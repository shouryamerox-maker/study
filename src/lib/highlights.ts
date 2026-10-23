/**
 * Text-anchoring helpers for the lesson highlighter. Pure functions so they can be
 * unit tested without a browser.
 *
 * A highlight is stored as (blockIndex, startOffset, endOffset) — character offsets in the
 * readable text of one lesson block — plus the quoted text and up to 32 characters of
 * context on each side. If the lesson is edited and the offsets no longer point at the
 * same words, the quote (disambiguated by its context) is searched for instead.
 */

export const HIGHLIGHT_COLORS = ["yellow", "green", "peach"] as const;
export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number];
export const CONTEXT_CHARS = 32;

export interface Anchor {
  blockIndex: number;
  startOffset: number;
  endOffset: number;
  text: string;
  prefix: string;
  suffix: string;
}

export function contextAround(full: string, start: number, end: number) {
  return {
    prefix: full.slice(Math.max(0, start - CONTEXT_CHARS), start),
    suffix: full.slice(end, end + CONTEXT_CHARS),
  };
}

/** Finds where an anchor's quote sits in `full` (the block's current text). */
export function resolveInText(full: string, a: Pick<Anchor, "startOffset" | "endOffset" | "text" | "prefix" | "suffix">): { start: number; end: number } | null {
  // 1. Offsets still match the quoted text — the normal case.
  if (full.slice(a.startOffset, a.endOffset) === a.text) return { start: a.startOffset, end: a.endOffset };
  // 2. Text moved: find every occurrence and pick the one whose context matches best.
  const hits: number[] = [];
  for (let i = full.indexOf(a.text); i !== -1; i = full.indexOf(a.text, i + 1)) hits.push(i);
  if (hits.length === 0) return null;
  const score = (i: number) => {
    const before = full.slice(Math.max(0, i - a.prefix.length), i);
    const after = full.slice(i + a.text.length, i + a.text.length + a.suffix.length);
    let s = 0;
    for (let k = 1; k <= Math.min(before.length, a.prefix.length) && before[before.length - k] === a.prefix[a.prefix.length - k]; k++) s++;
    for (let k = 0; k < Math.min(after.length, a.suffix.length) && after[k] === a.suffix[k]; k++) s++;
    return s - Math.abs(i - a.startOffset) / 1e6; // tie-break: nearest to the old position
  };
  const best = hits.reduce((b, i) => (score(i) > score(b) ? i : b), hits[0]);
  return { start: best, end: best + a.text.length };
}
