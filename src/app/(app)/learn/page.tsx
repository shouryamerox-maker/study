import { redirect } from "next/navigation";
import { requirePageUser } from "@/server/auth/guards";
import { db } from "@/server/db";
import { continueLearning, getCourseTree, orderedLessons } from "@/server/services/learning";

/** "Learn" goes straight to where the student should be studying. */
export default async function LearnIndex() {
  const user = await requirePageUser();
  const cont = await continueLearning(user.id);
  if (cont) redirect(`/learn/${cont.lesson.course.slug}/${cont.lesson.slug}`);
  const enrolled = await db.enrollment.findFirst({ where: { userId: user.id, status: "active" }, include: { course: true } });
  const course = enrolled?.course ?? (await db.course.findFirst({ where: { published: true }, orderBy: { order: "asc" } }));
  if (!course) redirect("/courses");
  const tree = await getCourseTree(course.slug);
  const first = tree ? orderedLessons(tree)[0] : null;
  redirect(first ? `/learn/${course.slug}/${first.slug}` : `/syllabus/${course.slug}`);
}
