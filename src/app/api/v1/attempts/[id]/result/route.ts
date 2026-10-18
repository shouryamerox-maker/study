import { api } from "@/server/http";
import { studentResult } from "@/server/assessments/attempts";

/** Released results only. Before release, returns { visible: false } and nothing else. */
export const GET = api<{ id: string }>("user", async ({ params, user }) => {
  const r = await studentResult(user, params.id);
  if (!r.visible) return { visible: false, status: r.attempt.status, submittedAt: r.attempt.submittedAt };
  return {
    visible: true,
    score: r.attempt.score,
    maxScore: r.attempt.maxScore,
    gradingStatus: r.attempt.gradingStatus,
    showKey: r.showKey,
    test: r.snapshot,
    items: r.items,
  };
});
