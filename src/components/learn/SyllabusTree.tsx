import Link from "next/link";
import { CheckCircle2, Circle, CircleDashed, FileText, Lock } from "lucide-react";
import type { CourseTree, ChapterState } from "@/server/services/learning";
import { Badge, ProgressBar, cn } from "@/components/ui";

const stateBadge: Record<ChapterState, { label: string; tone: "success" | "pending" | "neutral" }> = {
  completed: { label: "Completed", tone: "success" },
  in_progress: { label: "In progress", tone: "pending" },
  not_started: { label: "Not started", tone: "neutral" },
  locked: { label: "Locked", tone: "neutral" },
};

export function SyllabusTree({
  tree,
  chapters,
  lessonStatus,
  showProgress,
}: {
  tree: CourseTree;
  chapters: Map<string, { total: number; done: number; state: ChapterState }>;
  lessonStatus: (lessonId: string) => "COMPLETED" | "IN_PROGRESS" | undefined;
  showProgress: boolean;
}) {
  let chapterNo = 0;
  return (
    <div className="space-y-6">
      {tree.units.map((u) => (
        <section key={u.id} aria-labelledby={`unit-${u.id}`}>
          <div className="mb-2">
            <h2 id={`unit-${u.id}`} className="text-[15px] font-semibold">
              {u.title}
            </h2>
            {u.summary && <p className="text-[12.5px] text-muted">{u.summary}</p>}
          </div>
          <div className="card divide-y divide-divider overflow-hidden">
            {u.chapters.map((c) => {
              chapterNo++;
              const p = chapters.get(c.id);
              const locked = p?.state === "locked";
              return (
                <details key={c.id} className="group" open={showProgress && p?.state === "in_progress"}>
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 hover:bg-sidebar [&::-webkit-details-marker]:hidden">
                    <span className="w-7 shrink-0 font-mono text-[12px] text-faint">{String(chapterNo).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{c.title}</span>
                        {showProgress && p && (
                          <Badge tone={stateBadge[p.state].tone}>
                            {locked && <Lock size={11} />}
                            {stateBadge[p.state].label}
                          </Badge>
                        )}
                        {c.coveredInClassAt && <Badge tone="accent">Covered in class</Badge>}
                      </div>
                      {c.summary && <p className="mt-0.5 line-clamp-1 text-[12.5px] text-muted">{c.summary}</p>}
                    </div>
                    {showProgress && p && p.total > 0 && (
                      <div className="hidden w-32 shrink-0 sm:block">
                        <div className="mb-1 text-right text-[11.5px] text-muted">
                          {p.done}/{p.total}
                        </div>
                        <ProgressBar value={(p.done / p.total) * 100} tone={p.state === "completed" ? "success" : "primary"} label={`${c.title} progress`} />
                      </div>
                    )}
                  </summary>
                  <div className="bg-sidebar/60 px-4 pb-3 pt-1 sm:pl-14">
                    {c.topics.map((t) => (
                      <div key={t.id} className="mt-2">
                        <div className="label-caps mb-1">{t.title}</div>
                        <ul className="space-y-0.5">
                          {t.lessons.map((l) => {
                            const st = lessonStatus(l.id);
                            const Icon = st === "COMPLETED" ? CheckCircle2 : st === "IN_PROGRESS" ? CircleDashed : Circle;
                            return (
                              <li key={l.id}>
                                {locked ? (
                                  <span className="flex items-center gap-2 py-1 text-[13.5px] text-faint">
                                    <Lock size={13} /> {l.title}
                                  </span>
                                ) : (
                                  <Link href={`/learn/${tree.slug}/${l.slug}`} className="group/l flex items-center gap-2 rounded-[6px] py-1 text-[13.5px] hover:text-primary">
                                    <Icon size={14} className={cn(st === "COMPLETED" ? "text-success" : st === "IN_PROGRESS" ? "text-pending" : "text-faint")} aria-hidden />
                                    <span>{l.title}</span>
                                    <span className="ml-auto text-[11.5px] text-faint">{l.estMinutes} min</span>
                                    {!l.published && <Badge tone="pending">Draft</Badge>}
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                    {c.files.length > 0 && (
                      <div className="mt-3">
                        <div className="label-caps mb-1">Resources</div>
                        {c.files.map((f) => (
                          <a key={f.id} href={f.url ?? `/api/v1/files/${f.id}`} className="flex items-center gap-2 py-0.5 text-[13px] text-primary hover:underline" target="_blank" rel="noreferrer">
                            <FileText size={13} /> {f.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
