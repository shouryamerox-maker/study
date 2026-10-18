import { notFound } from "next/navigation";
import { CheckCircle2, CircleDashed, MinusCircle, XCircle } from "lucide-react";
import { requirePageUser } from "@/server/auth/guards";
import { studentResult } from "@/server/assessments/attempts";
import { ApiError } from "@/server/http";
import { Alert, Badge, Card, PageHeader, ProgressBar, Stat, cn, fmtDate, fmtMarks } from "@/components/ui";
import { Markdown } from "@/components/content/Markdown";
import { CodeView, OutputView } from "@/components/content/CodeView";
import { percent, type ResponseStatus } from "@/lib/grading";

export const metadata = { title: "Test result" };

const statusUi: Record<ResponseStatus, { label: string; tone: "success" | "danger" | "pending" | "neutral"; icon: typeof CheckCircle2 }> = {
  CORRECT: { label: "Correct", tone: "success", icon: CheckCircle2 },
  INCORRECT: { label: "Incorrect", tone: "danger", icon: XCircle },
  PARTIAL: { label: "Partially correct", tone: "pending", icon: CircleDashed },
  PENDING_REVIEW: { label: "Pending review", tone: "pending", icon: CircleDashed },
  UNANSWERED: { label: "Not answered", tone: "neutral", icon: MinusCircle },
};

export default async function ResultPage({ params }: { params: Promise<{ id: string; attemptId: string }> }) {
  const { id, attemptId } = await params;
  const user = await requirePageUser();
  let r;
  try {
    r = await studentResult(user, attemptId);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 403)) notFound();
    throw e;
  }
  if (r.attempt.assessmentId !== id) notFound();
  const crumbs = [{ href: "/tests", label: "Tests & Results" }, { href: `/tests/${id}`, label: r.attempt.assessment.title }, { label: `Attempt ${r.attempt.attemptNumber}` }];

  if (!r.visible) {
    return (
      <>
        <PageHeader back={{ href: `/tests/${id}`, label: "Back to test" }} crumbs={crumbs} title="Result not released yet" />
        <Alert tone="pending">Your answers were submitted on {fmtDate(r.attempt.submittedAt, true)}. Your teacher has not released the results for this test yet.</Alert>
      </>
    );
  }

  const pct = percent(r.attempt.score ?? 0, r.attempt.maxScore);
  const pending = r.items.filter((i) => i.status === "PENDING_REVIEW").length;
  const byId = new Map(r.items.map((i) => [i.questionId, i]));

  return (
    <>
      <PageHeader back={{ href: `/tests/${id}`, label: "Back to test" }} crumbs={crumbs} title={r.attempt.assessment.title} description={`Submitted ${fmtDate(r.attempt.submittedAt, true)}`} />
      {pending > 0 && (
        <Alert tone="pending" className="mb-4" title={`${pending} question${pending > 1 ? "s are" : " is"} still being marked`}>
          The score below is provisional and only includes marked questions.
        </Alert>
      )}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label={pending ? "Score so far" : "Score"} value={`${fmtMarks(r.attempt.score)} / ${fmtMarks(r.attempt.maxScore)}`} hint={<ProgressBar value={pct} className="mt-1.5" />} />
        <Stat label="Percentage" value={`${pct}%`} />
        <Stat label="Status" value={pending ? "Partly graded" : "Graded"} tone={pending ? "pending" : "success"} />
      </div>

      {r.snapshot.sections.map((s) => (
        <section key={s.id} className="mb-6">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h2 className="text-[15px] font-semibold">{s.title}</h2>
            <span className="text-[12.5px] tabular-nums text-muted">
              {fmtMarks(s.questions.reduce((n, q) => n + (byId.get(q.id)?.score ?? 0), 0))} / {fmtMarks(s.questions.reduce((n, q) => n + q.marks, 0))}
            </span>
          </div>
          <div className="space-y-3">
            {s.questions.map((q) => {
              const it = byId.get(q.id)!;
              const ui = statusUi[it.status];
              const Icon = ui.icon;
              const resp = (it.response ?? {}) as { optionId?: string; value?: boolean; blanks?: string[]; text?: string; code?: string };
              return (
                <Card key={q.id} className="p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold">Q{q.number}</span>
                    <Badge tone={ui.tone}>
                      <Icon size={11} /> {ui.label}
                    </Badge>
                    <span className="ml-auto text-[13px] font-semibold tabular-nums">
                      {it.score == null ? "—" : fmtMarks(it.score)} / {fmtMarks(q.marks)}
                    </span>
                  </div>
                  <Markdown className="text-[14px]">{q.prompt}</Markdown>
                  {q.code && <CodeView code={q.code} className="mt-2" />}
                  <div className="mt-3 space-y-2">
                    <div className="label-caps">Your answer</div>
                    {q.type === "MCQ" ? (
                      <ul className="space-y-1">
                        {q.data.options?.map((o) => (
                          <li
                            key={o.id}
                            className={cn(
                              "rounded-[7px] border px-3 py-1.5 text-[13.5px]",
                              resp.optionId === o.id ? (it.status === "CORRECT" ? "border-success bg-success-soft/60" : "border-danger bg-danger-soft/60") : "border-divider",
                              r.showKey && it.key?.correct === o.id && "border-success",
                            )}
                          >
                            <span className="mr-2 font-mono text-[12px] text-muted">{o.id.toUpperCase()}.</span>
                            <Markdown inline className="text-[13.5px]">{o.text}</Markdown>
                            {resp.optionId === o.id && <span className="ml-2 text-[12px] text-muted">(your choice)</span>}
                          </li>
                        ))}
                      </ul>
                    ) : q.type === "FILL_BLANK" ? (
                      <div className="flex flex-wrap gap-2">
                        {(resp.blanks ?? [""]).map((b, i) => (
                          <code key={i} className={cn("rounded-[6px] border px-2 py-0.5 text-[13px]", it.blankResults?.[i] ? "border-success bg-success-soft" : "border-danger bg-danger-soft")}>
                            {b || "(blank)"}
                          </code>
                        ))}
                      </div>
                    ) : q.type === "TRUE_FALSE" ? (
                      <p>{resp.value === undefined ? "—" : resp.value ? "True" : "False"}</p>
                    ) : (
                      <>
                        {resp.text && (q.type === "OUTPUT_PREDICTION" ? <OutputView title="Your output" text={resp.text} /> : <p className="whitespace-pre-wrap rounded-[8px] bg-sidebar px-3 py-2 text-[13.5px]">{resp.text}</p>)}
                        {resp.code && <CodeView code={resp.code} />}
                        {!resp.text && !resp.code && <p className="text-[13px] text-faint">Not answered</p>}
                      </>
                    )}
                    {it.feedback && (
                      <div className="rounded-[8px] border border-[#ddd0fa] bg-[#f6f2fe] px-3 py-2 text-[13.5px]">
                        <span className="font-semibold text-accent">Teacher feedback: </span>
                        {it.feedback}
                      </div>
                    )}
                    {r.showKey && it.key && (
                      <div className="rounded-[8px] border border-[#cfe0cd] bg-success-soft/40 px-3 py-2 text-[13.5px]">
                        <div className="mb-1 font-semibold text-success">Answer key</div>
                        {it.key.accepted && <p>Accepted: {it.key.accepted.map((a) => a[0]).join(" · ")}</p>}
                        {it.key.expected != null && <OutputView title="Correct output" text={it.key.expected} />}
                        {it.key.modelAnswer && <Markdown className="text-[13.5px]">{it.key.modelAnswer}</Markdown>}
                        {(it.key.correctedCode || it.key.solutionCode) && <CodeView code={(it.key.correctedCode || it.key.solutionCode)!} className="mt-1" />}
                        {it.key.explanation && <Markdown className="mt-1 text-[13.5px]">{it.key.explanation}</Markdown>}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
