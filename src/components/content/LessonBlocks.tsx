import { AlertTriangle, BookText, CheckCircle2, Info, Lightbulb, ListChecks, Star, Target, XCircle } from "lucide-react";
import type { Block } from "@/lib/content/schema";
import { cn } from "@/components/ui";
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

const calloutStyle = {
  info: { icon: Info, cls: "border-[#d9d2c6] bg-sidebar", iconCls: "text-muted", title: "Note" },
  note: { icon: Info, cls: "border-[#d9d2c6] bg-sidebar", iconCls: "text-muted", title: "Note" },
  tip: { icon: Lightbulb, cls: "border-[#cfe0cd] bg-success-soft/60", iconCls: "text-success", title: "Tip" },
  warning: { icon: AlertTriangle, cls: "border-[#efc7bf] bg-danger-soft/60", iconCls: "text-danger", title: "Watch out" },
  exam: { icon: Star, cls: "border-[#ecd9b8] bg-pending-soft/70", iconCls: "text-pending", title: "Exam point" },
} as const;

function ListBlock({ title, icon: Icon, items, tone }: { title: string; icon: typeof Target; items: string[]; tone: "primary" | "pending" | "success" }) {
  const toneCls = { primary: "text-primary", pending: "text-pending", success: "text-success" }[tone];
  return (
    <div className="rounded-[10px] border border-border bg-surface px-4 py-3">
      <div className={cn("mb-2 flex items-center gap-2 text-[13px] font-semibold", toneCls)}>
        <Icon size={15} aria-hidden /> {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-[14.5px] leading-relaxed">
            <span className={cn("mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full", tone === "primary" ? "bg-primary" : tone === "pending" ? "bg-pending" : "bg-success")} />
            <Markdown inline>{it}</Markdown>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LessonBlock({ block, index, lessonId, runnable }: { block: Block; index: number; lessonId: string; runnable: boolean }) {
  switch (block.type) {
    case "heading":
      return block.level === 3 ? (
        <h3 className="pt-2 text-[16px] font-semibold">{block.text}</h3>
      ) : (
        <h2 id={`s-${index}`} className="scroll-mt-20 border-t border-divider pt-6 text-[19px] font-semibold tracking-[-0.01em] first:border-t-0 first:pt-0">
          {block.text}
        </h2>
      );
    case "markdown":
      return <Markdown>{block.md}</Markdown>;
    case "objectives":
      return <ListBlock title="Learning objectives" icon={Target} items={block.items} tone="primary" />;
    case "examPoints":
      return <ListBlock title="Important exam points" icon={Star} items={block.items} tone="pending" />;
    case "recap":
      return <ListBlock title="Recap" icon={ListChecks} items={block.items} tone="success" />;
    case "definition":
      return (
        <div className="rounded-[10px] border-l-[3px] border-primary bg-surface px-4 py-3 shadow-[var(--shadow-card)]">
          <div className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-primary">
            <BookText size={13} aria-hidden /> Definition · <span className="normal-case tracking-normal text-ink">{block.term}</span>
          </div>
          <Markdown>{block.md}</Markdown>
        </div>
      );
    case "callout": {
      const s = calloutStyle[block.variant];
      const Icon = s.icon;
      return (
        <div className={cn("flex gap-3 rounded-[10px] border px-4 py-3", s.cls)}>
          <Icon size={17} className={cn("mt-0.5 shrink-0", s.iconCls)} aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 text-[13.5px] font-semibold">{block.title ?? s.title}</div>
            <Markdown>{block.md}</Markdown>
          </div>
        </div>
      );
    }
    case "syntax":
      return (
        <div>
          <div className="label-caps mb-1.5">Syntax</div>
          <CodeView code={block.code} language={block.language} lineNumbers={false} />
          {block.md && <Markdown className="mt-2">{block.md}</Markdown>}
        </div>
      );
    case "code": {
      const canRun = runnable && block.runnable && block.language === "c";
      return (
        <figure className="space-y-2">
          {block.title && <figcaption className="text-[13.5px] font-semibold">{block.title}</figcaption>}
          <CodeView code={block.code} language={block.language} />
          {block.stdin && <OutputView title="Input (stdin)" text={block.stdin} />}
          {block.output !== undefined && <OutputView title="Expected output" text={block.output} />}
          {canRun && <RunCodeActions code={block.code} stdin={block.stdin} refId={lessonId} />}
          {block.walkthrough && block.walkthrough.length > 0 && (
            <div className="rounded-[10px] border border-border bg-surface">
              <div className="border-b border-divider px-4 py-2 text-[13px] font-semibold">Line-by-line explanation</div>
              <dl className="divide-y divide-divider">
                {block.walkthrough.map((w, i) => (
                  <div key={i} className="grid grid-cols-[72px_1fr] gap-3 px-4 py-2.5">
                    <dt className="pt-0.5 font-mono text-[12px] text-primary">
                      {w.lines.includes("-") || w.lines.includes(",") ? "Lines" : "Line"} {w.lines}
                    </dt>
                    <dd className="min-w-0">
                      <CodeView
                        code={dedent(
                          block.code
                            .split("\n")
                            .filter((_, li) => parseLines(w.lines).has(li + 1)),
                        )}
                        language={block.language}
                        lineNumbers={false}
                        className="mb-1.5 py-1 text-[12.5px]"
                      />
                      <Markdown className="text-[14px]">{w.text}</Markdown>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </figure>
      );
    }
    case "output":
      return <OutputView title={block.title ?? "Output"} text={block.text} />;
    case "table":
      return (
        <figure className="overflow-x-auto rounded-[10px] border border-border bg-surface">
          <table className="table">
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
                      <Markdown inline className="text-[13.5px]">
                        {c}
                      </Markdown>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.caption && <figcaption className="border-t border-divider px-3 py-2 text-[12.5px] text-muted">{block.caption}</figcaption>}
        </figure>
      );
    case "mistakes":
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-danger">
            <AlertTriangle size={15} aria-hidden /> Common mistakes
          </div>
          {block.items.map((m, i) => (
            <div key={i} className="rounded-[10px] border border-border bg-surface px-4 py-3">
              <div className="mb-1.5 font-semibold">{m.title}</div>
              <Markdown className="text-[14px]">{m.md}</Markdown>
              {(m.wrong || m.right) && (
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {m.wrong && (
                    <div>
                      <div className="mb-1 flex items-center gap-1 text-[12px] font-medium text-danger">
                        <XCircle size={12} /> Wrong
                      </div>
                      <CodeView code={m.wrong} lineNumbers={false} className="border-[#efc7bf]" />
                    </div>
                  )}
                  {m.right && (
                    <div>
                      <div className="mb-1 flex items-center gap-1 text-[12px] font-medium text-success">
                        <CheckCircle2 size={12} /> Correct
                      </div>
                      <CodeView code={m.right} lineNumbers={false} className="border-[#cfe0cd]" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    case "exercise": {
      const kindLabel = { write: "Write a program", predict: "Predict the output", debug: "Find and fix the bug", concept: "Concept check" }[block.kind];
      return (
        <div className="rounded-[10px] border border-border bg-surface px-4 py-3.5">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-[5px] bg-primary-soft px-1.5 py-0.5 text-[11px] font-semibold text-primary-dark">Exercise</span>
            <span className="text-[12px] text-muted">{kindLabel}</span>
          </div>
          <div className="mb-2 font-semibold">{block.title}</div>
          <Markdown className="text-[14.5px]">{block.prompt}</Markdown>
          <div className="mt-3 space-y-2">
            {block.starterCode && <CodeView code={block.starterCode} />}
            <ExerciseTry starterCode={runnable && block.kind !== "concept" ? block.starterCode ?? "" : undefined} />
            {block.hint && (
              <Reveal label="Show hint" tone="hint">
                <Markdown className="text-[14px]">{block.hint}</Markdown>
              </Reveal>
            )}
            {(block.solution || block.solutionCode || block.expectedOutput) && (
              <Reveal label="Show solution">
                <div className="space-y-2">
                  {block.solution && <Markdown className="text-[14px]">{block.solution}</Markdown>}
                  {block.solutionCode && <CodeView code={block.solutionCode} />}
                  {block.expectedOutput !== undefined && <OutputView title="Expected output" text={block.expectedOutput} />}
                </div>
              </Reveal>
            )}
          </div>
        </div>
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
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[5px] border border-border bg-surface/95 px-1.5 py-0.5 text-[11.5px] font-medium shadow-[var(--shadow-card)]"
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
        <div className="rounded-[10px] border border-border bg-surface">
          <div className="border-b border-divider px-4 py-2 text-[13px] font-semibold">Worked example · {block.title}</div>
          <div className="space-y-3 px-4 py-3">
            <Markdown>{block.problem}</Markdown>
            <ol className="space-y-2">
              {block.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary-dark">{i + 1}</span>
                  <Markdown className="min-w-0 flex-1 text-[14.5px]">{s}</Markdown>
                </li>
              ))}
            </ol>
            <div className="rounded-[8px] bg-success-soft/60 px-3 py-2">
              <span className="text-[12px] font-semibold text-success">Answer</span>
              <Markdown className="text-[14.5px]">{block.answer}</Markdown>
            </div>
          </div>
        </div>
      );
    case "resource":
      return (
        <a href={block.url} target="_blank" rel="noreferrer noopener" className="block rounded-[10px] border border-border bg-surface px-4 py-3 hover:border-primary">
          <div className="font-medium text-primary">{block.title}</div>
          {block.description && <div className="text-[13px] text-muted">{block.description}</div>}
        </a>
      );
  }
}

export function LessonBlocks({ blocks, lessonId, runnable }: { blocks: Block[]; lessonId: string; runnable: boolean }) {
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => (
        <LessonBlock key={i} block={b} index={i} lessonId={lessonId} runnable={runnable} />
      ))}
    </div>
  );
}
