import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { allQuestions, snapshotOf } from "@/server/assessments/attempts";
import { percent } from "@/lib/grading";

/** Student directory rows, all computed from stored records. */
export async function studentDirectory(filter: { q?: string; courseId?: string; status?: string } = {}) {
  const where: Prisma.UserWhereInput = {
    role: "STUDENT",
    ...(filter.status === "SUSPENDED" ? { status: "SUSPENDED" } : filter.status === "ACTIVE" ? { status: "ACTIVE" } : {}),
    ...(filter.q ? { OR: [{ name: { contains: filter.q } }, { email: { contains: filter.q } }, { studentCode: { contains: filter.q } }] } : {}),
    ...(filter.courseId ? { enrollments: { some: { courseId: filter.courseId, status: "active" } } } : {}),
  };
  const students = await db.user.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      studentCode: true,
      status: true,
      createdAt: true,
      lastActiveAt: true,
      avatarColor: true,
      enrollments: { where: { status: "active" }, select: { courseId: true, enrolledAt: true, course: { select: { title: true } } } },
      _count: { select: { lessonProgress: { where: { status: "COMPLETED" } } } },
    },
  });
  if (students.length === 0) return [];
  const ids = students.map((s) => s.id);

  const [lessonTotals, attempts, lastEvents] = await Promise.all([
    db.lesson.groupBy({ by: ["courseId"], where: { published: true }, _count: { _all: true } }),
    db.attempt.findMany({
      where: { userId: { in: ids }, status: { not: "IN_PROGRESS" } },
      select: { userId: true, score: true, maxScore: true, submittedAt: true, gradingStatus: true },
      orderBy: { submittedAt: "asc" },
    }),
    db.learningEvent.groupBy({ by: ["userId"], where: { userId: { in: ids } }, _max: { createdAt: true } }),
  ]);
  const totalByCourse = new Map(lessonTotals.map((l) => [l.courseId, l._count._all]));
  const lastByUser = new Map(lastEvents.map((e) => [e.userId, e._max.createdAt]));

  return students.map((s) => {
    const total = s.enrollments.reduce((n, e) => n + (totalByCourse.get(e.courseId) ?? 0), 0);
    const mine = attempts.filter((a) => a.userId === s.id);
    const scored = mine.filter((a) => a.score != null);
    const latest = scored.at(-1);
    const avg = scored.length ? Math.round((scored.reduce((n, a) => n + percent(a.score!, a.maxScore), 0) / scored.length) * 10) / 10 : null;
    const lastEvent = lastByUser.get(s.id) ?? null;
    const lastActivity = [lastEvent, s.lastActiveAt].filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0] ?? null;
    return {
      id: s.id,
      name: s.name,
      email: s.email,
      studentCode: s.studentCode,
      status: s.status,
      avatarColor: s.avatarColor,
      enrolledAt: s.enrollments[0]?.enrolledAt ?? null,
      courses: s.enrollments.map((e) => e.course.title),
      lessonsCompleted: s._count.lessonProgress,
      lessonsTotal: total,
      progress: total ? Math.round((s._count.lessonProgress / total) * 100) : 0,
      testsAttempted: mine.length,
      pendingGrading: mine.filter((a) => a.gradingStatus === "PENDING_REVIEW").length,
      latestScore: latest ? percent(latest.score!, latest.maxScore) : null,
      averageScore: avg,
      lastActivity,
    };
  });
}
export type DirectoryRow = Awaited<ReturnType<typeof studentDirectory>>[number];

export async function teacherOverview() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [students, activeStudents, pendingAttempts, recent, published] = await Promise.all([
    db.user.count({ where: { role: "STUDENT", status: "ACTIVE" } }),
    db.learningEvent.groupBy({ by: ["userId"], where: { createdAt: { gte: weekAgo }, type: { not: "LOGIN" }, user: { role: "STUDENT" } } }),
    db.attempt.count({ where: { gradingStatus: "PENDING_REVIEW" } }),
    db.learningEvent.findMany({ where: { user: { role: "STUDENT" }, type: { not: "LOGIN" } }, orderBy: { createdAt: "desc" }, take: 12, include: { user: { select: { id: true, name: true } } } }),
    db.assessment.findMany({
      where: { status: { in: ["PUBLISHED", "ARCHIVED"] } },
      include: { attempts: { where: { status: { not: "IN_PROGRESS" } }, select: { userId: true, score: true, maxScore: true, gradingStatus: true } }, currentVersion: { select: { totalMarks: true } } },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
  ]);
  return {
    students,
    activeStudents: activeStudents.length,
    pendingAttempts,
    recent,
    tests: published.map((t) => {
      const graded = t.attempts.filter((a) => a.gradingStatus === "GRADED" && a.score != null);
      return {
        id: t.id,
        title: t.title,
        status: t.status,
        submissions: new Set(t.attempts.map((a) => a.userId)).size,
        pending: t.attempts.filter((a) => a.gradingStatus === "PENDING_REVIEW").length,
        average: graded.length ? Math.round((graded.reduce((n, a) => n + percent(a.score!, a.maxScore), 0) / graded.length) * 10) / 10 : null,
        totalMarks: t.currentVersion?.totalMarks ?? null,
      };
    }),
  };
}

/** Who is expected to take a test: explicit assignees, group members, or all enrolled. */
export async function assignedStudentIds(assessmentId: string) {
  const a = await db.assessment.findUniqueOrThrow({ where: { id: assessmentId }, include: { assignments: true } });
  const ids = new Set<string>();
  if (a.assignToAll) {
    const enrolled = await db.enrollment.findMany({ where: { courseId: a.courseId, status: "active", user: { role: "STUDENT" } }, select: { userId: true } });
    enrolled.forEach((e) => ids.add(e.userId));
  }
  a.assignments.forEach((x) => x.userId && ids.add(x.userId));
  const groupIds = a.assignments.map((x) => x.groupId).filter((g): g is string => !!g);
  if (groupIds.length) {
    const members = await db.groupMember.findMany({ where: { groupId: { in: groupIds } }, select: { userId: true } });
    members.forEach((m) => ids.add(m.userId));
  }
  return [...ids];
}

/** Everything the review workspace needs for one attempt (teacher-only data included). */
export async function attemptReview(attemptId: string) {
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      user: { select: { id: true, name: true, email: true, studentCode: true } },
      assessment: { select: { id: true, title: true, resultRelease: true, resultsReleasedAt: true } },
      version: true,
      responses: { include: { gradedBy: { select: { name: true } } } },
      audits: { include: { grader: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!attempt) return null;
  const snapshot = snapshotOf(attempt.version);
  const byQ = new Map(attempt.responses.map((r) => [r.questionId, r]));
  const others = await db.attempt.findMany({
    where: { assessmentId: attempt.assessmentId, userId: attempt.userId, status: { not: "IN_PROGRESS" } },
    select: { id: true, attemptNumber: true, score: true, maxScore: true, submittedAt: true },
    orderBy: { attemptNumber: "asc" },
  });
  return {
    attempt,
    snapshot,
    others,
    items: allQuestions(snapshot).map((q) => {
      const r = byQ.get(q.id);
      return {
        question: q,
        response: r
          ? {
              id: r.id,
              response: r.response,
              status: r.status,
              score: r.score,
              autoScore: r.autoScore,
              feedback: r.feedback,
              evaluation: r.evaluation,
              markedForReview: r.markedForReview,
              gradedBy: r.gradedBy?.name ?? null,
              gradedAt: r.gradedAt,
            }
          : null,
        audits: attempt.audits.filter((a) => a.responseId === r?.id),
      };
    }),
  };
}
