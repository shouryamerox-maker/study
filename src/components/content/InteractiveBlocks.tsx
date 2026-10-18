"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ExternalLink, Lightbulb, Play } from "lucide-react";
import { Button, cn } from "@/components/ui";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { RunResult, type RunResultData } from "@/components/code/RunResult";
import { OutputView } from "./CodeView";

export const PLAYGROUND_IMPORT_KEY = "sl:playground:import";

export function openInPlayground(router: ReturnType<typeof useRouter>, code: string, stdin = "") {
  try {
    sessionStorage.setItem(PLAYGROUND_IMPORT_KEY, JSON.stringify({ code, stdin }));
  } catch {
    /* storage unavailable — playground opens empty */
  }
  router.push("/playground?import=1");
}

/** Run / open-in-playground actions under a runnable lesson example. */
export function RunCodeActions({ code, stdin, refId }: { code: string; stdin?: string; refId?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RunResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const r = await apiFetch<{ result: RunResultData }>("/api/v1/run", { body: { source: code, stdin: stdin ?? "", context: "lesson", refId } });
      setResult(r.result);
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "Could not run the code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={run} disabled={busy}>
          <Play size={13} /> {busy ? "Running…" : "Run this example"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => openInPlayground(router, code, stdin)}>
          <ExternalLink size={13} /> Edit in playground
        </Button>
      </div>
      {error && <p className="text-[12.5px] text-danger">{error}</p>}
      {result && <RunResult r={result} />}
    </div>
  );
}

/** Reveal-on-demand hint / solution for lesson exercises (practice, not graded). */
export function Reveal({ label, children, tone = "neutral" }: { label: string; children: React.ReactNode; tone?: "neutral" | "hint" }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[8px] border border-divider">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-medium text-muted hover:text-ink"
      >
        {tone === "hint" && <Lightbulb size={14} className="text-pending" />}
        {label}
        <ChevronDown size={14} className={cn("ml-auto transition-transform duration-150", open && "rotate-180")} />
      </button>
      {open && <div className="border-t border-divider px-3 py-2.5">{children}</div>}
    </div>
  );
}

export function ExerciseTry({ starterCode, expectedOutput }: { starterCode?: string; expectedOutput?: string }) {
  const router = useRouter();
  if (!starterCode && !expectedOutput) return null;
  return (
    <div className="space-y-2">
      {expectedOutput !== undefined && <OutputView title="Expected output" text={expectedOutput} />}
      {starterCode !== undefined && (
        <Button size="sm" variant="secondary" onClick={() => openInPlayground(router, starterCode)}>
          <ExternalLink size={13} /> Try it in the playground
        </Button>
      )}
    </div>
  );
}
