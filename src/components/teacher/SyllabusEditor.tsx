"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, FileText, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { Alert, Badge, Button, Card, CardHeader, cn } from "@/components/ui";
import { apiFetch, ClientApiError } from "@/lib/client-api";

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

export function SyllabusEditor({ course }: { course: CourseN }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chapters = course.units.flatMap((u) => u.chapters);

  async function call(body: object) {
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/api/v1/teacher/content", { body });
      router.refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }
  const add = (kind: Kind, parentId: string, label: string) => {
    const title = prompt(`New ${label} title`);
    if (title?.trim()) call({ op: "create", kind, parentId, title: title.trim() });
  };
  const rename = (kind: Kind, id: string, current: string) => {
    const title = prompt("New title", current);
    if (title?.trim() && title !== current) call({ op: "update", kind, id, title: title.trim() });
  };
  const del = (kind: Kind, id: string, title: string) => {
    if (confirm(`Delete “${title}” and everything inside it? This cannot be undone.`)) call({ op: "delete", kind, id });
  };
  const Row = ({ kind, id, title, children, depth }: { kind: Kind; id: string; title: React.ReactNode; children?: React.ReactNode; depth: number }) => (
    <div className={cn("group flex flex-wrap items-center gap-1.5 py-1.5 pr-2", depth === 0 ? "pl-3" : depth === 1 ? "pl-7" : depth === 2 ? "pl-11" : "pl-[60px]")}>
      <div className="min-w-0 flex-1">{title}</div>
      {children}
      <div className="flex opacity-70 group-hover:opacity-100">
        <Button size="sm" variant="ghost" onClick={() => call({ op: "move", kind, id, direction: "up" })} disabled={busy} aria-label="Move up">
          <ArrowUp size={12} />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => call({ op: "move", kind, id, direction: "down" })} disabled={busy} aria-label="Move down">
          <ArrowDown size={12} />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => rename(kind, id, typeof title === "string" ? title : "")} disabled={busy} aria-label="Rename">
          <Pencil size={12} />
        </Button>
        <Button size="sm" variant="ghost" className="hover:text-danger" onClick={() => del(kind, id, typeof title === "string" ? title : kind)} disabled={busy} aria-label="Delete">
          <Trash2 size={12} />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {error && <Alert tone="danger">{error}</Alert>}
      <Card>
        <CardHeader title="Course settings" />
        <div className="flex flex-wrap gap-x-6 gap-y-2 p-4 text-[13.5px]">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-[#a85c40]" checked={course.published} onChange={(e) => call({ op: "updateCourse", id: course.id, published: e.target.checked })} />
            Published (visible to students)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-[#a85c40]" checked={course.enforcePrerequisites} onChange={(e) => call({ op: "updateCourse", id: course.id, enforcePrerequisites: e.target.checked })} />
            Enforce chapter prerequisites
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-[#a85c40]" checked={course.isStarterContent} onChange={(e) => call({ op: "updateCourse", id: course.id, isStarterContent: e.target.checked })} />
            Label as starter content (not the official syllabus)
          </label>
        </div>
      </Card>

      <FilesPanel title="Syllabus documents" courseId={course.id} files={course.files} kind="syllabus" onChange={() => router.refresh()} />

      <Card>
        <CardHeader
          title="Structure"
          description="Unit → chapter → topic → lesson. Changes are saved immediately and keep student progress intact."
          action={
            <Button size="sm" onClick={() => add("unit", course.id, "unit")} disabled={busy}>
              <Plus size={13} /> Unit
            </Button>
          }
        />
        <div className="divide-y divide-divider">
          {course.units.map((u) => (
            <div key={u.id} className="py-1">
              <Row kind="unit" id={u.id} depth={0} title={u.title}>
                <Button size="sm" variant="ghost" onClick={() => add("chapter", u.id, "chapter")} disabled={busy}>
                  <Plus size={12} /> Chapter
                </Button>
              </Row>
              {u.chapters.map((c) => (
                <div key={c.id} className="border-l-2 border-divider/0">
                  <Row
                    kind="chapter"
                    id={c.id}
                    depth={1}
                    title={
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="font-medium">{c.title}</span>
                        {!c.isAvailable && <Badge>Locked</Badge>}
                        {c.availableFrom && <Badge tone="pending">Opens {new Date(c.availableFrom).toLocaleDateString()}</Badge>}
                        {c.coveredInClassAt && <Badge tone="accent">Covered</Badge>}
                      </span>
                    }
                  >
                    <label className="flex items-center gap-1 text-[12px] text-muted" title="Students can open this chapter">
                      <input type="checkbox" className="accent-[#a85c40]" checked={c.isAvailable} onChange={(e) => call({ op: "update", kind: "chapter", id: c.id, isAvailable: e.target.checked })} />
                      Available
                    </label>
                    <label className="flex items-center gap-1 text-[12px] text-muted" title="Mark as covered in class (syllabus coverage)">
                      <input type="checkbox" className="accent-[#a85c40]" checked={!!c.coveredInClassAt} onChange={(e) => call({ op: "update", kind: "chapter", id: c.id, coveredInClass: e.target.checked })} />
                      Covered
                    </label>
                    {course.enforcePrerequisites && (
                      <select
                        aria-label="Prerequisite chapter"
                        className="input h-7 w-40 text-[12px]"
                        value={c.prerequisiteChapterId ?? ""}
                        onChange={(e) => call({ op: "update", kind: "chapter", id: c.id, prerequisiteChapterId: e.target.value || null })}
                      >
                        <option value="">No prerequisite</option>
                        {chapters
                          .filter((x) => x.id !== c.id)
                          .map((x) => (
                            <option key={x.id} value={x.id}>
                              After: {x.title}
                            </option>
                          ))}
                      </select>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => add("topic", c.id, "topic")} disabled={busy}>
                      <Plus size={12} /> Topic
                    </Button>
                  </Row>
                  {c.topics.map((t) => (
                    <div key={t.id}>
                      <Row kind="topic" id={t.id} depth={2} title={<span className="text-[13px] text-muted">{t.title}</span>}>
                        <Button size="sm" variant="ghost" onClick={() => add("lesson", t.id, "lesson")} disabled={busy}>
                          <Plus size={12} /> Lesson
                        </Button>
                      </Row>
                      {t.lessons.map((l) => (
                        <Row
                          key={l.id}
                          kind="lesson"
                          id={l.id}
                          depth={3}
                          title={
                            <span className="flex items-center gap-1.5 text-[13px]">
                              <Link href={`/teacher/lessons/${l.id}`} className="hover:text-primary">
                                {l.title}
                              </Link>
                              {!l.published && <Badge tone="pending">Draft</Badge>}
                            </span>
                          }
                        >
                          <Button size="sm" variant="ghost" onClick={() => call({ op: "update", kind: "lesson", id: l.id, published: !l.published })} disabled={busy} aria-label={l.published ? "Unpublish" : "Publish"}>
                            {l.published ? <EyeOff size={12} /> : <Eye size={12} />} {l.published ? "Unpublish" : "Publish"}
                          </Button>
                          <Link href={`/teacher/lessons/${l.id}`} className="px-1.5 text-[12px] text-primary hover:underline">
                            Edit
                          </Link>
                        </Row>
                      ))}
                    </div>
                  ))}
                  {c.files.length > 0 && (
                    <div className="pb-1 pl-11 text-[12px] text-muted">
                      Resources:{" "}
                      {c.files.map((f) => (
                        <span key={f.id} className="mr-2 inline-flex items-center gap-1">
                          <FileText size={11} /> {f.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          {course.units.length === 0 && <p className="px-4 py-6 text-center text-[13px] text-muted">No units yet. Add the first unit to start building the syllabus.</p>}
        </div>
      </Card>
    </div>
  );
}

export function FilesPanel({ title, courseId, files, kind, onChange }: { title: string; courseId: string; files: { id: string; title: string; url: string | null }[]; kind: "syllabus" | "resource"; onChange: () => void }) {
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
    if (!confirm("Remove this document?")) return;
    await apiFetch(`/api/v1/teacher/files?id=${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <Card>
      <CardHeader title={title} description="Upload PDFs/documents up to 4 MB (stored in the database) or link to larger files." />
      <div className="space-y-3 p-4">
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
          <input name="title" placeholder="Title (optional for uploads)" className="input h-8 w-56" required={mode === "link"} aria-label="Title" />
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
    </Card>
  );
}
