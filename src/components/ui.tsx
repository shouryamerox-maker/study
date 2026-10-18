import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/* ── Buttons ─────────────────────────────────────────────────────────── */

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const btnBase =
  "inline-flex items-center justify-center gap-1.5 font-medium rounded-[8px] transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none";
const btnVariants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark shadow-[0_1px_0_rgb(0_0_0/0.08)]",
  secondary: "bg-surface text-ink border border-border hover:bg-sidebar",
  ghost: "text-muted hover:text-ink hover:bg-divider/60",
  danger: "bg-surface text-danger border border-border hover:bg-danger-soft",
};
const btnSizes: Record<Size, string> = { sm: "h-8 px-2.5 text-[13px]", md: "h-9 px-3.5 text-sm" };

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(btnBase, btnVariants[variant], btnSizes[size], extra);
}

export function Button({ variant = "primary", size = "md", className, ...p }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...p} />;
}

export function LinkButton({ variant = "primary", size = "md", className, ...p }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...p} />;
}

/* ── Layout ──────────────────────────────────────────────────────────── */

export function PageHeader({
  title,
  description,
  crumbs,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  crumbs?: { href?: string; label: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5">
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-1.5 flex flex-wrap items-center gap-1 text-[12.5px] text-muted">
          {crumbs.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} className="text-faint" aria-hidden />}
              {c.href ? (
                <Link href={c.href} className="hover:text-ink">
                  {c.label}
                </Link>
              ) : (
                <span className="text-ink/80">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.01em]">{title}</h1>
          {description && <p className="mt-1 max-w-3xl text-[13.5px] text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({ className, ...p }: ComponentProps<"div">) {
  return <div className={cn("card", className)} {...p} />;
}

export function CardHeader({ title, action, description }: { title: ReactNode; action?: ReactNode; description?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-divider px-4 py-3">
      <div className="min-w-0">
        <h2 className="text-[14px] font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-[12.5px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Section({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("mb-6", className)}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="label-caps">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/* ── Feedback ────────────────────────────────────────────────────────── */

type Tone = "neutral" | "primary" | "success" | "pending" | "danger" | "accent";
const tones: Record<Tone, string> = {
  neutral: "bg-divider/70 text-muted",
  primary: "bg-primary-soft text-primary-dark",
  success: "bg-success-soft text-success",
  pending: "bg-pending-soft text-pending",
  danger: "bg-danger-soft text-danger",
  accent: "bg-[#f1ebfd] text-accent",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-[6px] px-1.5 py-0.5 text-[11.5px] font-medium leading-4 whitespace-nowrap", tones[tone], className)}>{children}</span>;
}

export function ProgressBar({ value, tone = "primary", className, label }: { value: number; tone?: "primary" | "success"; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-divider", className)}
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
    >
      <div className={cn("h-full rounded-full transition-[width] duration-200", tone === "success" ? "bg-success" : "bg-primary")} style={{ width: `${v}%` }} />
    </div>
  );
}

export function Alert({ tone = "neutral", title, children, className }: { tone?: Tone; title?: ReactNode; children?: ReactNode; className?: string }) {
  const border: Record<Tone, string> = {
    neutral: "border-border bg-sidebar",
    primary: "border-[#ead1c5] bg-primary-soft/60",
    success: "border-[#cfe0cd] bg-success-soft/70",
    pending: "border-[#ecd9b8] bg-pending-soft/70",
    danger: "border-[#efc7bf] bg-danger-soft/70",
    accent: "border-[#ddd0fa] bg-[#f6f2fe]",
  };
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("rounded-[10px] border px-3.5 py-2.5 text-[13.5px]", border[tone], className)}>
      {title && <div className="font-semibold">{title}</div>}
      {children && <div className={cn(title ? "mt-0.5" : null, "text-ink/85")}>{children}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      {icon && <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] border border-border bg-sidebar text-muted">{icon}</div>}
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 max-w-md text-[13.5px] text-muted">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "success" | "pending" | "danger" }) {
  return (
    <div className="card px-4 py-3">
      <div className="text-[12px] font-medium text-muted">{label}</div>
      <div className={cn("mt-1 text-[22px] font-semibold tabular-nums leading-7", tone === "success" && "text-success", tone === "pending" && "text-pending", tone === "danger" && "text-danger")}>
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[12px] text-faint">{hint}</div>}
    </div>
  );
}

export function Avatar({ name, color, size = 32 }: { name: string; color?: string | null; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38, background: color || "#8f4b32" }}
    >
      {initials || "?"}
    </span>
  );
}

/* ── Forms ───────────────────────────────────────────────────────────── */

export function Field({ label, htmlFor, error, hint, children, className }: { label: string; htmlFor?: string; error?: string | null; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[12.5px] text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12.5px] text-faint">{hint}</p>
      ) : null}
    </div>
  );
}

/* ── Formatting helpers ──────────────────────────────────────────────── */

export function fmtDate(d: Date | string | null | undefined, withTime = false) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function fmtRelative(d: Date | string | null | undefined) {
  if (!d) return "never";
  const date = typeof d === "string" ? new Date(d) : d;
  const s = Math.round((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return fmtDate(date);
}

export function fmtMarks(n: number | null | undefined) {
  if (n == null) return "—";
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, "");
}

export function fmtDuration(ms: number) {
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}
