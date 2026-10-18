import { api, notFound } from "@/server/http";
import { db } from "@/server/db";
import { logEvent } from "@/server/events";

export const POST = api<{ id: string }>("user", async ({ params, user }) => {
  const lesson = await db.lesson.findUnique({ where: { id: params.id }, select: { id: true, courseId: true, title: true } });
  if (!lesson) throw notFound("Lesson");
  await db.bookmark.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
    create: { userId: user.id, lessonId: lesson.id },
    update: {},
  });
  await logEvent(user.id, "BOOKMARK_ADDED", { courseId: lesson.courseId, lessonId: lesson.id, label: lesson.title });
  return { bookmarked: true };
});

export const DELETE = api<{ id: string }>("user", async ({ params, user }) => {
  await db.bookmark.deleteMany({ where: { userId: user.id, lessonId: params.id } });
  return { bookmarked: false };
});
