import { api } from "@/server/http";
import { startAttempt } from "@/server/assessments/attempts";

/** Starts a new attempt, or resumes the open one (idempotent). */
export const POST = api<{ id: string }>("user", async ({ params, user }) => {
  const attempt = await startAttempt(user, params.id);
  return { attemptId: attempt.id };
});
