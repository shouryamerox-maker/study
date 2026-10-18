import { api, notFound } from "@/server/http";
import { attemptReview } from "@/server/services/teacher";

/** Complete attempt for review: questions, keys, rubrics, responses, marks and audit trail. */
export const GET = api<{ id: string }>("staff", async ({ params }) => {
  const data = await attemptReview(params.id);
  if (!data) throw notFound("Attempt");
  const { attempt, items, others } = data;
  return {
    attempt: {
      id: attempt.id,
      student: attempt.user,
      assessment: attempt.assessment,
      attemptNumber: attempt.attemptNumber,
      version: attempt.version.version,
      status: attempt.status,
      gradingStatus: attempt.gradingStatus,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      score: attempt.score,
      maxScore: attempt.maxScore,
    },
    others,
    items,
  };
});
