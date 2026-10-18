"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { CheckCircle2, Lightbulb, RotateCcw, XCircle } from "lucide-react";
import { Alert, Badge, Button, cn } from "@/components/ui";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { OutputView } from "@/components/content/CodeView";
import { ClientCode, ClientMarkdown } from "@/components/content/ClientContent";

const CodeEditor = dynamic(() => import("@/components/code/CodeEditor"), { ssr: false, loading: () => <div className="h-[260px] animate-pulse rounded-[8px] border border-border bg-sidebar" /> });

export interface PracticeQ {
  id: string;
  type: string;
  prompt: string;
  code: string | null;
  hint: string | null;
  options: { id: string; text: string }[] | null;
  blanks: number | null;
  starterCode: string | null;
  sampleTests: { stdin: string; expected: string }[] | null;
  lastResult?: boolean | null;
}

interface CheckResult {
  available?: boolean;
  unanswered?: boolean;
  message?: string;
  correct?: boolean;
  blankResults?: boolean[];
  explanation?: string | null;
  answer?: { correct?: string | boolean; accepted?: string[]; expected?: string; solutionCode?: string | null } | null;
  tests?: { passed: number; total: number; results: { index: number; hidden: boolean; passed: boolean; status: string; stdin?: string; expected?: string; actual?: string; error?: string }[] } | null;
}

const typeLabel: Record<string, string> = {
  MCQ: "Multiple choice",
  TRUE_FALSE: "True or false",
  FILL_BLANK: "Fill in the blank",
  OUTPUT_PREDICTION: "Predict the output",
  CODE_WRITING: "Write a program",
};

export function PracticeQuestion({ q, number }: { q: PracticeQ; number?: number }) {
  const [optionId, setOptionId] = useState<string>("");
  const [tf, setTf] = useState<boolean | null>(null);
  const [blanks, setBlanks] = useState<string[]>(() => Array(q.blanks ?? 1).fill(""));
  const [text, setText] = useState("");
  const [code, setCode] = useState(q.starterCode ?? "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const locked = result?.available !== false && result?.correct !== undefined;

  async function check() {
    setBusy(true);
    setError(null);
    const response =
      q.type === "MCQ" ? { optionId } : q.type === "TRUE_FALSE" ? (tf === null ? {} : { value: tf }) : q.type === "FILL_BLANK" ? { blanks } : q.type === "CODE_WRITING" ? { code } : { text };
    try {
      const r = await apiFetch<CheckResult>(`/api/v1/practice/${q.id}/check`, { body: { response } });
      if (r.unanswered) setError("Answer the question first.");
      else setResult(r);
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "Could not check your answer.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setResult(null);
    setOptionId("");
    setTf(null);
    setBlanks(Array(q.blanks ?? 1).fill(""));
    setText("");
  }

  const promptParts = q.type === "FILL_BLANK" ? q.prompt.split("___") : null;

  return (
    <div className="rounded-[10px] border border-border bg-surface px-4 py-3.5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {number != null && <span className="text-[12px] font-semibold text-muted">Q{number}</span>}
        <Badge>{typeLabel[q.type] ?? q.type}</Badge>
        {q.lastResult === true && !result && <Badge tone="success">Solved before</Badge>}
        {q.lastResult === false && !result && <Badge tone="pending">Needs another try</Badge>}
      </div>

      {promptParts ? (
        <div className="prose-lesson text-[14.5px]">
          {promptParts.map((part, i) => (
            <span key={i}>
              <ClientMarkdown inline>{part}</ClientMarkdown>
              {i < promptParts.length - 1 && (
                <input
                  aria-label={`Blank ${i + 1}`}
                  value={blanks[i] ?? ""}
                  disabled={locked}
                  onChange={(e) => setBlanks((b) => b.map((v, j) => (j === i ? e.target.value : v)))}
                  className={cn(
                    "input mx-1 inline-block h-7 w-36 px-2 py-0 align-baseline font-mono text-[13px]",
                    result?.blankResults?.[i] === true && "border-success bg-success-soft",
                    result?.blankResults?.[i] === false && "border-danger bg-danger-soft",
                  )}
                />
              )}
            </span>
          ))}
        </div>
      ) : (
        <ClientMarkdown className="text-[14.5px]">{q.prompt}</ClientMarkdown>
      )}
      {q.code && <ClientCode code={q.code} className="mt-2" />}

      <div className="mt-3">
        {q.type === "MCQ" && q.options && (
          <fieldset className="space-y-1.5" disabled={locked}>
            <legend className="sr-only">Options</legend>
            {q.options.map((o) => {
              const isCorrect = result?.answer?.correct === o.id;
              const isChosenWrong = locked && optionId === o.id && !isCorrect;
              return (
                <label
                  key={o.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-[8px] border px-3 py-2 text-[14px] transition-colors duration-150",
                    optionId === o.id ? "border-primary bg-primary-soft/40" : "border-border hover:bg-sidebar",
                    locked && isCorrect && "border-success bg-success-soft/70",
                    isChosenWrong && "border-danger bg-danger-soft/70",
                  )}
                >
                  <input type="radio" name={`q-${q.id}`} className="mt-1 accent-[#a85c40]" checked={optionId === o.id} onChange={() => setOptionId(o.id)} />
                  <span className="font-mono text-[12px] text-muted">{o.id.toUpperCase()}.</span>
                  <ClientMarkdown inline className="text-[14px]">{o.text}</ClientMarkdown>
                </label>
              );
            })}
          </fieldset>
        )}
        {q.type === "TRUE_FALSE" && (
          <div className="flex gap-2">
            {[true, false].map((v) => (
              <Button key={String(v)} type="button" variant={tf === v ? "primary" : "secondary"} size="sm" disabled={locked} onClick={() => setTf(v)} aria-pressed={tf === v}>
                {v ? "True" : "False"}
              </Button>
            ))}
          </div>
        )}
        {q.type === "OUTPUT_PREDICTION" && (
          <textarea
            aria-label="Predicted output"
            rows={3}
            value={text}
            disabled={locked}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type the exact output, one line per line of output"
            className="input font-mono text-[13px]"
          />
        )}
        {q.type === "CODE_WRITING" && (
          <div className="space-y-2">
            <CodeEditor value={code} onChange={setCode} height="260px" onRun={check} ariaLabel="Your solution" />
            {q.sampleTests?.map((t, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <OutputView title={`Sample ${i + 1} input`} text={t.stdin} />
                <OutputView title={`Sample ${i + 1} expected output`} text={t.expected} />
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-[13px] text-danger">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!locked ? (
          <Button size="sm" onClick={check} disabled={busy}>
            {busy ? "Checking…" : q.type === "CODE_WRITING" ? "Run tests & check" : "Check answer"}
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={reset}>
            <RotateCcw size={13} /> Try again
          </Button>
        )}
        {q.hint && !locked && (
          <Button size="sm" variant="ghost" onClick={() => setShowHint((s) => !s)} aria-expanded={showHint}>
            <Lightbulb size={13} /> {showHint ? "Hide hint" : "Hint"}
          </Button>
        )}
      </div>
      {showHint && q.hint && !locked && (
        <div className="mt-2 rounded-[8px] bg-pending-soft/60 px-3 py-2 text-[13.5px]">
          <ClientMarkdown>{q.hint}</ClientMarkdown>
        </div>
      )}

      {result?.available === false && (
        <Alert tone="pending" className="mt-3">
          {result.message}
        </Alert>
      )}
      {locked && result && (
        <div className={cn("mt-3 rounded-[8px] border px-3 py-2.5", result.correct ? "border-[#cfe0cd] bg-success-soft/50" : "border-[#efc7bf] bg-danger-soft/50")}>
          <div className={cn("flex items-center gap-1.5 font-semibold", result.correct ? "text-success" : "text-danger")}>
            {result.correct ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
            {result.correct ? "Correct" : "Not quite"}
            {result.tests && (
              <span className="ml-1 font-normal text-ink/80">
                — {result.tests.passed}/{result.tests.total} tests passed
              </span>
            )}
          </div>
          {!result.correct && result.answer?.expected !== undefined && <OutputView title="Correct output" text={result.answer.expected} />}
          {!result.correct && result.answer?.accepted && (
            <p className="mt-1 text-[13.5px]">
              Accepted answer: <code className="font-mono">{result.answer.accepted.join(" · ")}</code>
            </p>
          )}
          {!result.correct && typeof result.answer?.correct === "boolean" && <p className="mt-1 text-[13.5px]">The statement is {result.answer.correct ? "true" : "false"}.</p>}
          {result.tests && (
            <ul className="mt-2 space-y-1.5">
              {result.tests.results.map((t) => (
                <li key={t.index} className="text-[13px]">
                  <span className={t.passed ? "text-success" : "text-danger"}>{t.passed ? "✓" : "✗"}</span> {t.hidden ? `Hidden test ${t.index + 1}` : `Sample test ${t.index + 1}`}
                  {!t.passed && t.error && <pre className="mt-1 overflow-x-auto rounded bg-[#2e2420] px-2 py-1 font-mono text-[12px] text-[#f3b4a8]">{t.error}</pre>}
                  {!t.passed && !t.hidden && t.actual !== undefined && !t.error && (
                    <div className="mt-1 grid gap-2 sm:grid-cols-2">
                      <OutputView title="Expected" text={t.expected ?? ""} />
                      <OutputView title="Your output" text={t.actual} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {result.explanation && <ClientMarkdown className="mt-2 text-[14px]">{result.explanation}</ClientMarkdown>}
        </div>
      )}
    </div>
  );
}
