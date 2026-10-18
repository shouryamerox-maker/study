import { z } from "zod";
import { api, parseBody } from "@/server/http";
import { gradeAttemptResponse } from "@/server/assessments/attempts";

const body = z.object({
  score: z.number(),
  feedback: z.string().max(5000).nullish(),
  reason: z.string().max(1000).nullish(),
});

/** Manual grade / override. Original answers are never modified; every change is audited. */
export const POST = api<{ id: string }>("staff", async ({ req, params, user }) => {
  const input = await parseBody(req, body);
  const { response, attempt } = await gradeAttemptResponse(user, params.id, input);
  return {
    response: { id: response.id, score: response.score, status: response.status, feedback: response.feedback, gradedAt: response.gradedAt },
    attempt: { score: attempt.score, gradingStatus: attempt.gradingStatus },
  };
});
