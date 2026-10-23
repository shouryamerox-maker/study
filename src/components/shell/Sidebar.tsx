"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookMarked,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  Code2,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  ListTree,
  Menu,
  PenLine,
  Settings,
  TrendingUp,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/components/ui";

type Item = { href: string; label: string; icon: LucideIcon; match?: string[] };

const studentNav: { group?: string; items: Item[] }[] = [
  {
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/courses", label: "My Courses", icon: GraduationCap },
      { href: "/syllabus", label: "Syllabus", icon: ListTree },
      { href: "/learn", label: "Learn", icon: BookOpen },
    ],
  },
  {
    group: "Practise",
    items: [
      { href: "/practice", label: "Practice", icon: PenLine },
      { href: "/playground", label: "Code Playground", icon: Code2 },
      { href: "/tests", label: "Tests & Results", icon: ClipboardCheck },
    ],
  },
  {
    group: "You",
    items: [
      { href: "/revision", label: "Revision", icon: BookMarked, match: ["/bookmarks"] },
      { href: "/progress", label: "My Progress", icon: TrendingUp },
      { href: "/profile", label: "Profile", icon: User },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

const teacherNav: { group?: string; items: Item[] }[] = [
  {
    items: [
      { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
      { href: "/teacher/students", label: "Students", icon: Users },
      { href: "/teacher/courses", label: "Courses & Syllabus", icon: ListTree },
    ],
  },
  {
    group: "Assessment",
    items: [
      { href: "/teacher/tests", label: "Tests & Assessments", icon: ClipboardList },
      { href: "/teacher/grading", label: "Submissions & Grading", icon: FileCheck2, match: ["/teacher/attempts"] },
      { href: "/teacher/reports", label: "Reports & Analytics", icon: BarChart3 },
    ],
  },
  {
    group: "Tools",
    items: [
      { href: "/playground", label: "Code Playground", icon: Code2 },
      { href: "/teacher/settings", label: "Settings", icon: Settings },
    ],
  },
];

function isActive(pathname: string, item: Item) {
  const roots = ["/teacher", "/dashboard"];
  if (roots.includes(item.href)) return pathname === item.href;
  return [item.href, ...(item.match ?? [])].some((h) => pathname === h || pathname.startsWith(h + "/"));
}

export function Sidebar({ staff }: { staff: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = staff ? teacherNav : studentNav;

  useEffect(() => setOpen(false), [pathname]);

  const content = (
    <nav aria-label="Main" className="flex h-full flex-col">
      <Link href={staff ? "/teacher" : "/dashboard"} className="flex h-14 shrink-0 items-center gap-2 border-b border-divider px-4">
        <svg width="24" height="24" viewBox="0 0 64 64" aria-hidden>
          <rect width="64" height="64" rx="14" fill="#a85c40" />
          <path d="M18 22h28M18 32h20M18 42h24" stroke="#faf8f4" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <span className="text-[15px] font-semibold tracking-[-0.01em]">Studyline</span>
        {staff && <span className="ml-auto rounded-[5px] bg-primary-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-primary-dark">TEACHER</span>}
      </Link>
      <div className="flex-1 overflow-y-auto px-2.5 py-3">
        {nav.map((g, gi) => (
          <div key={gi} className={cn(gi > 0 && "mt-4")}>
            {g.group && <div className="label-caps mb-1 px-2">{g.group}</div>}
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = isActive(pathname, it);
                const Icon = it.icon;
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-8 items-center gap-2.5 rounded-[7px] px-2 text-[13.5px] transition-colors duration-150",
                        active ? "bg-primary-soft font-medium text-primary-dark" : "text-muted hover:bg-divider/60 hover:text-ink",
                      )}
                    >
                      <Icon size={16} strokeWidth={1.8} aria-hidden />
                      {it.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );

  return (
    <>
      <button
        type="button"
        data-shell-sidebar
        className="fixed left-3 top-3 z-40 inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-border bg-surface text-ink lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={16} />
      </button>
      <aside data-shell-sidebar className="fixed inset-y-0 left-0 z-30 hidden w-56 border-r border-border bg-sidebar lg:block">{content}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64 border-r border-border bg-sidebar shadow-[var(--shadow-pop)]">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-2 top-3 rounded-md p-1.5 text-muted hover:text-ink" aria-label="Close navigation">
              <X size={16} />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
