import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, FileText, Lock } from "lucide-react";
import { requirePageUser } from "@/server/auth/guards";
import { isStaff } from "@/server/auth/session";
import { db } from "@/server/db";
import { computeCourseProgress, courseContinueLesson, getCourseTree, progressMap } from "@/server/services/learning";
import { PageHeader, ProgressBar, cn } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ course: string; unit: string }> }) {
  const { course, unit } = await params;
  const u = await db.unit.findFirst({ where: { slug: unit, course: { slug: course } }, select: { title: true } });
  return { title: u?.title ?? "Unit" };
}

const unitName = (title: string) => title.replace(/^Unit\s+\d+\s*·\s*/, "");

export default async function UnitPage({ params }: { params: Promise<{ course: string; unit: string }> }) {
  const { course: courseSlug, unit: unitSlug } = await params;
  const user = await requirePageUser();
  const staff = isStaff(user.role);
  const tree = await getCourseTree(courseSlug, { includeUnpublished: staff });
  if (!tree) notFound();
  const ui = tree.units.findIndex((u) => u.slug === unitSlug);
  if (ui < 0) notFound();
  const unit = tree.units[ui];
  const prevUnit = tree.units[ui - 1];
  const nextUnit = tree.units[ui + 1];

  const pm = await progressMap(user.id, tree.id);
  const progress = computeCourseProgress(tree, pm);
  const current = staff ? null : courseContinueLesson(tree, pm);
  const lessons = unit.chapters.flatMap((c) => c.topics.flatMap((t) => t.lessons));
  const done = lessons.filter((l) => pm.get(l.id)?.status === "COMPLETED").length;
  let chapterNo = tree.units.slice(0, ui).reduce((n, u) => n + u.chapters.length, 0);

  return (
    <div className="mx-auto max-w-[760px]">
      <PageHeader back={{ href: `/syllabus/${tree.slug}`, label: `Back to ${tree.title}` }} title={unitName(unit.title)} />
      <div className="-mt-3 mb-8">
        <p className="text-[12.5px] font-medium text-faint">{unit.title.match(/^Unit\s+\d+/)?.[0] ?? `Unit ${ui + 1}`} of {tree.units.length}</p>
        {unit.summary && <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{unit.summary}</p>}
        {!staff && lessons.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <ProgressBar value={(done / lessons.length) * 100} tone={done === lessons.length ? "success" : "primary"} className="max-w-xs" label="Unit progress" />
            <span className="text-[12.5px] tabular-nums text-muted">
              {done} of {lessons.length} lessons
            </span>
          </div>
        )}
      </div>

      <div className="space-y-10">
        {unit.chapters.map((c) => {
          chapterNo++;
          const p = progress.chapters.get(c.id);
          const locked = !staff && p?.state === "locked";
          const chLessons = c.topics.flatMap((t) => t.lessons.map((l) => ({ ...l, topic: t.title })));
          const showTopics = c.topics.length > 1;
          return (
            <section key={c.id} id={`ch-${c.id}`} className="scroll-mt-24" aria-labelledby={`h-${c.id}`}>
              <div className="mb-1 flex items-baseline gap-3">
                <span className="font-mono text-[12px] text-faint">{String(chapterNo).padStart(2, "0")}</span>
                <h2 id={`h-${c.id}`} className="min-w-0 flex-1 text-[18px] font-semibold tracking-[-0.01em]">
                  {c.title}
                </h2>
                {!staff && p && p.total > 0 && (
                  <span className={cn("shrink-0 text-[12.5px] tabular-nums", p.done === p.total ? "text-success" : "text-muted")}>{p.done === p.total ? "Complete" : `${p.done}/${p.total}`}</span>
                )}
              </div>
              {c.summary && <p className="mb-3 pl-[34px] text-[13.5px] leading-relaxed text-muted">{c.summary}</p>}
              {c.coveredInClassAt && <p className="mb-2 pl-[34px] text-[12px] text-accent">Covered in class</p>}
              {locked ? (
                <p className="flex items-center gap-2 rounded-[8px] bg-sidebar px-4 py-3 text-[13.5px] text-muted">
                  <Lock size={14} /> Your teacher has not opened this chapter yet.
                </p>
              ) : (
                <ol className="overflow-hidden rounded-[10px] border border-border bg-surface">
                  {chLessons.map((l, i) => {
                    const st = pm.get(l.id)?.status;
                    const here = current?.id === l.id;
                    const newTopic = showTopics && (i === 0 || chLessons[i - 1].topic !== l.topic);
                    return (
                      <li key={l.id} className={cn(i > 0 && "border-t border-divider")}>
                        {newTopic && <div className="bg-sidebar px-4 pb-1 pt-2 text-[11.5px] font-semibold uppercase tracking-[0.05em] text-faint">{l.topic}</div>}
                        <Link
                          href={`/learn/${tree.slug}/${l.slug}`}
                          aria-current={here ? "step" : undefined}
                          className={cn("group flex items-center gap-3 px-4 py-3 hover:bg-sidebar", here && "bg-primary-soft/50")}
                        >
                          {!staff && (
                            <span
                              className={cn(
                                "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border text-[10px]",
                                st === "COMPLETED" ? "border-success bg-success text-white" : st ? "border-pending bg-pending-soft" : "border-faint/70",
                              )}
                              aria-label={st === "COMPLETED" ? "Completed" : st ? "In progress" : "Not started"}
                            >
                              {st === "COMPLETED" ? "✓" : ""}
                            </span>
                          )}
                          <span className="min-w-0 flex-1 text-[14.5px] group-hover:text-primary">{l.title}</span>
                          {here && <span className="shrink-0 text-[12px] font-medium text-primary">Continue here</span>}
                          {!l.published && <span className="shrink-0 text-[12px] text-pending">Draft</span>}
                          <span className="shrink-0 text-[12px] tabular-nums text-faint">{l.estMinutes} min</span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}
              {c.files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-1">
                  {c.files.map((f) => (
                    <a key={f.id} href={f.url ?? `/api/v1/files/${f.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12.5px] text-primary hover:underline">
                      <FileText size={12} /> {f.title}
                    </a>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <nav aria-label="Units" className="mt-12 grid gap-2 border-t border-border pt-5 sm:grid-cols-2">
        {prevUnit ? (
          <Link href={`/syllabus/${tree.slug}/${prevUnit.slug}`} className="group rounded-[8px] px-3 py-2 hover:bg-surface">
            <span className="flex items-center gap-1 text-[12px] text-muted">
              <ChevronLeft size={13} /> Previous unit
            </span>
            <span className="block truncate text-[14px] font-medium group-hover:text-primary">{unitName(prevUnit.title)}</span>
          </Link>
        ) : (
          <span />
        )}
        {nextUnit && (
          <Link href={`/syllabus/${tree.slug}/${nextUnit.slug}`} className="group rounded-[8px] px-3 py-2 text-right hover:bg-surface">
            <span className="flex items-center justify-end gap-1 text-[12px] text-muted">
              Next unit <ChevronRight size={13} />
            </span>
            <span className="block truncate text-[14px] font-medium group-hover:text-primary">{unitName(nextUnit.title)}</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
