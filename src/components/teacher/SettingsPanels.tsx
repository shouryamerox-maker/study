"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Alert, Badge, Button, Card, CardHeader, fmtDate } from "@/components/ui";
import { apiFetch, ClientApiError } from "@/lib/client-api";

export function InvitePanel({ invites }: { invites: { id: string; email: string; role: string; expiresAt: string; acceptedAt: string | null; revokedAt: string | null }[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [link, setLink] = useState<string | null>(null);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    setMsg(null);
    setLink(null);
    try {
      const r = await apiFetch<{ link: string; emailed: boolean }>("/api/v1/teacher/invites", { body: { email: f.get("email"), role: f.get("role") } });
      setLink(r.link);
      setMsg({ tone: "success", text: r.emailed ? "Invitation emailed. You can also share the link below." : "Email is not configured — copy the link below and send it to the teacher privately." });
      form.reset();
      router.refresh();
    } catch (err) {
      setMsg({ tone: "danger", text: err instanceof ClientApiError ? err.message : "Failed." });
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card>
      <CardHeader title="Invite teachers" description="Staff accounts are created only through invitations. Links expire after 7 days and work once." />
      <div className="space-y-3 p-4">
        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        {link && <input readOnly value={link} className="input h-8 font-mono text-[12px]" onFocus={(e) => e.currentTarget.select()} aria-label="Invitation link" />}
        <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
          <input name="email" type="email" required placeholder="teacher@example.com" className="input h-8 w-64" aria-label="Email" />
          <select name="role" className="input h-8 w-auto" aria-label="Role">
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Administrator</option>
          </select>
          <Button size="sm" type="submit" disabled={busy}>
            <Plus size={13} /> Create invite
          </Button>
        </form>
        {invites.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {invites.map((i) => {
                const expired = new Date(i.expiresAt) < new Date();
                return (
                  <tr key={i.id}>
                    <td>{i.email}</td>
                    <td className="capitalize">{i.role.toLowerCase()}</td>
                    <td>
                      {i.acceptedAt ? <Badge tone="success">Accepted {fmtDate(i.acceptedAt)}</Badge> : i.revokedAt ? <Badge>Revoked</Badge> : expired ? <Badge>Expired</Badge> : <Badge tone="pending">Pending</Badge>}
                    </td>
                    <td className="text-right">
                      {!i.acceptedAt && !i.revokedAt && !expired && (
                        <button
                          type="button"
                          className="text-[12px] text-muted hover:text-danger"
                          onClick={async () => {
                            await apiFetch(`/api/v1/teacher/invites?id=${i.id}`, { method: "DELETE" });
                            router.refresh();
                          }}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}

export function GroupsPanel({ groups, students }: { groups: { id: string; name: string; memberIds: string[] }[]; students: { id: string; name: string; email: string }[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [members, setMembers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = new FormData(form).get("name");
    try {
      await apiFetch("/api/v1/teacher/groups", { body: { name } });
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Failed.");
    }
  }
  async function saveMembers(id: string) {
    await apiFetch("/api/v1/teacher/groups", { method: "PUT", body: { id, memberIds: [...members] } });
    setEditing(null);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader title="Groups / classes" description="Use groups to assign tests to a whole class at once." />
      <div className="space-y-3 p-4">
        {error && <Alert tone="danger">{error}</Alert>}
        <form onSubmit={create} className="flex gap-2">
          <input name="name" required placeholder="e.g. BCA Semester 1 — Section A" className="input h-8 w-72" aria-label="Group name" />
          <Button size="sm" type="submit">
            <Plus size={13} /> Add group
          </Button>
        </form>
        <ul className="divide-y divide-divider rounded-[8px] border border-divider">
          {groups.length === 0 && <li className="px-3 py-2 text-[13px] text-faint">No groups yet.</li>}
          {groups.map((g) => (
            <li key={g.id} className="px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{g.name}</span>
                <span className="text-[12px] text-muted">{g.memberIds.length} students</span>
                <button
                  type="button"
                  className="ml-auto text-[12px] text-primary hover:underline"
                  onClick={() => {
                    setEditing(editing === g.id ? null : g.id);
                    setMembers(new Set(g.memberIds));
                  }}
                >
                  {editing === g.id ? "Cancel" : "Edit members"}
                </button>
                <button
                  type="button"
                  aria-label="Delete group"
                  className="text-muted hover:text-danger"
                  onClick={async () => {
                    if (!confirm("Delete this group? Test assignments made to it will be removed.")) return;
                    await apiFetch(`/api/v1/teacher/groups?id=${g.id}`, { method: "DELETE" });
                    router.refresh();
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              {editing === g.id && (
                <div className="mt-2">
                  <div className="max-h-56 overflow-y-auto rounded-[8px] border border-divider">
                    {students.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 border-b border-divider px-3 py-1 text-[13px] last:border-b-0">
                        <input type="checkbox" className="accent-[#a85c40]" checked={members.has(s.id)} onChange={(e) => setMembers((m) => (e.target.checked ? new Set(m).add(s.id) : new Set([...m].filter((x) => x !== s.id))))} />
                        {s.name} <span className="text-[11.5px] text-faint">{s.email}</span>
                      </label>
                    ))}
                  </div>
                  <Button size="sm" className="mt-2" onClick={() => saveMembers(g.id)}>
                    Save members
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
