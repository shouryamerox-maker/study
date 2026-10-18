import { z } from "zod";
import { api, parseBody } from "@/server/http";
import { db } from "@/server/db";
import { executionAvailable, executionProvider, runC } from "@/server/execution";
import { rateLimit } from "@/server/rate-limit";
import { logEvent } from "@/server/events";

export const maxDuration = 30;

const body = z.object({
  source: z.string().min(1, "Write some code first.").max(64000),
  stdin: z.string().max(64000).default(""),
  language: z.literal("c").default("c"),
  context: z.enum(["playground", "lesson"]).default("playground"),
  refId: z.string().max(64).optional(),
});

export const GET = api("user", async () => ({ available: executionAvailable(), provider: executionProvider() }));

/** Runs C code in the configured sandbox. Never executes code in this process. */
export const POST = api("user", async ({ req, user }) => {
  const input = await parseBody(req, body);
  await rateLimit(`run:${user.id}`, 20, 60);
  const result = await runC(input.source, input.stdin);
  if (result.status !== "unavailable") {
    await db.codeRun.create({
      data: {
        userId: user.id,
        context: input.context,
        refId: input.refId,
        language: "c",
        source: input.source,
        stdin: input.stdin || null,
        provider: result.provider,
        status: result.status,
        stdout: result.stdout,
        stderr: result.stderr || null,
        compileOutput: result.compileOutput || null,
        timeMs: result.timeMs,
        memoryKb: result.memoryKb,
      },
    });
    await logEvent(user.id, "CODE_RUN", { refId: input.refId, label: input.context, meta: { status: result.status } });
  }
  return { result };
});
