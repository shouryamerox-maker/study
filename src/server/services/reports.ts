import "server-only";
import { db } from "@/server/db";
import { resultsVisible } from "@/lib/assessment-rules";
import { activeDays, practiceStats } from "./learning";
import { enrolledCoursesWithProgress } from "./student";
import type { TestRow } from "@/components/reports/StudentProgressReport";

/** Everything needed for a student's progress report, from real records only. */
export async function studentReport(userId: string, opts: { asTeacher: boolean; eventLimit?: number }) {
  const [courses, practice, attempts, events, days] = await Promise.all([
    enrolledCoursesWithProgress(userId),
    practiceStats(userId),
    db.attempt.findMany({ where: { userId, status: { not: "IN_PROGRESS" } }, include: { assessment: true }, orderBy: { submittedAt: "asc" } }),
    db.learningEvent.findMany({ where: { userId, ...(opts.asTeacher ? {} : { type: { not: "LOGIN" } }) }, orderBy: { createdAt: "desc" }, take: opts.eventLimit ?? 30 }),
    activeDays(userId),
  ]);
  const tests: TestRow[] = attempts.map((a) => {
    const visible = opts.asTeacher || resultsVisible(a.assessment, true);
    return {
      attemptId: a.id,
      assessmentId: a.assessmentId,
      title: a.assessment.title,
      attemptNumber: a.attemptNumber,
      submittedAt: a.submittedAt,
      score: visible ? a.score : null,
      maxScore: a.maxScore,
      pending: a.gradingStatus === "PENDING_REVIEW",
      visible,
      status: a.status,
    };
  });
  return { courses, practice, tests, events, activeDays: days };
}
