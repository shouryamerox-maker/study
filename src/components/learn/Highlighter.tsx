"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { contextAround, resolveInText, HIGHLIGHT_COLORS, type HighlightColor } from "@/lib/highlights";
import { cn } from "@/components/ui";

interface Stored {
  id: string;
  blockIndex: number;
  startOffset: number;
  endOffset: number;
  text: string;
  prefix: string;
  suffix: string;
  color: string;
}

const SWATCH: Record<HighlightColor, { bg: string; label: string }> = {
  yellow: { bg: "#f7e58a", label: "Yellow" },
  green: { bg: "#cfe3c8", label: "Sage green" },
  peach: { bg: "#f6cdb4", label: "Peach" },
};

/** Text inside these is never highlightable (code, controls, form fields, maths markup). */
const EXCLUDE = "[data-no-hl], pre, button, input, textarea, select, label, .katex-mathml, [contenteditable]";

function textNodes(block: Element): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => ((n.parentElement?.closest(EXCLUDE) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)),
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) out.push(n as Text);
  return out;
}

/** Character offset of a DOM point within the block's highlightable text. */
function pointToOffset(nodes: Text[], container: Node, offset: number): number | null {
  const probe = document.createRange();
  try {
    probe.setStart(container, offset);
  } catch {
    return null;
  }
  let total = 0;
  for (const n of nodes) {
    if (n === container) return total + offset;
    if (probe.comparePoint(n, 0) < 0) total += n.data.length; // node lies before the point
    else return total;
  }
  return total;
}

function offsetsToRange(nodes: Text[], start: number, end: number): Range | null {
  let pos = 0;
  let startNode: Text | null = null;
  let startLocal = 0;
  const range = document.createRange();
  for (const n of nodes) {
    const len = n.data.length;
    if (!startNode && start < pos + len) {
      startNode = n;
      startLocal = start - pos;
      range.setStart(n, startLocal);
    }
    if (startNode && end <= pos + len) {
      range.setEnd(n, end - pos);
      return range;
    }
    pos += len;
  }
  return null;
}

type Toolbar = { x: number; y: number; below: boolean; mode: "new"; anchor: Omit<Stored, "id" | "color"> } | { x: number; y: number; below: boolean; mode: "existing"; id: string };

export function Highlighter({ lessonId, children }: { lessonId: string; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Stored[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [toolbar, setToolbar] = useState<Toolbar | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [unplaced, setUnplaced] = useState(0);
  const rangesRef = useRef<Map<string, Range>>(new Map());
  const supported = typeof window !== "undefined" && "highlights" in CSS && typeof (window as unknown as { Highlight?: unknown }).Highlight === "function";

  useEffect(() => {
    let alive = true;
    apiFetch<{ highlights: Stored[] }>(`/api/v1/lessons/${lessonId}/highlights`)
      .then((r) => alive && setItems(r.highlights))
      .catch(() => alive && setStatus("Your highlights could not be loaded."))
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, [lessonId]);

  /** Re-locates every stored highlight in the current DOM and paints it. */
  const paint = useCallback(() => {
    if (!supported || !rootRef.current) return;
    const registry = (CSS as unknown as { highlights: Map<string, unknown> }).highlights;
    const HighlightCtor = (window as unknown as { Highlight: new (...r: Range[]) => unknown }).Highlight;
    const byColor: Record<string, Range[]> = { yellow: [], green: [], peach: [] };
    const map = new Map<string, Range>();
    let missing = 0;
    const blocks = new Map<number, { nodes: Text[]; full: string }>();
    const blockData = (i: number) => {
      if (!blocks.has(i)) {
        const el = rootRef.current!.querySelector(`[data-hl-block="${i}"]`);
        const nodes = el ? textNodes(el) : [];
        blocks.set(i, { nodes, full: nodes.map((n) => n.data).join("") });
      }
      return blocks.get(i)!;
    };
    const allBlocks = () => [...rootRef.current!.querySelectorAll("[data-hl-block]")].map((el) => Number(el.getAttribute("data-hl-block")));
    for (const h of items) {
      let placed: Range | null = null;
      // Try the original block first, then the rest of the lesson (content may have moved).
      for (const bi of [h.blockIndex, ...allBlocks().filter((b) => b !== h.blockIndex)]) {
        const { nodes, full } = blockData(bi);
        const at = resolveInText(full, h);
        if (at) {
          placed = offsetsToRange(nodes, at.start, at.end);
          if (placed) break;
        }
      }
      if (placed) {
        map.set(h.id, placed);
        (byColor[h.color] ?? byColor.yellow).push(placed);
      } else missing++;
    }
    for (const c of HIGHLIGHT_COLORS) registry.set(`sl-${c}`, new HighlightCtor(...byColor[c]));
    rangesRef.current = map;
    setUnplaced(missing);
  }, [items, supported]);

  // Paint now, and again whenever lesson content changes (e.g. a section is expanded).
  useEffect(() => {
    if (!loaded) return;
    paint();
    const root = rootRef.current;
    if (!root) return;
    let t: ReturnType<typeof setTimeout>;
    const obs = new MutationObserver(() => {
      clearTimeout(t);
      t = setTimeout(paint, 80);
    });
    obs.observe(root, { childList: true, subtree: true, characterData: true });
    return () => {
      obs.disconnect();
      clearTimeout(t);
    };
  }, [loaded, paint]);

  useEffect(
    () => () => {
      if (!supported) return;
      const registry = (CSS as unknown as { highlights: Map<string, unknown> }).highlights;
      for (const c of HIGHLIGHT_COLORS) registry.delete(`sl-${c}`);
    },
    [supported],
  );

  const placeToolbar = (rect: DOMRect) => {
    const below = rect.top < 70 || window.matchMedia("(pointer: coarse)").matches; // keep clear of the native touch menu
    return { x: Math.min(Math.max(rect.left + rect.width / 2, 110), window.innerWidth - 110), y: below ? rect.bottom + 8 : rect.top - 8, below };
  };

  /** Reads the current selection; shows the toolbar if it is a valid passage. */
  const onSelection = useCallback(() => {
    const sel = window.getSelection();
    const root = rootRef.current;
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed || !root) {
      setToolbar((t) => (t?.mode === "new" ? null : t));
      return;
    }
    const range = sel.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return;
    const startBlock = (range.startContainer.nodeType === 1 ? (range.startContainer as Element) : range.startContainer.parentElement)?.closest("[data-hl-block]");
    const endBlock = (range.endContainer.nodeType === 1 ? (range.endContainer as Element) : range.endContainer.parentElement)?.closest("[data-hl-block]");
    const inExcluded = (range.startContainer.parentElement?.closest(EXCLUDE) || range.endContainer.parentElement?.closest(EXCLUDE));
    if (!startBlock || startBlock !== endBlock || inExcluded) {
      setToolbar(null);
      if (startBlock && startBlock !== endBlock) setStatus("Highlight one section at a time.");
      return;
    }
    const nodes = textNodes(startBlock);
    const full = nodes.map((n) => n.data).join("");
    let s = pointToOffset(nodes, range.startContainer, range.startOffset);
    let e = pointToOffset(nodes, range.endContainer, range.endOffset);
    if (s == null || e == null) return;
    while (s < e && /\s/.test(full[s])) s++;
    while (e > s && /\s/.test(full[e - 1])) e--;
    if (e - s < 1 || e - s > 4000) return;
    setStatus(null);
    setToolbar({
      ...placeToolbar(range.getBoundingClientRect()),
      mode: "new",
      anchor: { blockIndex: Number(startBlock.getAttribute("data-hl-block")), startOffset: s, endOffset: e, text: full.slice(s, e), ...contextAround(full, s, e) },
    });
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onChange = () => {
      clearTimeout(t);
      t = setTimeout(onSelection, 250);
    };
    const hide = () => setToolbar(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setToolbar(null);
    document.addEventListener("selectionchange", onChange);
    window.addEventListener("scroll", hide, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("selectionchange", onChange);
      window.removeEventListener("scroll", hide);
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [onSelection]);

  /** Clicking on an existing highlight opens its toolbar (change colour / remove). */
  function onClick(e: React.MouseEvent) {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) return;
    const doc = document as Document & { caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null; caretRangeFromPoint?: (x: number, y: number) => Range | null };
    let node: Node | null = null;
    let off = 0;
    const pos = doc.caretPositionFromPoint?.(e.clientX, e.clientY);
    if (pos) {
      node = pos.offsetNode;
      off = pos.offset;
    } else {
      const r = doc.caretRangeFromPoint?.(e.clientX, e.clientY);
      if (r) {
        node = r.startContainer;
        off = r.startOffset;
      }
    }
    if (!node) return;
    for (const [id, range] of rangesRef.current) {
      try {
        if (range.isPointInRange(node, off) && !range.collapsed) {
          setToolbar({ ...placeToolbar(range.getBoundingClientRect()), mode: "existing", id });
          return;
        }
      } catch {
        /* node from another document fragment */
      }
    }
    setToolbar((t) => (t?.mode === "existing" ? null : t));
  }

  async function create(color: HighlightColor) {
    if (toolbar?.mode !== "new") return;
    const anchor = toolbar.anchor;
    setToolbar(null);
    try {
      const r = await apiFetch<{ highlight: Stored }>(`/api/v1/lessons/${lessonId}/highlights`, { body: { ...anchor, color } });
      setItems((all) => [...all.filter((h) => h.id !== r.highlight.id), r.highlight]);
      window.getSelection()?.removeAllRanges();
      setStatus(null);
    } catch (e) {
      setStatus(e instanceof ClientApiError ? `Highlight not saved: ${e.message}` : "Highlight not saved. Check your connection.");
    }
  }
  async function recolor(id: string, color: HighlightColor) {
    setToolbar(null);
    try {
      await apiFetch(`/api/v1/highlights/${id}`, { method: "PATCH", body: { color } });
      setItems((all) => all.map((h) => (h.id === id ? { ...h, color } : h)));
    } catch {
      setStatus("Colour change not saved.");
    }
  }
  async function remove(id: string) {
    setToolbar(null);
    try {
      await apiFetch(`/api/v1/highlights/${id}`, { method: "DELETE" });
      setItems((all) => all.filter((h) => h.id !== id));
    } catch {
      setStatus("Highlight not removed. Check your connection.");
    }
  }

  const activeColor = toolbar?.mode === "existing" ? items.find((h) => h.id === toolbar.id)?.color : null;

  return (
    <div ref={rootRef} onClick={onClick} data-highlight-root>
      {(status || unplaced > 0 || (!supported && loaded)) && (
        <p className="mb-4 text-[12.5px] text-muted" role="status">
          {status ??
            (!supported
              ? "Highlighting needs a newer browser (Chrome, Edge, Safari 17.2+ or Firefox 140+)."
              : `${unplaced} of your highlights could not be placed because this lesson changed. You can still see them in Revision.`)}
        </p>
      )}
      {children}
      {toolbar && supported && (
        <div
          role="toolbar"
          aria-label={toolbar.mode === "new" ? "Highlight selected text" : "Edit highlight"}
          className="fixed z-40 flex -translate-x-1/2 items-center gap-1 rounded-[10px] border border-border bg-surface p-1 shadow-[var(--shadow-pop)]"
          style={{ left: toolbar.x, top: toolbar.y, transform: `translate(-50%, ${toolbar.below ? "0" : "-100%"})` }}
          onMouseDown={(e) => e.preventDefault() /* keep the text selection */}
        >
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              title={`Highlight ${SWATCH[c].label.toLowerCase()}`}
              aria-label={`${toolbar.mode === "new" ? "Highlight" : "Change to"} ${SWATCH[c].label}`}
              aria-pressed={activeColor === c}
              onClick={() => (toolbar.mode === "new" ? create(c) : recolor(toolbar.id, c))}
              className={cn("h-7 w-7 rounded-full border-2 transition-transform duration-100 hover:scale-110", activeColor === c ? "border-ink" : "border-white")}
              style={{ background: SWATCH[c].bg, boxShadow: "0 0 0 1px #e4dcd0" }}
            />
          ))}
          {toolbar.mode === "existing" && (
            <button type="button" onClick={() => remove(toolbar.id)} className="ml-1 inline-flex h-7 items-center gap-1 rounded-[7px] px-2 text-[12.5px] text-muted hover:bg-danger-soft hover:text-danger" aria-label="Remove highlight">
              <Trash2 size={13} /> Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}
