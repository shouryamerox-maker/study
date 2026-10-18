"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Alert, Button, Card, CardHeader } from "@/components/ui";
import { apiFetch, ClientApiError } from "@/lib/client-api";

export function NewTestForm({ courses }: { courses: { id: string; title: string }[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const r = await apiFetch<{ id: string }>("/api/v1/teacher/tests", { body: { courseId: f.get("courseId"), title: f.get("title") } });
      router.push(`/teacher/tests/${r.id}`);
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Could not create the test.");
      setBusy(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
      <div>
        <label htmlFor="nt-course" className="mb-1 block text-[12px] text-muted">
          Course
        </label>
        <select id="nt-course" name="courseId" className="input h-9 w-auto" required>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[240px] flex-1">
        <label htmlFor="nt-title" className="mb-1 block text-[12px] text-muted">
          Title
        </label>
        <input id="nt-title" name="title" className="input" placeholder="e.g. Unit 3 quiz — operators" required minLength={3} />
      </div>
      <Button type="submit" disabled={busy}>
        <Plus size={15} /> Create draft
      </Button>
      {error && <p className="w-full text-[12.5px] text-danger">{error}</p>}
    </form>
  );
}

export function StatusButtons({ id, status, released, hasVersion, resultRelease }: { id: string; status: string; released: boolean; hasVersion: boolean; resultRelease: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function act(action: string, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/v1/teacher/tests/${id}/status`, { body: { action } });
      router.refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      {resultRelease !== "IMMEDIATE" &&
        (released ? (
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => act("unrelease", "Hide results from students again?")}>
            Hide results
          </Button>
        ) : (
          <Button size="sm" disabled={busy} onClick={() => act("release", "Release results to students? They will see their marks (pending questions show as pending).")}>
            Release results
          </Button>
        ))}
      {status === "PUBLISHED" && (
        <Button size="sm" variant="secondary" disabled={busy} onClick={() => act("archive", "Close this test? Students will no longer be able to start new attempts.")}>
          Close test
        </Button>
      )}
      {status === "ARCHIVED" && hasVersion && (
        <Button size="sm" variant="secondary" disabled={busy} onClick={() => act("reopen")}>
          Reopen
        </Button>
      )}
      {error && <span className="text-[12.5px] text-danger">{error}</span>}
    </div>
  );
}

export function AssignPanel({
  id,
  assignToAll,
  students,
  groups,
  assignedUserIds,
  assignedGroupIds,
  dueAt,
}: {
  id: string;
  assignToAll: boolean;
  students: { id: string; name: string; email: string }[];
  groups: { id: string; name: string; count: number }[];
  assignedUserIds: string[];
  assignedGroupIds: string[];
  dueAt: string | null;
}) {
  const router = useRouter();
  const [all, setAll] = useState(assignToAll);
  const [users, setUsers] = useState(new Set(assignedUserIds));
  const [grps, setGrps] = useState(new Set(assignedGroupIds));
  const [due, setDue] = useState(dueAt ? new Date(new Date(dueAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await apiFetch<{ students: number; groups: number }>(`/api/v1/teacher/tests/${id}/assignments`, {
        method: "PUT",
        body: { assignToAll: all, userIds: [...users], groupIds: [...grps], dueAt: due ? new Date(due).toISOString() : null },
      });
      setMsg({ tone: "success", text: `Saved. ${all ? "All enrolled students" : `${r.students} student(s), ${r.groups} group(s)`} assigned.` });
      router.refresh();
    } catch (e) {
      setMsg({ tone: "danger", text: e instanceof ClientApiError ? e.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }
  const shown = students.filter((s) => (s.name + s.email).toLowerCase().includes(filter.toLowerCase()));

  return (
    <Card>
      <CardHeader title="Assign" description="Choose who must take this test." />
      <div className="space-y-3 p-4">
        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        <label className="flex items-center gap-2 text-[13.5px]">
          <input type="checkbox" className="accent-[#a85c40]" checked={all} onChange={(e) => setAll(e.target.checked)} />
          All students enrolled in the course
        </label>
        {groups.length > 0 && (
          <div>
            <div className="mb-1 text-[12.5px] font-medium">Groups / classes</div>
            <div className="flex flex-wrap gap-1.5">
              {groups.map((g) => (
                <label key={g.id} className="flex items-center gap-1.5 rounded-[6px] border border-border px-2 py-0.5 text-[12.5px]">
                  <input type="checkbox" className="accent-[#a85c40]" checked={grps.has(g.id)} onChange={(e) => setGrps((s) => (e.target.checked ? new Set(s).add(g.id) : new Set([...s].filter((x) => x !== g.id))))} />
                  {g.name} ({g.count})
                </label>
              ))}
            </div>
          </div>
        )}
        <div>
          <div className="mb-1 flex items-center justify-between text-[12.5px] font-medium">
            Individual students ({users.size} selected)
            <input aria-label="Filter students" className="input h-7 w-40 text-[12px]" placeholder="Filter…" value={filter} onChange={(e) => setFilter(e.target.value)} />
          </div>
          <div className="max-h-56 overflow-y-auto rounded-[8px] border border-divider">
            {shown.length === 0 ? (
              <p className="px-3 py-2 text-[12.5px] text-faint">No students.</p>
            ) : (
              shown.map((s) => (
                <label key={s.id} className="flex items-center gap-2 border-b border-divider px-3 py-1.5 text-[13px] last:border-b-0">
                  <input type="checkbox" className="accent-[#a85c40]" checked={users.has(s.id)} onChange={(e) => setUsers((x) => (e.target.checked ? new Set(x).add(s.id) : new Set([...x].filter((y) => y !== s.id))))} />
                  {s.name} <span className="text-[11.5px] text-faint">{s.email}</span>
                </label>
              ))
            )}
          </div>
        </div>
        <div>
          <label htmlFor="as-due" className="mb-1 block text-[12.5px] font-medium">
            Deadline for these assignments (optional override)
          </label>
          <input id="as-due" type="datetime-local" className="input h-8 w-auto" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <Button size="sm" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save assignment"}
        </Button>
      </div>
    </Card>
  );
}
