import { api } from "@/server/http";
import { db } from "@/server/db";

/** Published courses with the caller's enrolment status. */
export const GET = api("user", async ({ user }) => {
  const courses = await db.course.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { title: "asc" }],
    include: {
      subject: { select: { slug: true, name: true, kind: true } },
      enrollments: { where: { userId: user.id }, select: { status: true, enrolledAt: true } },
      _count: { select: { lessons: { where: { published: true } }, chapters: true } },
    },
  });
  return {
    courses: courses.map(({ enrollments, ...c }) => ({ ...c, enrolled: enrollments[0]?.status === "active" })),
  };
});
