import "server-only";
import { db } from "@/server/db";
import { computeCourseProgress, getCourseTree, progressMap } from "./learning";

/** Enrolled courses with real progress, for dashboards and reports. */
export async function enrolledCoursesWithProgress(userId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { userId, status: "active", course: { published: true } },
    include: { course: { select: { slug: true } } },
    orderBy: { enrolledAt: "asc" },
  });
  const out = [];
  for (const e of enrollments) {
    const tree = await getCourseTree(e.course.slug);
    if (!tree) continue;
    const pm = await progressMap(userId, tree.id);
    out.push({ tree, enrolledAt: e.enrolledAt, progress: computeCourseProgress(tree, pm), progressMap: pm });
  }
  return out;
}
