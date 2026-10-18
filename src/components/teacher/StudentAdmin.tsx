"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, Field } from "@/components/ui";
import { apiFetch, ClientApiError } from "@/lib/client-api";

export function StudentAdmin({
  id,
  status,
  studentCode,
  role,
  viewerIsAdmin,
  courses,
}: {
  id: string;
  status: string;
  studentCode: string | null;
  role: string;
  viewerIsAdmin: boolean;
  courses: { id: string; title: string; enrolled: boolean }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [code, setCode] = useState(studentCode ?? "");

  async function patch(body: object, ok: string) {
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch(`/api/v1/teacher/students/${id}`, { method: "PATCH", body });
      setMsg({ tone: "success", text: ok });
      router.refresh();
    } catch (e) {
      setMsg({ tone: "danger", text: e instanceof ClientApiError ? e.message : "Failed." });
    } finally {
      setBusy(false);
    }
  }
  async function resetLink() {
    setBusy(true);
    try {
      const r = await apiFetch<{ link: string }>(`/api/v1/teacher/students/${id}/reset-link`, { method: "POST" });
      setLink(r.link);
    } catch (e) {
      setMsg({ tone: "danger", text: e instanceof ClientApiError ? e.message : "Failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 p-4">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <Field label="Student ID" htmlFor="sid" hint="Optional identifier, e.g. a roll number.">
        <div className="flex gap-2">
          <input id="sid" value={code} onChange={(e) => setCode(e.target.value)} className="input h-8" />
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => patch({ studentCode: code || null }, "Student ID saved.")}>
            Save
          </Button>
        </div>
      </Field>
      <div>
        <div className="mb-1 text-[13px] font-medium">Enrol in course</div>
        <div className="flex flex-wrap gap-2">
          {courses.filter((c) => !c.enrolled).length === 0 ? (
            <span className="text-[12.5px] text-faint">Enrolled in all courses.</span>
          ) : (
            courses
              .filter((c) => !c.enrolled)
              .map((c) => (
                <Button key={c.id} size="sm" variant="secondary" disabled={busy} onClick={() => patch({ enrollCourseId: c.id }, `Enrolled in ${c.title}.`)}>
                  + {c.title}
                </Button>
              ))
          )}
        </div>
      </div>
      <div>
        <div className="mb-1 text-[13px] font-medium">Password reset</div>
        <Button size="sm" variant="secondary" onClick={resetLink} disabled={busy}>
          Generate reset link
        </Button>
        {link && (
          <div className="mt-2 rounded-[8px] border border-border bg-sidebar p-2">
            <p className="mb-1 text-[12px] text-muted">Share this link with the student privately. It works once and expires in 1 hour.</p>
            <input readOnly value={link} className="input h-8 font-mono text-[12px]" onFocus={(e) => e.currentTarget.select()} aria-label="Reset link" />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-divider pt-3">
        {status === "ACTIVE" ? (
          <Button size="sm" variant="danger" disabled={busy} onClick={() => confirm("Suspend this account? The student will be signed out and unable to sign in.") && patch({ status: "SUSPENDED" }, "Account suspended.")}>
            Suspend account
          </Button>
        ) : (
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => patch({ status: "ACTIVE" }, "Account reactivated.")}>
            Reactivate account
          </Button>
        )}
        {viewerIsAdmin && role === "STUDENT" && (
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => confirm("Give this user teacher access?") && patch({ role: "TEACHER" }, "Role changed to teacher.")}>
            Make teacher
          </Button>
        )}
      </div>
    </div>
  );
}
