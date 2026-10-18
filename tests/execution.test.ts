import { afterEach, describe, expect, it, vi } from "vitest";
import { evaluateTests, runC } from "@/server/execution";

const b64 = (s: string) => Buffer.from(s).toString("base64");

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("execution provider", () => {
  it("reports unavailable (and never runs code locally) when no provider is configured", async () => {
    vi.stubEnv("EXECUTION_PROVIDER", "none");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const r = await runC("int main(){}");
    expect(r.status).toBe("unavailable");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("maps Judge0 results and sends sandbox limits", async () => {
    vi.stubEnv("EXECUTION_PROVIDER", "judge0");
    vi.stubEnv("JUDGE0_URL", "https://judge0.example");
    const fetchSpy = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string);
      expect(body.language_id).toBe(50);
      expect(body.cpu_time_limit).toBeGreaterThan(0);
      expect(body.memory_limit).toBeGreaterThan(0);
      expect(Buffer.from(body.stdin, "base64").toString()).toBe("5\n");
      return new Response(JSON.stringify({ stdout: b64("25\n"), status: { id: 3, description: "Accepted" }, time: "0.004", memory: 1024, exit_code: 0 }));
    });
    vi.stubGlobal("fetch", fetchSpy);
    const r = await runC("src", "5\n");
    expect(r).toMatchObject({ status: "ok", stdout: "25\n", timeMs: 4, provider: "judge0" });
  });

  it("maps Judge0 compile errors and time limits", async () => {
    vi.stubEnv("EXECUTION_PROVIDER", "judge0");
    vi.stubEnv("JUDGE0_URL", "https://judge0.example");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ compile_output: b64("error: expected ';'"), status: { id: 6, description: "Compilation Error" } }))));
    expect(await runC("x")).toMatchObject({ status: "compile_error", compileOutput: "error: expected ';'" });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ status: { id: 5, description: "Time Limit Exceeded" } }))));
    expect((await runC("while(1);")).status).toBe("timeout");
  });

  it("maps Piston results", async () => {
    vi.stubEnv("EXECUTION_PROVIDER", "piston");
    vi.stubEnv("PISTON_URL", "http://piston:2000");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ compile: { code: 0, stdout: "", stderr: "" }, run: { stdout: "hi\n", stderr: "", code: 0, signal: null } }))));
    expect(await runC("x")).toMatchObject({ status: "ok", stdout: "hi\n", provider: "piston" });
  });

  it("evaluates test cases and hides hidden-case details", async () => {
    vi.stubEnv("EXECUTION_PROVIDER", "judge0");
    vi.stubEnv("JUDGE0_URL", "https://judge0.example");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_u: string, init: RequestInit) => {
        const stdin = Buffer.from(JSON.parse(init.body as string).stdin, "base64").toString();
        return new Response(JSON.stringify({ stdout: b64(String(Number(stdin) * 2)), status: { id: 3 } }));
      }),
    );
    const r = await evaluateTests("src", [{ stdin: "2", expected: "4" }], [{ stdin: "5", expected: "11" }]);
    expect(r).toMatchObject({ available: true, passed: 1, total: 2 });
    expect(r.results[1]).toMatchObject({ hidden: true, passed: false });
    expect(r.results[1].stdin).toBeUndefined();
    expect(r.results[1].expected).toBeUndefined();
  });

  it("rejects oversized source without calling the service", async () => {
    vi.stubEnv("EXECUTION_PROVIDER", "judge0");
    vi.stubEnv("JUDGE0_URL", "https://judge0.example");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect((await runC("x".repeat(70_000))).status).toBe("internal_error");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
