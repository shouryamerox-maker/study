import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { api, notFound, parseBody } from "@/server/http";
import { db } from "@/server/db";
import { gradeResponse, type AnswerKey } from "@/lib/grading";
import { evaluateTests } from "@/server/execution";
import { rateLimit } from "@/server/rate-limit";
import { logEvent } from "@/server/events";

const body = z.object({
  response: z
    .object({
      optionId: z.string().max(40).optional(),
      value: z.boolean().optional(),
      blanks: z.array(z.string().max(500)).max(20).optional(),
      text: z.string().max(20000).optional(),
      code: z.string().max(64000).optional(),
    })
    .strict(),
});

/** Checks a practice answer on the server, records the attempt and returns feedback. */
export const POST = api<{ id: string }>("user", async ({ req, params, user }) => {
  await rateLimit(`practice:${user.id}`, 120, 60);
  const { response } = await parseBody(req, body);
  const q = await db.question.findUnique({ where: { id: params.id } });
  if (!q) throw notFound("Question");
  const key = q.answer as unknown as AnswerKey;

  let isCorrect = false;
  let tests: Awaited<ReturnType<typeof evaluateTests>> | null = null;
  let blankResults: boolean[] | undefined;

  if (q.type === "CODE_WRITING") {
    await rateLimit(`run:${user.id}`, 20, 60);
    const k = key as Extract<AnswerKey, { type: "CODE_WRITING" }>;
    tests = await evaluateTests(response.code ?? "", k.sampleTests ?? [], k.hiddenTests ?? []);
    if (!tests.available) {
      return { available: false, message: "Code execution is not configured on this server, so this answer cannot be checked automatically." };
    }
    isCorrect = tests.passed === tests.total && tests.total > 0;
  } else {
    const g = gradeResponse(q.type, key, response, 1);
    if (g.status === "UNANSWERED") return { unanswered: true };
    isCorrect = g.status === "CORRECT";
    blankResults = g.blankResults;
  }

  await db.practiceAttempt.create({
    data: {
      userId: user.id,
      questionId: q.id,
      response: response as Prisma.InputJsonValue,
      isCorrect,
      score: isCorrect ? 1 : 0,
      maxScore: 1,
    },
  });
  await logEvent(user.id, "PRACTICE_SUBMITTED", {
    courseId: q.courseId ?? undefined,
    lessonId: q.lessonId ?? undefined,
    refId: q.id,
    label: q.slug,
    meta: { correct: isCorrect },
  });

  // Practice is formative: once answered, the correct answer and explanation are shown.
  return {
    available: true,
    correct: isCorrect,
    blankResults,
    explanation: q.explanation,
    answer:
      key.type === "MCQ"
        ? { correct: key.correct }
        : key.type === "TRUE_FALSE"
          ? { correct: key.correct }
          : key.type === "FILL_BLANK"
            ? { accepted: key.accepted.map((a) => a[0]) }
            : key.type === "OUTPUT_PREDICTION"
              ? { expected: key.expected }
              : key.type === "CODE_WRITING" && isCorrect
                ? { solutionCode: key.solutionCode ?? null }
                : null,
    tests: tests && tests.available ? { passed: tests.passed, total: tests.total, results: tests.results } : null,
  };
});
