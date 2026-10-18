"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Circle, CircleDashed, FileText, Lock } from "lucide-react";
import { cn } from "@/components/ui";

export type OutlineState = "completed" | "in_progress" | "not_started" | "locked";
export interface OutlineLesson {
  id: string;
  slug: string;
  title: string;
  estMinutes: number;
  status: "COMPLETED" | "IN_PROGRESS" | null;
  published: boolean;
}
export interface OutlineChapter {
  id: string;
  number: number;
  title: string;
  summary: string | null;
  state: OutlineState | null;
  done: number;
  total: number;
  covered: boolean;
  lessons: OutlineLesson[];
  files: { id: string; title: string; url: string | null }[];
}
export interface OutlineUnit {
  id: string;
  title: string;
  chapters: OutlineChapter[];
}

const stateIcon = {
  completed: { icon: CheckCircle2, cls: "text-success", label: "Completed" },
  in_progress: { icon: CircleDashed, cls: "text-pending", label: "In progress" },
  not_started: { icon: Circle, cls: "text-faint", label: "Not started" },
  locked: { icon: Lock, cls: "text-faint", label: "Locked" },
} as const;

export function SyllabusOutline({
  courseSlug,
  units,
  currentLessonId,
  initialOpenChapterId,
  showProgress,
}: {
  courseSlug: string;
  units: OutlineUnit[];
  currentLessonId: string | null;
  initialOpenChapterId: string | null;
  showProgress: boolean;
}) {
  const storageKey = `sl:outline:${courseSlug}`;
  const chapterOfLesson = useMemo(() => {
    const m = new Map<string, string>();
    units.forEach((u) => u.chapters.forEach((c) => c.lessons.forEach((l) => m.set(l.id, c.id))));
    return m;
  }, [units]);
  const unitOfChapter = useMemo(() => {
    const m = new Map<string, string>();
    units.forEach((u) => u.chapters.forEach((c) => m.set(c.id, u.id)));
    return m;
  }, [units]);

  const focusChapter = initialOpenChapterId ?? (currentLessonId ? chapterOfLesson.get(currentLessonId) ?? null : null);
  const [openUnits, setOpenUnits] = useState<Set<string>>(() => new Set([focusChapter ? unitOfChapter.get(focusChapter)! : units[0]?.id].filter(Boolean) as string[]));
  const [openChapters, setOpenChapters] = useState<Set<string>>(() => new Set(focusChapter ? [focusChapter] : []));

  // Restore what the student had open earlier in this session, always keeping the focus chapter visible.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? "null") as { u: string[]; c: string[] } | null;
      if (saved) {
        setOpenUnits(new Set([...saved.u, ...(focusChapter ? [unitOfChapter.get(focusChapter)!] : [])]));
        setOpenChapters(new Set([...saved.c, ...(focusChapter ? [focusChapter] : [])]));
      }
    } catch {
      /* ignore */
    }
    if (focusChapter) {
      requestAnimationFrame(() => document.getElementById(`ch-${focusChapter}`)?.scrollIntoView({ block: "center" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ u: [...openUnits], c: [...openChapters] }));
    } catch {
      /* ignore */
    }
  }, [openUnits, openChapters, storageKey]);

  const toggle = (set: Set<string>, id: string) => {
    const n = new Set(set);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  };
  const allOpen = openUnits.size === units.length;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">Course outline</h2>
        <button
          type="button"
          className="text-[12.5px] font-medium text-primary hover:underline"
          onClick={() => {
            if (allOpen) {
              setOpenUnits(new Set());
              setOpenChapters(new Set());
            } else setOpenUnits(new Set(units.map((u) => u.id)));
          }}
        >
          {allOpen ? "Collapse all" : "Expand all units"}
        </button>
      </div>
      <div className="overflow-hidden rounded-[12px] border border-border bg-surface">
        {units.map((u, ui) => {
          const uOpen = openUnits.has(u.id);
          const uDone = u.chapters.reduce((n, c) => n + c.done, 0);
          const uTotal = u.chapters.reduce((n, c) => n + c.total, 0);
          const containsCurrent = u.chapters.some((c) => c.lessons.some((l) => l.id === currentLessonId));
          return (
            <section key={u.id} className={cn(ui > 0 && "border-t border-border")}>
              <h3>
                <button
                  type="button"
                  aria-expanded={uOpen}
                  aria-controls={`unit-${u.id}`}
                  onClick={() => setOpenUnits((s) => toggle(s, u.id))}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-sidebar"
                >
                  <ChevronDown size={16} className={cn("shrink-0 text-faint transition-transform duration-150", !uOpen && "-rotate-90")} aria-hidden />
                  <span className="min-w-0 flex-1 font-semibold">{u.title}</span>
                  {containsCurrent && <span className="hidden text-[12px] text-primary sm:inline">You are here</span>}
                  {showProgress && uTotal > 0 && (
                    <span className={cn("text-[12.5px] tabular-nums", uDone === uTotal ? "text-success" : "text-muted")}>
                      {uDone}/{uTotal}
                    </span>
                  )}
                </button>
              </h3>
              <div id={`unit-${u.id}`} hidden={!uOpen}>
                <ul className="pb-1.5">
                  {u.chapters.map((c) => {
                    const cOpen = openChapters.has(c.id);
                    const st = c.state ? stateIcon[c.state] : null;
                    const Icon = st?.icon ?? Circle;
                    const locked = c.state === "locked";
                    return (
                      <li key={c.id} id={`ch-${c.id}`} className="scroll-mt-24">
                        <button
                          type="button"
                          aria-expanded={cOpen}
                          aria-controls={`chl-${c.id}`}
                          onClick={() => setOpenChapters((s) => toggle(s, c.id))}
                          className={cn("flex w-full items-center gap-3 py-2 pl-11 pr-4 text-left hover:bg-sidebar", cOpen && "bg-sidebar/70")}
                        >
                          {showProgress ? <Icon size={16} className={cn("shrink-0", st?.cls)} aria-label={st?.label} /> : <span className="w-4 shrink-0" />}
                          <span className="w-6 shrink-0 font-mono text-[12px] text-faint">{String(c.number).padStart(2, "0")}</span>
                          <span className="min-w-0 flex-1 text-[14px]">{c.title}</span>
                          {c.covered && <span className="hidden text-[11.5px] text-accent md:inline">Covered in class</span>}
                          {showProgress && c.total > 0 && (
                            <span className="text-[12px] tabular-nums text-muted">
                              {c.done}/{c.total}
                            </span>
                          )}
                          <ChevronDown size={14} className={cn("shrink-0 text-faint transition-transform duration-150", !cOpen && "-rotate-90")} aria-hidden />
                        </button>
                        <div id={`chl-${c.id}`} hidden={!cOpen} className="bg-sidebar/70 pb-2.5 pl-[84px] pr-4">
                          {c.summary && <p className="mb-1.5 text-[13px] text-muted">{c.summary}</p>}
                          {locked ? (
                            <p className="flex items-center gap-1.5 py-1 text-[13px] text-muted">
                              <Lock size={13} /> Your teacher has not opened this chapter yet.
                            </p>
                          ) : (
                            <ol className="space-y-0.5">
                              {c.lessons.map((l) => {
                                const current = l.id === currentLessonId;
                                return (
                                  <li key={l.id}>
                                    <Link
                                      href={`/learn/${courseSlug}/${l.slug}`}
                                      aria-current={current ? "step" : undefined}
                                      className={cn(
                                        "flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-[13.5px] hover:bg-surface hover:text-primary",
                                        current && "bg-primary-soft font-medium text-primary-dark",
                                      )}
                                    >
                                      {showProgress &&
                                        (l.status === "COMPLETED" ? (
                                          <CheckCircle2 size={14} className="shrink-0 text-success" aria-label="Completed" />
                                        ) : l.status === "IN_PROGRESS" ? (
                                          <CircleDashed size={14} className="shrink-0 text-pending" aria-label="In progress" />
                                        ) : (
                                          <Circle size={14} className="shrink-0 text-faint" aria-label="Not started" />
                                        ))}
                                      <span className="min-w-0 flex-1">{l.title}</span>
                                      {current && <span className="text-[11.5px]">Continue here</span>}
                                      {!l.published && <span className="text-[11.5px] text-pending">Draft</span>}
                                      <span className="text-[11.5px] tabular-nums text-faint">{l.estMinutes} min</span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ol>
                          )}
                          {c.files.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                              {c.files.map((f) => (
                                <a key={f.id} href={f.url ?? `/api/v1/files/${f.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12.5px] text-primary hover:underline">
                                  <FileText size={12} /> {f.title}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
