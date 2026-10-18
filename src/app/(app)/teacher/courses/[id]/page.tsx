import { requirePageStaff } from "@/server/auth/guards";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { getCourseTree } from "@/server/services/learning";
import { LinkButton, PageHeader } from "@/components/ui";
import { SyllabusEditor } from "@/components/teacher/SyllabusEditor";

export const metadata = { title: "Edit syllabus" };

export default async function EditCourse({ params }: { params: Promise<{ id: string }> }) {
  await requirePageStaff();
  const { id } = await params;
  const c = await db.course.findUnique({ where: { id }, select: { slug: true } });
  if (!c) notFound();
  const tree = await getCourseTree(c.slug, { includeUnpublished: true });
  if (!tree) notFound();
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/teacher/courses", label: "Courses & Syllabus" }, { label: tree.title }]}
        title={tree.title}
        description={tree.summary}
        actions={
          <LinkButton href={`/syllabus/${tree.slug}`} variant="secondary" size="sm">
            Preview as student
          </LinkButton>
        }
      />
      <SyllabusEditor
        course={{
          id: tree.id,
          slug: tree.slug,
          title: tree.title,
          summary: tree.summary,
          published: tree.published,
          enforcePrerequisites: tree.enforcePrerequisites,
          isStarterContent: tree.isStarterContent,
          files: tree.files.map((f) => ({ id: f.id, title: f.title, url: f.url })),
          units: tree.units.map((u) => ({
            id: u.id,
            title: u.title,
            chapters: u.chapters.map((ch) => ({
              id: ch.id,
              title: ch.title,
              isAvailable: ch.isAvailable,
              availableFrom: ch.availableFrom?.toISOString() ?? null,
              prerequisiteChapterId: ch.prerequisiteChapterId,
              coveredInClassAt: ch.coveredInClassAt?.toISOString() ?? null,
              files: ch.files.map((f) => ({ id: f.id, title: f.title, url: f.url })),
              topics: ch.topics.map((t) => ({ id: t.id, title: t.title, lessons: t.lessons.map((l) => ({ id: l.id, slug: l.slug, title: l.title, published: l.published })) })),
            })),
          })),
        }}
      />
    </>
  );
}
