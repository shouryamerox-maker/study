"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { Avatar } from "@/components/ui";
import { apiFetch } from "@/lib/client-api";

export function UserMenu({ name, email, role, color, staff }: { name: string; email: string; role: string; color?: string | null; staff: boolean }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function logout() {
    setBusy(true);
    try {
      await apiFetch("/api/v1/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-[8px] px-1.5 py-1 hover:bg-divider/60"
      >
        <Avatar name={name} color={color} size={28} />
        <span className="hidden text-left sm:block">
          <span className="block max-w-[160px] truncate text-[13px] font-medium leading-4">{name}</span>
          <span className="block text-[11px] capitalize leading-4 text-faint">{role.toLowerCase()}</span>
        </span>
        <ChevronDown size={14} className="text-faint" aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-1.5 w-60 rounded-[10px] border border-border bg-surface p-1 shadow-[var(--shadow-pop)]">
          <div className="border-b border-divider px-2.5 py-2">
            <div className="truncate text-[13px] font-medium">{name}</div>
            <div className="truncate text-[12px] text-muted">{email}</div>
          </div>
          {!staff && (
            <Link role="menuitem" href="/profile" className="mt-1 flex items-center gap-2 rounded-[7px] px-2.5 py-1.5 text-[13px] hover:bg-sidebar">
              <User size={14} aria-hidden /> Profile
            </Link>
          )}
          <Link role="menuitem" href={staff ? "/teacher/settings" : "/settings"} className="flex items-center gap-2 rounded-[7px] px-2.5 py-1.5 text-[13px] hover:bg-sidebar">
            <Settings size={14} aria-hidden /> Settings
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={logout}
            disabled={busy}
            className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-1.5 text-left text-[13px] text-danger hover:bg-danger-soft"
          >
            <LogOut size={14} aria-hidden /> {busy ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
