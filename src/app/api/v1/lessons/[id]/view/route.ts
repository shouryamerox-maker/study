import { api } from "@/server/http";
import { recordLessonView } from "@/server/services/learning";

export const POST = api<{ id: string }>("user", async ({ params, user }) => {
  await recordLessonView(user.id, params.id);
  return { ok: true };
});
