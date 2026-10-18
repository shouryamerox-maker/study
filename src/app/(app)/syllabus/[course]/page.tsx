import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { requirePageUser } from "@/server/auth/guards";
import { isStaff } from "@/server/auth/session";
import { db } from "@/server/db";
import { computeCourseProgress, getCourseTree, progressMap } from "@/server/services/learning";
import { Alert, Badge, Card, PageHeader, ProgressBar, Stat } from "@/components/ui";
import { SyllabusTree } from "@/components/learn/SyllabusTree";
import { EnrollButton } from "@/components/learn/EnrollButton";

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }) {
  const c = await db.course.findUnique({ where: { slug: (await params).course }, select: { title: true } });
  return { title: c ? `Syllabus · ${c.title}` : "Syllabus" };
}

export default async function CourseSyllabus({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const user = await requirePageUser();
  const staff = isStaff(user.role);
  const tree = await getCourseTree(slug, { includeUnpublished: staff });
  if (!tree) notFound();
  const [pm, enrollment] = await Promise.all([
    progressMap(user.id, tree.id),
    db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: tree.id } } }),
  ]);
  const progress = computeCourseProgress(tree, pm);
  const enrolled = enrollment?.status === "active";
  const covered = tree.units.flatMap((u) => u.chapters).filter((c) => c.coveredInClassAt).length;

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/syllabus", label: "Syllabus" }, { label: tree.title }]}
        title={tree.title}
        description={tree.summary}
        actions={!staff && <EnrollButton slug={tree.slug} enrolled={enrolled} />}
      />
      {tree.isStarterContent && (
        <Alert tone="neutral" className="mb-5" title="Starter curriculum">
          This course uses the platform&apos;s starter C curriculum. It will be updated to match the official syllabus when your teacher publishes it.
        </Alert>
      )}
      {tree.files.length > 0 && (
        <Card className="mb-5 p-4">
          <div className="label-caps mb-2">Syllabus documents</div>
          <div className="flex flex-wrap gap-3">
            {tree.files.map((f) => (
              <a key={f.id} href={f.url ?? `/api/v1/files/${f.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13.5px] text-primary hover:underline">
                <FileText size={14} /> {f.title}
              </a>
            ))}
          </div>
        </Card>
      )}
      {!staff && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Course completion" value={`${progress.percent}%`} hint={<ProgressBar value={progress.percent} className="mt-1.5" />} />
          <Stat label="Lessons completed" value={`${progress.done} / ${progress.total}`} />
          <Stat label="Chapters completed" value={`${progress.chaptersCompleted} / ${progress.chapterCount}`} />
          <Stat label="Covered in class" value={`${covered} / ${progress.chapterCount}`} hint="Marked by your teacher" />
        </div>
      )}
      {!staff && !enrolled && (
        <Alert tone="primary" className="mb-5">
          You can read lessons without enrolling, but enrol to see this course on your dashboard and receive course tests.
        </Alert>
      )}
      <div className="mb-3 flex flex-wrap gap-2 text-[12px] text-muted">
        <Badge tone="success">Completed</Badge>
        <Badge tone="pending">In progress</Badge>
        <Badge>Not started</Badge>
        <Badge>Locked</Badge>
      </div>
      <SyllabusTree tree={tree} chapters={progress.chapters} lessonStatus={(id) => pm.get(id)?.status} showProgress={!staff} />
    </>
  );
}
