import { api, notFound } from "@/server/http";
import { computeCourseProgress, getCourseTree, progressMap } from "@/server/services/learning";

/** Syllabus tree with the caller's progress (used by the mobile app). */
export const GET = api<{ slug: string }>("user", async ({ params, user }) => {
  const tree = await getCourseTree(params.slug);
  if (!tree) throw notFound("Course");
  const progress = computeCourseProgress(tree, await progressMap(user.id, tree.id));
  return {
    course: tree,
    progress: { ...progress, chapters: Object.fromEntries(progress.chapters) },
  };
});
