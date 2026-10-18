import { z } from "zod";
import { api, parseBody } from "@/server/http";
import { setLessonCompletion } from "@/server/services/learning";

export const POST = api<{ id: string }>("user", async ({ req, params, user }) => {
  const { complete } = await parseBody(req, z.object({ complete: z.boolean() }));
  const row = await setLessonCompletion(user.id, params.id, complete);
  return { status: row.status, completedAt: row.completedAt };
});
