import Link from "next/link";
import { BookOpen, GraduationCap } from "lucide-react";
import { requirePageUser } from "@/server/auth/guards";
import { db } from "@/server/db";
import { enrolledCoursesWithProgress } from "@/server/services/student";
import { Badge, Card, EmptyState, LinkButton, PageHeader, ProgressBar } from "@/components/ui";
import { EnrollButton } from "@/components/learn/EnrollButton";

export const metadata = { title: "Study Material" };

export default async function CoursesPage() {
  const user = await requirePageUser();
  const [mine, all] = await Promise.all([
    enrolledCoursesWithProgress(user.id),
    db.course.findMany({
      where: { published: true },
      include: { subject: true, _count: { select: { lessons: { where: { published: true } }, chapters: true } } },
      orderBy: [{ order: "asc" }, { title: "asc" }],
    }),
  ]);
  const enrolledIds = new Set(mine.map((m) => m.tree.id));
  const available = all.filter((c) => !enrolledIds.has(c.id));

  return (
    <>
      <PageHeader title="Study Material" description="Courses with lessons and practice. The official university syllabus is under Syllabus." />
      <h2 className="label-caps mb-2">Enrolled</h2>
      {mine.length === 0 ? (
        <Card className="mb-6">
          <EmptyState icon={<GraduationCap size={18} />} title="You are not enrolled in any course yet">
            Enrol in a course below to start tracking your progress.
          </EmptyState>
        </Card>
      ) : (
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {mine.map(({ tree, progress }) => (
            <Card key={tree.id} className="flex flex-col p-4">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge tone="primary">{tree.subject.name}</Badge>
                {tree.isStarterContent && <Badge>Starter content</Badge>}
              </div>
              <h3 className="text-[16px] font-semibold">{tree.title}</h3>
              <p className="mt-1 line-clamp-2 text-[13px] text-muted">{tree.summary}</p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-[12.5px] text-muted">
                  <span>
                    {progress.done} of {progress.total} lessons
                  </span>
                  <span className="font-medium text-ink">{progress.percent}%</span>
                </div>
                <ProgressBar value={progress.percent} label={`${tree.title} progress`} />
                <p className="mt-1.5 text-[12px] text-faint">
                  {progress.chaptersCompleted} of {progress.chapterCount} chapters complete
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <LinkButton href={`/study/${tree.slug}`} size="sm">
                  <BookOpen size={14} /> Open course
                </LinkButton>
                <EnrollButton slug={tree.slug} enrolled />
              </div>
            </Card>
          ))}
        </div>
      )}

      <h2 className="label-caps mb-2">Available courses</h2>
      {available.length === 0 ? (
        <p className="text-[13.5px] text-muted">{all.length === 0 ? "No courses have been published yet." : "You are enrolled in every available course."}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {available.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge tone="primary">{c.subject.name}</Badge>
                <Badge>{c.level}</Badge>
              </div>
              <h3 className="text-[16px] font-semibold">
                <Link href={`/study/${c.slug}`} className="hover:text-primary">
                  {c.title}
                </Link>
              </h3>
              <p className="mt-1 text-[13px] text-muted">{c.summary}</p>
              <p className="mt-2 text-[12px] text-faint">
                {c._count.chapters} chapters · {c._count.lessons} lessons
              </p>
              <div className="mt-3">
                <EnrollButton slug={c.slug} enrolled={false} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
