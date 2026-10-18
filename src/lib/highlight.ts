/**
 * Tiny, dependency-free syntax highlighter for C-family code used in read-only blocks.
 * (The interactive editor uses CodeMirror.) Produces tokens, never raw HTML.
 */
export type Tok = { t: "kw" | "type" | "str" | "num" | "com" | "pre" | "fn" | "plain"; v: string };

const KEYWORDS = new Set(
  "auto break case const continue default do else enum extern for goto if inline register restrict return sizeof static struct switch typedef union volatile while NULL true false".split(" "),
);
const TYPES = new Set("int char float double long short signed unsigned void bool size_t FILE".split(" "));

const RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(^[ \t]*#[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[uUlLfF]*\b|\b0[xX][0-9a-fA-F]+\b)|([A-Za-z_]\w*)(\s*\()?/gm;

export function highlightC(code: string): Tok[] {
  const out: Tok[] = [];
  let last = 0;
  for (const m of code.matchAll(RE)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ t: "plain", v: code.slice(last, i) });
    if (m[1]) out.push({ t: "com", v: m[1] });
    else if (m[2]) out.push({ t: "pre", v: m[2] });
    else if (m[3]) out.push({ t: "str", v: m[3] });
    else if (m[4]) out.push({ t: "num", v: m[4] });
    else if (m[5]) {
      const w = m[5];
      if (KEYWORDS.has(w)) out.push({ t: "kw", v: w });
      else if (TYPES.has(w)) out.push({ t: "type", v: w });
      else if (m[6]) out.push({ t: "fn", v: w });
      else out.push({ t: "plain", v: w });
      if (m[6]) out.push({ t: "plain", v: m[6] });
    }
    last = i + m[0].length;
  }
  if (last < code.length) out.push({ t: "plain", v: code.slice(last) });
  return out;
}

export const tokenClass: Record<Tok["t"], string> = {
  kw: "text-[#a0442c] font-medium",
  type: "text-[#3f6d75]",
  str: "text-[#4a7850]",
  num: "text-[#9a5d14]",
  com: "text-[#a89c8d] italic",
  pre: "text-[#7c3aed]",
  fn: "text-[#6b4a2e]",
  plain: "",
};
