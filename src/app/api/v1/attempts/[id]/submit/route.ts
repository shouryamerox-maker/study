import { api, notFound } from "@/server/http";
import { db } from "@/server/db";
import { submitAttempt } from "@/server/assessments/attempts";
import { isPastDeadline } from "@/lib/assessment-rules";

/** Final submission. Safe to call twice — the second call is a no-op. */
export const POST = api<{ id: string }>("user", async ({ params, user }) => {
  const attempt = await db.attempt.findUnique({ where: { id: params.id } });
  if (!attempt || attempt.userId !== user.id) throw notFound("Attempt");
  const mode = attempt.status === "IN_PROGRESS" && isPastDeadline(attempt.deadlineAt) ? "AUTO_SUBMITTED" : "SUBMITTED";
  const { attempt: done, alreadySubmitted } = await submitAttempt(attempt.id, mode);
  return { status: done.status, submittedAt: done.submittedAt, alreadySubmitted };
});
