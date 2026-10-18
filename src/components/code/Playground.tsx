"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Save } from "lucide-react";
import { Alert, Button, Card } from "@/components/ui";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { RunResult, type RunResultData } from "./RunResult";
import { PLAYGROUND_IMPORT_KEY } from "@/components/content/InteractiveBlocks";

const CodeEditor = dynamic(() => import("./CodeEditor"), { ssr: false, loading: () => <div className="h-[420px] animate-pulse rounded-[8px] border border-border bg-sidebar" /> });

const DEFAULT = `#include <stdio.h>

int main(void) {
    printf("Hello, C!\\n");
    return 0;
}
`;

export function Playground({ available, userId }: { available: boolean; userId: string }) {
  const storageKey = `sl:playground:${userId}`;
  const [code, setCode] = useState(DEFAULT);
  const [stdin, setStdin] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RunResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const imported = sessionStorage.getItem(PLAYGROUND_IMPORT_KEY);
      if (imported && new URLSearchParams(location.search).has("import")) {
        const d = JSON.parse(imported) as { code: string; stdin?: string };
        setCode(d.code || DEFAULT);
        setStdin(d.stdin ?? "");
        sessionStorage.removeItem(PLAYGROUND_IMPORT_KEY);
      } else {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const d = JSON.parse(saved) as { code: string; stdin: string };
          setCode(d.code);
          setStdin(d.stdin);
        }
      }
    } catch {
      /* storage unavailable */
    }
    loaded.current = true;
  }, [storageKey]);

  // Autosave the draft locally (per user) a moment after typing stops.
  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ code, stdin }));
        setSavedAt(new Date());
      } catch {
        /* ignore */
      }
    }, 600);
    return () => clearTimeout(t);
  }, [code, stdin, storageKey]);

  const run = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await apiFetch<{ result: RunResultData }>("/api/v1/run", { body: { source: code, stdin, context: "playground" } });
      setResult(r.result);
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "Could not run the code.");
    } finally {
      setBusy(false);
    }
  }, [busy, code, stdin]);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Card className="p-3">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[12.5px] text-muted">main.c</span>
          <span className="text-[11.5px] text-faint">{savedAt ? "Draft saved on this device" : ""}</span>
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm("Reset the editor to the starter program? Your current code will be lost.")) {
                  setCode(DEFAULT);
                  setStdin("");
                  setResult(null);
                }
              }}
            >
              <RotateCcw size={13} /> Reset
            </Button>
            <Button size="sm" onClick={run} disabled={busy || !available} title="Run (Ctrl+Enter)">
              <Play size={13} /> {busy ? "Running…" : "Run"}
            </Button>
          </div>
        </div>
        <CodeEditor value={code} onChange={setCode} onRun={run} height="440px" ariaLabel="C source code" />
        <p className="mt-2 text-[11.5px] text-faint">
          <kbd className="rounded border border-border bg-sidebar px-1">Ctrl</kbd> + <kbd className="rounded border border-border bg-sidebar px-1">Enter</kbd> to run · <kbd className="rounded border border-border bg-sidebar px-1">Tab</kbd> indents
        </p>
      </Card>
      <div className="space-y-4">
        <Card className="p-3">
          <label htmlFor="stdin" className="mb-1.5 block text-[13px] font-medium">
            Standard input (stdin)
          </label>
          <textarea id="stdin" rows={5} value={stdin} onChange={(e) => setStdin(e.target.value)} className="input font-mono text-[13px]" placeholder="Input your program reads with scanf()…" />
        </Card>
        <Card className="p-3">
          <div className="mb-2 flex items-center gap-2 text-[13px] font-medium">
            <Save size={13} className="text-muted" /> Result
          </div>
          {!available ? (
            <Alert tone="pending" title="Code execution is not configured">
              This server is not connected to a sandboxed C compiler yet, so programs cannot be run. Your code is still saved on this device. An administrator can enable execution by setting <code>EXECUTION_PROVIDER</code> (see the README).
            </Alert>
          ) : error ? (
            <Alert tone="danger">{error}</Alert>
          ) : result ? (
            <RunResult r={result} />
          ) : (
            <p className="text-[13px] text-muted">Run your program to see compiler messages and output here.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
