import { z } from "zod";
import { api, badRequest, conflict, notFound, parseBody } from "@/server/http";
import { db } from "@/server/db";
import { allQuestions, snapshotOf } from "@/server/assessments/attempts";
import { evaluateTests, runC } from "@/server/execution";
import { rateLimit } from "@/server/rate-limit";

export const maxDuration = 30;

/**
 * Lets a student run their code during a test: against the question's SAMPLE tests only
 * (hidden tests and expected solutions stay on the server), or with custom input.
 */
export const POST = api<{ id: string }>("user", async ({ req, params, user }) => {
  const input = await parseBody(req, z.object({ questionId: z.string().max(40), code: z.string().min(1).max(64000), stdin: z.string().max(64000).optional() }));
  await rateLimit(`run:${user.id}`, 20, 60);
  const attempt = await db.attempt.findUnique({ where: { id: params.id }, include: { version: true } });
  if (!attempt || attempt.userId !== user.id) throw notFound("Attempt");
  if (attempt.status !== "IN_PROGRESS") throw conflict("This attempt has been submitted.");
  const q = allQuestions(snapshotOf(attempt.version)).find((x) => x.id === input.questionId);
  if (!q || (q.type !== "CODE_WRITING" && q.type !== "DEBUGGING")) throw badRequest("This question does not support running code.");

  if (input.stdin !== undefined || !q.data.sampleTests?.length) {
    return { mode: "custom", result: await runC(input.code, input.stdin ?? "") };
  }
  const tests = await evaluateTests(input.code, q.data.sampleTests, []);
  return { mode: "samples", tests };
});
