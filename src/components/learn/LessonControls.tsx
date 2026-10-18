"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";
import { Button, cn, fmtRelative } from "@/components/ui";
import { apiFetch, ClientApiError } from "@/lib/client-api";

/** Records that the lesson was opened (once per page load). */
export function ViewTracker({ lessonId, enabled }: { lessonId: string; enabled: boolean }) {
  const sent = useRef(false);
  useEffect(() => {
    if (!enabled || sent.current) return;
    sent.current = true;
    apiFetch(`/api/v1/lessons/${lessonId}/view`, { method: "POST" }).catch(() => undefined);
  }, [lessonId, enabled]);
  return null;
}

export function CompleteButton({ lessonId, completed, nextHref }: { lessonId: string; completed: boolean; nextHref?: string | null }) {
  const router = useRouter();
  const [done, setDone] = useState(completed);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/v1/lessons/${lessonId}/complete`, { body: { complete: !done } });
      setDone(!done);
      router.refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant={done ? "secondary" : "primary"} onClick={toggle} disabled={busy} aria-pressed={done}>
        {done ? <CheckCircle2 size={15} className="text-success" /> : <Circle size={15} />}
        {busy ? "Saving…" : done ? "Completed" : "Mark lesson complete"}
      </Button>
      {done && nextHref && (
        <Button variant="ghost" onClick={() => router.push(nextHref)}>
          Continue to next lesson →
        </Button>
      )}
      {error && <span className="text-[13px] text-danger">{error}</span>}
    </div>
  );
}

export function BookmarkButton({ lessonId, bookmarked }: { lessonId: string; bookmarked: boolean }) {
  const [on, setOn] = useState(bookmarked);
  const [busy, setBusy] = useState(false);
  async function toggle() {
    setBusy(true);
    try {
      await apiFetch(`/api/v1/lessons/${lessonId}/bookmark`, { method: on ? "DELETE" : "POST" });
      setOn(!on);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button variant="secondary" size="sm" onClick={toggle} disabled={busy} aria-pressed={on}>
      {on ? <BookmarkCheck size={14} className="text-primary" /> : <Bookmark size={14} />}
      {on ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}

interface NoteRow {
  id: string;
  body: string;
  updatedAt: string;
}

export function NotesPanel({ lessonId, initial }: { lessonId: string; initial: NoteRow[] }) {
  const [notes, setNotes] = useState(initial);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storageKey = `sl:note-draft:${lessonId}`;

  useEffect(() => {
    try {
      const d = localStorage.getItem(storageKey);
      if (d) setDraft(d);
    } catch {
      /* ignore */
    }
  }, [storageKey]);
  useEffect(() => {
    try {
      if (draft) localStorage.setItem(storageKey, draft);
      else localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }, [draft, storageKey]);

  async function add() {
    if (!draft.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const r = await apiFetch<{ note: NoteRow }>(`/api/v1/lessons/${lessonId}/notes`, { body: { body: draft } });
      setNotes((n) => [r.note, ...n]);
      setDraft("");
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "Could not save the note.");
    } finally {
      setBusy(false);
    }
  }
  async function save(id: string) {
    setBusy(true);
    try {
      const r = await apiFetch<{ note: NoteRow }>(`/api/v1/notes/${id}`, { method: "PATCH", body: { body: editText } });
      setNotes((n) => n.map((x) => (x.id === id ? r.note : x)));
      setEditing(null);
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "Could not save the note.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (!confirm("Delete this note?")) return;
    await apiFetch(`/api/v1/notes/${id}`, { method: "DELETE" });
    setNotes((n) => n.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="new-note" className="sr-only">
          New note
        </label>
        <textarea
          id="new-note"
          rows={3}
          className="input text-[13.5px]"
          placeholder="Write a private note for this lesson…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) add();
          }}
        />
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[11.5px] text-faint">Only you can see your notes.</span>
          <Button size="sm" onClick={add} disabled={busy || !draft.trim()}>
            Save note
          </Button>
        </div>
        {error && <p className="mt-1 text-[12.5px] text-danger">{error}</p>}
      </div>
      {notes.length > 0 && (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="rounded-[8px] border border-divider bg-sidebar px-3 py-2">
              {editing === n.id ? (
                <div className="space-y-1.5">
                  <textarea rows={3} className="input text-[13px]" value={editText} onChange={(e) => setEditText(e.target.value)} aria-label="Edit note" />
                  <div className="flex gap-1.5">
                    <Button size="sm" onClick={() => save(n.id)} disabled={busy}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-[13px]">{n.body}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11.5px] text-faint">
                    {fmtRelative(n.updatedAt)}
                    <button
                      type="button"
                      className={cn("ml-auto inline-flex items-center gap-1 hover:text-ink")}
                      onClick={() => {
                        setEditing(n.id);
                        setEditText(n.body);
                      }}
                    >
                      <Pencil size={11} /> Edit
                    </button>
                    <button type="button" className="inline-flex items-center gap-1 hover:text-danger" onClick={() => remove(n.id)}>
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
