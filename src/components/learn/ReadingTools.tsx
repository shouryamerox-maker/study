"use client";

import { useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui";

const KEY = "sl:reading-mode";

/** Hides the app sidebar, top bar and chapter panel so only the lesson remains. */
export function ReadingModeToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    try {
      setOn(localStorage.getItem(KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (on) html.setAttribute("data-reading", "");
    else html.removeAttribute("data-reading");
    try {
      localStorage.setItem(KEY, on ? "1" : "0");
    } catch {
      /* ignore */
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && on && !(e.target as HTMLElement)?.closest?.("input, textarea, [role=toolbar]")) setOn(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [on]);

  // Leaving the lesson page always restores the normal layout.
  useEffect(() => () => document.documentElement.removeAttribute("data-reading"), []);

  return (
    <Button variant="ghost" size="sm" onClick={() => setOn((v) => !v)} aria-pressed={on} title={on ? "Exit reading mode (Esc)" : "Hide menus and read without distractions"}>
      {on ? <Minimize2 size={14} /> : <Maximize2 size={14} />} {on ? "Exit reading mode" : "Reading mode"}
    </Button>
  );
}

/** Thin bar at the top of the window showing how far through the lesson the reader is. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setPct(total <= 0 ? 100 : Math.min(100, Math.max(0, (-r.top / total) * 100)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetId]);
  return (
    <div className="fixed inset-x-0 top-0 z-30 h-[3px]" aria-hidden>
      <div className="h-full bg-primary/70 transition-[width] duration-100" style={{ width: `${pct}%` }} />
    </div>
  );
}
