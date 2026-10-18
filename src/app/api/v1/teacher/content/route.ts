import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { api, badRequest, conflict, notFound, parseBody } from "@/server/http";
import { db } from "@/server/db";
import { slugify } from "@/lib/slug";

const kind = z.enum(["unit", "chapter", "topic", "lesson"]);

const op = z.discriminatedUnion("op", [
  z.object({ op: z.literal("createSubject"), name: z.string().trim().min(2).max(120), kind: z.enum(["PROGRAMMING", "SCIENCE", "GENERAL"]) }),
  z.object({
    op: z.literal("createCourse"),
    subjectId: z.string(),
    title: z.string().trim().min(3).max(200),
    summary: z.string().trim().min(1).max(2000),
    codeLanguage: z.enum(["c", "cpp", "python", "java"]).nullish(),
  }),
  z.object({
    op: z.literal("updateCourse"),
    id: z.string(),
    title: z.string().trim().min(3).max(200).optional(),
    summary: z.string().trim().min(1).max(2000).optional(),
    level: z.string().max(60).optional(),
    published: z.boolean().optional(),
    enforcePrerequisites: z.boolean().optional(),
    isStarterContent: z.boolean().optional(),
  }),
  z.object({ op: z.literal("create"), kind, parentId: z.string(), title: z.string().trim().min(1).max(200) }),
  z.object({
    op: z.literal("update"),
    kind,
    id: z.string(),
    title: z.string().trim().min(1).max(200).optional(),
    summary: z.string().max(2000).nullish(),
    isAvailable: z.boolean().optional(),
    availableFrom: z.coerce.date().nullish(),
    prerequisiteChapterId: z.string().nullish(),
    coveredInClass: z.boolean().optional(),
    published: z.boolean().optional(),
  }),
  z.object({ op: z.literal("move"), kind, id: z.string(), direction: z.enum(["up", "down"]) }),
  z.object({ op: z.literal("delete"), kind, id: z.string() }),
]);

async function uniqueSlug(base: string, exists: (s: string) => Promise<boolean>) {
  let slug = slugify(base);
  for (let i = 2; await exists(slug); i++) slug = `${slugify(base)}-${i}`;
  return slug;
}

/**
 * Syllabus editing. Every record touched here is marked EDITED so a later content
 * import does not overwrite the teacher's changes. Stable ids are never changed.
 */
export const POST = api("staff", async ({ req }) => {
  const input = await parseBody(req, op);
  switch (input.op) {
    case "createSubject": {
      const slug = await uniqueSlug(input.name, async (s) => !!(await db.subject.findUnique({ where: { slug: s } })));
      return { subject: await db.subject.create({ data: { slug, name: input.name, kind: input.kind } }) };
    }
    case "createCourse": {
      const slug = await uniqueSlug(input.title, async (s) => !!(await db.course.findUnique({ where: { slug: s } })));
      const course = await db.course.create({
        data: { slug, subjectId: input.subjectId, title: input.title, summary: input.summary, codeLanguage: input.codeLanguage ?? null, source: "EDITED", published: false },
      });
      return { course };
    }
    case "updateCourse": {
      const { id, op: _op, ...data } = input;
      return { course: await db.course.update({ where: { id }, data: { ...data, source: "EDITED" } }) };
    }
    case "create":
      return { item: await createItem(input.kind, input.parentId, input.title) };
    case "update":
      return { item: await updateItem(input) };
    case "move":
      await moveItem(input.kind, input.id, input.direction);
      return { ok: true };
    case "delete":
      await deleteItem(input.kind, input.id);
      return { ok: true };
  }
});

async function createItem(k: z.infer<typeof kind>, parentId: string, title: string) {
  if (k === "unit") {
    const course = await db.course.findUnique({ where: { id: parentId } });
    if (!course) throw notFound("Course");
    const slug = await uniqueSlug(title, async (s) => !!(await db.unit.findUnique({ where: { courseId_slug: { courseId: course.id, slug: s } } })));
    const order = await db.unit.count({ where: { courseId: course.id } });
    return db.unit.create({ data: { courseId: course.id, slug, title, order, source: "EDITED" } });
  }
  if (k === "chapter") {
    const unit = await db.unit.findUnique({ where: { id: parentId } });
    if (!unit) throw notFound("Unit");
    const slug = await uniqueSlug(title, async (s) => !!(await db.chapter.findUnique({ where: { courseId_slug: { courseId: unit.courseId, slug: s } } })));
    const order = await db.chapter.count({ where: { unitId: unit.id } });
    return db.chapter.create({ data: { courseId: unit.courseId, unitId: unit.id, slug, title, order, source: "EDITED" } });
  }
  if (k === "topic") {
    const chapter = await db.chapter.findUnique({ where: { id: parentId } });
    if (!chapter) throw notFound("Chapter");
    const slug = await uniqueSlug(title, async (s) => !!(await db.topic.findUnique({ where: { chapterId_slug: { chapterId: chapter.id, slug: s } } })));
    const order = await db.topic.count({ where: { chapterId: chapter.id } });
    return db.topic.create({ data: { chapterId: chapter.id, slug, title, order, source: "EDITED" } });
  }
  const topic = await db.topic.findUnique({ where: { id: parentId }, include: { chapter: true } });
  if (!topic) throw notFound("Topic");
  const slug = await uniqueSlug(title, async (s) => !!(await db.lesson.findUnique({ where: { courseId_slug: { courseId: topic.chapter.courseId, slug: s } } })));
  const order = await db.lesson.count({ where: { topicId: topic.id } });
  const blocks = [
    { type: "objectives", items: ["Describe the learning objective here."] },
    { type: "markdown", md: "Write the lesson explanation here." },
  ];
  // New lessons start unpublished so students never see a half-written page.
  return db.lesson.create({
    data: { courseId: topic.chapter.courseId, chapterId: topic.chapterId, topicId: topic.id, slug, title, order, blocks, published: false, source: "EDITED" },
  });
}

async function updateItem(input: Extract<z.infer<typeof op>, { op: "update" }>) {
  const base = { ...(input.title ? { title: input.title } : {}), source: "EDITED" as const };
  switch (input.kind) {
    case "unit":
      return db.unit.update({ where: { id: input.id }, data: { ...base, ...(input.summary !== undefined ? { summary: input.summary } : {}) } });
    case "topic":
      return db.topic.update({ where: { id: input.id }, data: base });
    case "lesson":
      return db.lesson.update({ where: { id: input.id }, data: { ...base, ...(input.published !== undefined ? { published: input.published } : {}) } });
    case "chapter": {
      const data: Prisma.ChapterUncheckedUpdateInput = { ...base };
      if (input.summary !== undefined) data.summary = input.summary;
      if (input.isAvailable !== undefined) data.isAvailable = input.isAvailable;
      if (input.availableFrom !== undefined) data.availableFrom = input.availableFrom;
      if (input.coveredInClass !== undefined) data.coveredInClassAt = input.coveredInClass ? new Date() : null;
      if (input.prerequisiteChapterId !== undefined) {
        if (input.prerequisiteChapterId === input.id) throw badRequest("A chapter cannot be its own prerequisite.");
        data.prerequisiteChapterId = input.prerequisiteChapterId || null;
      }
      return db.chapter.update({ where: { id: input.id }, data });
    }
  }
}

async function moveItem(k: z.infer<typeof kind>, id: string, dir: "up" | "down") {
  type Row = { id: string; order: number };
  const siblings = async (): Promise<Row[]> => {
    if (k === "unit") {
      const u = await db.unit.findUniqueOrThrow({ where: { id } });
      return db.unit.findMany({ where: { courseId: u.courseId }, orderBy: { order: "asc" }, select: { id: true, order: true } });
    }
    if (k === "chapter") {
      const c = await db.chapter.findUniqueOrThrow({ where: { id } });
      return db.chapter.findMany({ where: { unitId: c.unitId }, orderBy: { order: "asc" }, select: { id: true, order: true } });
    }
    if (k === "topic") {
      const t = await db.topic.findUniqueOrThrow({ where: { id } });
      return db.topic.findMany({ where: { chapterId: t.chapterId }, orderBy: { order: "asc" }, select: { id: true, order: true } });
    }
    const l = await db.lesson.findUniqueOrThrow({ where: { id } });
    return db.lesson.findMany({ where: { topicId: l.topicId }, orderBy: { order: "asc" }, select: { id: true, order: true } });
  };
  const list = await siblings();
  const i = list.findIndex((r) => r.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  // Rewrite contiguous order values so ordering stays stable.
  await db.$transaction(
    list.map((r, idx) => {
      const data = { order: idx, source: "EDITED" as const };
      if (k === "unit") return db.unit.update({ where: { id: r.id }, data });
      if (k === "chapter") return db.chapter.update({ where: { id: r.id }, data });
      if (k === "topic") return db.topic.update({ where: { id: r.id }, data });
      return db.lesson.update({ where: { id: r.id }, data });
    }),
  );
}

/** Deleting is refused when students have records attached; unpublish/close instead. */
async function deleteItem(k: z.infer<typeof kind>, id: string) {
  const lessonWhere: Prisma.LessonWhereInput = k === "unit" ? { chapter: { unitId: id } } : k === "chapter" ? { chapterId: id } : k === "topic" ? { topicId: id } : { id };
  const used = await db.lessonProgress.count({ where: { lesson: lessonWhere } });
  if (used > 0) throw conflict(`Students have progress recorded here (${used} record(s)). Unpublish it or mark the chapter unavailable instead of deleting.`);
  if (k === "unit") await db.unit.delete({ where: { id } });
  else if (k === "chapter") await db.chapter.delete({ where: { id } });
  else if (k === "topic") await db.topic.delete({ where: { id } });
  else await db.lesson.delete({ where: { id } });
}
