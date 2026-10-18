import { z } from "zod";
import { api, parseBody } from "@/server/http";
import { responseInputSchema, saveResponse } from "@/server/assessments/attempts";

const body = z.object({
  questionId: z.string().min(1).max(40),
  response: responseInputSchema.nullable().optional(),
  markedForReview: z.boolean().optional(),
});

/** Autosave of a single answer during an attempt. */
export const PUT = api<{ id: string }>("user", async ({ req, params, user }) => {
  const input = await parseBody(req, body);
  return saveResponse(user, params.id, input);
});
