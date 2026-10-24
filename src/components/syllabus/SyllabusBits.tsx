import { Code2, Cpu, Dna, HeartHandshake, Leaf, Sigma, Zap } from "lucide-react";
import type { SyllabusSubject } from "@content/syllabus/sharda-btech-cse-aiml-2026";
import { cn } from "@/components/ui";

const ICONS = { computer: Cpu, zap: Zap, sigma: Sigma, heart: HeartHandshake, code: Code2, dna: Dna, leaf: Leaf } as const;

export function SubjectIcon({ icon, size = 18, className }: { icon: SyllabusSubject["icon"]; size?: number; className?: string }) {
  const Icon = ICONS[icon];
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-[10px] bg-primary-soft text-primary-dark", className)} style={{ width: size + 18, height: size + 18 }} aria-hidden>
      <Icon size={size} strokeWidth={1.8} />
    </span>
  );
}

/** "Units 1–3" style label from a sorted unit list. */
export function unitsLabel(units: number[]) {
  if (units.length === 0) return "No units";
  const contiguous = units.every((u, i) => i === 0 || u === units[i - 1] + 1);
  if (units.length === 1) return `Unit ${units[0]}`;
  return contiguous ? `Units ${units[0]}–${units[units.length - 1]}` : `Units ${units.join(", ")}`;
}

export function examSummary(s: SyllabusSubject) {
  return {
    mid: s.midSem?.units ? unitsLabel(s.midSem.units) : null,
    end: s.endSem?.units ? (s.endSem.units.length === s.units.length ? "All units" : unitsLabel(s.endSem.units)) : null,
  };
}

export function PdfRef({ pages, className }: { pages: number | number[]; className?: string }) {
  const list = Array.isArray(pages) ? [...new Set(pages)] : [pages];
  return (
    <span className={cn("text-[11.5px] text-faint", className)} title="Page in the official syllabus PDF">
      PDF p. {list.join(", ")}
    </span>
  );
}
