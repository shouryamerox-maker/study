"use client";

import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Alert, Badge } from "@/components/ui";
import { OutputView } from "@/components/content/CodeView";

export interface RunResultData {
  status: "ok" | "compile_error" | "runtime_error" | "timeout" | "memory_limit" | "internal_error" | "unavailable";
  stdout: string;
  stderr: string;
  compileOutput: string;
  exitCode: number | null;
  timeMs: number | null;
  memoryKb: number | null;
  message: string;
  provider: string;
}

const label: Record<RunResultData["status"], string> = {
  ok: "Finished",
  compile_error: "Compilation error",
  runtime_error: "Runtime error",
  timeout: "Time limit exceeded",
  memory_limit: "Memory limit exceeded",
  internal_error: "Execution failed",
  unavailable: "Execution unavailable",
};

export function RunResult({ r }: { r: RunResultData }) {
  if (r.status === "unavailable") {
    return (
      <Alert tone="pending" title="Code execution is not available">
        {r.message} Nothing was compiled or run.
      </Alert>
    );
  }
  const ok = r.status === "ok";
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
        <Badge tone={ok ? "success" : r.status === "timeout" ? "pending" : "danger"}>
          {ok ? <CheckCircle2 size={12} /> : r.status === "timeout" ? <Clock size={12} /> : <XCircle size={12} />}
          {label[r.status]}
        </Badge>
        {r.exitCode != null && <span>exit code {r.exitCode}</span>}
        {r.timeMs != null && <span>· {r.timeMs} ms</span>}
        {r.memoryKb != null && <span>· {Math.round(r.memoryKb / 1024)} MB</span>}
        <span className="ml-auto text-faint">compiled & run in sandbox ({r.provider})</span>
      </div>
      {r.compileOutput && <OutputView title="Compiler output" text={r.compileOutput} tone={r.status === "compile_error" ? "error" : "neutral"} />}
      {r.status !== "compile_error" && <OutputView title="Program output (stdout)" text={r.stdout} />}
      {r.stderr && <OutputView title="Errors (stderr)" text={r.stderr} tone="error" />}
      {r.status === "internal_error" && (
        <p className="flex items-center gap-1.5 text-[12.5px] text-danger">
          <AlertTriangle size={13} /> {r.message}
        </p>
      )}
    </div>
  );
}
