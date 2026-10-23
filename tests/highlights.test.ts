import { describe, expect, it } from "vitest";
import { contextAround, resolveInText } from "@/lib/highlights";

const text = "A pointer stores an address. A pointer to int points to an int.";

function anchor(full: string, start: number, end: number) {
  return { startOffset: start, endOffset: end, text: full.slice(start, end), ...contextAround(full, start, end) };
}

describe("highlight anchoring", () => {
  it("uses the stored offsets when the text is unchanged", () => {
    const a = anchor(text, 2, 9); // "pointer"
    expect(resolveInText(text, a)).toEqual({ start: 2, end: 9 });
  });

  it("re-finds the passage when content before it changed", () => {
    const a = anchor(text, 29, 46); // "A pointer to int "
    const edited = "Intro sentence added. " + text;
    const r = resolveInText(edited, a)!;
    expect(edited.slice(r.start, r.end)).toBe(a.text);
    expect(r.start).toBe(29 + "Intro sentence added. ".length);
  });

  it("picks the occurrence whose surrounding context matches", () => {
    // "pointer" appears twice; the second one is followed by " to int".
    const second = text.indexOf("pointer", 10);
    const a = anchor(text, second, second + 7);
    const shifted = "X " + text;
    const r = resolveInText(shifted, a)!;
    expect(r.start).toBe(second + 2);
  });

  it("returns null when the passage no longer exists", () => {
    const a = anchor(text, 2, 9);
    expect(resolveInText("Completely different content.", a)).toBeNull();
  });

  it("keeps up to 32 characters of context", () => {
    const long = "x".repeat(100) + "TARGET" + "y".repeat(100);
    const c = contextAround(long, 100, 106);
    expect(c.prefix).toHaveLength(32);
    expect(c.suffix).toHaveLength(32);
  });
});
