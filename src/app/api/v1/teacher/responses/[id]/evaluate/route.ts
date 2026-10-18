import type { Prisma } from "@prisma/client";
import { api, badRequest, notFound } from "@/server/http";
import { db } from "@/server/db";
import { allQuestions, snapshotOf } from "@/server/assessments/attempts";
import { evaluateTests } from "@/server/execution";
import { rateLimit } from "@/server/rate-limit";

export const maxDuration = 60;

/**
 * Compiles the student's submitted code and runs it against the question's sample and
 * hidden tests. The result is stored as a grading aid; it never changes the mark itself.
 */
export const POST = api<{ id: string }>("staff", async ({ params, user }) => {
  await rateLimit(`evaluate:${user.id}`, 30, 60);
  const r = await db.attemptResponse.findUnique({ where: { id: params.id }, include: { attempt: { include: { version: true } } } });
  if (!r) throw notFound("Response");
  const q = allQuestions(snapshotOf(r.attempt.version)).find((x) => x.id === r.questionId);
  if (!q) throw notFound("Question");
  const code = (r.response as { code?: string } | null)?.code;
  if (!code?.trim()) throw badRequest("No code was submitted for this question.");

  const samples = q.type === "DEBUGGING" ? (q.answer.tests ?? []) : (q.data.sampleTests ?? []);
  const hidden = q.type === "CODE_WRITING" ? (q.answer.hiddenTests ?? []) : [];
  if (samples.length + hidden.length === 0) throw badRequest("This question has no test cases.");

  const result = await evaluateTests(code, samples, hidden);
  if (!result.available) return { available: false };
  // Teachers see every case including hidden inputs, so re-attach them for the review screen.
  const all = [...samples, ...hidden];
  const detailed = result.results.map((c) => ({ ...c, stdin: all[c.index]?.stdin, expected: all[c.index]?.expected }));
  const evaluation = { ranAt: new Date().toISOString(), passed: result.passed, total: result.total, results: detailed };
  await db.attemptResponse.update({
    where: { id: r.id },
    data: { evaluation: { ...((r.evaluation as object) ?? {}), tests: evaluation } as Prisma.InputJsonValue },
  });
  return { available: true, evaluation };
});
