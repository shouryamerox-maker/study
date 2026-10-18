import { z } from "zod";
import { api, notFound, parseBody } from "@/server/http";
import { db } from "@/server/db";

async function own(userId: string, id: string) {
  const note = await db.note.findUnique({ where: { id } });
  if (!note || note.userId !== userId) throw notFound("Note");
  return note;
}

export const PATCH = api<{ id: string }>("user", async ({ req, params, user }) => {
  await own(user.id, params.id);
  const { body } = await parseBody(req, z.object({ body: z.string().trim().min(1).max(10000) }));
  return { note: await db.note.update({ where: { id: params.id }, data: { body } }) };
});

export const DELETE = api<{ id: string }>("user", async ({ params, user }) => {
  await own(user.id, params.id);
  await db.note.delete({ where: { id: params.id } });
  return { ok: true };
});
