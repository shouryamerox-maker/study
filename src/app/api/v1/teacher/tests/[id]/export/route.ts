import { api, notFound } from "@/server/http";
import { db } from "@/server/db";
import { allQuestions, snapshotOf } from "@/server/assessments/attempts";
import { percent } from "@/lib/grading";

function csvCell(v: unknown) {
  const s = v == null ? "" : String(v);
  // Prevent spreadsheet formula injection and quote safely.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** CSV of every submitted attempt with per-question marks. */
export const GET = api<{ id: string }>("staff", async ({ params }) => {
  const a = await db.assessment.findUnique({ where: { id: params.id }, include: { currentVersion: true } });
  if (!a) throw notFound("Test");
  const attempts = await db.attempt.findMany({
    where: { assessmentId: a.id, status: { not: "IN_PROGRESS" } },
    include: { user: { select: { name: true, email: true, studentCode: true } }, responses: true, version: true },
    orderBy: [{ user: { name: "asc" } }, { attemptNumber: "asc" }],
  });
  const qs = a.currentVersion ? allQuestions(snapshotOf(a.currentVersion)) : [];
  const header = ["Student", "Email", "Student ID", "Attempt", "Version", "Started", "Submitted", "Status", "Grading", "Score", "Max", "Percent", ...qs.map((q) => `Q${q.number} (${q.marks})`)];
  const rows = attempts.map((t) => {
    const byQ = new Map(t.responses.map((r) => [r.questionId, r]));
    return [
      t.user.name,
      t.user.email,
      t.user.studentCode ?? "",
      t.attemptNumber,
      t.version.version,
      t.startedAt.toISOString(),
      t.submittedAt?.toISOString() ?? "",
      t.status,
      t.gradingStatus,
      t.score ?? "",
      t.maxScore,
      t.score != null ? percent(t.score, t.maxScore) : "",
      ...qs.map((q) => {
        const r = byQ.get(q.id);
        return r?.status === "PENDING_REVIEW" ? "pending" : (r?.score ?? "");
      }),
    ];
  });
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const name = (a.slug ?? a.id).replace(/[^a-z0-9-]/gi, "-");
  return new Response("﻿" + csv, {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${name}-results.csv"` },
  });
});
