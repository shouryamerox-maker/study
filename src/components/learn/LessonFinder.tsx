"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Search } from "lucide-react";

export interface FinderItem {
  slug: string;
  title: string;
  chapter: string;
  unit: string;
  done: boolean;
}

/** Instant filter over every lesson and chapter in the course. */
export function LessonFinder({ courseSlug, items }: { courseSlug: string; items: FinderItem[] }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    return items.filter((i) => i.title.toLowerCase().includes(t) || i.chapter.toLowerCase().includes(t)).slice(0, 12);
  }, [q, items]);
  return (
    <div className="relative">
      <Search size={15} className="pointer-events-none absolute left-3 top-[11px] text-faint" aria-hidden />
      <label htmlFor="lesson-finder" className="sr-only">
        Find a lesson or chapter in this course
      </label>
      <input id="lesson-finder" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a lesson or chapter…" className="input h-10 pl-9" autoComplete="off" />
      {q.trim().length >= 2 && (
        <div className="mt-2 rounded-[10px] border border-border bg-surface" role="region" aria-live="polite" aria-label="Search results">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-[13.5px] text-muted">No lessons or chapters match “{q.trim()}”.</p>
          ) : (
            <ul className="divide-y divide-divider">
              {results.map((r) => (
                <li key={r.slug}>
                  <Link href={`/learn/${courseSlug}/${r.slug}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-sidebar">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium">{r.title}</span>
                      <span className="block truncate text-[12px] text-muted">
                        {r.unit} · {r.chapter}
                      </span>
                    </span>
                    {r.done && <CheckCircle2 size={15} className="shrink-0 text-success" aria-label="Completed" />}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
