import { AlertTriangle, CheckCircle2, Info, Lightbulb, Star, XCircle } from "lucide-react";
import type { Block } from "@/lib/content/schema";
import { cn } from "@/components/ui";
import { Disclosure } from "@/components/Disclosure";
import { Markdown } from "./Markdown";
import { CodeView, OutputView } from "./CodeView";
import { ExerciseTry, Reveal, RunCodeActions } from "./InteractiveBlocks";
import katex from "katex";

function parseLines(spec: string): Set<number> {
  const s = new Set<number>();
  for (const part of spec.split(",")) {
    const [a, b] = part.split("-").map((x) => parseInt(x.trim(), 10));
    if (Number.isFinite(a)) for (let i = a; i <= (Number.isFinite(b) ? b : a); i++) s.add(i);
  }
  return s;
}

function dedent(lines: string[]) {
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)![0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join("\n");
}

/** Only genuinely important notes get colour; plain notes stay quiet. */
const calloutStyle = {
  info: { icon: Info, cls: "border-l-faint/60", iconCls: "text-muted", title: "Note" },
  note: { icon: Info, cls: "border-l-faint/60", iconCls: "text-muted", title: "Note" },
  tip: { icon: Lightbulb, cls: "border-l-success bg-success-soft/40", iconCls: "text-success", title: "Tip" },
  warning: { icon: AlertTriangle, cls: "border-l-danger bg-danger-soft/40", iconCls: "text-danger", title: "Watch out" },
  exam: { icon: Star, cls: "border-l-pending bg-pending-soft/50", iconCls: "text-pending", title: "Exam point" },
} as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-[15px] font-semibold">{children}</h3>;
}

function PlainList({ items, marker = "dot" }: { items: string[]; marker?: "dot" | "check" }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed">
          {marker === "check" ? <CheckCircle2 size={16} className="mt-[3px] shrink-0 text-success" aria-hidden /> : <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />}
          <Markdown inline className="text-[15px]">
            {it}
          </Markdown>
        </li>
      ))}
    </ul>
  );
}

export function LessonBlock({ block, index, lessonId, runnable }: { block: Block; index: number; lessonId: string; runnable: boolean }) {
  switch (block.type) {
    case "heading":
      return block.level === 3 ? (
        <h3 className="pt-1 text-[16px] font-semibold">{block.text}</h3>
      ) : (
        <h2 id={`s-${index}`} className="scroll-mt-20 pt-4 text-[20px] font-semibold tracking-[-0.01em]">
          {block.text}
        </h2>
      );
    case "markdown":
      return <Markdown>{block.md}</Markdown>;
    case "objectives":
      return (
        <section className="rounded-[10px] bg-sidebar px-5 py-4">
          <SectionLabel>What you will learn</SectionLabel>
          <PlainList items={block.items} />
        </section>
      );
    case "examPoints":
      return (
        <section className="border-l-[3px] border-pending pl-4">
          <SectionLabel>Remember for exams</SectionLabel>
          <PlainList items={block.items} />
        </section>
      );
    case "recap":
      return (
        <section className="rounded-[10px] bg-success-soft/50 px-5 py-4">
          <SectionLabel>Quick recap</SectionLabel>
          <PlainList items={block.items} marker="check" />
        </section>
      );
    case "definition":
      return (
        <div className="border-l-2 border-primary/60 pl-4">
          <dfn className="block text-[14.5px] font-semibold not-italic text-primary-dark">{block.term}</dfn>
          <Markdown className="text-[15px]">{block.md}</Markdown>
        </div>
      );
    case "callout": {
      const s = calloutStyle[block.variant];
      const Icon = s.icon;
      return (
        <aside className={cn("flex gap-3 rounded-r-[8px] border-l-[3px] px-4 py-3", s.cls)}>
          <Icon size={16} className={cn("mt-1 shrink-0", s.iconCls)} aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-semibold">{block.title ?? s.title}</div>
            <Markdown className="text-[15px]">{block.md}</Markdown>
          </div>
        </aside>
      );
    }
    case "syntax":
      return (
        <div>
          <div className="mb-1.5 text-[13px] font-semibold text-muted">Syntax</div>
          <CodeView code={block.code} language={block.language} lineNumbers={false} />
          {block.md && <Markdown className="mt-2">{block.md}</Markdown>}
        </div>
      );
    case "code": {
      const canRun = runnable && block.runnable && block.language === "c";
      return (
        <figure className="space-y-2.5">
          {block.title && <figcaption className="text-[14.5px] font-semibold">{block.title}</figcaption>}
          <CodeView code={block.code} language={block.language} />
          {block.stdin && <OutputView title="Input" text={block.stdin} />}
          {block.output !== undefined && <OutputView title="Expected output" text={block.output} />}
          {canRun && <RunCodeActions code={block.code} stdin={block.stdin} refId={lessonId} />}
          {block.walkthrough && block.walkthrough.length > 0 && (
            <Disclosure
              title={<span className="text-[13.5px] font-medium text-primary">Step-by-step explanation</span>}
              meta={<span className="text-[12px] text-faint">{block.walkthrough.length} steps</span>}
              buttonClassName="py-1.5"
              panelClassName="mt-1"
            >
              <ol className="space-y-3 border-l border-divider pl-4">
                {block.walkthrough.map((w, i) => (
                  <li key={i}>
                    <div className="mb-1 font-mono text-[11.5px] text-muted">
                      {w.lines.includes("-") || w.lines.includes(",") ? "Lines" : "Line"} {w.lines}
                    </div>
                    <CodeView
                      code={dedent(block.code.split("\n").filter((_, li) => parseLines(w.lines).has(li + 1)))}
                      language={block.language}
                      lineNumbers={false}
                      className="mb-1 border-divider py-1 text-[12.5px]"
                    />
                    <Markdown className="text-[14.5px]">{w.text}</Markdown>
                  </li>
                ))}
              </ol>
            </Disclosure>
          )}
        </figure>
      );
    }
    case "output":
      return <OutputView title={block.title ?? "Output"} text={block.text} />;
    case "table":
      return (
        <figure className="overflow-x-auto">
          <table className="table rounded-[8px] border border-border">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>
                      <Markdown inline className="text-[14px]">
                        {c}
                      </Markdown>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.caption && <figcaption className="mt-1.5 text-[12.5px] text-muted">{block.caption}</figcaption>}
        </figure>
      );
    case "mistakes":
      return (
        <section>
          <SectionLabel>Common mistakes</SectionLabel>
          <div className="divide-y divide-divider">
            {block.items.map((m, i) => (
              <div key={i} className="py-3 first:pt-0">
                <div className="mb-1 flex items-start gap-2 font-medium">
                  <AlertTriangle size={15} className="mt-[3px] shrink-0 text-danger" aria-hidden />
                  {m.title}
                </div>
                <Markdown className="text-[15px]">{m.md}</Markdown>
                {(m.wrong || m.right) && (
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    {m.wrong && (
                      <div>
                        <div className="mb-1 flex items-center gap-1 text-[12px] font-medium text-danger">
                          <XCircle size={12} /> Wrong
                        </div>
                        <CodeView code={m.wrong} lineNumbers={false} />
                      </div>
                    )}
                    {m.right && (
                      <div>
                        <div className="mb-1 flex items-center gap-1 text-[12px] font-medium text-success">
                          <CheckCircle2 size={12} /> Correct
                        </div>
                        <CodeView code={m.right} lineNumbers={false} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    case "exercise": {
      const kindLabel = { write: "Write a program", predict: "Predict the output", debug: "Find and fix the bug", concept: "Think about it" }[block.kind];
      return (
        <section className="rounded-[10px] border border-border bg-surface px-5 py-4">
          <div className="mb-1 text-[12px] font-medium uppercase tracking-[0.05em] text-primary">Exercise · {kindLabel}</div>
          <div className="mb-1.5 text-[15px] font-semibold">{block.title}</div>
          <Markdown className="text-[15px]">{block.prompt}</Markdown>
          <div className="mt-3 space-y-2">
            {block.starterCode && <CodeView code={block.starterCode} />}
            <ExerciseTry starterCode={runnable && block.kind !== "concept" ? (block.starterCode ?? "") : undefined} />
            {block.hint && (
              <Reveal label="Show hint" tone="hint">
                <Markdown className="text-[14.5px]">{block.hint}</Markdown>
              </Reveal>
            )}
            {(block.solution || block.solutionCode || block.expectedOutput) && (
              <Reveal label="Show solution">
                <div className="space-y-2">
                  {block.solution && <Markdown className="text-[14.5px]">{block.solution}</Markdown>}
                  {block.solutionCode && <CodeView code={block.solutionCode} />}
                  {block.expectedOutput !== undefined && <OutputView title="Expected output" text={block.expectedOutput} />}
                </div>
              </Reveal>
            )}
          </div>
        </section>
      );
    }
    case "math":
      return (
        <figure className="overflow-x-auto py-1 text-center">
          <span dangerouslySetInnerHTML={{ __html: katex.renderToString(block.tex, { displayMode: block.display, throwOnError: false, trust: false }) }} />
          {block.caption && <figcaption className="mt-1 text-[12.5px] text-muted">{block.caption}</figcaption>}
        </figure>
      );
    case "image":
      return (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.src} alt={block.alt} className="mx-auto max-h-[480px] rounded-[10px] border border-border" loading="lazy" />
          {block.caption && <figcaption className="mt-1.5 text-center text-[12.5px] text-muted">{block.caption}</figcaption>}
        </figure>
      );
    case "diagram":
      return (
        <figure>
          <div className="relative mx-auto w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={block.src} alt={block.alt} className="max-h-[520px] rounded-[10px] border border-border" loading="lazy" />
            {block.labels.map((l, i) => (
              <span
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[5px] border border-border bg-surface/95 px-1.5 py-0.5 text-[11.5px] font-medium"
                style={{ left: `${l.x}%`, top: `${l.y}%` }}
              >
                {l.text}
              </span>
            ))}
          </div>
          {block.caption && <figcaption className="mt-1.5 text-center text-[12.5px] text-muted">{block.caption}</figcaption>}
        </figure>
      );
    case "workedExample":
      return (
        <section className="rounded-[10px] bg-sidebar px-5 py-4">
          <SectionLabel>Worked example · {block.title}</SectionLabel>
          <Markdown>{block.problem}</Markdown>
          <ol className="mt-3 space-y-2">
            {block.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary-dark">{i + 1}</span>
                <Markdown className="min-w-0 flex-1 text-[15px]">{s}</Markdown>
              </li>
            ))}
          </ol>
          <div className="mt-3 border-t border-divider pt-2">
            <span className="text-[12.5px] font-semibold text-success">Answer</span>
            <Markdown className="text-[15px]">{block.answer}</Markdown>
          </div>
        </section>
      );
    case "resource":
      return (
        <a href={block.url} target="_blank" rel="noreferrer noopener" className="block border-l-2 border-primary/60 pl-4 hover:text-primary">
          <div className="font-medium text-primary">{block.title}</div>
          {block.description && <div className="text-[13.5px] text-muted">{block.description}</div>}
        </a>
      );
  }
}

export function LessonBlocks({ blocks, lessonId, runnable }: { blocks: Block[]; lessonId: string; runnable: boolean }) {
  return (
    <div className="space-y-6">
      {blocks.map((b, i) => (
        // data-hl-block anchors student highlights to a block; its index is stable for a lesson version.
        <div key={i} data-hl-block={i}>
          <LessonBlock block={b} index={i} lessonId={lessonId} runnable={runnable} />
        </div>
      ))}
    </div>
  );
}
