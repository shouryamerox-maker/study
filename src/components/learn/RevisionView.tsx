"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bookmark, Highlighter, NotebookPen, Search, Trash2 } from "lucide-react";
import { Button, EmptyState, cn, fmtRelative } from "@/components/ui";
import { apiFetch } from "@/lib/client-api";

interface LessonRef {
  href: string;
  title: string;
  chapter: string;
}
export interface RevisionData {
  highlights: { id: string; text: string; color: string; createdAt: string; lesson: LessonRef }[];
  notes: { id: string; body: string; updatedAt: string; lesson: LessonRef }[];
  bookmarks: { id: string; lessonId: string; createdAt: string; lesson: LessonRef }[];
}

const COLOR: Record<string, string> = { yellow: "#f7e58a", green: "#cfe3c8", peach: "#f6cdb4" };
type Tab = "highlights" | "notes" | "bookmarks";

export function RevisionView({ initial, initialTab }: { initial: RevisionData; initialTab: Tab }) {
  const [data, setData] = useState(initial);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const term = q.trim().toLowerCase();
  const match = (...parts: string[]) => !term || parts.some((p) => p.toLowerCase().includes(term));

  const filtered = useMemo(
    () => ({
      highlights: data.highlights.filter((h) => match(h.text, h.lesson.title, h.lesson.chapter)),
      notes: data.notes.filter((n) => match(n.body, n.lesson.title, n.lesson.chapter)),
      bookmarks: data.bookmarks.filter((b) => match(b.lesson.title, b.lesson.chapter)),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, term],
  );

  async function removeHighlight(id: string) {
    try {
      await apiFetch(`/api/v1/highlights/${id}`, { method: "DELETE" });
      setData((d) => ({ ...d, highlights: d.highlights.filter((h) => h.id !== id) }));
    } catch {
      setError("Could not remove the highlight. Check your connection.");
    }
  }
  async function removeBookmark(lessonId: string) {
    try {
      await apiFetch(`/api/v1/lessons/${lessonId}/bookmark`, { method: "DELETE" });
      setData((d) => ({ ...d, bookmarks: d.bookmarks.filter((b) => b.lessonId !== lessonId) }));
    } catch {
      setError("Could not remove the bookmark. Check your connection.");
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof Bookmark; count: number }[] = [
    { id: "highlights", label: "Highlights", icon: Highlighter, count: data.highlights.length },
    { id: "notes", label: "Notes", icon: NotebookPen, count: data.notes.length },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark, count: data.bookmarks.length },
  ];

  // Group a list by lesson so revision reads lesson by lesson.
  function grouped<T extends { lesson: LessonRef }>(items: T[]) {
    const m = new Map<string, { lesson: LessonRef; items: T[] }>();
    for (const it of items) {
      const g = m.get(it.lesson.href) ?? { lesson: it.lesson, items: [] };
      g.items.push(it);
      m.set(it.lesson.href, g);
    }
    return [...m.values()];
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div role="tablist" aria-label="Revision" className="flex gap-1 border-b border-border sm:border-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "-mb-px inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-[13.5px] sm:mb-0 sm:rounded-[8px] sm:border-0 sm:py-1.5",
                tab === t.id ? "border-primary font-medium text-ink sm:bg-surface sm:shadow-[var(--shadow-card)]" : "border-transparent text-muted hover:text-ink",
              )}
            >
              <t.icon size={14} aria-hidden /> {t.label} <span className="text-[12px] tabular-nums text-faint">{t.count}</span>
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-72">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" aria-hidden />
          <label htmlFor="rev-search" className="sr-only">
            Search your revision items
          </label>
          <input id="rev-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search highlights, notes, lessons…" className="input h-9 pl-8" />
        </div>
      </div>
      {error && (
        <p className="mb-3 text-[13px] text-danger" role="alert">
          {error}
        </p>
      )}

      {tab === "highlights" &&
        (filtered.highlights.length === 0 ? (
          <EmptyState icon={<Highlighter size={18} />} title={term ? "No highlights match" : "No highlights yet"}>
            {term ? "Try another word." : "Select any passage in a lesson and choose a colour to highlight it."}
          </EmptyState>
        ) : (
          <div className="space-y-6">
            {grouped(filtered.highlights).map((g) => (
              <section key={g.lesson.href}>
                <LessonHeading lesson={g.lesson} />
                <ul className="space-y-2">
                  {g.items.map((h) => (
                    <li key={h.id} className="group flex gap-3 rounded-[8px] bg-surface px-4 py-3">
                      <span className="w-1 shrink-0 rounded-full" style={{ background: COLOR[h.color] ?? COLOR.yellow }} aria-hidden />
                      <blockquote className="min-w-0 flex-1 text-[14.5px] leading-relaxed">{h.text}</blockquote>
                      <button type="button" onClick={() => removeHighlight(h.id)} className="self-start rounded-[6px] p-1.5 text-faint opacity-60 hover:bg-danger-soft hover:text-danger group-hover:opacity-100" aria-label="Remove highlight" title="Remove highlight">
                        <Trash2 size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ))}

      {tab === "notes" &&
        (filtered.notes.length === 0 ? (
          <EmptyState icon={<NotebookPen size={18} />} title={term ? "No notes match" : "No notes yet"}>
            {term ? "Try another word." : "Open a lesson and use “My notes” to write private notes."}
          </EmptyState>
        ) : (
          <div className="space-y-6">
            {grouped(filtered.notes).map((g) => (
              <section key={g.lesson.href}>
                <LessonHeading lesson={g.lesson} />
                <ul className="space-y-2">
                  {g.items.map((n) => (
                    <li key={n.id} className="rounded-[8px] bg-surface px-4 py-3">
                      <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed">{n.body}</p>
                      <p className="mt-1 text-[11.5px] text-faint">Edited {fmtRelative(n.updatedAt)} · edit it from the lesson</p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ))}

      {tab === "bookmarks" &&
        (filtered.bookmarks.length === 0 ? (
          <EmptyState icon={<Bookmark size={18} />} title={term ? "No bookmarks match" : "No bookmarks yet"}>
            {term ? "Try another word." : "Use the Bookmark button on any lesson to save it here."}
          </EmptyState>
        ) : (
          <ul className="overflow-hidden rounded-[10px] border border-border bg-surface">
            {filtered.bookmarks.map((b, i) => (
              <li key={b.id} className={cn("group flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-divider")}>
                <Bookmark size={14} className="shrink-0 text-primary" aria-hidden />
                <Link href={b.lesson.href} className="min-w-0 flex-1 hover:text-primary">
                  <span className="block truncate text-[14.5px] font-medium">{b.lesson.title}</span>
                  <span className="block truncate text-[12px] text-muted">{b.lesson.chapter}</span>
                </Link>
                <span className="hidden text-[11.5px] text-faint sm:inline">{fmtRelative(b.createdAt)}</span>
                <Button size="sm" variant="ghost" onClick={() => removeBookmark(b.lessonId)} aria-label={`Remove bookmark: ${b.lesson.title}`}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}

function LessonHeading({ lesson }: { lesson: LessonRef }) {
  return (
    <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
      <Link href={lesson.href} className="text-[14.5px] font-semibold hover:text-primary">
        {lesson.title}
      </Link>
      <span className="text-[12px] text-muted">{lesson.chapter}</span>
    </div>
  );
}
