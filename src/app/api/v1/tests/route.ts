import { api } from "@/server/http";
import { db } from "@/server/db";
import { assignedAssessments, canStudentSeeResults, finalizeExpiredAttempts } from "@/server/assessments/attempts";

/** Tests assigned to the caller with their attempt state. */
export const GET = api("user", async ({ user }) => {
  await finalizeExpiredAttempts({ userId: user.id });
  const list = await assignedAssessments(user.id);
  const attempts = await db.attempt.findMany({ where: { userId: user.id, assessmentId: { in: list.map((a) => a.id) } }, orderBy: { attemptNumber: "asc" } });
  return {
    tests: list.map((a) => {
      const mine = attempts.filter((t) => t.assessmentId === a.id);
      return {
        id: a.id,
        title: a.title,
        course: a.course,
        durationMinutes: a.durationMinutes,
        availableFrom: a.availableFrom,
        dueAt: a.effectiveDueAt,
        attemptLimit: a.attemptLimit,
        totalMarks: a.currentVersion?.totalMarks ?? null,
        attempts: mine.map((t) => {
          const visible = canStudentSeeResults(a, t);
          return {
            id: t.id,
            attemptNumber: t.attemptNumber,
            status: t.status,
            submittedAt: t.submittedAt,
            resultsVisible: visible,
            gradingStatus: visible ? t.gradingStatus : null,
            score: visible ? t.score : null,
            maxScore: t.maxScore,
          };
        }),
      };
    }),
  };
});
