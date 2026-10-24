"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export interface TopicIndexItem {
  code: string;
  subject: string;
  unit: number;
  unitTitle: string;
  id: string;
  text: string;
  href: string;
}

/** Instant search across every unit title and topic in the semester. */
export function TopicFinder({ items }: { items: TopicIndexItem[] }) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (term.length < 2) return [];
    return items.filter((i) => i.text.toLowerCase().includes(term) || i.unitTitle.toLowerCase().includes(term) || i.code.toLowerCase() === term).slice(0, 25);
  }, [items, term]);

  const mark = (text: string) => {
    const i = text.toLowerCase().indexOf(term);
    if (i < 0 || term.length < 2) return text;
    return (
      <>
        {text.slice(0, i)}
        <mark className="rounded-[3px] bg-[#f7e58a] px-0.5 text-inherit">{text.slice(i, i + term.length)}</mark>
        {text.slice(i + term.length)}
      </>
    );
  };

  return (
    <div>
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" aria-hidden />
        <label htmlFor="topic-finder" className="sr-only">
          Find a topic in Semester 1
        </label>
        <input
          id="topic-finder"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find a topic — e.g. Karnaugh map, eigenvalues, pointers, ozone…"
          className="input h-11 pl-9 text-[14px]"
          autoComplete="off"
        />
      </div>
      {term.length >= 2 && (
        <div className="mt-2 rounded-[12px] border border-border bg-surface" role="region" aria-live="polite" aria-label="Topic search results">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-[13.5px] text-muted">No topics match “{q.trim()}”.</p>
          ) : (
            <ul className="divide-y divide-divider">
              {results.map((r) => (
                <li key={`${r.code}-${r.unit}-${r.id}`}>
                  <Link href={r.href} className="block px-4 py-2.5 hover:bg-sidebar">
                    <span className="block text-[12px] text-muted">
                      <span className="font-mono">{r.code}</span> · {r.subject} · Unit {r.unit}
                    </span>
                    <span className="block text-[14px]">{mark(r.text)}</span>
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
