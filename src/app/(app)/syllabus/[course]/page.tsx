import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookOpen, ChevronRight, FileText } from "lucide-react";
import { requirePageUser } from "@/server/auth/guards";
import { isStaff } from "@/server/auth/session";
import { db } from "@/server/db";
import { computeCourseProgress, courseContinueLesson, getCourseTree, progressMap } from "@/server/services/learning";
import { LinkButton, PageHeader, ProgressBar, cn } from "@/components/ui";
import { LessonFinder } from "@/components/learn/LessonFinder";
import { EnrollButton } from "@/components/learn/EnrollButton";

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }) {
  const c = await db.course.findUnique({ where: { slug: (await params).course }, select: { title: true } });
  return { title: c ? `Syllabus · ${c.title}` : "Syllabus" };
}

const unitLabel = (title: string) => {
  const m = title.match(/^(Unit\s+\d+)\s*·\s*(.*)$/);
  return m ? { kicker: m[1], name: m[2] } : { kicker: null, name: title };
};

export default async function CourseSyllabus({ params, searchParams }: { params: Promise<{ course: string }>; searchParams: Promise<{ open?: string }> }) {
  const { course: slug } = await params;
  const { open } = await searchParams;
  const user = await requirePageUser();
  const staff = isStaff(user.role);
  const tree = await getCourseTree(slug, { includeUnpublished: staff });
  if (!tree) notFound();

  // Older links (?open=<chapterId>) go straight to that chapter inside its unit.
  if (open) {
    const unit = tree.units.find((u) => u.chapters.some((c) => c.id === open));
    if (unit) redirect(`/syllabus/${tree.slug}/${unit.slug}#ch-${open}`);
  }

  const [pm, enrollment] = await Promise.all([
    progressMap(user.id, tree.id),
    db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: tree.id } } }),
  ]);
  const progress = computeCourseProgress(tree, pm);
  const enrolled = enrollment?.status === "active";
  const next = staff ? null : courseContinueLesson(tree, pm);

  // The unit the student most recently opened a lesson in.
  let lastUnitId: string | null = null;
  let lastTime = 0;
  for (const u of tree.units)
    for (const c of u.chapters)
      for (const t of c.topics)
        for (const l of t.lessons) {
          const p = pm.get(l.id);
          if (p && p.lastViewedAt.getTime() > lastTime) {
            lastTime = p.lastViewedAt.getTime();
            lastUnitId = u.id;
          }
        }

  const finder = tree.units.flatMap((u) =>
    u.chapters.flatMap((c) => c.topics.flatMap((t) => t.lessons.map((l) => ({ slug: l.slug, title: l.title, chapter: c.title, unit: unitLabel(u.title).name, done: pm.get(l.id)?.status === "COMPLETED" })))),
  );

  return (
    <div className="mx-auto max-w-[820px]">
      <PageHeader back={staff ? { href: "/teacher/courses", label: "Back to courses" } : { href: "/courses", label: "Back to my courses" }} title={tree.title} />

      <section className="-mt-2 mb-8">
        <p className="max-w-2xl text-[14.5px] leading-relaxed text-muted">{tree.summary}</p>
        <p className="mt-2 text-[12.5px] text-faint">
          {tree.units.length} units · {progress.chapterCount} chapters · {progress.total} lessons
          {tree.isStarterContent ? " · Starter curriculum — your teacher may replace it with the official syllabus." : ""}
        </p>

        {!staff && (
          <div className="mt-5 flex flex-col gap-4 rounded-[12px] border border-border bg-surface p-5 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="text-muted">Your progress</span>
                <span className="tabular-nums">
                  <strong>{progress.done}</strong> of {progress.total} lessons · {progress.percent}%
                </span>
              </div>
              <ProgressBar value={progress.percent} className="mt-2" label="Course progress" />
              {next && (
                <p className="mt-2.5 truncate text-[13px] text-muted">
                  {next.resume ? "Continue with" : progress.done ? "Up next" : "Start with"}: <span className="font-medium text-ink">{next.title}</span>
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

      <div className="mb-6">
        <LessonFinder courseSlug={tree.slug} items={finder} />
      </div>

      <h2 className="mb-2 text-[15px] font-semibold">Units</h2>
      <ol className="overflow-hidden rounded-[12px] border border-border bg-surface">
        {tree.units.map((u, i) => {
          const lessons = u.chapters.flatMap((c) => c.topics.flatMap((t) => t.lessons));
          const done = lessons.filter((l) => pm.get(l.id)?.status === "COMPLETED").length;
          const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
          const label = unitLabel(u.title);
          const isLast = !staff && u.id === lastUnitId;
          return (
            <li key={u.id} className={cn(i > 0 && "border-t border-divider")}>
              <Link href={`/syllabus/${tree.slug}/${u.slug}`} className={cn("group flex items-center gap-4 px-5 py-4 hover:bg-sidebar", isLast && "bg-primary-soft/40")}>
                <span className="w-14 shrink-0 text-[12px] font-medium text-faint">{label.kicker ?? `Unit ${i + 1}`}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2">
                    <span className="text-[15px] font-medium group-hover:text-primary">{label.name}</span>
                    {isLast && <span className="text-[12px] font-medium text-primary">Last studied</span>}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] text-muted">
                    {u.chapters.length} chapter{u.chapters.length === 1 ? "" : "s"} · {lessons.length} lessons
                  </span>
                </span>
                {!staff && (
                  <span className="hidden w-36 shrink-0 sm:block">
                    <span className={cn("mb-1 block text-right text-[12px] tabular-nums", done === lessons.length && lessons.length > 0 ? "text-success" : "text-muted")}>
                      {done === lessons.length && lessons.length > 0 ? "Complete" : `${done}/${lessons.length}`}
                    </span>
                    <ProgressBar value={pct} tone={pct === 100 ? "success" : "primary"} label={`${label.name} progress`} />
                  </span>
                )}
                <ChevronRight size={16} className="shrink-0 text-faint group-hover:text-primary" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
