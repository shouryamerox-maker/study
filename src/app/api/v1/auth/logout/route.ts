import { api } from "@/server/http";
import { destroyCurrentSession } from "@/server/auth/session";

export const POST = api("public", async () => {
  await destroyCurrentSession();
  return { ok: true };
});
