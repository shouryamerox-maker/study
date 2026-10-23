import "server-only";
import { db } from "@/server/db";
import { logEvent } from "@/server/events";
import { notFound } from "@/server/http";

export type ChapterState = "completed" | "in_progress" | "not_started" | "locked";

const lessonListSelect = { id: true, slug: true, title: true, estMinutes: true, order: true, published: true } as const;

/** Full syllabus tree (no lesson bodies). */
export async function getCourseTree(courseSlug: string, opts: { includeUnpublished?: boolean } = {}) {
  const course = await db.course.findUnique({
    where: { slug: courseSlug },
    include: {
      subject: true,
      units: {
        orderBy: { order: "asc" },
        include: {
          chapters: {
            orderBy: { order: "asc" },
            include: {
              topics: {
                orderBy: { order: "asc" },
                include: {
                  lessons: {
                    where: opts.includeUnpublished ? {} : { published: true },
                    orderBy: { order: "asc" },
                    select: lessonListSelect,
                  },
                },
              },
              files: { select: { id: true, title: true, kind: true, url: true, mimeType: true, sizeBytes: true } },
              _count: { select: { questions: true } },
            },
          },
        },
      },
      files: { where: { chapterId: null, lessonId: null }, select: { id: true, title: true, kind: true, url: true, mimeType: true, sizeBytes: true } },
    },
  });
  if (!course || (!course.published && !opts.includeUnpublished)) return null;
  return course;
}
export type CourseTree = NonNullable<Awaited<ReturnType<typeof getCourseTree>>>;

export function orderedLessons(tree: CourseTree) {
  return tree.units.flatMap((u) => u.chapters.flatMap((c) => c.topics.flatMap((t) => t.lessons.map((l) => ({ ...l, chapterId: c.id, chapterTitle: c.title })))));
}

export async function progressMap(userId: string, courseId: string) {
  const rows = await db.lessonProgress.findMany({
    where: { userId, lesson: { courseId } },
    select: { lessonId: true, status: true, lastViewedAt: true, completedAt: true },
  });
  return new Map(rows.map((r) => [r.lessonId, r]));
}

/** Computes per-chapter status and course totals from real progress records. */
export function computeCourseProgress(tree: CourseTree, progress: Awaited<ReturnType<typeof progressMap>>, now = new Date()) {
  const chapterCompletion = new Map<string, boolean>();
  const chapters = tree.units.flatMap((u) =>
    u.chapters.map((c) => {
      const lessons = c.topics.flatMap((t) => t.lessons);
      const done = lessons.filter((l) => progress.get(l.id)?.status === "COMPLETED").length;
      const started = lessons.some((l) => progress.has(l.id));
      chapterCompletion.set(c.id, lessons.length > 0 && done === lessons.length);
      return { id: c.id, unitId: u.id, total: lessons.length, done, started, chapter: c };
    }),
  );
  const states = new Map<string, ChapterState>();
  for (const c of chapters) {
    const ch = c.chapter;
    const lockedBySchedule = !ch.isAvailable || (ch.availableFrom != null && ch.availableFrom > now);
    const lockedByPrereq = tree.enforcePrerequisites && ch.prerequisiteChapterId != null && !chapterCompletion.get(ch.prerequisiteChapterId);
    states.set(
      c.id,
      lockedBySchedule || lockedByPrereq
        ? "locked"
        : c.total > 0 && c.done === c.total
          ? "completed"
          : c.started
            ? "in_progress"
            : "not_started",
    );
  }
  const total = chapters.reduce((s, c) => s + c.total, 0);
  const done = chapters.reduce((s, c) => s + c.done, 0);
  return {
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
    chapters: new Map(chapters.map((c) => [c.id, { total: c.total, done: c.done, state: states.get(c.id)! }])),
    chaptersCompleted: [...states.values()].filter((s) => s === "completed").length,
    chapterCount: chapters.length,
  };
}

/**
 * Where to continue inside one course: the most recently opened unfinished lesson,
 * otherwise the first lesson not yet completed. Null when everything is complete.
 */
export function courseContinueLesson(tree: CourseTree, progress: Awaited<ReturnType<typeof progressMap>>) {
  const list = orderedLessons(tree);
  const inProgress = list
    .filter((l) => progress.get(l.id)?.status === "IN_PROGRESS")
    .sort((a, b) => progress.get(b.id)!.lastViewedAt.getTime() - progress.get(a.id)!.lastViewedAt.getTime())[0];
  const next = inProgress ?? list.find((l) => progress.get(l.id)?.status !== "COMPLETED");
  return next ? { ...next, resume: !!inProgress, started: progress.size > 0 } : null;
}

export async function isLessonLocked(userId: string, lesson: { chapterId: string; courseId: string }) {
  const chapter = await db.chapter.findUniqueOrThrow({ where: { id: lesson.chapterId }, include: { course: true } });
  if (!chapter.isAvailable || (chapter.availableFrom && chapter.availableFrom > new Date())) return true;
  if (!chapter.course.enforcePrerequisites || !chapter.prerequisiteChapterId) return false;
  const [total, done] = await Promise.all([
    db.lesson.count({ where: { chapterId: chapter.prerequisiteChapterId, published: true } }),
    db.lessonProgress.count({ where: { userId, status: "COMPLETED", lesson: { chapterId: chapter.prerequisiteChapterId, published: true } } }),
  ]);
  return done < total;
}

/* ── Recording progress ─────────────────────────────────────────────── */

const VIEW_EVENT_THROTTLE_MS = 30 * 60 * 1000;

export async function recordLessonView(userId: string, lessonId: string) {
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { id: true, courseId: true, title: true } });
  if (!lesson) throw notFound("Lesson");
  const existing = await db.lessonProgress.findUnique({ where: { userId_lessonId: { userId, lessonId } } });
  const now = new Date();
  if (!existing) {
    await db.lessonProgress.create({ data: { userId, lessonId } });
  } else {
    await db.lessonProgress.update({ where: { id: existing.id }, data: { lastViewedAt: now, viewCount: { increment: 1 } } });
  }
  // Opening a lesson is recorded as "viewed", never as time studied.
  if (!existing || now.getTime() - existing.lastViewedAt.getTime() > VIEW_EVENT_THROTTLE_MS) {
    await logEvent(userId, "LESSON_VIEWED", { courseId: lesson.courseId, lessonId, label: lesson.title });
  }
}

export async function setLessonCompletion(userId: string, lessonId: string, complete: boolean) {
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { id: true, courseId: true, title: true } });
  if (!lesson) throw notFound("Lesson");
  const now = new Date();
  const row = await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, status: complete ? "COMPLETED" : "IN_PROGRESS", completedAt: complete ? now : null },
    update: { status: complete ? "COMPLETED" : "IN_PROGRESS", completedAt: complete ? now : null, lastViewedAt: now },
  });
  await logEvent(userId, complete ? "LESSON_COMPLETED" : "LESSON_REOPENED", { courseId: lesson.courseId, lessonId, label: lesson.title });
  return row;
}

/** Last lesson touched, or the first incomplete lesson of the most recent course. */
export async function continueLearning(userId: string) {
  const last = await db.lessonProgress.findFirst({
    where: { userId, lesson: { published: true } },
    orderBy: { lastViewedAt: "desc" },
    include: { lesson: { select: { id: true, slug: true, title: true, courseId: true, chapterId: true, chapter: { select: { title: true } }, course: { select: { slug: true, title: true } } } } },
  });
  if (!last) return null;
  if (last.status === "IN_PROGRESS") return { lesson: last.lesson, reason: "resume" as const };

  const tree = await getCourseTree(last.lesson.course.slug);
  if (!tree) return null;
  const progress = await progressMap(userId, tree.id);
  const list = orderedLessons(tree);
  const idx = list.findIndex((l) => l.id === last.lesson.id);
  const next = list.slice(idx + 1).find((l) => progress.get(l.id)?.status !== "COMPLETED") ?? list.find((l) => progress.get(l.id)?.status !== "COMPLETED");
  if (!next) return { lesson: last.lesson, reason: "course_complete" as const };
  return {
    lesson: { id: next.id, slug: next.slug, title: next.title, courseId: tree.id, chapterId: next.chapterId, chapter: { title: next.chapterTitle }, course: { slug: tree.slug, title: tree.title } },
    reason: "next" as const,
  };
}

/* ── Statistics (all derived from stored records) ───────────────────── */

export async function practiceStats(userId: string) {
  const attempts = await db.practiceAttempt.findMany({
    where: { userId },
    select: { questionId: true, isCorrect: true, createdAt: true, question: { select: { chapterId: true, chapter: { select: { title: true, slug: true } } } } },
    orderBy: { createdAt: "asc" },
  });
  // Latest attempt per question decides whether it is currently "correct".
  const latest = new Map<string, (typeof attempts)[number]>();
  for (const a of attempts) latest.set(a.questionId, a);
  const byChapter = new Map<string, { id: string; title: string; slug: string; attempted: number; correct: number }>();
  for (const a of latest.values()) {
    const ch = a.question.chapter;
    if (!ch || !a.question.chapterId) continue;
    const e = byChapter.get(a.question.chapterId) ?? { id: a.question.chapterId, title: ch.title, slug: ch.slug, attempted: 0, correct: 0 };
    e.attempted++;
    if (a.isCorrect) e.correct++;
    byChapter.set(a.question.chapterId, e);
  }
  const questionsAttempted = latest.size;
  const correctNow = [...latest.values()].filter((a) => a.isCorrect).length;
  const weak = [...byChapter.values()]
    .filter((c) => c.attempted >= 2 && c.correct / c.attempted < 0.6)
    .sort((a, b) => a.correct / a.attempted - b.correct / b.attempted);
  return {
    totalSubmissions: attempts.length,
    questionsAttempted,
    correctNow,
    accuracy: questionsAttempted ? Math.round((correctNow / questionsAttempted) * 100) : null,
    byChapter: [...byChapter.values()],
    weak,
    incorrectQuestionIds: [...latest.values()].filter((a) => !a.isCorrect).map((a) => a.questionId),
  };
}

export async function testStats(userId: string) {
  const attempts = await db.attempt.findMany({
    where: { userId, status: { not: "IN_PROGRESS" } },
    include: { assessment: { select: { id: true, title: true, resultRelease: true, resultsReleasedAt: true, dueAt: true, showAnswerKey: true } } },
    orderBy: { submittedAt: "asc" },
  });
  return attempts;
}

export async function recentActivity(userId: string, take = 12) {
  return db.learningEvent.findMany({ where: { userId, type: { not: "LOGIN" } }, orderBy: { createdAt: "desc" }, take });
}

/** Distinct calendar days with recorded learning activity (a measurable proxy, not "time studied"). */
export async function activeDays(userId: string, sinceDays = 30) {
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
  const rows = await db.learningEvent.findMany({
    where: { userId, createdAt: { gte: since }, type: { in: ["LESSON_VIEWED", "LESSON_COMPLETED", "PRACTICE_SUBMITTED", "CODE_RUN", "TEST_SUBMITTED"] } },
    select: { createdAt: true },
  });
  return new Set(rows.map((r) => r.createdAt.toISOString().slice(0, 10))).size;
}
