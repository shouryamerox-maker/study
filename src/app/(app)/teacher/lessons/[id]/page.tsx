import { requirePageStaff } from "@/server/auth/guards";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { Alert, LinkButton, PageHeader } from "@/components/ui";
import { LessonEditor } from "@/components/teacher/LessonEditor";

export const metadata = { title: "Edit lesson" };

export default async function EditLesson({ params }: { params: Promise<{ id: string }> }) {
  await requirePageStaff();
  const { id } = await params;
  const lesson = await db.lesson.findUnique({ where: { id }, include: { course: true, chapter: true, files: { select: { id: true, title: true, url: true } }, _count: { select: { progress: true, questions: true } } } });
  if (!lesson) notFound();
  return (
    <>
      <PageHeader
        crumbs={[
          { href: "/teacher/courses", label: "Courses" },
          { href: `/teacher/courses/${lesson.courseId}`, label: lesson.course.title },
          { label: lesson.chapter.title },
        ]}
        title={lesson.title}
        actions={
          <LinkButton href={`/learn/${lesson.course.slug}/${lesson.slug}`} variant="secondary" size="sm">
            View as student
          </LinkButton>
        }
      />
      <Alert className="mb-4">
        {lesson._count.progress} student progress record(s) and {lesson._count.questions} practice question(s) are linked to this lesson. Editing keeps them; the lesson&apos;s id and URL never change.
        {lesson.source === "SEED" ? " This lesson comes from the content files — once you save here, re-importing content will no longer overwrite it." : ""}
      </Alert>
      <LessonEditor lesson={{ id: lesson.id, title: lesson.title, summary: lesson.summary, estMinutes: lesson.estMinutes, published: lesson.published, blocks: lesson.blocks, version: lesson.version }} />
    </>
  );
}
