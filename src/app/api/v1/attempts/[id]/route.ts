import { api } from "@/server/http";
import { getAttemptForStudent } from "@/server/assessments/attempts";

/** Student view of their own attempt: questions without answer keys + saved responses. */
export const GET = api<{ id: string }>("user", async ({ params, user }) => {
  const { attempt, snapshot, responses } = await getAttemptForStudent(user, params.id);
  return {
    attempt: {
      id: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt,
      deadlineAt: attempt.deadlineAt,
      submittedAt: attempt.submittedAt,
      attemptNumber: attempt.attemptNumber,
      maxScore: attempt.maxScore,
    },
    serverTime: new Date(),
    test: snapshot,
    responses,
  };
});
