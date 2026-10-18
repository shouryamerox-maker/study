"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Copy, Eye, Plus, Save, Send, Trash2 } from "lucide-react";
import { Alert, Badge, Button, Card, CardHeader, Field, LinkButton, cn, fmtMarks } from "@/components/ui";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { useUnsavedGuard } from "@/lib/use-unsaved-guard";
import { Disclosure } from "@/components/Disclosure";

type QType = "MCQ" | "TRUE_FALSE" | "FILL_BLANK" | "SHORT_ANSWER" | "OUTPUT_PREDICTION" | "DEBUGGING" | "CODE_WRITING" | "LONG_ANSWER";
interface TestCase {
  stdin: string;
  expected: string;
}
interface QDef {
  id?: string;
  /** client-only stable key */
  _k?: string;
  type: QType;
  prompt: string;
  code?: string | null;
  marks: number;
  data: { options?: { id: string; text: string }[]; starterCode?: string | null; sampleTests?: TestCase[] };
  answer: {
    correct?: string | boolean;
    accepted?: string[][];
    caseSensitive?: boolean;
    expected?: string;
    hiddenTests?: TestCase[];
    tests?: TestCase[];
    solutionCode?: string;
    correctedCode?: string;
    errors?: string[];
    modelAnswer?: string;
  };
  rubric?: { criterion: string; marks: number }[] | null;
  explanation?: string | null;
}
interface SDef {
  id?: string;
  title: string;
  instructions?: string | null;
  questions: QDef[];
}
export interface Settings {
  title: string;
  description: string | null;
  instructions: string | null;
  durationMinutes: number | null;
  availableFrom: string | null;
  dueAt: string | null;
  attemptLimit: number;
  resultRelease: "IMMEDIATE" | "AFTER_DUE" | "MANUAL";
  showAnswerKey: boolean;
  assignToAll: boolean;
  coverage: string[];
}

const TYPE_LABEL: Record<QType, string> = {
  MCQ: "Multiple choice",
  TRUE_FALSE: "True / false",
  FILL_BLANK: "Fill in the blank",
  OUTPUT_PREDICTION: "Predict the output",
  DEBUGGING: "Debugging / correction",
  SHORT_ANSWER: "Short answer",
  LONG_ANSWER: "Long answer",
  CODE_WRITING: "Programming",
};

function blank(type: QType): QDef {
  switch (type) {
    case "MCQ":
      return { type, prompt: "", marks: 1, data: { options: ["a", "b", "c", "d"].map((id) => ({ id, text: "" })) }, answer: { correct: "a" } };
    case "TRUE_FALSE":
      return { type, prompt: "", marks: 1, data: {}, answer: { correct: true } };
    case "FILL_BLANK":
      return { type, prompt: "The ___ operator …", marks: 1, data: {}, answer: { accepted: [[""]] } };
    case "OUTPUT_PREDICTION":
      return { type, prompt: "What does this program print?", code: "", marks: 2, data: {}, answer: { expected: "" } };
    case "DEBUGGING":
      return { type, prompt: "", code: "", marks: 3, data: { starterCode: "" }, answer: { correctedCode: "", errors: [""] }, rubric: [{ criterion: "", marks: 3 }] };
    case "CODE_WRITING":
      return { type, prompt: "", marks: 5, data: { starterCode: "", sampleTests: [{ stdin: "", expected: "" }] }, answer: { solutionCode: "", hiddenTests: [] }, rubric: [{ criterion: "", marks: 5 }] };
    default:
      return { type, prompt: "", marks: 4, data: {}, answer: { modelAnswer: "" }, rubric: [{ criterion: "", marks: 4 }] };
  }
}

const newKey = () => Math.random().toString(36).slice(2, 10);

const toLocalInput = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

export function TestEditor({
  id,
  status,
  hasAttempts,
  initialSettings,
  initialSections,
  chapters,
}: {
  id: string;
  status: string;
  hasAttempts: boolean;
  initialSettings: Settings;
  initialSections: SDef[];
  chapters: { slug: string; title: string }[];
}) {
  const router = useRouter();
  const [s, setS] = useState(initialSettings);
  // Each question gets a client-only key so the open editor survives reordering.
  const [sections, setSections] = useState<SDef[]>(() => initialSections.map((sec) => ({ ...sec, questions: sec.questions.map((q) => ({ ...q, _k: q.id ?? newKey() })) })));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "danger" | "pending"; text: string; details?: { path: string; message: string }[] } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [openQ, setOpenQ] = useState<string | null>(null);
  const [closedSections, setClosedSections] = useState<Set<number>>(new Set());

  useUnsavedGuard(dirty, "This test has unsaved changes. Leave without saving?");

  const total = sections.reduce((n, sec) => n + sec.questions.reduce((a, q) => a + (Number(q.marks) || 0), 0), 0);
  const questionCount = sections.reduce((n, x) => n + x.questions.length, 0);

  const touch = () => setDirty(true);
  const setSetting = <K extends keyof Settings>(k: K, v: Settings[K]) => {
    setS((x) => ({ ...x, [k]: v }));
    touch();
  };
  const updateQ = (si: number, qi: number, patch: Partial<QDef> | ((q: QDef) => QDef)) => {
    setSections((all) => all.map((sec, i) => (i !== si ? sec : { ...sec, questions: sec.questions.map((q, j) => (j !== qi ? q : typeof patch === "function" ? patch(q) : { ...q, ...patch })) })));
    touch();
  };
  const moveQ = (si: number, qi: number, d: -1 | 1) => {
    setSections((all) =>
      all.map((sec, i) => {
        if (i !== si) return sec;
        const qs = [...sec.questions];
        const t = qi + d;
        if (t < 0 || t >= qs.length) return sec;
        [qs[qi], qs[t]] = [qs[t], qs[qi]];
        return { ...sec, questions: qs };
      }),
    );
    touch();
  };

  /** Client-side checks so teachers see problems before publishing (the server validates again). */
  function problems(): string[] {
    const out: string[] = [];
    if (questionCount === 0) out.push("Add at least one question.");
    let n = 0;
    sections.forEach((sec) =>
      sec.questions.forEach((q) => {
        n++;
        const where = `Q${n}`;
        const marks = Number(q.marks);
        if (!(marks > 0)) out.push(`${where}: marks must be more than 0.`);
        if (!q.prompt.trim()) out.push(`${where}: question text is empty.`);
        if (q.type === "MCQ" && (q.data.options ?? []).some((o) => !o.text.trim())) out.push(`${where}: every option needs text.`);
        if (q.type === "FILL_BLANK") {
          const blanks = (q.prompt.match(/___/g) ?? []).length;
          const lists = q.answer.accepted ?? [];
          if (blanks !== lists.length) out.push(`${where}: ${blanks} blank(s) in the text but ${lists.length} answer list(s).`);
          if (lists.some((l) => l.length === 0)) out.push(`${where}: every blank needs at least one accepted answer.`);
        }
        if (q.type === "OUTPUT_PREDICTION" && !(q.answer.expected ?? "").trim()) out.push(`${where}: enter the expected output.`);
        if (q.rubric && q.rubric.length) {
          const sum = q.rubric.reduce((a, r) => a + (Number(r.marks) || 0), 0);
          if (Math.abs(sum - marks) > 1e-9) out.push(`${where}: rubric adds up to ${fmtMarks(sum)} but the question is worth ${fmtMarks(marks)}.`);
          if (q.rubric.some((r) => !r.criterion.trim())) out.push(`${where}: a rubric criterion is empty.`);
        }
      }),
    );
    return out;
  }

  async function save(): Promise<boolean> {
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch(`/api/v1/teacher/tests/${id}`, {
        method: "PUT",
        body: {
          settings: { ...s, durationMinutes: s.durationMinutes || null, description: s.description || null, instructions: s.instructions || null },
          sections: sections.map((sec) => ({ ...sec, questions: sec.questions.map(({ _k, ...q }) => ({ ...q, marks: Number(q.marks) })) })),
        },
      });
      setDirty(false);
      setMsg({ tone: "success", text: status === "PUBLISHED" ? "Draft saved. Students still see the published version until you publish again." : "Draft saved." });
      router.refresh();
      return true;
    } catch (e) {
      setMsg({ tone: "danger", text: e instanceof ClientApiError ? e.message : "Could not save.", details: e instanceof ClientApiError ? e.details : undefined });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    const p = problems();
    if (p.length) {
      setMsg({ tone: "danger", text: "Fix these before publishing:", details: p.map((m) => ({ path: "", message: m })) });
      return;
    }
    if (!confirm(`${hasAttempts ? "Publish a new version? Students who already took the test keep their original version; new attempts use this one." : "Publish this test? Assigned students will be able to start it."}\n\nTotal: ${fmtMarks(total)} marks, ${questionCount} questions.`)) return;
    if (!(await save())) return;
    setBusy(true);
    try {
      await apiFetch(`/api/v1/teacher/tests/${id}/status`, { body: { action: "publish" } });
      setMsg({ tone: "success", text: `Published — ${fmtMarks(total)} marks.` });
      router.refresh();
    } catch (e) {
      setMsg({ tone: "danger", text: e instanceof ClientApiError ? e.message : "Could not publish." });
    } finally {
      setBusy(false);
    }
  }

  // Map "sections.1.questions.2.answer.correct" to a friendly location.
  const describePath = (p: string) => {
    const m = p.match(/^sections\.(\d+)\.questions\.(\d+)\.?(.*)$/);
    if (!m) return p;
    return `Section ${Number(m[1]) + 1}, question ${Number(m[2]) + 1}${m[3] ? ` (${m[3]})` : ""}`;
  };

  let qNumber = 0;

  return (
    <div className="space-y-5">
      <div className="sticky top-14 z-10 -mx-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-page/95 px-4 py-2.5 lg:-mx-6 lg:px-6">
        <div className="flex items-baseline gap-2">
          <span className="text-[22px] font-semibold tabular-nums leading-none">{fmtMarks(total)}</span>
          <span className="text-[13px] text-muted">marks · {questionCount} questions</span>
        </div>
        <Badge tone={status === "PUBLISHED" ? "success" : status === "ARCHIVED" ? "neutral" : "pending"}>{status === "PUBLISHED" ? "Published" : status === "ARCHIVED" ? "Closed" : "Draft"}</Badge>
        {dirty ? <span className="text-[12.5px] text-pending">Unsaved changes</span> : <span className="text-[12.5px] text-faint">All changes saved</span>}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <LinkButton href={`/teacher/tests/${id}/preview`} variant="ghost" size="sm">
            <Eye size={14} /> Preview
          </LinkButton>
          <Button variant="secondary" size="sm" onClick={save} disabled={busy || !dirty}>
            <Save size={14} /> Save draft
          </Button>
          <span className="mx-1 h-6 w-px bg-border" aria-hidden />
          <Button size="sm" onClick={publish} disabled={busy}>
            <Send size={14} /> {status === "PUBLISHED" ? "Publish changes" : "Publish"}
          </Button>
        </div>
      </div>

      {msg && (
        <Alert tone={msg.tone}>
          {msg.text}
          {msg.details && (
            <ul className="mt-1 list-disc pl-5 text-[12.5px]">
              {msg.details.slice(0, 10).map((d, i) => (
                <li key={i}>
                  {d.path ? `${describePath(d.path)}: ` : ""}
                  {d.message}
                </li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      <Card>
        <div className="grid gap-4 p-4 md:grid-cols-[1fr_160px_140px]">
          <Field label="Test title" htmlFor="t-title">
            <input id="t-title" className="input" value={s.title} onChange={(e) => setSetting("title", e.target.value)} />
          </Field>
          <Field label="Duration (minutes)" htmlFor="t-dur" hint="Empty = untimed">
            <input id="t-dur" type="number" min={1} className="input" value={s.durationMinutes ?? ""} onChange={(e) => setSetting("durationMinutes", e.target.value ? Number(e.target.value) : null)} />
          </Field>
          <Field label="Attempts allowed" htmlFor="t-att">
            <input id="t-att" type="number" min={1} max={20} className="input" value={s.attemptLimit} onChange={(e) => setSetting("attemptLimit", Number(e.target.value) || 1)} />
          </Field>
        </div>
        <Disclosure
          title={<span className="text-[13.5px] font-medium">Advanced settings</span>}
          meta={<span className="hidden text-[12px] text-faint sm:inline">Instructions, dates, result release, syllabus coverage</span>}
          buttonClassName="border-t border-divider px-4 py-2.5"
          panelClassName="grid gap-4 border-t border-divider p-4 md:grid-cols-2"
        >
          <Field label="Description" htmlFor="t-desc" className="md:col-span-2">
            <textarea id="t-desc" rows={2} className="input" value={s.description ?? ""} onChange={(e) => setSetting("description", e.target.value)} />
          </Field>
          <Field label="Instructions shown before starting (markdown)" htmlFor="t-ins" className="md:col-span-2">
            <textarea id="t-ins" rows={5} className="input font-mono text-[13px]" value={s.instructions ?? ""} onChange={(e) => setSetting("instructions", e.target.value)} />
          </Field>
          <Field label="Opens at" htmlFor="t-from" hint="Optional.">
            <input id="t-from" type="datetime-local" className="input" value={toLocalInput(s.availableFrom)} onChange={(e) => setSetting("availableFrom", fromLocalInput(e.target.value))} />
          </Field>
          <Field label="Deadline" htmlFor="t-due" hint="Optional. Timed attempts end at the deadline at the latest.">
            <input id="t-due" type="datetime-local" className="input" value={toLocalInput(s.dueAt)} onChange={(e) => setSetting("dueAt", fromLocalInput(e.target.value))} />
          </Field>
          <Field label="Result release" htmlFor="t-rel">
            <select id="t-rel" className="input" value={s.resultRelease} onChange={(e) => setSetting("resultRelease", e.target.value as Settings["resultRelease"])}>
              <option value="MANUAL">When I release them</option>
              <option value="AFTER_DUE">Automatically after the deadline</option>
              <option value="IMMEDIATE">Immediately after submission</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 pt-6 text-[13.5px]">
            <input type="checkbox" className="accent-[#a85c40]" checked={s.showAnswerKey} onChange={(e) => setSetting("showAnswerKey", e.target.checked)} />
            Show answer key with released results (after full grading)
          </label>
          <fieldset className="md:col-span-2">
            <legend className="mb-1 text-[13px] font-medium">Syllabus coverage</legend>
            <div className="flex flex-wrap gap-1.5">
              {chapters.map((c) => {
                const on = s.coverage.includes(c.slug);
                return (
                  <button
                    key={c.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSetting("coverage", on ? s.coverage.filter((x) => x !== c.slug) : [...s.coverage, c.slug])}
                    className={cn("rounded-[6px] border px-2 py-0.5 text-[12px]", on ? "border-primary bg-primary-soft text-primary-dark" : "border-border text-muted hover:text-ink")}
                  >
                    {c.title}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </Disclosure>
      </Card>

      {sections.map((sec, si) => {
        const secMarks = sec.questions.reduce((n, q) => n + (Number(q.marks) || 0), 0);
        const collapsed = closedSections.has(si);
        const firstNumber = qNumber + 1;
        qNumber += sec.questions.length;
        return (
          <section key={sec.id ?? `new-${si}`} className="rounded-[12px] border border-border bg-surface">
            <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
              <button
                type="button"
                aria-expanded={!collapsed}
                aria-label={`${collapsed ? "Expand" : "Collapse"} section`}
                onClick={() =>
                  setClosedSections((c) => {
                    const n = new Set(c);
                    if (n.has(si)) n.delete(si);
                    else n.add(si);
                    return n;
                  })
                }
                className="rounded p-1 text-faint"
              >
                <ChevronDown size={16} className={cn("transition-transform duration-150", collapsed && "-rotate-90")} />
              </button>
              <input
                aria-label="Section title"
                className="input h-8 max-w-md flex-1 border-transparent bg-transparent font-semibold hover:border-border focus:bg-surface"
                value={sec.title}
                onChange={(e) => {
                  setSections((all) => all.map((x, i) => (i === si ? { ...x, title: e.target.value } : x)));
                  touch();
                }}
              />
              <span className="text-[12.5px] tabular-nums text-muted">
                {sec.questions.length} question{sec.questions.length === 1 ? "" : "s"} · {fmtMarks(secMarks)} marks
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto hover:text-danger"
                onClick={() => {
                  if (sections.length > 1 && confirm(`Delete “${sec.title}” and its ${sec.questions.length} question(s)?`)) {
                    setSections((all) => all.filter((_, i) => i !== si));
                    touch();
                  }
                }}
                disabled={sections.length === 1}
                aria-label="Delete section"
              >
                <Trash2 size={13} />
              </Button>
            </div>
            {!collapsed && (
              <div className="border-t border-divider">
                <div className="px-4 pt-3">
                  <input
                    aria-label="Section instructions"
                    className="input h-8 text-[13px]"
                    placeholder="Section instructions shown to students (optional)"
                    value={sec.instructions ?? ""}
                    onChange={(e) => {
                      setSections((all) => all.map((x, i) => (i === si ? { ...x, instructions: e.target.value } : x)));
                      touch();
                    }}
                  />
                </div>
                <div className="space-y-1.5 p-3">
                  {sec.questions.map((q, qi) => (
                    <QuestionEditor
                      key={q._k}
                      q={q}
                      label={`Q${firstNumber + qi}`}
                      open={openQ === q._k}
                      onToggle={() => setOpenQ((o) => (o === q._k ? null : (q._k ?? null)))}
                      onChange={(p) => updateQ(si, qi, p)}
                      onMove={(d) => moveQ(si, qi, d)}
                      onDuplicate={() => {
                        const copy = { ...structuredClone(q), id: undefined, _k: newKey() };
                        setSections((all) => all.map((x, i) => (i === si ? { ...x, questions: [...x.questions.slice(0, qi + 1), copy, ...x.questions.slice(qi + 1)] } : x)));
                        setOpenQ(copy._k);
                        touch();
                      }}
                      onDelete={() => {
                        if (confirm(`Delete Q${firstNumber + qi}?`)) {
                          setSections((all) => all.map((x, i) => (i === si ? { ...x, questions: x.questions.filter((_, j) => j !== qi) } : x)));
                          touch();
                        }
                      }}
                    />
                  ))}
                  <AddQuestion
                    onAdd={(t) => {
                      const nq = { ...blank(t), _k: newKey() };
                      setSections((all) => all.map((x, i) => (i === si ? { ...x, questions: [...x.questions, nq] } : x)));
                      setOpenQ(nq._k);
                      touch();
                    }}
                  />
                </div>
              </div>
            )}
          </section>
        );
      })}
      <Button
        variant="secondary"
        onClick={() => {
          setSections((all) => [...all, { title: `Section ${String.fromCharCode(65 + all.length)}`, instructions: null, questions: [] }]);
          touch();
        }}
      >
        <Plus size={14} /> Add section
      </Button>
    </div>
  );
}


function AddQuestion({ onAdd }: { onAdd: (t: QType) => void }) {
  const [t, setT] = useState<QType>("MCQ");
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[8px] border border-dashed border-border p-2">
      <label htmlFor="add-type" className="sr-only">
        Question type
      </label>
      <select id="add-type" className="input h-8 w-auto" value={t} onChange={(e) => setT(e.target.value as QType)}>
        {Object.entries(TYPE_LABEL).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      <Button size="sm" variant="secondary" onClick={() => onAdd(t)}>
        <Plus size={13} /> Add question
      </Button>
    </div>
  );
}

function TestCasesEditor({ label, cases, onChange }: { label: string; cases: TestCase[]; onChange: (c: TestCase[]) => void }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[13px] font-medium">
        {label}
        <Button size="sm" variant="ghost" onClick={() => onChange([...cases, { stdin: "", expected: "" }])}>
          <Plus size={12} /> Case
        </Button>
      </div>
      {cases.length === 0 && <p className="text-[12px] text-faint">None.</p>}
      {cases.map((c, i) => (
        <div key={i} className="mb-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <textarea aria-label={`${label} ${i + 1} input`} rows={2} placeholder="stdin" className="input font-mono text-[12.5px]" value={c.stdin} onChange={(e) => onChange(cases.map((x, j) => (j === i ? { ...x, stdin: e.target.value } : x)))} />
          <textarea aria-label={`${label} ${i + 1} expected`} rows={2} placeholder="expected output" className="input font-mono text-[12.5px]" value={c.expected} onChange={(e) => onChange(cases.map((x, j) => (j === i ? { ...x, expected: e.target.value } : x)))} />
          <Button size="sm" variant="ghost" onClick={() => onChange(cases.filter((_, j) => j !== i))} aria-label="Remove case">
            <Trash2 size={13} />
          </Button>
        </div>
      ))}
    </div>
  );
}

function QuestionEditor({ q, label, open, onToggle, onChange, onMove, onDuplicate, onDelete }: { q: QDef; label: string; open: boolean; onToggle: () => void; onChange: (p: Partial<QDef> | ((q: QDef) => QDef)) => void; onMove: (d: -1 | 1) => void; onDuplicate: () => void; onDelete: () => void }) {
  const rubricSum = (q.rubric ?? []).reduce((n, r) => n + (Number(r.marks) || 0), 0);
  const setAnswer = (patch: Partial<QDef["answer"]>) => onChange((x) => ({ ...x, answer: { ...x.answer, ...patch } }));
  const setData = (patch: Partial<QDef["data"]>) => onChange((x) => ({ ...x, data: { ...x.data, ...patch } }));
  const mono = "input font-mono text-[12.5px]";

  return (
    <div className="rounded-[10px] border border-border">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-expanded={open}>
          <span className="text-[12.5px] font-semibold">{label}</span>
          <Badge>{TYPE_LABEL[q.type]}</Badge>
          <span className="truncate text-[13px] text-muted">{q.prompt || "(no question text)"}</span>
        </button>
        <span className="text-[12.5px] tabular-nums text-muted">{fmtMarks(Number(q.marks) || 0)} m</span>
        <div className="flex">
          <Button size="sm" variant="ghost" onClick={() => onMove(-1)} aria-label="Move up">
            <ArrowUp size={13} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onMove(1)} aria-label="Move down">
            <ArrowDown size={13} />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDuplicate} aria-label="Duplicate">
            <Copy size={13} />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} aria-label="Delete" className="hover:text-danger">
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
      {open && (
        <div className="space-y-3 border-t border-divider p-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <Field label={q.type === "FILL_BLANK" ? 'Question (use ___ for each blank)' : "Question (markdown)"}>
              <textarea rows={3} className="input text-[13.5px]" value={q.prompt} onChange={(e) => onChange({ prompt: e.target.value })} />
            </Field>
            <Field label="Marks">
              <input type="number" min={0.25} step={0.25} className="input" value={q.marks} onChange={(e) => onChange({ marks: Number(e.target.value) })} />
            </Field>
          </div>

          {(q.type === "OUTPUT_PREDICTION" || q.type === "DEBUGGING" || q.type === "SHORT_ANSWER" || q.type === "MCQ" || q.type === "LONG_ANSWER") && (
            <Field label={q.type === "DEBUGGING" ? "Program with mistakes (shown to student and pre-filled in their editor)" : "Code snippet (optional)"}>
              <textarea
                rows={q.type === "DEBUGGING" || q.type === "OUTPUT_PREDICTION" ? 8 : 3}
                className={mono}
                value={q.code ?? ""}
                onChange={(e) => (q.type === "DEBUGGING" ? onChange((x) => ({ ...x, code: e.target.value, data: { ...x.data, starterCode: e.target.value } })) : onChange({ code: e.target.value }))}
              />
            </Field>
          )}

          {q.type === "MCQ" && (
            <fieldset className="space-y-1.5">
              <legend className="mb-1 text-[13px] font-medium">Options (select the correct one)</legend>
              {(q.data.options ?? []).map((o, i) => (
                <div key={o.id} className="flex items-center gap-2">
                  <input type="radio" name={`correct-${label}`} aria-label={`Option ${o.id} is correct`} className="accent-[#a85c40]" checked={q.answer.correct === o.id} onChange={() => setAnswer({ correct: o.id })} />
                  <span className="w-4 font-mono text-[12px] text-muted">{o.id}</span>
                  <input className="input h-8" value={o.text} onChange={(e) => setData({ options: q.data.options!.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} aria-label={`Option ${o.id}`} />
                </div>
              ))}
            </fieldset>
          )}
          {q.type === "TRUE_FALSE" && (
            <Field label="Correct answer">
              <select className="input w-40" value={String(q.answer.correct)} onChange={(e) => setAnswer({ correct: e.target.value === "true" })}>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </Field>
          )}
          {q.type === "FILL_BLANK" && (
            <div className="space-y-2">
              {(q.answer.accepted ?? [[""]]).map((list, i) => (
                <Field key={i} label={`Accepted answers for blank ${i + 1} (comma-separated)`}>
                  <input
                    className={mono}
                    value={list.join(", ")}
                    onChange={(e) =>
                      setAnswer({
                        accepted: (q.answer.accepted ?? [[""]]).map((l, j) =>
                          j === i
                            ? e.target.value
                                .split(",")
                                .map((x) => x.trim())
                                .filter(Boolean)
                            : l,
                        ),
                      })
                    }
                  />
                </Field>
              ))}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => setAnswer({ accepted: [...(q.answer.accepted ?? []), [""]] })}>
                  <Plus size={12} /> Blank
                </Button>
                <label className="flex items-center gap-2 text-[13px]">
                  <input type="checkbox" className="accent-[#a85c40]" checked={!!q.answer.caseSensitive} onChange={(e) => setAnswer({ caseSensitive: e.target.checked })} />
                  Case-sensitive
                </label>
              </div>
            </div>
          )}
          {q.type === "OUTPUT_PREDICTION" && (
            <Field label="Expected output (verify by running the program)">
              <textarea rows={3} className={mono} value={q.answer.expected ?? ""} onChange={(e) => setAnswer({ expected: e.target.value })} />
            </Field>
          )}
          {q.type === "DEBUGGING" && (
            <>
              <Field label="Mistakes (one per line, teacher-only)">
                <textarea rows={3} className="input text-[13px]" value={(q.answer.errors ?? []).join("\n")} onChange={(e) => setAnswer({ errors: e.target.value.split("\n") })} />
              </Field>
              <Field label="Corrected program (teacher-only)">
                <textarea rows={8} className={mono} value={q.answer.correctedCode ?? ""} onChange={(e) => setAnswer({ correctedCode: e.target.value })} />
              </Field>
              <TestCasesEditor label="Test cases for the corrected program" cases={q.answer.tests ?? []} onChange={(c) => setAnswer({ tests: c })} />
            </>
          )}
          {q.type === "CODE_WRITING" && (
            <>
              <Field label="Starter code (optional)">
                <textarea rows={5} className={mono} value={q.data.starterCode ?? ""} onChange={(e) => setData({ starterCode: e.target.value })} />
              </Field>
              <TestCasesEditor label="Sample tests (visible to students)" cases={q.data.sampleTests ?? []} onChange={(c) => setData({ sampleTests: c })} />
              <TestCasesEditor label="Hidden tests (teacher-only)" cases={q.answer.hiddenTests ?? []} onChange={(c) => setAnswer({ hiddenTests: c })} />
              <Field label="Model solution (teacher-only)">
                <textarea rows={8} className={mono} value={q.answer.solutionCode ?? ""} onChange={(e) => setAnswer({ solutionCode: e.target.value })} />
              </Field>
            </>
          )}
          {(q.type === "SHORT_ANSWER" || q.type === "LONG_ANSWER") && (
            <Field label="Model answer (teacher-only)">
              <textarea rows={4} className="input text-[13px]" value={q.answer.modelAnswer ?? ""} onChange={(e) => setAnswer({ modelAnswer: e.target.value })} />
            </Field>
          )}

          {["DEBUGGING", "CODE_WRITING", "SHORT_ANSWER", "LONG_ANSWER"].includes(q.type) && (
            <div>
              <div className="mb-1 flex items-center justify-between text-[13px] font-medium">
                <span>
                  Marking rubric{" "}
                  <span className={cn("font-normal", Math.abs(rubricSum - q.marks) > 1e-9 ? "text-danger" : "text-muted")}>
                    ({fmtMarks(rubricSum)} of {fmtMarks(q.marks)} marks allocated)
                  </span>
                </span>
                <Button size="sm" variant="ghost" onClick={() => onChange((x) => ({ ...x, rubric: [...(x.rubric ?? []), { criterion: "", marks: 1 }] }))}>
                  <Plus size={12} /> Criterion
                </Button>
              </div>
              {(q.rubric ?? []).map((r, i) => (
                <div key={i} className="mb-1.5 flex gap-2">
                  <input aria-label="Rubric criterion" className="input h-8 flex-1 text-[13px]" value={r.criterion} onChange={(e) => onChange((x) => ({ ...x, rubric: x.rubric!.map((y, j) => (j === i ? { ...y, criterion: e.target.value } : y)) }))} />
                  <input aria-label="Rubric marks" type="number" step={0.25} min={0.25} className="input h-8 w-20" value={r.marks} onChange={(e) => onChange((x) => ({ ...x, rubric: x.rubric!.map((y, j) => (j === i ? { ...y, marks: Number(e.target.value) } : y)) }))} />
                  <Button size="sm" variant="ghost" onClick={() => onChange((x) => ({ ...x, rubric: x.rubric!.filter((_, j) => j !== i) }))} aria-label="Remove criterion">
                    <Trash2 size={13} />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Field label="Explanation (shown with released answer key)">
            <textarea rows={2} className="input text-[13px]" value={q.explanation ?? ""} onChange={(e) => onChange({ explanation: e.target.value })} />
          </Field>
        </div>
      )}
    </div>
  );
}
