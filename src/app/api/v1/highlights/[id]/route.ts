import { z } from "zod";
import { api, notFound, parseBody } from "@/server/http";
import { db } from "@/server/db";
import { HIGHLIGHT_COLORS } from "@/lib/highlights";

async function own(userId: string, id: string) {
  const h = await db.highlight.findUnique({ where: { id }, select: { id: true, userId: true } });
  // Someone else's highlight is reported as missing, never as forbidden, so ids cannot be probed.
  if (!h || h.userId !== userId) throw notFound("Highlight");
  return h;
}

export const PATCH = api<{ id: string }>("user", async ({ req, params, user }) => {
  await own(user.id, params.id);
  const { color } = await parseBody(req, z.object({ color: z.enum(HIGHLIGHT_COLORS) }));
  return { highlight: await db.highlight.update({ where: { id: params.id }, data: { color }, select: { id: true, color: true } }) };
});

export const DELETE = api<{ id: string }>("user", async ({ params, user }) => {
  await own(user.id, params.id);
  await db.highlight.delete({ where: { id: params.id } });
  return { ok: true };
});
