"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Play } from "lucide-react";
import { Alert, Button, Card } from "@/components/ui";
import { apiFetch, ClientApiError } from "@/lib/client-api";

export function StartTestButton({ assessmentId, resume, duration, marks }: { assessmentId: string; resume: boolean; duration: number | null; marks: number | null }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const r = await apiFetch<{ attemptId: string }>(`/api/v1/tests/${assessmentId}/start`, { method: "POST" });
      router.push(`/tests/${assessmentId}/attempt/${r.attemptId}`);
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "Could not start the test.");
      setBusy(false);
    }
  }

  return (
    <>
      <Button onClick={() => (resume ? start() : setConfirm(true))} disabled={busy}>
        <Play size={15} /> {resume ? (busy ? "Opening…" : "Resume attempt") : "Start test"}
      </Button>
      {error && (
        <Alert tone="danger" className="mt-3">
          {error}
        </Alert>
      )}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4" role="dialog" aria-modal="true" aria-labelledby="start-title">
          <Card className="w-full max-w-md p-5 shadow-[var(--shadow-pop)]">
            <h2 id="start-title" className="text-[16px] font-semibold">
              Start the test now?
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[13.5px]">
              {marks != null && <li>{marks} marks in total.</li>}
              {duration ? <li>You will have {duration} minutes. The timer keeps running if you leave the page.</li> : <li>This test is not timed.</li>}
              <li>Answers are saved automatically as you go.</li>
              {duration ? <li>When time runs out, your saved answers are submitted automatically.</li> : null}
            </ul>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirm(false)} disabled={busy} autoFocus>
                Not yet
              </Button>
              <Button onClick={start} disabled={busy}>
                {busy ? "Starting…" : "Start now"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
