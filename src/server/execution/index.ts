import "server-only";
import { outputsMatch, type TestCase } from "@/lib/grading";

/**
 * Sandboxed code execution.
 *
 * Student code is NEVER executed inside this application's server process. It is sent
 * to an isolated execution service that compiles with a real compiler (gcc) inside a
 * sandbox with CPU-time, wall-time, memory and process limits:
 *
 *   EXECUTION_PROVIDER=judge0  → Judge0 CE (self-hosted, or the RapidAPI hosted plan)
 *   EXECUTION_PROVIDER=piston  → Piston (self-hosted)
 *   EXECUTION_PROVIDER=none    → execution disabled; the UI says so honestly
 */

export type RunStatus =
  | "ok"
  | "compile_error"
  | "runtime_error"
  | "timeout"
  | "memory_limit"
  | "internal_error"
  | "unavailable";

export interface RunResult {
  status: RunStatus;
  stdout: string;
  stderr: string;
  compileOutput: string;
  exitCode: number | null;
  timeMs: number | null;
  memoryKb: number | null;
  message: string;
  provider: string;
}

export const LIMITS = {
  sourceBytes: 64 * 1024,
  stdinBytes: 64 * 1024,
  outputBytes: 64 * 1024,
  cpuSeconds: 2,
  wallSeconds: 5,
  memoryKb: 128 * 1024,
};

export function executionProvider(): "judge0" | "piston" | "none" {
  const p = (process.env.EXECUTION_PROVIDER ?? "none").toLowerCase();
  if (p === "judge0" && process.env.JUDGE0_URL) return "judge0";
  if (p === "piston" && process.env.PISTON_URL) return "piston";
  return "none";
}

export function executionAvailable() {
  return executionProvider() !== "none";
}

const clip = (s: string | null | undefined) => {
  const v = s ?? "";
  return v.length > LIMITS.outputBytes ? v.slice(0, LIMITS.outputBytes) + "\n…[output truncated]" : v;
};

const empty = (provider: string, status: RunStatus, message: string): RunResult => ({
  status,
  stdout: "",
  stderr: "",
  compileOutput: "",
  exitCode: null,
  timeMs: null,
  memoryKb: null,
  message,
  provider,
});

export async function runC(source: string, stdin = ""): Promise<RunResult> {
  const provider = executionProvider();
  if (provider === "none") {
    return empty("none", "unavailable", "Code execution is not configured on this server. Ask your administrator to connect a sandboxed execution service.");
  }
  if (Buffer.byteLength(source) > LIMITS.sourceBytes) return empty(provider, "internal_error", "Source code is too large (64 KB max).");
  if (Buffer.byteLength(stdin) > LIMITS.stdinBytes) return empty(provider, "internal_error", "Input is too large (64 KB max).");
  try {
    return provider === "judge0" ? await runJudge0(source, stdin) : await runPiston(source, stdin);
  } catch (err) {
    console.error("[execution] provider error", err);
    return empty(provider, "internal_error", "The execution service could not be reached. Try again in a moment.");
  }
}

async function fetchWithTimeout(url: string, init: RequestInit, ms = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
  } finally {
    clearTimeout(t);
  }
}

/* ── Judge0 ─────────────────────────────────────────────────────────── */

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");
const unb64 = (s: string | null | undefined) => (s ? Buffer.from(s, "base64").toString("utf8") : "");

async function runJudge0(source: string, stdin: string): Promise<RunResult> {
  const base = process.env.JUDGE0_URL!.replace(/\/$/, "");
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (process.env.JUDGE0_KEY) {
    if (process.env.JUDGE0_HOST) {
      headers["x-rapidapi-key"] = process.env.JUDGE0_KEY;
      headers["x-rapidapi-host"] = process.env.JUDGE0_HOST;
    } else {
      headers["x-auth-token"] = process.env.JUDGE0_KEY;
    }
  }
  const res = await fetchWithTimeout(`${base}/submissions?base64_encoded=true&wait=true&fields=*`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      language_id: Number(process.env.JUDGE0_C_LANGUAGE_ID ?? 50), // 50 = C (GCC 9.2.0)
      source_code: b64(source),
      stdin: b64(stdin),
      cpu_time_limit: LIMITS.cpuSeconds,
      wall_time_limit: LIMITS.wallSeconds,
      memory_limit: LIMITS.memoryKb,
      max_processes_and_or_threads: 1,
      enable_network: false,
    }),
  });
  if (!res.ok) {
    return empty("judge0", "internal_error", `Execution service error (${res.status}).`);
  }
  const j = (await res.json()) as {
    stdout?: string;
    stderr?: string;
    compile_output?: string;
    message?: string;
    exit_code?: number | null;
    time?: string | null;
    memory?: number | null;
    status?: { id: number; description: string };
  };
  const id = j.status?.id ?? 13;
  const status: RunStatus =
    id === 3 || id === 4 ? "ok" : id === 5 ? "timeout" : id === 6 ? "compile_error" : id >= 7 && id <= 12 ? "runtime_error" : "internal_error";
  const stderr = unb64(j.stderr);
  return {
    status: status === "runtime_error" && /memory/i.test(stderr) ? "memory_limit" : status,
    stdout: clip(unb64(j.stdout)),
    stderr: clip(stderr),
    compileOutput: clip(unb64(j.compile_output)),
    exitCode: j.exit_code ?? null,
    timeMs: j.time ? Math.round(parseFloat(j.time) * 1000) : null,
    memoryKb: j.memory ?? null,
    message: j.status?.description ?? "",
    provider: "judge0",
  };
}

/* ── Piston ─────────────────────────────────────────────────────────── */

async function runPiston(source: string, stdin: string): Promise<RunResult> {
  const base = process.env.PISTON_URL!.replace(/\/$/, "");
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (process.env.PISTON_KEY) headers["authorization"] = process.env.PISTON_KEY;
  const res = await fetchWithTimeout(`${base}/api/v2/execute`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      language: "c",
      version: process.env.PISTON_C_VERSION ?? "*",
      files: [{ name: "main.c", content: source }],
      stdin,
      compile_timeout: 10000,
      run_timeout: LIMITS.wallSeconds * 1000,
      run_memory_limit: LIMITS.memoryKb * 1024,
    }),
  });
  if (!res.ok) return empty("piston", "internal_error", `Execution service error (${res.status}).`);
  const j = (await res.json()) as {
    compile?: { stdout: string; stderr: string; code: number | null; output?: string };
    run?: { stdout: string; stderr: string; code: number | null; signal: string | null; output?: string };
    message?: string;
  };
  if (j.compile && j.compile.code !== 0) {
    return { ...empty("piston", "compile_error", "Compilation failed"), compileOutput: clip(j.compile.stderr || j.compile.stdout) };
  }
  const run = j.run;
  if (!run) return empty("piston", "internal_error", j.message ?? "No run result.");
  const status: RunStatus = run.signal === "SIGKILL" ? "timeout" : run.code !== 0 || run.signal ? "runtime_error" : "ok";
  return {
    status,
    stdout: clip(run.stdout),
    stderr: clip(run.stderr),
    compileOutput: clip(j.compile?.stderr),
    exitCode: run.code,
    timeMs: null,
    memoryKb: null,
    message: run.signal ? `Terminated by ${run.signal}` : status === "ok" ? "Finished" : `Exited with code ${run.code}`,
    provider: "piston",
  };
}

/* ── Test-case evaluation ───────────────────────────────────────────── */

export interface CaseResult {
  index: number;
  hidden: boolean;
  passed: boolean;
  status: RunStatus;
  stdin?: string;
  expected?: string;
  actual?: string;
  error?: string;
}

/** Runs code against test cases. Hidden cases never return their input/expected output. */
export async function evaluateTests(source: string, samples: TestCase[], hidden: TestCase[]) {
  const all = [...samples.map((t) => ({ ...t, hidden: false })), ...hidden.map((t) => ({ ...t, hidden: true }))];
  const results: CaseResult[] = [];
  for (const [i, t] of all.entries()) {
    const r = await runC(source, t.stdin);
    if (r.status === "unavailable") return { available: false as const, results: [], passed: 0, total: all.length };
    const passed = r.status === "ok" && outputsMatch(r.stdout, t.expected);
    results.push({
      index: i,
      hidden: t.hidden,
      passed,
      status: r.status,
      ...(t.hidden ? {} : { stdin: t.stdin, expected: t.expected, actual: r.stdout }),
      error: r.status === "compile_error" ? r.compileOutput : r.status !== "ok" ? r.stderr || r.message : undefined,
    });
    if (r.status === "compile_error") break; // the same error will repeat for every case
  }
  return { available: true as const, results, passed: results.filter((r) => r.passed).length, total: all.length };
}
