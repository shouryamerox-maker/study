"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { apiFetch, ClientApiError } from "@/lib/client-api";

export function EnrollButton({ slug, enrolled }: { slug: string; enrolled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function go() {
    if (enrolled && !confirm("Leave this course? Your progress is kept and comes back if you re-enrol.")) return;
    setBusy(true);
    try {
      await apiFetch(`/api/v1/courses/${slug}/enroll`, { method: enrolled ? "DELETE" : "POST" });
      router.refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <span className="inline-flex items-center gap-2">
      <Button variant={enrolled ? "ghost" : "primary"} size="sm" onClick={go} disabled={busy}>
        {busy ? "…" : enrolled ? "Leave course" : "Enrol in course"}
      </Button>
      {error && <span className="text-[12px] text-danger">{error}</span>}
    </span>
  );
}
