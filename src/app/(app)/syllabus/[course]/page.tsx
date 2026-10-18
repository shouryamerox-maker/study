import { notFound } from "next/navigation";
import { BookOpen, FileText } from "lucide-react";
import { requirePageUser } from "@/server/auth/guards";
import { isStaff } from "@/server/auth/session";
import { db } from "@/server/db";
import { buildOutline, computeCourseProgress, courseContinueLesson, getCourseTree, progressMap } from "@/server/services/learning";
import { LinkButton, PageHeader, ProgressBar } from "@/components/ui";
import { SyllabusOutline } from "@/components/learn/SyllabusOutline";
import { EnrollButton } from "@/components/learn/EnrollButton";

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }) {
  const c = await db.course.findUnique({ where: { slug: (await params).course }, select: { title: true } });
  return { title: c ? `Syllabus · ${c.title}` : "Syllabus" };
}

export default async function CourseSyllabus({ params, searchParams }: { params: Promise<{ course: string }>; searchParams: Promise<{ open?: string }> }) {
  const { course: slug } = await params;
  const { open } = await searchParams;
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
  const next = staff ? null : courseContinueLesson(tree, pm);

  return (
    <div className="mx-auto max-w-[860px]">
      <PageHeader back={staff ? { href: "/teacher/courses", label: "Back to courses" } : { href: "/courses", label: "Back to my courses" }} title={tree.title} />

      <section className="mb-7 -mt-2">
        <p className="max-w-2xl text-[14px] leading-relaxed text-muted line-clamp-3">{tree.summary}</p>
        {tree.isStarterContent && <p className="mt-1.5 text-[12.5px] text-faint">Starter curriculum — your teacher may replace it with the official syllabus.</p>}

        {!staff && (
          <div className="mt-5 flex flex-col gap-4 rounded-[12px] border border-border bg-surface p-5 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] text-muted">Your progress</span>
                <span className="text-[13px] tabular-nums">
                  <strong className="text-ink">{progress.done}</strong> of {progress.total} lessons · {progress.percent}%
                </span>
              </div>
              <ProgressBar value={progress.percent} className="mt-2" label="Course progress" />
              {next && (
                <p className="mt-2.5 truncate text-[13px] text-muted">
                  {next.resume ? "Continue with" : progress.done ? "Up next" : "Start with"}: <span className="font-medium text-ink">{next.title}</span> · {next.chapterTitle}
                </p>
              )}
            </div>
            {next ? (
              <LinkButton href={`/learn/${tree.slug}/${next.slug}`} className="shrink-0">
                <BookOpen size={15} /> {next.started ? "Continue learning" : "Start the course"}
              </LinkButton>
            ) : (
              progress.total > 0 && <span className="text-[13.5px] font-medium text-success">Course complete</span>
            )}
          </div>
        )}
        {!staff && !enrolled && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-muted">
            Enrol to see this course on your dashboard and receive its tests.
            <EnrollButton slug={tree.slug} enrolled={false} />
          </div>
        )}
        {tree.files.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
            {tree.files.map((f) => (
              <a key={f.id} href={f.url ?? `/api/v1/files/${f.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13px] text-primary hover:underline">
                <FileText size={14} /> {f.title}
              </a>
            ))}
          </div>
        )}
      </section>

      <SyllabusOutline
        courseSlug={tree.slug}
        units={buildOutline(tree, staff ? null : progress, staff ? null : pm)}
        currentLessonId={next?.id ?? null}
        initialOpenChapterId={open ?? null}
        showProgress={!staff}
      />
    </div>
  );
}
