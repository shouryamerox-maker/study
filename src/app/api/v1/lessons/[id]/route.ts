import { api, forbidden, notFound } from "@/server/http";
import { db } from "@/server/db";
import { isStaff } from "@/server/auth/session";
import { isLessonLocked } from "@/server/services/learning";

/** Lesson content (blocks). Practice answer keys are never included. */
export const GET = api<{ id: string }>("user", async ({ params, user }) => {
  const lesson = await db.lesson.findUnique({
    where: { id: params.id },
    select: { id: true, slug: true, title: true, summary: true, estMinutes: true, blocks: true, version: true, published: true, courseId: true, chapterId: true, topicId: true, updatedAt: true },
  });
  if (!lesson || (!lesson.published && !isStaff(user.role))) throw notFound("Lesson");
  if (!isStaff(user.role) && (await isLessonLocked(user.id, lesson))) throw forbidden("This lesson is locked.");
  return { lesson };
});
