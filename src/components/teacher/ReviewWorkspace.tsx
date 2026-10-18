"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, CircleDashed, History, MinusCircle, Play, XCircle } from "lucide-react";
import { Alert, Badge, Button, Card, CardHeader, cn, fmtDate, fmtMarks } from "@/components/ui";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { ClientCode, ClientMarkdown } from "@/components/content/ClientContent";
import { OutputView } from "@/components/content/CodeView";

type Status = "UNANSWERED" | "CORRECT" | "INCORRECT" | "PARTIAL" | "PENDING_REVIEW";
interface Item {
  question: {
    id: string;
    number: number;
    type: string;
    prompt: string;
    code?: string | null;
    marks: number;
    data: { options?: { id: string; text: string }[]; starterCode?: string | null; sampleTests?: { stdin: string; expected: string }[] };
    answer: {
      correct?: string | boolean;
      accepted?: string[][];
      expected?: string;
      modelAnswer?: string;
      correctedCode?: string;
      solutionCode?: string;
      errors?: string[];
      hiddenTests?: { stdin: string; expected: string }[];
      tests?: { stdin: string; expected: string }[];
    };
    rubric?: { criterion: string; marks: number }[] | null;
    explanation?: string | null;
  };
  response: null | {
    id: string;
    response: { optionId?: string; value?: boolean; blanks?: string[]; text?: string; code?: string } | null;
    status: Status;
    score: number | null;
    autoScore: number | null;
    feedback: string | null;
    evaluation: { blankResults?: boolean[]; tests?: Evaluation } | null;
    markedForReview: boolean;
    gradedBy: string | null;
    gradedAt: string | null;
  };
  audits: { id: string; kind: string; previousScore: number | null; newScore: number; reason: string | null; createdAt: string; grader: { name: string } }[];
}
interface Evaluation {
  ranAt: string;
  passed: number;
  total: number;
  results: { index: number; hidden: boolean; passed: boolean; status: string; stdin?: string; expected?: string; actual?: string; error?: string }[];
}

const statusUi: Record<Status, { label: string; tone: "success" | "danger" | "pending" | "neutral"; icon: typeof CheckCircle2 }> = {
  CORRECT: { label: "Correct", tone: "success", icon: CheckCircle2 },
  INCORRECT: { label: "Incorrect", tone: "danger", icon: XCircle },
  PARTIAL: { label: "Partially correct", tone: "pending", icon: CircleDashed },
  PENDING_REVIEW: { label: "Pending review", tone: "pending", icon: CircleDashed },
  UNANSWERED: { label: "Not answered", tone: "neutral", icon: MinusCircle },
};

export function ReviewWorkspace({
  attempt,
  others,
  sections,
  items: initialItems,
  executionAvailable,
  initialQuestionId,
}: {
  attempt: {
    id: string;
    status: string;
    inProgress: boolean;
    attemptNumber: number;
    version: number;
    startedAt: string;
    submittedAt: string | null;
    score: number | null;
    maxScore: number;
    gradingStatus: string;
    student: { id: string; name: string; email: string; studentCode: string | null };
    resultsReleased: boolean;
  };
  others: { id: string; attemptNumber: number; score: number | null; maxScore: number; submittedAt: string | null }[];
  sections: { id: string; title: string; questionIds: string[] }[];
  items: Item[];
  executionAvailable: boolean;
  initialQuestionId?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [totals, setTotals] = useState({ score: attempt.score, gradingStatus: attempt.gradingStatus });
  const firstPending = items.findIndex((i) => i.response?.status === "PENDING_REVIEW");
  const [idx, setIdx] = useState(() => {
    const byId = initialQuestionId ? items.findIndex((i) => i.question.id === initialQuestionId) : -1;
    return byId >= 0 ? byId : Math.max(firstPending, 0);
  });
  const it = items[idx];
  const q = it.question;
  const r = it.response;

  const duration = attempt.submittedAt ? Math.round((new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000) : null;
  const pending = items.filter((i) => i.response?.status === "PENDING_REVIEW").length;

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 text-[13px]">
        <div>
          <div className="text-muted">Student</div>
          <div className="font-medium">
            {attempt.student.name} <span className="font-normal text-muted">· {attempt.student.studentCode ?? attempt.student.email}</span>
          </div>
        </div>
        <div>
          <div className="text-muted">Attempt</div>
          <div>
            #{attempt.attemptNumber} · test version {attempt.version}
            {attempt.status === "AUTO_SUBMITTED" && <Badge tone="pending" className="ml-1">Auto-submitted</Badge>}
          </div>
        </div>
        <div>
          <div className="text-muted">Started → submitted</div>
          <div>
            {fmtDate(attempt.startedAt, true)} → {attempt.submittedAt ? fmtDate(attempt.submittedAt, true) : "in progress"}
            {duration != null && <span className="text-muted"> ({duration} min)</span>}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-muted">{totals.gradingStatus === "PENDING_REVIEW" ? `Provisional score · ${pending} to grade` : "Final score"}</div>
          <div className="text-[20px] font-semibold tabular-nums">
            {fmtMarks(totals.score)} / {fmtMarks(attempt.maxScore)}
          </div>
        </div>
      </Card>

      {attempt.inProgress && <Alert tone="pending">This attempt is still in progress. Answers shown are the latest autosaved ones; grading opens after submission.</Alert>}
      {!attempt.resultsReleased && !attempt.inProgress && <Alert>Results for this test have not been released to students yet. Release them from the test&apos;s results page.</Alert>}
      {others.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
          Other attempts:
          {others.map((o) => (
            <a key={o.id} href={`/teacher/attempts/${o.id}`} className={cn("rounded-[6px] border px-2 py-0.5", o.id === attempt.id ? "border-primary bg-primary-soft text-primary-dark" : "border-border bg-surface hover:text-ink")}>
              #{o.attemptNumber}: {fmtMarks(o.score)}/{fmtMarks(o.maxScore)}
            </a>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <Card className="self-start p-2 lg:sticky lg:top-20">
          {sections.map((s) => (
            <div key={s.id} className="mb-2">
              <div className="truncate px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-faint" title={s.title}>
                {s.title.split("(")[0]}
              </div>
              {s.questionIds.map((qid) => {
                const i = items.findIndex((x) => x.question.id === qid);
                const x = items[i];
                const st = x.response?.status ?? "UNANSWERED";
                const Icon = statusUi[st].icon;
                return (
                  <button
                    key={qid}
                    type="button"
                    onClick={() => setIdx(i)}
                    aria-current={i === idx ? "step" : undefined}
                    className={cn("flex w-full items-center gap-2 rounded-[6px] px-2 py-1 text-left text-[12.5px]", i === idx ? "bg-primary-soft font-medium text-primary-dark" : "hover:bg-sidebar")}
                  >
                    <Icon
                      size={13}
                      className={cn(st === "CORRECT" ? "text-success" : st === "INCORRECT" ? "text-danger" : st === "UNANSWERED" ? "text-faint" : "text-pending")}
                      aria-label={statusUi[st].label}
                    />
                    Q{x.question.number}
                    <span className="ml-auto tabular-nums text-muted">
                      {x.response?.status === "PENDING_REVIEW" ? "?" : fmtMarks(x.response?.score ?? 0)}/{fmtMarks(x.question.marks)}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </Card>

        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader
              title={`Question ${q.number} · ${q.type.replace(/_/g, " ").toLowerCase()}`}
              action={
                <Badge tone={statusUi[r?.status ?? "UNANSWERED"].tone}>
                  {statusUi[r?.status ?? "UNANSWERED"].label} · {r?.status === "PENDING_REVIEW" ? "—" : fmtMarks(r?.score ?? 0)}/{fmtMarks(q.marks)}
                </Badge>
              }
            />
            <div className="p-4">
              <ClientMarkdown className="text-[14.5px]">{q.prompt}</ClientMarkdown>
              {q.code && q.type !== "DEBUGGING" && <ClientCode code={q.code} className="mt-2" />}
            </div>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader title="Student's response" description={r?.markedForReview ? "Student flagged this question for review" : "Exactly as submitted"} />
              <div className="space-y-3 p-4">
                <StudentAnswer item={it} />
              </div>
            </Card>
            <Card>
              <CardHeader title="Expected answer" description="Teacher-only" />
              <div className="space-y-3 p-4">
                <ExpectedAnswer item={it} />
              </div>
            </Card>
          </div>

          {(q.type === "CODE_WRITING" || q.type === "DEBUGGING") && r && (
            <Evaluator responseId={r.id} initial={r.evaluation?.tests ?? null} available={executionAvailable} hasCode={!!r.response?.code?.trim()} />
          )}

          {r && !attempt.inProgress && (
            <GradeForm
              key={r.id + (r.gradedAt ?? "")}
              item={it}
              onSaved={(resp, att) => {
                setItems((all) => all.map((x, i) => (i === idx && x.response ? { ...x, response: { ...x.response, ...resp } } : x)));
                setTotals(att);
                router.refresh();
              }}
            />
          )}

          {it.audits.length > 0 && (
            <Card>
              <CardHeader title="Grading history" />
              <ul className="divide-y divide-divider">
                {it.audits.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-start gap-2 px-4 py-2 text-[12.5px]">
                    <History size={13} className="mt-0.5 text-muted" />
                    <span>
                      <strong>{a.grader.name}</strong> {a.kind === "grade" ? "graded" : a.kind === "override" ? "overrode the automatic mark" : "changed the mark"}: {a.previousScore != null ? `${fmtMarks(a.previousScore)} → ` : ""}
                      {fmtMarks(a.newScore)}
                      {a.reason && <span className="text-muted"> — “{a.reason}”</span>}
                    </span>
                    <span className="ml-auto text-faint">{fmtDate(a.createdAt, true)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
              <ChevronLeft size={15} /> Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const nextPending = items.findIndex((x, i) => i > idx && x.response?.status === "PENDING_REVIEW");
                setIdx(nextPending >= 0 ? nextPending : Math.min(items.length - 1, idx + 1));
              }}
              disabled={idx === items.length - 1}
            >
              {items.some((x, i) => i > idx && x.response?.status === "PENDING_REVIEW") ? "Next to grade" : "Next"} <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentAnswer({ item }: { item: Item }) {
  const { question: q, response: r } = item;
  const resp = r?.response ?? {};
  if (!r || r.status === "UNANSWERED") return <p className="text-[13px] text-faint">No answer was submitted.</p>;
  switch (q.type) {
    case "MCQ":
      return (
        <ul className="space-y-1">
          {q.data.options?.map((o) => (
            <li
              key={o.id}
              className={cn(
                "rounded-[7px] border px-3 py-1.5 text-[13.5px]",
                resp.optionId === o.id ? (o.id === q.answer.correct ? "border-success bg-success-soft/60" : "border-danger bg-danger-soft/60") : "border-divider",
              )}
            >
              <span className="mr-2 font-mono text-[12px] text-muted">{o.id.toUpperCase()}.</span>
              <ClientMarkdown inline className="text-[13.5px]">{o.text}</ClientMarkdown>
              {resp.optionId === o.id && <span className="ml-1 text-[12px] font-medium"> ← selected</span>}
            </li>
          ))}
        </ul>
      );
    case "TRUE_FALSE":
      return <p>{resp.value ? "True" : "False"}</p>;
    case "FILL_BLANK":
      return (
        <div className="space-y-1">
          {(resp.blanks ?? []).map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-[13px]">
              <span className="text-muted">Blank {i + 1}:</span>
              <code className={cn("rounded-[6px] border px-2 py-0.5 font-mono whitespace-pre", r.evaluation?.blankResults?.[i] ? "border-success bg-success-soft" : "border-danger bg-danger-soft")}>{JSON.stringify(b)}</code>
            </div>
          ))}
        </div>
      );
    case "OUTPUT_PREDICTION":
      return <OutputView title="Predicted output" text={resp.text ?? ""} />;
    case "DEBUGGING":
      return (
        <>
          <div>
            <div className="label-caps mb-1">Explanation</div>
            <p className="whitespace-pre-wrap rounded-[8px] bg-sidebar px-3 py-2 text-[13.5px]">{resp.text || <span className="text-faint">(none)</span>}</p>
          </div>
          <div>
            <div className="label-caps mb-1">Submitted corrected code</div>
            {resp.code ? <ClientCode code={resp.code} /> : <p className="text-[13px] text-faint">(no code changes submitted)</p>}
          </div>
          {q.code && (
            <details>
              <summary className="cursor-pointer text-[12.5px] text-muted">Original buggy program</summary>
              <ClientCode code={q.code} className="mt-1" />
            </details>
          )}
        </>
      );
    case "CODE_WRITING":
      return resp.code ? <ClientCode code={resp.code} /> : <p className="text-[13px] text-faint">(no code)</p>;
    default:
      return <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{resp.text}</p>;
  }
}

function ExpectedAnswer({ item }: { item: Item }) {
  const { question: q } = item;
  const a = q.answer;
  return (
    <>
      {q.type === "MCQ" && (
        <p className="text-[13.5px]">
          Correct option: <strong>{String(a.correct).toUpperCase()}</strong>
        </p>
      )}
      {q.type === "TRUE_FALSE" && <p>Correct: {a.correct ? "True" : "False"}</p>}
      {a.accepted && (
        <div className="text-[13.5px]">
          Accepted answers:
          {a.accepted.map((list, i) => (
            <div key={i} className="mt-1 flex flex-wrap gap-1">
              {list.map((x) => (
                <code key={x} className="rounded-[5px] bg-success-soft px-1.5 py-0.5 font-mono text-[12.5px]">
                  {x}
                </code>
              ))}
            </div>
          ))}
        </div>
      )}
      {a.expected !== undefined && <OutputView title="Expected output (verified)" text={a.expected} />}
      {a.errors && (
        <div>
          <div className="label-caps mb-1">Mistakes to find</div>
          <ol className="list-decimal space-y-1 pl-5 text-[13.5px]">
            {a.errors.map((e, i) => (
              <li key={i}>
                <ClientMarkdown inline className="text-[13.5px]">{e}</ClientMarkdown>
              </li>
            ))}
          </ol>
        </div>
      )}
      {a.modelAnswer && (
        <div>
          <div className="label-caps mb-1">Model answer</div>
          <ClientMarkdown className="text-[13.5px]">{a.modelAnswer}</ClientMarkdown>
        </div>
      )}
      {(a.correctedCode || a.solutionCode) && (
        <div>
          <div className="label-caps mb-1">{a.correctedCode ? "Corrected program" : "Model solution"}</div>
          <ClientCode code={(a.correctedCode || a.solutionCode)!} />
        </div>
      )}
      {q.rubric && q.rubric.length > 0 && (
        <div>
          <div className="label-caps mb-1">Rubric</div>
          <ul className="space-y-1 text-[13px]">
            {q.rubric.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="w-10 shrink-0 font-semibold tabular-nums text-primary">{fmtMarks(c.marks)}</span>
                {c.criterion}
              </li>
            ))}
          </ul>
        </div>
      )}
      {q.explanation && <ClientMarkdown className="text-[13px] text-muted">{q.explanation}</ClientMarkdown>}
    </>
  );
}

function Evaluator({ responseId, initial, available, hasCode }: { responseId: string; initial: Evaluation | null; available: boolean; hasCode: boolean }) {
  const [ev, setEv] = useState<Evaluation | null>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setEv(initial), [initial, responseId]);
  async function run() {
    setBusy(true);
    setError(null);
    try {
      const r = await apiFetch<{ available: boolean; evaluation?: Evaluation }>(`/api/v1/teacher/responses/${responseId}/evaluate`, { method: "POST" });
      if (!r.available) setError("Code execution is not configured on this server.");
      else setEv(r.evaluation!);
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "Could not run the tests.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card>
      <CardHeader
        title="Compile & run against test cases"
        description="A grading aid — it does not change the mark."
        action={
          <Button size="sm" variant="secondary" onClick={run} disabled={busy || !available || !hasCode}>
            <Play size={13} /> {busy ? "Running…" : ev ? "Run again" : "Run tests"}
          </Button>
        }
      />
      <div className="p-4">
        {!available && <p className="text-[13px] text-muted">Code execution is not configured, so submissions cannot be compiled here. Grade by reading the code against the rubric.</p>}
        {!hasCode && available && <p className="text-[13px] text-muted">No code submitted.</p>}
        {error && <p className="text-[13px] text-danger">{error}</p>}
        {ev && (
          <div className="space-y-2">
            <p className="text-[13.5px]">
              <strong className={ev.passed === ev.total ? "text-success" : "text-pending"}>
                {ev.passed} / {ev.total} test cases passed
              </strong>{" "}
              <span className="text-[12px] text-faint">· run {fmtDate(ev.ranAt, true)}</span>
            </p>
            {ev.results.map((t) => (
              <details key={t.index} className="rounded-[8px] border border-divider" open={!t.passed}>
                <summary className={cn("cursor-pointer px-3 py-1.5 text-[13px]", t.passed ? "text-success" : "text-danger")}>
                  {t.passed ? "✓" : "✗"} {t.hidden ? "Hidden" : "Sample"} test {t.index + 1} {t.status !== "ok" && `· ${t.status.replace("_", " ")}`}
                </summary>
                <div className="grid gap-2 p-2 md:grid-cols-3">
                  <OutputView title="Input" text={t.stdin ?? ""} />
                  <OutputView title="Expected" text={t.expected ?? ""} />
                  {t.error ? <OutputView title="Error" text={t.error} tone="error" /> : <OutputView title="Actual" text={t.actual ?? ""} />}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function GradeForm({
  item,
  onSaved,
}: {
  item: Item;
  onSaved: (resp: { score: number; status: Status; feedback: string | null; gradedAt: string }, attempt: { score: number | null; gradingStatus: string }) => void;
}) {
  const { question: q, response: r } = item;
  const rubric = q.rubric ?? [];
  const [checks, setChecks] = useState<number[]>(() => rubric.map(() => 0));
  const [score, setScore] = useState<string>(r?.status === "PENDING_REVIEW" || r?.score == null ? "" : String(r.score));
  const [feedback, setFeedback] = useState(r?.feedback ?? "");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  const rubricTotal = useMemo(() => checks.reduce((a, b) => a + b, 0), [checks]);
  const alreadyScored = r?.status !== "PENDING_REVIEW" && r?.score != null;
  const changing = alreadyScored && score !== "" && Number(score) !== r?.score;

  async function save() {
    if (!r) return;
    const value = Number(score);
    if (score === "" || !Number.isFinite(value)) {
      setMsg({ tone: "danger", text: "Enter a mark." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await apiFetch<{ response: { score: number; status: Status; feedback: string | null; gradedAt: string }; attempt: { score: number | null; gradingStatus: string } }>(
        `/api/v1/teacher/responses/${r.id}/grade`,
        { body: { score: value, feedback: feedback || null, reason: reason || null } },
      );
      setMsg({ tone: "success", text: "Saved." });
      onSaved(res.response, res.attempt);
    } catch (e) {
      setMsg({ tone: "danger", text: e instanceof ClientApiError ? e.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader title={alreadyScored ? "Change mark" : "Award marks"} description={r?.autoScore != null && alreadyScored ? `Automatic mark: ${fmtMarks(r.autoScore)}` : undefined} />
      <div className="space-y-4 p-4">
        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        {rubric.length > 0 && (
          <div>
            <div className="mb-1.5 text-[13px] font-medium">Rubric (tick criteria met — partial marks allowed)</div>
            <ul className="space-y-1.5">
              {rubric.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-[13.5px]">
                  <select
                    aria-label={`Marks for: ${c.criterion}`}
                    className="input h-7 w-20 px-1.5 text-[13px]"
                    value={checks[i]}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      const next = checks.map((x, j) => (j === i ? v : x));
                      setChecks(next);
                      setScore(String(next.reduce((a, b) => a + b, 0)));
                    }}
                  >
                    {Array.from({ length: Math.round(c.marks * 2) + 1 }, (_, k) => k / 2).map((v) => (
                      <option key={v} value={v}>
                        {fmtMarks(v)}/{fmtMarks(c.marks)}
                      </option>
                    ))}
                  </select>
                  <span className="pt-0.5">{c.criterion}</span>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-[12px] text-muted">Rubric total: {fmtMarks(rubricTotal)} — copied into the mark below (you can adjust it).</p>
          </div>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="mark" className="mb-1 block text-[13px] font-medium">
              Mark (out of {fmtMarks(q.marks)})
            </label>
            <input id="mark" type="number" min={0} max={q.marks} step={0.25} value={score} onChange={(e) => setScore(e.target.value)} className="input h-9 w-28 tabular-nums" />
          </div>
          <div className="flex gap-1.5">
            <Button size="sm" variant="ghost" type="button" onClick={() => setScore("0")}>
              0
            </Button>
            <Button size="sm" variant="ghost" type="button" onClick={() => setScore(String(q.marks / 2))}>
              Half
            </Button>
            <Button size="sm" variant="ghost" type="button" onClick={() => setScore(String(q.marks))}>
              Full
            </Button>
          </div>
        </div>
        <div>
          <label htmlFor="feedback" className="mb-1 block text-[13px] font-medium">
            Feedback to student
          </label>
          <textarea id="feedback" rows={3} className="input text-[13.5px]" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Optional — shown to the student when results are released" />
        </div>
        {(changing || alreadyScored) && (
          <div>
            <label htmlFor="reason" className="mb-1 block text-[13px] font-medium">
              Reason for change {changing && <span className="text-danger">(required)</span>}
            </label>
            <input id="reason" className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Recorded in the grading audit trail" />
          </div>
        )}
        <Button onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save grade"}
        </Button>
      </div>
    </Card>
  );
}
