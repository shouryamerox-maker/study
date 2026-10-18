import { z } from "zod";
import { api, notFound, parseBody } from "@/server/http";
import { db } from "@/server/db";
import { logEvent } from "@/server/events";

/** Notes are private: only the author can list or change them. */
export const GET = api<{ id: string }>("user", async ({ params, user }) => {
  const notes = await db.note.findMany({ where: { userId: user.id, lessonId: params.id }, orderBy: { updatedAt: "desc" } });
  return { notes };
});

export const POST = api<{ id: string }>("user", async ({ req, params, user }) => {
  const { body } = await parseBody(req, z.object({ body: z.string().trim().min(1, "Write something first.").max(10000) }));
  const lesson = await db.lesson.findUnique({ where: { id: params.id }, select: { id: true, courseId: true, title: true } });
  if (!lesson) throw notFound("Lesson");
  const note = await db.note.create({ data: { userId: user.id, lessonId: lesson.id, body } });
  await logEvent(user.id, "NOTE_SAVED", { courseId: lesson.courseId, lessonId: lesson.id, label: lesson.title });
  return { note };
});
