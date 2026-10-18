/**
 * End-to-end API workflow against a running server and a real database.
 *   E2E_BASE_URL=http://localhost:3100 E2E_ADMIN_EMAIL=… E2E_ADMIN_PASSWORD=… npx vitest run tests/e2e.test.ts
 * Skipped automatically when E2E_BASE_URL is not set.
 */
import { beforeAll, describe, expect, it } from "vitest";

const BASE = process.env.E2E_BASE_URL;
const run = BASE ? describe : describe.skip;

class Client {
  cookie = "";
  constructor(public name: string) {}
  async req(path: string, init: { method?: string; body?: unknown; origin?: string } = {}) {
    const headers: Record<string, string> = {};
    if (this.cookie) headers.cookie = this.cookie;
    if (init.body !== undefined) headers["content-type"] = "application/json";
    if (init.origin) headers.origin = init.origin;
    const res = await fetch(BASE + path, {
      method: init.method ?? (init.body !== undefined ? "POST" : "GET"),
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      redirect: "manual",
    });
    const set = res.headers.get("set-cookie");
    if (set?.startsWith("sl_session=")) this.cookie = set.split(";")[0];
    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
    return { status: res.status, json, headers: res.headers };
  }
}

const stamp = Date.now();
const alice = new Client("alice");
const bob = new Client("bob");
const admin = new Client("admin");
let testId = "";
let attemptId = "";

run("end-to-end workflows", () => {
  beforeAll(async () => {
    const r = await admin.req("/api/v1/auth/login", { body: { email: process.env.E2E_ADMIN_EMAIL, password: process.env.E2E_ADMIN_PASSWORD } });
    expect(r.status).toBe(200);
  });

  it("registers students who always get the STUDENT role", async () => {
    const a = await alice.req("/api/v1/auth/register", { body: { name: "Alice Tester", email: `alice${stamp}@test.dev`, password: "password1" } });
    expect(a.status).toBe(200);
    expect(a.json.user.role).toBe("STUDENT");
    // An attempt to self-assign a role is ignored (strict schema strips unknown keys).
    const b = await bob.req("/api/v1/auth/register", { body: { name: "Bob Tester", email: `bob${stamp}@test.dev`, password: "password1", role: "ADMIN" } });
    expect(b.status).toBe(200);
    expect(b.json.user.role).toBe("STUDENT");
    expect((await alice.req("/api/v1/auth/me")).json.user.email).toBe(`alice${stamp}@test.dev`);
  });

  it("rejects duplicate emails, weak passwords and wrong credentials", async () => {
    const anon = new Client("anon");
    expect((await anon.req("/api/v1/auth/register", { body: { name: "Dup", email: `alice${stamp}@test.dev`, password: "password1" } })).status).toBe(409);
    expect((await anon.req("/api/v1/auth/register", { body: { name: "Weak", email: `weak${stamp}@test.dev`, password: "short" } })).status).toBe(422);
    expect((await anon.req("/api/v1/auth/login", { body: { email: `alice${stamp}@test.dev`, password: "wrongpass1" } })).status).toBe(401);
  });

  it("blocks students from teacher APIs and pages", async () => {
    expect((await alice.req("/api/v1/teacher/students")).status).toBe(403);
    expect((await alice.req("/api/v1/teacher/tests")).status).toBe(403);
    const page = await alice.req("/teacher");
    expect([307, 308]).toContain(page.status);
    expect(page.headers.get("location")).toContain("/dashboard");
    expect((await new Client("anon").req("/api/v1/auth/me")).status).toBe(401);
  });

  it("blocks cross-origin cookie mutations (CSRF)", async () => {
    const r = await alice.req("/api/v1/courses/c-programming/enroll", { method: "POST", origin: "https://evil.example" });
    expect(r.status).toBe(403);
  });

  it("persists enrolment, lesson progress, bookmarks and private notes", async () => {
    expect((await alice.req("/api/v1/courses/c-programming/enroll", { method: "POST" })).status).toBe(200);
    const course = await alice.req("/api/v1/courses/c-programming");
    const lesson = course.json.course.units[0].chapters[0].topics[0].lessons[0];
    expect((await alice.req(`/api/v1/lessons/${lesson.id}/view`, { method: "POST" })).status).toBe(200);
    expect((await alice.req(`/api/v1/lessons/${lesson.id}/complete`, { body: { complete: true } })).json.status).toBe("COMPLETED");
    await alice.req(`/api/v1/lessons/${lesson.id}/bookmark`, { method: "POST" });
    const note = await alice.req(`/api/v1/lessons/${lesson.id}/notes`, { body: { body: "my private note" } });
    expect(note.status).toBe(200);

    // Sign out and back in: progress is still there.
    await alice.req("/api/v1/auth/logout", { method: "POST" });
    alice.cookie = "";
    await alice.req("/api/v1/auth/login", { body: { email: `alice${stamp}@test.dev`, password: "password1" } });
    const again = await alice.req("/api/v1/courses/c-programming");
    expect(again.json.progress.done).toBe(1);

    // Bob cannot read or edit Alice's note.
    expect((await bob.req(`/api/v1/lessons/${lesson.id}/notes`)).json.notes).toHaveLength(0);
    expect((await bob.req(`/api/v1/notes/${note.json.note.id}`, { method: "PATCH", body: { body: "hacked" } })).status).toBe(404);
  });

  it("checks practice answers on the server without leaking keys first", async () => {
    const list = await alice.req("/api/v1/practice?mode=all");
    const qs = (await alice.req(`/api/v1/practice?chapterId=${list.json.questions[0]?.chapterId ?? ""}`)).json.questions;
    const mcq = qs.find((q: any) => q.type === "MCQ");
    expect(mcq).toBeTruthy();
    expect(JSON.stringify(mcq)).not.toContain("correct");
    const wrong = mcq.options.find((o: any) => o.id !== "zzz");
    const res = await alice.req(`/api/v1/practice/${mcq.id}/check`, { body: { response: { optionId: wrong.id } } });
    expect(res.status).toBe(200);
    expect(typeof res.json.correct).toBe("boolean");
  });

  it("lets the teacher assign the 50-mark test", async () => {
    const tests = await admin.req("/api/v1/teacher/tests");
    const t = tests.json.tests.find((x: any) => x.slug === "c-fundamentals-pointers-50");
    expect(t.currentVersion.totalMarks).toBe(50);
    testId = t.id;
    const students = (await admin.req(`/api/v1/teacher/students?q=${stamp}`)).json.students;
    const a = await admin.req(`/api/v1/teacher/tests/${testId}/assignments`, { method: "PUT", body: { assignToAll: false, userIds: students.map((s: any) => s.id), groupIds: [] } });
    expect(a.json.students).toBe(2);
  });

  it("runs a full attempt: start, autosave, submit once, auto-grade objective parts", async () => {
    const listed = await alice.req("/api/v1/tests");
    expect(listed.json.tests.some((t: any) => t.id === testId)).toBe(true);
    const s1 = await alice.req(`/api/v1/tests/${testId}/start`, { method: "POST" });
    attemptId = s1.json.attemptId;
    // Starting again resumes the same attempt (no duplicates).
    expect((await alice.req(`/api/v1/tests/${testId}/start`, { method: "POST" })).json.attemptId).toBe(attemptId);

    const view = await alice.req(`/api/v1/attempts/${attemptId}`);
    const text = JSON.stringify(view.json.test);
    expect(text).not.toContain("modelAnswer");
    expect(text).not.toContain("hiddenTests");
    expect(text).not.toContain("solutionCode");
    expect(text).not.toContain('"answer"');

    const save = (questionId: string, response: unknown) => alice.req(`/api/v1/attempts/${attemptId}/responses`, { method: "PUT", body: { questionId, response } });
    expect((await save("cf50-a1", { optionId: "b" })).status).toBe(200); // correct
    await save("cf50-a2", { optionId: "a" }); // wrong
    await save("cf50-b1", { blanks: [" stdio.h "] }); // correct
    await save("cf50-b10", { blanks: ["null"] }); // wrong (case)
    await save("cf50-c1", { text: "3 2 7\n" }); // correct
    await save("cf50-c3", { text: "B\nseventy-eighty" }); // correct
    await save("cf50-e1", { text: "Call by value copies the value; a pointer passes the address..." });
    await save("cf50-f1", { code: "#include <stdio.h>\nint main(void){return 0;}" });
    expect((await alice.req(`/api/v1/attempts/${attemptId}/responses`, { method: "PUT", body: { questionId: "cf50-a3", markedForReview: true } })).status).toBe(200);

    // Bob cannot read or write Alice's attempt.
    expect((await bob.req(`/api/v1/attempts/${attemptId}`)).status).toBe(404);
    expect((await bob.req(`/api/v1/attempts/${attemptId}/responses`, { method: "PUT", body: { questionId: "cf50-a1", response: { optionId: "a" } } })).status).toBe(404);

    const sub = await alice.req(`/api/v1/attempts/${attemptId}/submit`, { method: "POST" });
    expect(sub.json.status).toBe("SUBMITTED");
    expect((await alice.req(`/api/v1/attempts/${attemptId}/submit`, { method: "POST" })).json.alreadySubmitted).toBe(true);
    expect((await save("cf50-a2", { optionId: "c" })).status).toBe(409);

    // Results are MANUAL-release: nothing visible yet.
    const res = await alice.req(`/api/v1/attempts/${attemptId}/result`);
    expect(res.json.visible).toBe(false);
    expect(res.json.score).toBeUndefined();
  });

  it("lets the teacher see every answer, grade manually and audit overrides", async () => {
    const ids = await admin.req(`/teacher/attempts/${attemptId}`);
    expect(ids.status).toBe(200);
    expect(ids.json).toContain("Call by value copies the value");

    // Find response ids from the CSV/export path? Use the DB-backed export to confirm auto-grading first.
    const csv = await admin.req(`/api/v1/teacher/tests/${testId}/export`);
    expect(csv.status).toBe(200);
    expect(csv.json).toContain("Alice Tester");
    // Auto score: a1 (1) + b1 (1) + c1 (2) + c3 (2) = 6, with manual items pending.
    expect(csv.json).toContain('"PENDING_REVIEW","6"');
  });

  it("supports partial manual marks, audited overrides and result release", async () => {
    const review = await admin.req(`/api/v1/teacher/attempts/${attemptId}`);
    expect(review.status).toBe(200);
    const items = review.json.items as any[];
    const byQ = (id: string) => items.find((i) => i.question.id === id);
    expect(byQ("cf50-a1").response.status).toBe("CORRECT");
    expect(byQ("cf50-b10").response.status).toBe("INCORRECT");
    expect(byQ("cf50-e1").response.status).toBe("PENDING_REVIEW");
    expect(byQ("cf50-f1").response.response.code).toContain("int main");
    expect(byQ("cf50-d1").response.status).toBe("UNANSWERED");
    expect(byQ("cf50-a3").response.markedForReview).toBe(true);

    const grade = (rid: string, body: object) => admin.req(`/api/v1/teacher/responses/${rid}/grade`, { body });
    expect((await grade(byQ("cf50-e1").response.id, { score: 4.5 })).status).toBe(400); // over max
    expect((await grade(byQ("cf50-e1").response.id, { score: 2.5, feedback: "Good start; add an example." })).status).toBe(200);
    const g2 = await grade(byQ("cf50-f1").response.id, { score: 1 });
    expect(g2.json.attempt.gradingStatus).toBe("GRADED");
    expect(g2.json.attempt.score).toBe(9.5); // 6 auto + 2.5 + 1

    // Overriding an automatic mark requires a reason and is audited.
    expect((await grade(byQ("cf50-b10").response.id, { score: 1 })).status).toBe(400);
    const o = await grade(byQ("cf50-b10").response.id, { score: 1, reason: "Accepting lowercase in this cohort" });
    expect(o.json.attempt.score).toBe(10.5);
    const after = await admin.req(`/api/v1/teacher/attempts/${attemptId}`);
    const b10 = (after.json.items as any[]).find((i) => i.question.id === "cf50-b10");
    expect(b10.audits[0].reason).toContain("lowercase");
    expect(b10.audits[0].previousScore).toBe(0);
    expect(b10.response.response.blanks[0]).toBe("null"); // original answer preserved

    expect((await admin.req(`/api/v1/teacher/tests/${testId}/status`, { body: { action: "release" } })).status).toBe(200);
    const res = await alice.req(`/api/v1/attempts/${attemptId}/result`);
    expect(res.json.visible).toBe(true);
    expect(res.json.score).toBe(10.5);
    expect(res.json.maxScore).toBe(50);
    expect(res.json.gradingStatus).toBe("GRADED");
    const e1 = res.json.items.find((i: any) => i.questionId === "cf50-e1");
    expect(e1.feedback).toContain("Good start");
    // Restore manual release state for repeat runs.
    await admin.req(`/api/v1/teacher/tests/${testId}/status`, { body: { action: "unrelease" } });
  });

  it("does not let a student grade or release", async () => {
    expect((await alice.req(`/api/v1/teacher/tests/${testId}/status`, { body: { action: "release" } })).status).toBe(403);
    expect((await alice.req(`/api/v1/teacher/responses/whatever/grade`, { body: { score: 4 } })).status).toBe(403);
  });
});
