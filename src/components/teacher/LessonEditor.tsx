"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { blocksSchema, type Block } from "@/lib/content/schema";
import { Alert, Button, Card, CardHeader, Field, cn } from "@/components/ui";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { LessonBlocks } from "@/components/content/LessonBlocks";

const TEMPLATES: Record<string, object> = {
  heading: { type: "heading", text: "Section title", level: 2 },
  markdown: { type: "markdown", md: "Explanation in **markdown**." },
  objectives: { type: "objectives", items: ["Objective one", "Objective two"] },
  definition: { type: "definition", term: "Term", md: "Definition." },
  callout: { type: "callout", variant: "tip", title: "Tip", md: "Helpful note." },
  syntax: { type: "syntax", language: "c", code: "type name = value;" },
  code: { type: "code", language: "c", title: "Example", code: '#include <stdio.h>\n\nint main(void) {\n    printf("Hi\\n");\n    return 0;\n}', runnable: true, output: "Hi", walkthrough: [{ lines: "5", text: "Prints a line." }] },
  table: { type: "table", headers: ["A", "B"], rows: [["1", "2"]] },
  mistakes: { type: "mistakes", items: [{ title: "Mistake", wrong: "wrong();", right: "right();", md: "Why it is wrong." }] },
  examPoints: { type: "examPoints", items: ["Key point"] },
  recap: { type: "recap", items: ["Summary point"] },
  exercise: { type: "exercise", id: "unique-id", kind: "write", title: "Exercise", prompt: "Task description.", hint: "Hint.", solution: "Solution explanation." },
  math: { type: "math", tex: "v = u + at", display: true, caption: "First equation of motion" },
  image: { type: "image", src: "https://…", alt: "Description", caption: "Caption" },
  diagram: { type: "diagram", src: "https://…", alt: "Labelled diagram", labels: [{ x: 30, y: 40, text: "Label" }] },
  workedExample: { type: "workedExample", title: "Worked example", problem: "Problem.", steps: ["Step 1"], answer: "Answer." },
  resource: { type: "resource", title: "Link", url: "https://…", description: "What it is." },
};

export function LessonEditor({ lesson }: { lesson: { id: string; title: string; summary: string | null; estMinutes: number; published: boolean; blocks: unknown; version: number } }) {
  const router = useRouter();
  const [title, setTitle] = useState(lesson.title);
  const [summary, setSummary] = useState(lesson.summary ?? "");
  const [est, setEst] = useState(lesson.estMinutes);
  const [published, setPublished] = useState(lesson.published);
  const [json, setJson] = useState(() => JSON.stringify(lesson.blocks, null, 2));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  const parsed = useMemo((): { ok: true; blocks: Block[] } | { ok: false; error: string } => {
    let raw: unknown;
    try {
      raw = JSON.parse(json);
    } catch (e) {
      return { ok: false, error: `JSON syntax error: ${(e as Error).message}` };
    }
    const r = blocksSchema.safeParse(raw);
    if (!r.success) return { ok: false, error: r.error.issues.slice(0, 5).map((i) => `Block ${i.path.join(".")}: ${i.message}`).join("\n") };
    return { ok: true, blocks: r.data };
  }, [json]);

  function insert(type: string) {
    try {
      const arr = JSON.parse(json) as unknown[];
      arr.push(TEMPLATES[type]);
      setJson(JSON.stringify(arr, null, 2));
    } catch {
      setMsg({ tone: "danger", text: "Fix the JSON syntax before inserting a block." });
    }
  }

  async function save() {
    if (!parsed.ok) {
      setMsg({ tone: "danger", text: "Fix the content errors before saving." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const r = await apiFetch<{ version: number }>(`/api/v1/teacher/lessons/${lesson.id}`, { method: "PUT", body: { title, summary: summary || null, estMinutes: est, published, blocks: parsed.blocks } });
      setMsg({ tone: "success", text: `Saved (version ${r.version}). Student progress on this lesson is kept.` });
      router.refresh();
    } catch (e) {
      setMsg({ tone: "danger", text: e instanceof ClientApiError ? e.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <Card>
        <div className="grid gap-3 p-4 md:grid-cols-[1fr_140px_auto]">
          <Field label="Title" htmlFor="l-title">
            <input id="l-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Minutes" htmlFor="l-est">
            <input id="l-est" type="number" min={1} className="input" value={est} onChange={(e) => setEst(Number(e.target.value) || 1)} />
          </Field>
          <label className="flex items-center gap-2 pt-6 text-[13.5px]">
            <input type="checkbox" className="accent-[#a85c40]" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published
          </label>
          <Field label="Summary" htmlFor="l-sum" className="md:col-span-3">
            <input id="l-sum" className="input" value={summary} onChange={(e) => setSummary(e.target.value)} />
          </Field>
        </div>
      </Card>
      <Card>
        <CardHeader
          title="Content blocks"
          description="Structured blocks (JSON) validated against the content schema — see content/CONTENT_GUIDE.md."
          action={
            <div className="flex gap-1">
              {(["edit", "preview"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setTab(t)} className={cn("rounded-[6px] px-2.5 py-1 text-[12.5px] capitalize", tab === t ? "bg-primary-soft text-primary-dark" : "text-muted hover:text-ink")}>
                  {t}
                </button>
              ))}
            </div>
          }
        />
        {tab === "edit" ? (
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[12px] text-muted">Insert block:</span>
              {Object.keys(TEMPLATES).map((t) => (
                <button key={t} type="button" onClick={() => insert(t)} className="rounded-[6px] border border-border px-1.5 py-0.5 font-mono text-[11.5px] text-muted hover:text-ink">
                  {t}
                </button>
              ))}
            </div>
            <textarea aria-label="Lesson blocks JSON" spellCheck={false} className="input h-[560px] font-mono text-[12.5px] leading-[1.5]" value={json} onChange={(e) => setJson(e.target.value)} />
            {parsed.ok ? <p className="text-[12.5px] text-success">✓ {parsed.blocks.length} valid blocks</p> : <pre className="whitespace-pre-wrap text-[12.5px] text-danger">{parsed.error}</pre>}
          </div>
        ) : (
          <div className="px-5 py-6 sm:px-8">{parsed.ok ? <LessonBlocks blocks={parsed.blocks} lessonId={lesson.id} runnable={false} /> : <Alert tone="danger">Fix the errors to preview.</Alert>}</div>
        )}
      </Card>
      <Button onClick={save} disabled={busy || !parsed.ok}>
        <Save size={14} /> {busy ? "Saving…" : "Save lesson"}
      </Button>
    </div>
  );
}
