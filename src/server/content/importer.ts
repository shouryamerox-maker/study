/**
 * Imports validated course content into the database.
 *
 * - Matches every record by slug, so re-running is safe and IDs (and therefore student
 *   progress, bookmarks and notes) stay stable when content is edited.
 * - Records edited in the teacher UI (source = EDITED) are left untouched unless `force`.
 * - Nothing is deleted. Items missing from the files are reported so a teacher can
 *   decide what to do with them.
 *
 * Not marked server-only: used by CLI scripts as well as the app.
 */
import type { Prisma, PrismaClient } from "@prisma/client";
import { courseContentSchema, type CourseContent } from "@/lib/content/schema";
import { splitPracticeQuestion } from "@/lib/content/questions";

export interface ImportReport {
  course: string;
  created: Record<string, number>;
  updated: Record<string, number>;
  skippedEdited: number;
  orphanedLessons: string[];
}

export async function importCourse(db: PrismaClient, input: CourseContent, opts: { force?: boolean } = {}): Promise<ImportReport> {
  const c = courseContentSchema.parse(input);
  const report: ImportReport = { course: c.slug, created: {}, updated: {}, skippedEdited: 0, orphanedLessons: [] };
  const bump = (m: Record<string, number>, k: string) => (m[k] = (m[k] ?? 0) + 1);

  const subject = await db.subject.upsert({
    where: { slug: c.subject.slug },
    create: { slug: c.subject.slug, name: c.subject.name, kind: c.subject.kind, description: c.subject.description },
    update: { name: c.subject.name, kind: c.subject.kind, description: c.subject.description },
  });

  const existingCourse = await db.course.findUnique({ where: { slug: c.slug } });
  const courseFields = {
    title: c.title,
    summary: c.summary,
    level: c.level,
    codeLanguage: c.codeLanguage,
    isStarterContent: c.isStarterContent,
    subjectId: subject.id,
  };
  const course = existingCourse
    ? existingCourse.source === "EDITED" && !opts.force
      ? existingCourse
      : await db.course.update({ where: { id: existingCourse.id }, data: courseFields })
    : await db.course.create({ data: { slug: c.slug, ...courseFields } });
  bump(existingCourse ? report.updated : report.created, "course");

  const seenLessons = new Set<string>();

  for (const [ui, u] of c.units.entries()) {
    const unit = await upsertEditable(
      () => db.unit.findUnique({ where: { courseId_slug: { courseId: course.id, slug: u.slug } } }),
      () => db.unit.create({ data: { courseId: course.id, slug: u.slug, title: u.title, summary: u.summary, order: ui } }),
      (id) => db.unit.update({ where: { id }, data: { title: u.title, summary: u.summary, order: ui } }),
      "unit",
    );

    for (const [ci, ch] of u.chapters.entries()) {
      const chapter = await upsertEditable(
        () => db.chapter.findUnique({ where: { courseId_slug: { courseId: course.id, slug: ch.slug } } }),
        () => db.chapter.create({ data: { courseId: course.id, unitId: unit.id, slug: ch.slug, title: ch.title, summary: ch.summary, order: ci } }),
        (id) => db.chapter.update({ where: { id }, data: { unitId: unit.id, title: ch.title, summary: ch.summary, order: ci } }),
        "chapter",
      );

      let questionOrder = 0;
      for (const [ti, t] of ch.topics.entries()) {
        const topic = await upsertEditable(
          () => db.topic.findUnique({ where: { chapterId_slug: { chapterId: chapter.id, slug: t.slug } } }),
          () => db.topic.create({ data: { chapterId: chapter.id, slug: t.slug, title: t.title, order: ti } }),
          (id) => db.topic.update({ where: { id }, data: { title: t.title, order: ti } }),
          "topic",
        );

        for (const [li, l] of t.lessons.entries()) {
          seenLessons.add(l.slug);
          const blocks = l.blocks as unknown as Prisma.InputJsonValue;
          const existing = await db.lesson.findUnique({ where: { courseId_slug: { courseId: course.id, slug: l.slug } } });
          let lessonId: string;
          if (!existing) {
            const created = await db.lesson.create({
              data: {
                courseId: course.id,
                chapterId: chapter.id,
                topicId: topic.id,
                slug: l.slug,
                title: l.title,
                summary: l.summary,
                estMinutes: l.estMinutes,
                blocks,
                order: li,
              },
            });
            lessonId = created.id;
            bump(report.created, "lesson");
          } else if (existing.source === "EDITED" && !opts.force) {
            lessonId = existing.id;
            report.skippedEdited++;
          } else {
            const changed = JSON.stringify(existing.blocks) !== JSON.stringify(l.blocks);
            await db.lesson.update({
              where: { id: existing.id },
              data: {
                chapterId: chapter.id,
                topicId: topic.id,
                title: l.title,
                summary: l.summary,
                estMinutes: l.estMinutes,
                blocks,
                order: li,
                source: "SEED",
                ...(changed ? { version: { increment: 1 } } : {}),
              },
            });
            lessonId = existing.id;
            bump(report.updated, "lesson");
          }

          for (const q of l.practice) {
            const s = splitPracticeQuestion(q);
            const fields = {
              type: s.type,
              prompt: s.prompt,
              code: s.code,
              data: s.data as Prisma.InputJsonValue,
              answer: s.answer as unknown as Prisma.InputJsonValue,
              explanation: s.explanation,
              hint: s.hint,
              courseId: course.id,
              chapterId: chapter.id,
              lessonId,
              order: questionOrder++,
            };
            const ex = await db.question.findUnique({ where: { slug: q.slug } });
            if (!ex) {
              await db.question.create({ data: { slug: q.slug, ...fields } });
              bump(report.created, "question");
            } else if (ex.source === "EDITED" && !opts.force) {
              report.skippedEdited++;
            } else {
              await db.question.update({ where: { id: ex.id }, data: fields });
              bump(report.updated, "question");
            }
          }
        }
      }
    }
  }

  const all = await db.lesson.findMany({ where: { courseId: course.id, source: "SEED" }, select: { slug: true } });
  report.orphanedLessons = all.map((l) => l.slug).filter((s) => !seenLessons.has(s));
  return report;

  async function upsertEditable<T extends { id: string; source: string }>(
    find: () => Promise<T | null>,
    create: () => Promise<T>,
    update: (id: string) => Promise<T>,
    kind: string,
  ): Promise<T> {
    const ex = await find();
    if (!ex) {
      bump(report.created, kind);
      return create();
    }
    if (ex.source === "EDITED" && !opts.force) {
      report.skippedEdited++;
      return ex;
    }
    bump(report.updated, kind);
    return update(ex.id);
  }
}
