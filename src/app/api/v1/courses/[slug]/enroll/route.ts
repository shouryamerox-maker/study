import { api, notFound } from "@/server/http";
import { db } from "@/server/db";

export const POST = api<{ slug: string }>("user", async ({ params, user }) => {
  const course = await db.course.findUnique({ where: { slug: params.slug } });
  if (!course || !course.published) throw notFound("Course");
  await db.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    create: { userId: user.id, courseId: course.id },
    update: { status: "active" },
  });
  return { ok: true };
});

/** Leaving a course keeps all progress records; re-enrolling restores them. */
export const DELETE = api<{ slug: string }>("user", async ({ params, user }) => {
  const course = await db.course.findUnique({ where: { slug: params.slug } });
  if (!course) throw notFound("Course");
  await db.enrollment.updateMany({ where: { userId: user.id, courseId: course.id }, data: { status: "dropped" } });
  return { ok: true };
});
