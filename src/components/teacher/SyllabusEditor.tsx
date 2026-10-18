"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Check, CheckCircle2, ChevronDown, Eye, EyeOff, FileText, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { Alert, Badge, Button, cn } from "@/components/ui";
import { Disclosure } from "@/components/Disclosure";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { useUnsavedGuard } from "@/lib/use-unsaved-guard";

type Kind = "unit" | "chapter" | "topic" | "lesson";
interface LessonN {
  id: string;
  slug: string;
  title: string;
  published: boolean;
}
interface TopicN {
  id: string;
  title: string;
  lessons: LessonN[];
}
interface ChapterN {
  id: string;
  title: string;
  isAvailable: boolean;
  availableFrom: string | null;
  prerequisiteChapterId: string | null;
  coveredInClassAt: string | null;
  topics: TopicN[];
  files: { id: string; title: string; url: string | null }[];
}
interface UnitN {
  id: string;
  title: string;
  chapters: ChapterN[];
}
export interface CourseN {
  id: string;
  slug: string;
  title: string;
  summary: string;
  published: boolean;
  enforcePrerequisites: boolean;
  isStarterContent: boolean;
  units: UnitN[];
  files: { id: string; title: string; url: string | null }[];
}

type Edit = { mode: "add" | "rename"; kind: Kind; target: string; value: string };
type Status = { state: "idle" | "saving" | "saved" | "error"; text?: string };

const KIND_LABEL: Record<Kind, string> = { unit: "unit", chapter: "chapter", topic: "topic", lesson: "lesson" };

export function SyllabusEditor({ course }: { course: CourseN }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [edit, setEdit] = useState<Edit | null>(null);
  const [openUnits, setOpenUnits] = useState<Set<string>>(new Set(course.units.slice(0, 1).map((u) => u.id)));
  const [openChapters, setOpenChapters] = useState<Set<string>>(new Set());
  const chapters = course.units.flatMap((u) => u.chapters);
  const busy = status.state === "saving";

  useUnsavedGuard(!!edit && edit.value.trim() !== "", "You are in the middle of typing a name that has not been saved. Leave anyway?");

  async function call(body: object, done = "Saved") {
    setStatus({ state: "saving" });
    try {
      await apiFetch("/api/v1/teacher/content", { body });
      setStatus({ state: "saved", text: done });
      router.refresh();
      return true;
    } catch (e) {
      setStatus({ state: "error", text: e instanceof ClientApiError ? e.message : "Could not save." });
      return false;
    }
  }
  async function submitEdit(e?: FormEvent) {
    e?.preventDefault();
    if (!edit || !edit.value.trim()) return;
    const ok =
      edit.mode === "add"
        ? await call({ op: "create", kind: edit.kind, parentId: edit.target, title: edit.value.trim() }, `${KIND_LABEL[edit.kind][0].toUpperCase()}${KIND_LABEL[edit.kind].slice(1)} added`)
        : await call({ op: "update", kind: edit.kind, id: edit.target, title: edit.value.trim() }, "Renamed");
    if (ok) {
      if (edit.mode === "add" && edit.kind === "chapter") setOpenUnits((s) => new Set(s).add(edit.target));
      setEdit(null);
    }
  }
  const del = (kind: Kind, id: string, title: string) => {
    const extra = kind === "lesson" ? "" : " and everything inside it";
    if (confirm(`Delete the ${KIND_LABEL[kind]} “${title}”${extra}? This cannot be undone. (Items with student progress cannot be deleted — unpublish them instead.)`)) call({ op: "delete", kind, id }, "Deleted");
  };
  const toggle = (setter: typeof setOpenUnits, id: string) =>
    setter((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const InlineInput = ({ placeholder }: { placeholder: string }) => (
    <form onSubmit={submitEdit} className="flex flex-1 items-center gap-1.5">
      <input
        autoFocus
        aria-label={placeholder}
        placeholder={placeholder}
        className="input h-8 flex-1 text-[13.5px]"
        value={edit?.value ?? ""}
        onChange={(e) => setEdit((x) => (x ? { ...x, value: e.target.value } : x))}
        onKeyDown={(e) => e.key === "Escape" && setEdit(null)}
      />
      <Button size="sm" type="submit" disabled={busy || !edit?.value.trim()} aria-label="Save">
        <Check size={13} /> Save
      </Button>
      <Button size="sm" variant="ghost" type="button" onClick={() => setEdit(null)} aria-label="Cancel">
        <X size={13} />
      </Button>
    </form>
  );

  const Actions = ({ kind, id, title }: { kind: Kind; id: string; title: string }) => (
    <span className="flex shrink-0 items-center opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
      <IconBtn label={`Rename ${title}`} onClick={() => setEdit({ mode: "rename", kind, target: id, value: title })} disabled={busy}>
        <Pencil size={12} />
      </IconBtn>
      <IconBtn label={`Move ${title} up`} onClick={() => call({ op: "move", kind, id, direction: "up" }, "Reordered")} disabled={busy}>
        <ArrowUp size={12} />
      </IconBtn>
      <IconBtn label={`Move ${title} down`} onClick={() => call({ op: "move", kind, id, direction: "down" }, "Reordered")} disabled={busy}>
        <ArrowDown size={12} />
      </IconBtn>
      <IconBtn label={`Delete ${title}`} onClick={() => del(kind, id, title)} disabled={busy} danger>
        <Trash2 size={12} />
      </IconBtn>
    </span>
  );

  const AddRow = ({ kind, parentId, indent }: { kind: Kind; parentId: string; indent: string }) =>
    edit?.mode === "add" && edit.kind === kind && edit.target === parentId ? (
      <div className={cn("flex py-1.5 pr-3", indent)}>
        {InlineInput({ placeholder: `New ${KIND_LABEL[kind]} title` })}
      </div>
    ) : (
      <button type="button" className={cn("flex items-center gap-1 py-1.5 text-[12.5px] font-medium text-primary hover:underline", indent)} onClick={() => setEdit({ mode: "add", kind, target: parentId, value: "" })}>
        <Plus size={12} /> Add {KIND_LABEL[kind]}
      </button>
    );

  const Title = ({ kind, id, title, children }: { kind: Kind; id: string; title: string; children: ReactNode }) =>
    edit?.mode === "rename" && edit.target === id && edit.kind === kind ? InlineInput({ placeholder: `Rename ${KIND_LABEL[kind]}` }) : <>{children}</>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
          {course.published ? <Badge tone="success">Published</Badge> : <Badge tone="pending">Not published</Badge>}
          <span>
            {course.units.length} units · {chapters.length} chapters · {chapters.reduce((n, c) => n + c.topics.reduce((m, t) => m + t.lessons.length, 0), 0)} lessons
          </span>
        </div>
        <SaveStatus status={status} />
      </div>
      {status.state === "error" && <Alert tone="danger">{status.text}</Alert>}

      <section aria-labelledby="outline-h">
        <div className="mb-2 flex items-center justify-between">
          <h2 id="outline-h" className="text-[15px] font-semibold">
            Course outline
          </h2>
          <span className="text-[12px] text-faint">Changes save immediately · student progress is always kept</span>
        </div>
        <div className="overflow-hidden rounded-[12px] border border-border bg-surface">
          {course.units.length === 0 && <p className="px-4 py-6 text-center text-[13.5px] text-muted">No units yet. Add the first unit to start building the syllabus.</p>}
          {course.units.map((u, ui) => {
            const uOpen = openUnits.has(u.id);
            return (
              <div key={u.id} className={cn(ui > 0 && "border-t border-border")}>
                <div className="group flex items-center gap-2 px-3 py-2.5 hover:bg-sidebar">
                  <button type="button" onClick={() => toggle(setOpenUnits, u.id)} aria-expanded={uOpen} aria-label={`${uOpen ? "Collapse" : "Expand"} ${u.title}`} className="rounded p-0.5 text-faint">
                    <ChevronDown size={16} className={cn("transition-transform duration-150", !uOpen && "-rotate-90")} />
                  </button>
                  {Title({ kind: "unit", id: u.id, title: u.title, children: (<>
                    <button type="button" onClick={() => toggle(setOpenUnits, u.id)} className="min-w-0 flex-1 text-left font-semibold">
                      {u.title}
                    </button>
                    <span className="text-[12px] text-faint">{u.chapters.length} chapters</span>
                    {Actions({ kind: "unit", id: u.id, title: u.title })}
                  </>) })}
                </div>
                {uOpen && (
                  <div className="pb-2">
                    {u.chapters.map((c) => {
                      const cOpen = openChapters.has(c.id);
                      const lessonCount = c.topics.reduce((n, t) => n + t.lessons.length, 0);
                      return (
                        <div key={c.id}>
                          <div className="group flex items-center gap-2 py-1.5 pl-9 pr-3 hover:bg-sidebar">
                            <button type="button" onClick={() => toggle(setOpenChapters, c.id)} aria-expanded={cOpen} aria-label={`${cOpen ? "Collapse" : "Expand"} ${c.title}`} className="rounded p-0.5 text-faint">
                              <ChevronDown size={14} className={cn("transition-transform duration-150", !cOpen && "-rotate-90")} />
                            </button>
                            {Title({ kind: "chapter", id: c.id, title: c.title, children: (<>
                              <button type="button" onClick={() => toggle(setOpenChapters, c.id)} className="min-w-0 flex-1 text-left text-[14px]">
                                {c.title}
                              </button>
                              {!c.isAvailable && <Badge>Locked</Badge>}
                              {c.coveredInClassAt && <Badge tone="accent">Covered</Badge>}
                              <span className="text-[12px] text-faint">{lessonCount} lessons</span>
                              {Actions({ kind: "chapter", id: c.id, title: c.title })}
                            </>) })}
                          </div>
                          {cOpen && (
                            <div className="mb-2 ml-[60px] mr-3 rounded-[8px] border border-divider bg-sidebar/60 px-3 py-2">
                              <div className="mb-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-b border-divider pb-2 text-[12.5px] text-muted">
                                <label className="flex items-center gap-1.5">
                                  <input type="checkbox" className="accent-[#a85c40]" checked={c.isAvailable} disabled={busy} onChange={(e) => call({ op: "update", kind: "chapter", id: c.id, isAvailable: e.target.checked })} />
                                  Open to students
                                </label>
                                <label className="flex items-center gap-1.5">
                                  <input type="checkbox" className="accent-[#a85c40]" checked={!!c.coveredInClassAt} disabled={busy} onChange={(e) => call({ op: "update", kind: "chapter", id: c.id, coveredInClass: e.target.checked })} />
                                  Covered in class
                                </label>
                                {course.enforcePrerequisites && (
                                  <label className="flex items-center gap-1.5">
                                    Unlocks after
                                    <select
                                      className="input h-7 w-48 text-[12px]"
                                      value={c.prerequisiteChapterId ?? ""}
                                      disabled={busy}
                                      onChange={(e) => call({ op: "update", kind: "chapter", id: c.id, prerequisiteChapterId: e.target.value || null })}
                                    >
                                      <option value="">— nothing —</option>
                                      {chapters
                                        .filter((x) => x.id !== c.id)
                                        .map((x) => (
                                          <option key={x.id} value={x.id}>
                                            {x.title}
                                          </option>
                                        ))}
                                    </select>
                                  </label>
                                )}
                              </div>
                              {c.topics.map((t) => (
                                <div key={t.id} className="mb-1">
                                  <div className="group flex items-center gap-2 py-1">
                                    {Title({ kind: "topic", id: t.id, title: t.title, children: (<>
                                      <span className="min-w-0 flex-1 text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">{t.title}</span>
                                      {Actions({ kind: "topic", id: t.id, title: t.title })}
                                    </>) })}
                                  </div>
                                  <ul>
                                    {t.lessons.map((l) => (
                                      <li key={l.id} className="group flex items-center gap-2 rounded-[6px] py-1 pl-3 hover:bg-surface">
                                        {Title({ kind: "lesson", id: l.id, title: l.title, children: (<>
                                          <Link href={`/teacher/lessons/${l.id}`} className="min-w-0 flex-1 truncate text-[13.5px] hover:text-primary">
                                            {l.title}
                                          </Link>
                                          {!l.published && <Badge tone="pending">Draft</Badge>}
                                          <IconBtn label={l.published ? `Unpublish ${l.title}` : `Publish ${l.title}`} onClick={() => call({ op: "update", kind: "lesson", id: l.id, published: !l.published }, l.published ? "Lesson unpublished" : "Lesson published")} disabled={busy}>
                                            {l.published ? <EyeOff size={12} /> : <Eye size={12} />}
                                          </IconBtn>
                                          <Link href={`/teacher/lessons/${l.id}`} className="px-1 text-[12px] font-medium text-primary hover:underline">
                                            Edit content
                                          </Link>
                                          {Actions({ kind: "lesson", id: l.id, title: l.title })}
                                        </>) })}
                                      </li>
                                    ))}
                                  </ul>
                                  {AddRow({ kind: "lesson", parentId: t.id, indent: "pl-3" })}
                                </div>
                              ))}
                              {AddRow({ kind: "topic", parentId: c.id, indent: "" })}
                              {c.files.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-x-3 border-t border-divider pt-1.5 text-[12px] text-muted">
                                  Resources:
                                  {c.files.map((f) => (
                                    <span key={f.id} className="inline-flex items-center gap-1">
                                      <FileText size={11} /> {f.title}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {AddRow({ kind: "chapter", parentId: u.id, indent: "pl-10" })}
                  </div>
                )}
              </div>
            );
          })}
          <div className="border-t border-border px-3 py-1">
            {AddRow({ kind: "unit", parentId: course.id, indent: "pl-1" })}
          </div>
        </div>
      </section>

      <div className="rounded-[12px] border border-border bg-surface">
        <Disclosure title={<span className="font-semibold">Course settings</span>} meta={<span className="text-[12px] text-faint">Visibility, prerequisites, labels</span>} buttonClassName="px-4 py-3" panelClassName="space-y-2.5 border-t border-divider px-4 py-3 text-[13.5px]">
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1 accent-[#a85c40]" checked={course.published} disabled={busy} onChange={(e) => call({ op: "updateCourse", id: course.id, published: e.target.checked })} />
            <span>
              Published <span className="block text-[12.5px] text-muted">Students can see and enrol in this course.</span>
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1 accent-[#a85c40]" checked={course.enforcePrerequisites} disabled={busy} onChange={(e) => call({ op: "updateCourse", id: course.id, enforcePrerequisites: e.target.checked })} />
            <span>
              Enforce chapter prerequisites <span className="block text-[12.5px] text-muted">Chapters unlock only after the chapter you choose (set inside each chapter) is complete.</span>
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1 accent-[#a85c40]" checked={course.isStarterContent} disabled={busy} onChange={(e) => call({ op: "updateCourse", id: course.id, isStarterContent: e.target.checked })} />
            <span>
              Label as starter content <span className="block text-[12.5px] text-muted">Shows students that this is not yet the official syllabus.</span>
            </span>
          </label>
        </Disclosure>
      </div>

      <div className="rounded-[12px] border border-border bg-surface">
        <Disclosure title={<span className="font-semibold">Syllabus documents</span>} meta={<span className="text-[12px] text-faint">{course.files.length} file(s)</span>} buttonClassName="px-4 py-3" panelClassName="border-t border-divider">
          <FilesPanel courseId={course.id} files={course.files} kind="syllabus" onChange={() => router.refresh()} />
        </Disclosure>
      </div>
    </div>
  );
}

function IconBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className={cn("rounded-[6px] p-1.5 text-muted hover:bg-divider/60 disabled:opacity-40", danger ? "hover:text-danger" : "hover:text-ink")}>
      {children}
    </button>
  );
}

function SaveStatus({ status }: { status: Status }) {
  return (
    <span className="flex items-center gap-1.5 text-[12.5px] text-muted" aria-live="polite">
      {status.state === "saving" ? (
        <>
          <Loader2 size={13} className="animate-spin" /> Saving…
        </>
      ) : status.state === "error" ? (
        <>
          <AlertTriangle size={13} className="text-danger" /> Not saved
        </>
      ) : status.state === "saved" ? (
        <>
          <CheckCircle2 size={13} className="text-success" /> {status.text} · all changes saved
        </>
      ) : (
        <>
          <CheckCircle2 size={13} className="text-success" /> All changes saved
        </>
      )}
    </span>
  );
}

export function FilesPanel({ courseId, files, kind, onChange }: { courseId: string; files: { id: string; title: string; url: string | null }[]; kind: "syllabus" | "resource"; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [mode, setMode] = useState<"file" | "link">("file");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "file") {
        fd.set("courseId", courseId);
        fd.set("kind", kind);
        const res = await fetch("/api/v1/teacher/files", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) throw new ClientApiError(res.status, json.error?.message ?? "Upload failed.");
      } else {
        await apiFetch("/api/v1/teacher/files", { body: { title: fd.get("title"), url: fd.get("url"), kind, courseId } });
      }
      form.reset();
      setMsg({ tone: "success", text: "Added." });
      onChange();
    } catch (err) {
      setMsg({ tone: "danger", text: err instanceof ClientApiError ? err.message : "Failed." });
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (!confirm("Remove this document? Students will no longer see it.")) return;
    await apiFetch(`/api/v1/teacher/files?id=${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="space-y-3 p-4">
      <p className="text-[12.5px] text-muted">Upload PDFs or documents up to 4 MB, or link to larger files. Students see them at the top of the syllabus.</p>
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-2 text-[13px]">
              <FileText size={13} className="text-muted" />
              <a href={f.url ?? `/api/v1/files/${f.id}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                {f.title}
              </a>
              <button type="button" onClick={() => remove(f.id)} className="ml-auto text-[12px] text-muted hover:text-danger">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
        <select aria-label="Upload or link" className="input h-8 w-auto" value={mode} onChange={(e) => setMode(e.target.value as "file" | "link")}>
          <option value="file">Upload file</option>
          <option value="link">Add link</option>
        </select>
        <input name="title" placeholder={mode === "file" ? "Title (optional)" : "Title"} className="input h-8 w-56" required={mode === "link"} aria-label="Title" />
        {mode === "file" ? (
          <input name="file" type="file" required className="text-[12.5px]" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,.doc,.docx,.pptx" aria-label="File" />
        ) : (
          <input name="url" type="url" required placeholder="https://…" className="input h-8 w-72" aria-label="URL" />
        )}
        <Button size="sm" type="submit" disabled={busy}>
          <Upload size={13} /> {busy ? "Adding…" : "Add"}
        </Button>
      </form>
    </div>
  );
}
