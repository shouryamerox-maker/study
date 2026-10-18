import { requirePageStaff } from "@/server/auth/guards";
import Link from "next/link";
import { db } from "@/server/db";
import { Badge, Card, PageHeader } from "@/components/ui";
import { Disclosure } from "@/components/Disclosure";
import { CourseCreate } from "@/components/teacher/CourseCreate";

export const metadata = { title: "Courses & Syllabus" };

export default async function TeacherCourses() {
  await requirePageStaff();
  const [courses, subjects] = await Promise.all([
    db.course.findMany({
      orderBy: [{ order: "asc" }, { title: "asc" }],
      include: { subject: true, _count: { select: { units: true, chapters: true, lessons: true, enrollments: { where: { status: "active" } }, questions: true } } },
    }),
    db.subject.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <>
      <PageHeader title="Courses & Syllabus" description="Manage subjects, courses and their syllabus structure. Content files can also be imported with `npm run content:import`." />
      <div className="mb-5 grid gap-4 md:grid-cols-2">
        {courses.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="mb-1 flex flex-wrap gap-1.5">
              <Badge tone="primary">{c.subject.name}</Badge>
              {c.published ? <Badge tone="success">Published</Badge> : <Badge tone="pending">Unpublished</Badge>}
              {c.isStarterContent && <Badge>Starter content</Badge>}
            </div>
            <Link href={`/teacher/courses/${c.id}`} className="text-[16px] font-semibold hover:text-primary">
              {c.title}
            </Link>
            <p className="mt-1 line-clamp-2 text-[13px] text-muted">{c.summary}</p>
            <p className="mt-2 text-[12px] text-faint">
              {c._count.units} units · {c._count.chapters} chapters · {c._count.lessons} lessons · {c._count.questions} practice questions · {c._count.enrollments} enrolled
            </p>
            <div className="mt-3 flex gap-3 text-[13px]">
              <Link href={`/teacher/courses/${c.id}`} className="text-primary hover:underline">
                Edit syllabus
              </Link>
              <Link href={`/syllabus/${c.slug}`} className="text-muted hover:text-ink">
                Preview as student
              </Link>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <Disclosure
          title={<span className="font-semibold">+ Add a new course</span>}
          meta={<span className="hidden text-[12px] text-faint sm:inline">Physics, Biology, C++… · starts unpublished</span>}
          buttonClassName="px-4 py-3"
          panelClassName="border-t border-divider p-4"
        >
          <CourseCreate subjects={subjects.map((s) => ({ id: s.id, name: s.name }))} />
        </Disclosure>
      </Card>
    </>
  );
}
