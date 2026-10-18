"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Clock, CloudOff, Flag, Loader2, Play, Send } from "lucide-react";
import { Alert, Badge, Button, Card, cn, fmtMarks } from "@/components/ui";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { ClientCode, ClientMarkdown } from "@/components/content/ClientContent";
import { OutputView } from "@/components/content/CodeView";
import { RunResult, type RunResultData } from "@/components/code/RunResult";

const CodeEditor = dynamic(() => import("@/components/code/CodeEditor"), { ssr: false, loading: () => <div className="h-[320px] animate-pulse rounded-[8px] border border-border bg-sidebar" /> });

type Resp = { optionId?: string; value?: boolean; blanks?: string[]; text?: string; code?: string };

interface Q {
  id: string;
  number: number;
  type: string;
  prompt: string;
  code: string | null;
  marks: number;
  data: { options?: { id: string; text: string }[]; blanks?: number; starterCode?: string | null; sampleTests?: { stdin: string; expected: string }[] };
}
interface Section {
  id: string;
  title: string;
  instructions: string | null;
  questions: Q[];
}
export interface RunnerProps {
  assessmentId: string;
  attemptId: string;
  title: string;
  totalMarks: number;
  deadlineAt: string | null;
  serverTime: string;
  sections: Section[];
  initial: { questionId: string; response: Resp | null; markedForReview: boolean }[];
  executionAvailable: boolean;
}

type SaveState = "saved" | "dirty" | "saving" | "error";

function answered(q: Q, r: Resp | undefined) {
  if (!r) return false;
  switch (q.type) {
    case "MCQ":
      return !!r.optionId;
    case "TRUE_FALSE":
      return typeof r.value === "boolean";
    case "FILL_BLANK":
      return (r.blanks ?? []).some((b) => b.trim() !== "");
    case "DEBUGGING":
    case "CODE_WRITING":
      return !!(r.text?.trim() || (r.code?.trim() && r.code.trim() !== (q.data.starterCode ?? "").trim()));
    default:
      return !!r.text?.trim();
  }
}

export function TestRunner(p: RunnerProps) {
  const router = useRouter();
  const questions = useMemo(() => p.sections.flatMap((s) => s.questions.map((q) => ({ ...q, section: s }))), [p.sections]);
  const backupKey = `sl:attempt:${p.attemptId}`;

  const [responses, setResponses] = useState<Record<string, Resp>>(() => Object.fromEntries(p.initial.filter((r) => r.response).map((r) => [r.questionId, r.response!])));
  const [review, setReview] = useState<Record<string, boolean>>(() => Object.fromEntries(p.initial.map((r) => [r.questionId, r.markedForReview])));
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});
  const [idx, setIdx] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fatal, setFatal] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const pending = useRef<Map<string, Resp>>(new Map());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const finished = useRef(false);

  // Clock: offset by server time so a wrong device clock cannot extend the test.
  const offset = useMemo(() => new Date(p.serverTime).getTime() - Date.now(), [p.serverTime]);
  const deadline = p.deadlineAt ? new Date(p.deadlineAt).getTime() : null;
  const [now, setNow] = useState(() => Date.now() + offset);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now() + offset), 1000);
    return () => clearInterval(t);
  }, [offset]);
  const remaining = deadline ? Math.max(0, deadline - now) : null;

  // Restore answers that were typed but not yet confirmed by the server (e.g. connection lost).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(backupKey);
      if (raw) {
        const backup = JSON.parse(raw) as Record<string, Resp>;
        const ids = Object.keys(backup);
        if (ids.length) {
          setResponses((r) => ({ ...r, ...backup }));
          for (const id of ids) {
            pending.current.set(id, backup[id]);
            schedule(id, 50);
          }
        }
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const writeBackup = useCallback(() => {
    try {
      if (pending.current.size === 0) localStorage.removeItem(backupKey);
      else localStorage.setItem(backupKey, JSON.stringify(Object.fromEntries(pending.current)));
    } catch {
      /* ignore */
    }
  }, [backupKey]);

  const handleTerminal = useCallback(
    (e: unknown) => {
      if (e instanceof ClientApiError && e.status === 409) {
        finished.current = true;
        try {
          localStorage.removeItem(backupKey);
        } catch {}
        router.replace(`/tests/${p.assessmentId}?submitted=1`);
        return true;
      }
      return false;
    },
    [backupKey, p.assessmentId, router],
  );

  const saveNow = useCallback(
    async (questionId: string) => {
      const resp = pending.current.get(questionId);
      if (!resp) return true;
      setSaveState((s) => ({ ...s, [questionId]: "saving" }));
      try {
        await apiFetch(`/api/v1/attempts/${p.attemptId}/responses`, { method: "PUT", body: { questionId, response: resp } });
        if (pending.current.get(questionId) === resp) pending.current.delete(questionId);
        writeBackup();
        setSaveState((s) => ({ ...s, [questionId]: pending.current.has(questionId) ? "dirty" : "saved" }));
        setOffline(false);
        return true;
      } catch (e) {
        if (handleTerminal(e)) return false;
        setSaveState((s) => ({ ...s, [questionId]: "error" }));
        if (e instanceof ClientApiError && e.status === 0) setOffline(true);
        return false;
      }
    },
    [p.attemptId, writeBackup, handleTerminal],
  );

  const schedule = useCallback(
    (questionId: string, delay = 800) => {
      const t = timers.current.get(questionId);
      if (t) clearTimeout(t);
      timers.current.set(
        questionId,
        setTimeout(() => {
          timers.current.delete(questionId);
          void saveNow(questionId);
        }, delay),
      );
    },
    [saveNow],
  );

  const flushAll = useCallback(async () => {
    for (const t of timers.current.values()) clearTimeout(t);
    timers.current.clear();
    const ids = [...pending.current.keys()];
    const results = await Promise.all(ids.map((id) => saveNow(id)));
    return results.every(Boolean);
  }, [saveNow]);

  // Retry failed saves periodically (network blips).
  useEffect(() => {
    const t = setInterval(() => {
      if (pending.current.size && !timers.current.size) for (const id of pending.current.keys()) void saveNow(id);
    }, 10000);
    return () => clearInterval(t);
  }, [saveNow]);

  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (finished.current) return;
      if (pending.current.size > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  function update(q: Q, patch: Resp) {
    setResponses((r) => {
      const next = { ...(r[q.id] ?? {}), ...patch };
      pending.current.set(q.id, next);
      writeBackup();
      return { ...r, [q.id]: next };
    });
    setSaveState((s) => ({ ...s, [q.id]: "dirty" }));
    schedule(q.id, q.type === "MCQ" || q.type === "TRUE_FALSE" ? 100 : 800);
  }

  async function toggleReview(q: Q) {
    const v = !review[q.id];
    setReview((r) => ({ ...r, [q.id]: v }));
    try {
      await apiFetch(`/api/v1/attempts/${p.attemptId}/responses`, { method: "PUT", body: { questionId: q.id, markedForReview: v } });
    } catch (e) {
      if (!handleTerminal(e)) setReview((r) => ({ ...r, [q.id]: !v }));
    }
  }

  const submit = useCallback(
    async (auto: boolean) => {
      if (finished.current) return;
      setSubmitting(true);
      setFatal(null);
      const ok = await flushAll();
      if (!ok && !auto) {
        setSubmitting(false);
        setFatal("Some answers could not be saved. Check your connection and try again — nothing has been submitted yet.");
        return;
      }
      try {
        await apiFetch(`/api/v1/attempts/${p.attemptId}/submit`, { method: "POST" });
        finished.current = true;
        try {
          localStorage.removeItem(backupKey);
        } catch {}
        router.replace(`/tests/${p.assessmentId}?submitted=1`);
      } catch (e) {
        if (handleTerminal(e)) return;
        setSubmitting(false);
        setFatal(e instanceof ClientApiError ? e.message : "Submission failed. Your saved answers are safe — try again.");
      }
    },
    [flushAll, p.attemptId, p.assessmentId, backupKey, router, handleTerminal],
  );

  // Auto-submit when the timer reaches zero.
  useEffect(() => {
    if (remaining === 0 && !finished.current && !submitting) void submit(true);
  }, [remaining, submitting, submit]);

  const q = questions[idx];
  const r = responses[q.id];
  const answeredCount = questions.filter((x) => answered(x, responses[x.id])).length;
  const reviewCount = questions.filter((x) => review[x.id]).length;
  const anyUnsaved = Object.values(saveState).some((s) => s === "dirty" || s === "saving" || s === "error");
  const anyError = Object.values(saveState).some((s) => s === "error");

  const timeStr = remaining == null ? null : `${Math.floor(remaining / 3600000) > 0 ? Math.floor(remaining / 3600000) + ":" : ""}${String(Math.floor((remaining % 3600000) / 60000)).padStart(2, "0")}:${String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0")}`;
  const lowTime = remaining != null && remaining < 5 * 60 * 1000;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="min-w-0">
        <div className="sticky top-14 z-10 -mx-4 mb-4 flex flex-wrap items-center gap-3 border-b border-border bg-page/95 px-4 py-2.5 lg:-mx-6 lg:px-6">
          <div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
            <div className="truncate text-[14px] font-semibold">{p.title}</div>
            <div className="text-[12px] text-muted">
              {answeredCount} of {questions.length} answered · {fmtMarks(p.totalMarks)} marks
            </div>
          </div>
          <span className="mr-auto flex items-center gap-1.5 text-[12px] text-muted sm:mr-0" aria-live="polite">
            {offline ? (
              <>
                <CloudOff size={13} className="text-danger" /> Offline — answers kept on this device
              </>
            ) : anyError ? (
              <>
                <AlertTriangle size={13} className="text-danger" /> Retrying save…
              </>
            ) : anyUnsaved ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <CheckCircle2 size={13} className="text-success" /> All answers saved
              </>
            )}
          </span>
          {timeStr && (
            <span
              className={cn("inline-flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1 font-mono text-[14px] tabular-nums", lowTime ? "border-danger bg-danger-soft text-danger" : "border-border bg-surface")}
              role="timer"
              aria-label={`Time remaining ${timeStr}`}
            >
              <Clock size={14} /> {timeStr}
            </span>
          )}
          <Button onClick={() => setConfirming(true)} disabled={submitting}>
            <Send size={14} /> Submit
          </Button>
        </div>

        {fatal && (
          <Alert tone="danger" className="mb-4">
            {fatal}
          </Alert>
        )}

        {(idx === 0 || questions[idx - 1].section.id !== q.section.id) && (
          <div className="mb-3">
            <h2 className="text-[15px] font-semibold">{q.section.title}</h2>
            {q.section.instructions && <p className="text-[13px] text-muted">{q.section.instructions}</p>}
          </div>
        )}

        <Card className="p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-semibold">Question {q.number}</span>
            <Badge>
              {fmtMarks(q.marks)} mark{q.marks === 1 ? "" : "s"}
            </Badge>
            {review[q.id] && (
              <Badge tone="accent">
                <Flag size={11} /> Marked for review
              </Badge>
            )}
            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => toggleReview(q)} aria-pressed={!!review[q.id]}>
              <Flag size={13} /> {review[q.id] ? "Unmark" : "Mark for review"}
            </Button>
          </div>

          {q.type === "FILL_BLANK" ? (
            <div className="prose-lesson text-[15px]">
              {q.prompt.split("___").map((part, i, arr) => (
                <span key={i}>
                  <ClientMarkdown inline>{part}</ClientMarkdown>
                  {i < arr.length - 1 && (
                    <input
                      aria-label={`Blank ${i + 1}`}
                      className="input mx-1 inline-block h-8 w-40 align-baseline font-mono text-[13.5px]"
                      value={r?.blanks?.[i] ?? ""}
                      onChange={(e) => {
                        const b = [...(r?.blanks ?? Array(arr.length - 1).fill(""))];
                        b[i] = e.target.value;
                        update(q, { blanks: b });
                      }}
                    />
                  )}
                </span>
              ))}
            </div>
          ) : (
            <ClientMarkdown className="text-[15px]">{q.prompt}</ClientMarkdown>
          )}
          {q.code && q.type !== "DEBUGGING" && <ClientCode code={q.code} className="mt-3" />}

          <div className="mt-4">
            <AnswerInput q={q} r={r} onChange={(patch) => update(q, patch)} attemptId={p.attemptId} executionAvailable={p.executionAvailable} />
          </div>
        </Card>

        <div className="mt-4 flex items-center justify-between">
          <Button variant="secondary" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
            <ChevronLeft size={15} /> Previous
          </Button>
          <span className="text-[12.5px] text-muted">
            {idx + 1} / {questions.length}
          </span>
          {idx < questions.length - 1 ? (
            <Button variant="secondary" onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))}>
              Next <ChevronRight size={15} />
            </Button>
          ) : (
            <Button onClick={() => setConfirming(true)}>
              <Send size={14} /> Review & submit
            </Button>
          )}
        </div>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Card className="p-3">
          <div className="mb-2 text-[13px] font-semibold">Questions</div>
          {p.sections.map((s) => (
            <div key={s.id} className="mb-3">
              <div className="mb-1 truncate text-[11px] font-medium text-faint" title={s.title}>
                {s.title.split("(")[0]}
              </div>
              <div className="grid grid-cols-6 gap-1">
                {s.questions.map((sq) => {
                  const i = questions.findIndex((x) => x.id === sq.id);
                  const isAns = answered(sq, responses[sq.id]);
                  return (
                    <button
                      key={sq.id}
                      type="button"
                      onClick={() => setIdx(i)}
                      aria-label={`Question ${sq.number}${isAns ? ", answered" : ", not answered"}${review[sq.id] ? ", marked for review" : ""}`}
                      aria-current={i === idx ? "step" : undefined}
                      className={cn(
                        "relative h-8 rounded-[6px] border text-[12px] font-medium tabular-nums transition-colors duration-150",
                        isAns ? "border-success/40 bg-success-soft text-success" : "border-border bg-surface text-muted hover:bg-sidebar",
                        i === idx && "ring-2 ring-primary ring-offset-1",
                      )}
                    >
                      {sq.number}
                      {review[sq.id] && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="mt-2 space-y-1 border-t border-divider pt-2 text-[11.5px] text-muted">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-[3px] border border-success/40 bg-success-soft" /> Answered ({answeredCount})
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-[3px] border border-border bg-surface" /> Not answered ({questions.length - answeredCount})
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" /> Marked for review ({reviewCount})
            </div>
          </div>
        </Card>
      </aside>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4" role="dialog" aria-modal="true" aria-labelledby="submit-title">
          <Card className="w-full max-w-md p-5 shadow-[var(--shadow-pop)]">
            <h2 id="submit-title" className="text-[16px] font-semibold">
              Submit this test?
            </h2>
            <ul className="mt-3 space-y-1 text-[13.5px]">
              <li>
                Answered: <strong>{answeredCount}</strong> of {questions.length}
              </li>
              {questions.length - answeredCount > 0 && <li className="text-pending">Unanswered: {questions.length - answeredCount} (they will score 0)</li>}
              {reviewCount > 0 && <li className="text-accent">Marked for review: {reviewCount}</li>}
            </ul>
            <p className="mt-3 text-[13px] text-muted">After submitting you cannot change your answers.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirming(false)} disabled={submitting} autoFocus>
                Keep working
              </Button>
              <Button onClick={() => submit(false)} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit test"}
              </Button>
            </div>
          </Card>
        </div>
      )}
      {submitting && !confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30" role="alert">
          <Card className="p-5 text-[14px]">Time is up — submitting your saved answers…</Card>
        </div>
      )}
    </div>
  );
}

function AnswerInput({ q, r, onChange, attemptId, executionAvailable }: { q: Q; r: Resp | undefined; onChange: (p: Resp) => void; attemptId: string; executionAvailable: boolean }) {
  switch (q.type) {
    case "MCQ":
      return (
        <fieldset className="space-y-2">
          <legend className="sr-only">Choose one option</legend>
          {q.data.options?.map((o) => (
            <label
              key={o.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-[8px] border px-3.5 py-2.5 text-[14.5px] transition-colors duration-150",
                r?.optionId === o.id ? "border-primary bg-primary-soft/50" : "border-border hover:bg-sidebar",
              )}
            >
              <input type="radio" name={`q-${q.id}`} className="mt-1 accent-[#a85c40]" checked={r?.optionId === o.id} onChange={() => onChange({ optionId: o.id })} />
              <span className="font-mono text-[12.5px] text-muted">{o.id.toUpperCase()}.</span>
              <ClientMarkdown inline className="text-[14.5px]">{o.text}</ClientMarkdown>
            </label>
          ))}
        </fieldset>
      );
    case "TRUE_FALSE":
      return (
        <div className="flex gap-2">
          {[true, false].map((v) => (
            <Button key={String(v)} variant={r?.value === v ? "primary" : "secondary"} onClick={() => onChange({ value: v })} aria-pressed={r?.value === v}>
              {v ? "True" : "False"}
            </Button>
          ))}
        </div>
      );
    case "FILL_BLANK":
      return <p className="text-[12.5px] text-muted">Type your answer in the blank above.</p>;
    case "OUTPUT_PREDICTION":
      return (
        <div>
          <label htmlFor={`a-${q.id}`} className="mb-1 block text-[13px] font-medium">
            Your predicted output
          </label>
          <textarea id={`a-${q.id}`} rows={5} className="input font-mono text-[13.5px]" value={r?.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} placeholder="Type exactly what the program prints" />
        </div>
      );
    case "DEBUGGING":
      return (
        <div className="space-y-3">
          <div>
            <label htmlFor={`a-${q.id}`} className="mb-1 block text-[13px] font-medium">
              Mistakes you found (and why they are wrong)
            </label>
            <textarea id={`a-${q.id}`} rows={4} className="input text-[14px]" value={r?.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} />
          </div>
          <div>
            <div className="mb-1 text-[13px] font-medium">Corrected program</div>
            <CodeEditor value={r?.code ?? q.data.starterCode ?? q.code ?? ""} onChange={(v) => onChange({ code: v })} height="300px" ariaLabel="Corrected program" />
          </div>
          <CodeRunBox q={q} code={r?.code ?? q.data.starterCode ?? q.code ?? ""} attemptId={attemptId} available={executionAvailable} />
        </div>
      );
    case "CODE_WRITING":
      return (
        <div className="space-y-3">
          <CodeEditor value={r?.code ?? q.data.starterCode ?? ""} onChange={(v) => onChange({ code: v })} height="420px" ariaLabel="Your program" />
          <CodeRunBox q={q} code={r?.code ?? q.data.starterCode ?? ""} attemptId={attemptId} available={executionAvailable} />
        </div>
      );
    default:
      return (
        <div>
          <label htmlFor={`a-${q.id}`} className="mb-1 block text-[13px] font-medium">
            Your answer
          </label>
          <textarea id={`a-${q.id}`} rows={q.type === "LONG_ANSWER" ? 12 : 8} className="input text-[14.5px]" value={r?.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} />
          <div className="mt-1 text-right text-[11.5px] text-faint">{(r?.text ?? "").trim().split(/\s+/).filter(Boolean).length} words</div>
        </div>
      );
  }
}

function CodeRunBox({ q, code, attemptId, available }: { q: Q; code: string; attemptId: string; available: boolean }) {
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<
    | { mode: "custom"; result: RunResultData }
    | { mode: "samples"; tests: { available: boolean; passed: number; total: number; results: { index: number; passed: boolean; expected?: string; actual?: string; error?: string }[] } }
    | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  if (!available) {
    return <p className="text-[12.5px] text-muted">Code execution is not configured on this server, so you cannot run your code here. Your teacher will compile and review it.</p>;
  }
  async function run() {
    setBusy(true);
    setError(null);
    try {
      setOut(await apiFetch(`/api/v1/attempts/${attemptId}/run`, { body: { questionId: q.id, code } }));
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "Could not run the code.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-2">
      <Button size="sm" variant="secondary" onClick={run} disabled={busy}>
        <Play size={13} /> {busy ? "Running…" : q.data.sampleTests?.length ? "Run against sample test" : "Compile & run"}
      </Button>
      <p className="text-[11.5px] text-faint">Running does not submit or grade your answer. Hidden tests are used only by your teacher.</p>
      {error && <p className="text-[12.5px] text-danger">{error}</p>}
      {out?.mode === "custom" && <RunResult r={out.result} />}
      {out?.mode === "samples" &&
        out.tests.results.map((t) => (
          <div key={t.index} className="space-y-1.5">
            <div className={cn("text-[13px] font-medium", t.passed ? "text-success" : "text-danger")}>
              Sample {t.index + 1}: {t.passed ? "output matches" : "output differs"}
            </div>
            {t.error ? (
              <OutputView title="Error" text={t.error} tone="error" />
            ) : (
              !t.passed && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <OutputView title="Expected" text={t.expected ?? ""} />
                  <OutputView title="Your output" text={t.actual ?? ""} />
                </div>
              )
            )}
          </div>
        ))}
    </div>
  );
}
