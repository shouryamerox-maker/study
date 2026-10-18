"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert, Button, Field, cn } from "@/components/ui";
import { apiFetch, ClientApiError, fieldErrors } from "@/lib/client-api";

const COLORS = ["#8f4b32", "#a85c40", "#4a7850", "#b07830", "#5b6f8a", "#7a6f63", "#6b4a6e", "#3f6d75"];

export function ProfileForm({ name, bio, color }: { name: string; bio: string | null; color: string | null }) {
  const router = useRouter();
  const [c, setC] = useState(color ?? COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setMsg(null);
    setErrors({});
    try {
      await apiFetch("/api/v1/me/profile", { method: "PATCH", body: { name: f.get("name"), bio: f.get("bio") || null, avatarColor: c } });
      setMsg({ tone: "success", text: "Profile saved." });
      router.refresh();
    } catch (err) {
      setErrors(fieldErrors(err));
      setMsg({ tone: "danger", text: err instanceof ClientApiError ? err.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <Field label="Full name" htmlFor="name" error={errors.name}>
        <input id="name" name="name" defaultValue={name} className="input" required />
      </Field>
      <Field label="About you" htmlFor="bio" hint="Optional, up to 500 characters." error={errors.bio}>
        <textarea id="bio" name="bio" defaultValue={bio ?? ""} rows={3} maxLength={500} className="input" />
      </Field>
      <fieldset>
        <legend className="mb-1.5 text-[13px] font-medium">Avatar colour</legend>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((col) => (
            <button
              key={col}
              type="button"
              onClick={() => setC(col)}
              aria-label={`Colour ${col}`}
              aria-pressed={c === col}
              className={cn("h-7 w-7 rounded-full border-2", c === col ? "border-ink" : "border-transparent")}
              style={{ background: col }}
            />
          ))}
        </div>
      </fieldset>
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (f.get("newPassword") !== f.get("confirm")) {
      setMsg({ tone: "danger", text: "New passwords do not match." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch("/api/v1/auth/change-password", { body: { currentPassword: f.get("currentPassword"), newPassword: f.get("newPassword") } });
      setMsg({ tone: "success", text: "Password changed." });
      form.reset();
    } catch (err) {
      setMsg({ tone: "danger", text: err instanceof ClientApiError ? err.message : "Could not change password." });
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <Field label="Current password" htmlFor="currentPassword">
        <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" className="input" required />
      </Field>
      <Field label="New password" htmlFor="newPassword" hint="At least 8 characters, with a letter and a number.">
        <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" className="input" required />
      </Field>
      <Field label="Confirm new password" htmlFor="confirm">
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" className="input" required />
      </Field>
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Change password"}
      </Button>
    </form>
  );
}
