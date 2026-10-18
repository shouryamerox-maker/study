"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/components/ui";

/**
 * Accessible expand/collapse section (button with aria-expanded/aria-controls).
 * With `storageKey`, the open state is remembered for the browser session.
 */
export function Disclosure({
  title,
  meta,
  children,
  defaultOpen = false,
  storageKey,
  className,
  buttonClassName,
  panelClassName,
  id,
}: {
  title: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  storageKey?: string;
  className?: string;
  buttonClassName?: string;
  panelClassName?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  useEffect(() => {
    if (!storageKey) return;
    try {
      const v = sessionStorage.getItem(storageKey);
      if (v !== null) setOpen(v === "1");
    } catch {
      /* storage unavailable */
    }
  }, [storageKey]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (storageKey) {
      try {
        sessionStorage.setItem(storageKey, next ? "1" : "0");
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div className={className} id={id}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn("flex w-full items-center gap-2 text-left", buttonClassName)}
      >
        <ChevronDown size={15} className={cn("shrink-0 text-faint transition-transform duration-150", !open && "-rotate-90")} aria-hidden />
        <span className="min-w-0 flex-1">{title}</span>
        {meta}
      </button>
      <div id={panelId} hidden={!open} className={panelClassName}>
        {open && children}
      </div>
    </div>
  );
}
