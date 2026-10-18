"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert, Button, Field } from "@/components/ui";
import { apiFetch, ClientApiError, fieldErrors } from "@/lib/client-api";

function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setErrors({});
    try {
      await fn();
    } catch (e) {
      setErrors(fieldErrors(e));
      setError(e instanceof ClientApiError ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }
  return { busy, error, errors, run, setBusy };
}

function val(form: HTMLFormElement, name: string) {
  return (form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "";
}

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const { busy, error, errors, run } = useSubmit();
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    run(async () => {
      const res = await apiFetch<{ redirectTo: string }>("/api/v1/auth/login", { body: { email: val(f, "email"), password: val(f, "password") } });
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      router.replace(safeNext ?? res.redirectTo);
      router.refresh();
    });
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && <Alert tone="danger">{error}</Alert>}
      <Field label="Email" htmlFor="email" error={errors.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" aria-invalid={!!errors.email} />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password}>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" aria-invalid={!!errors.password} />
      </Field>
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-[13px] text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const { busy, error, errors, run } = useSubmit();
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    if (val(f, "password") !== val(f, "confirm")) {
      run(async () => {
        throw new ClientApiError(422, "Passwords do not match.", "validation", [{ path: "confirm", message: "Passwords do not match." }]);
      });
      return;
    }
    run(async () => {
      await apiFetch("/api/v1/auth/register", { body: { name: val(f, "name"), email: val(f, "email"), password: val(f, "password") } });
      router.replace("/courses");
      router.refresh();
    });
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && <Alert tone="danger">{error}</Alert>}
      <Field label="Full name" htmlFor="name" error={errors.name}>
        <input id="name" name="name" autoComplete="name" required className="input" aria-invalid={!!errors.name} />
      </Field>
      <Field label="Email" htmlFor="email" error={errors.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" aria-invalid={!!errors.email} />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters, with a letter and a number.">
        <input id="password" name="password" type="password" autoComplete="new-password" required className="input" aria-invalid={!!errors.password} />
      </Field>
      <Field label="Confirm password" htmlFor="confirm" error={errors.confirm}>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="input" aria-invalid={!!errors.confirm} />
      </Field>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Creating account…" : "Create student account"}
      </Button>
    </form>
  );
}

export function ForgotForm() {
  const { busy, error, errors, run, setBusy } = useSubmit();
  const [done, setDone] = useState<{ emailEnabled: boolean } | null>(null);
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    run(async () => {
      const r = await apiFetch<{ emailEnabled: boolean }>("/api/v1/auth/forgot-password", { body: { email: val(f, "email") } });
      setDone(r);
      setBusy(false);
    });
  }
  if (done) {
    return done.emailEnabled ? (
      <Alert tone="success" title="Check your email">
        If an account exists for that address, we have sent a link to reset the password. The link expires in 1 hour.
      </Alert>
    ) : (
      <Alert tone="pending" title="Email is not set up on this server">
        Password-reset emails cannot be sent yet. Ask your teacher to generate a reset link for you from the Teacher portal (Students → your name → Reset password).
      </Alert>
    );
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && <Alert tone="danger">{error}</Alert>}
      <Field label="Email" htmlFor="email" error={errors.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </Field>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const { busy, error, errors, run } = useSubmit();
  const [done, setDone] = useState(false);
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    run(async () => {
      if (val(f, "password") !== val(f, "confirm")) throw new ClientApiError(422, "Passwords do not match.");
      await apiFetch("/api/v1/auth/reset-password", { body: { token, password: val(f, "password") } });
      setDone(true);
      setTimeout(() => router.replace("/login"), 1500);
    });
  }
  if (done) return <Alert tone="success" title="Password updated">You can now sign in with your new password.</Alert>;
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && <Alert tone="danger">{error}</Alert>}
      <Field label="New password" htmlFor="password" error={errors.password} hint="At least 8 characters, with a letter and a number.">
        <input id="password" name="password" type="password" autoComplete="new-password" required className="input" />
      </Field>
      <Field label="Confirm new password" htmlFor="confirm">
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="input" />
      </Field>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}

export function AcceptInviteForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const { busy, error, errors, run } = useSubmit();
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    run(async () => {
      if (val(f, "password") !== val(f, "confirm")) throw new ClientApiError(422, "Passwords do not match.");
      const r = await apiFetch<{ redirectTo: string }>("/api/v1/auth/accept-invite", { body: { token, name: val(f, "name"), password: val(f, "password") } });
      router.replace(r.redirectTo);
      router.refresh();
    });
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && <Alert tone="danger">{error}</Alert>}
      <Field label="Email" htmlFor="email">
        <input id="email" value={email} readOnly className="input bg-sidebar text-muted" />
      </Field>
      <Field label="Full name" htmlFor="name" error={errors.name}>
        <input id="name" name="name" autoComplete="name" required className="input" />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters, with a letter and a number.">
        <input id="password" name="password" type="password" autoComplete="new-password" required className="input" />
      </Field>
      <Field label="Confirm password" htmlFor="confirm">
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="input" />
      </Field>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Creating account…" : "Create teacher account"}
      </Button>
    </form>
  );
}
