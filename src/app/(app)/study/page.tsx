import { redirect } from "next/navigation";
import Link from "next/link";
import { ListTree } from "lucide-react";
import { requirePageUser } from "@/server/auth/guards";
import { db } from "@/server/db";
import { Card, EmptyState, LinkButton, PageHeader } from "@/components/ui";

export const metadata = { title: "Study Material" };

/** Opens the syllabus of the student's course (or lists courses if there are several). */
export default async function StudyIndex() {
  const user = await requirePageUser();
  const enrolled = await db.enrollment.findMany({ where: { userId: user.id, status: "active", course: { published: true } }, include: { course: true } });
  if (enrolled.length === 1) redirect(`/study/${enrolled[0].course.slug}`);
  const courses = enrolled.length ? enrolled.map((e) => e.course) : await db.course.findMany({ where: { published: true }, orderBy: { order: "asc" } });
  return (
    <>
      <PageHeader title="Study Material" description="Choose a course to see its units, chapters and lessons." />
      {courses.length === 0 ? (
        <Card>
          <EmptyState icon={<ListTree size={18} />} title="No courses yet" />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {courses.map((c) => (
            <Card key={c.id} className="p-4">
              <Link href={`/study/${c.slug}`} className="text-[15px] font-semibold hover:text-primary">
                {c.title}
              </Link>
              <p className="mt-1 line-clamp-2 text-[13px] text-muted">{c.summary}</p>
              <LinkButton href={`/study/${c.slug}`} size="sm" variant="secondary" className="mt-3">
                Open course
              </LinkButton>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
