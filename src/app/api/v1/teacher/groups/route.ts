import { z } from "zod";
import { api, notFound, parseBody } from "@/server/http";
import { db } from "@/server/db";

export const GET = api("staff", async () => ({
  groups: await db.group.findMany({ orderBy: { name: "asc" }, include: { members: { select: { userId: true } } } }),
}));

export const POST = api("staff", async ({ req, user }) => {
  const body = await parseBody(req, z.object({ name: z.string().trim().min(1).max(120), description: z.string().max(500).nullish() }));
  return { group: await db.group.create({ data: { name: body.name, description: body.description ?? null, createdById: user.id } }) };
});

/** Replace a group's members, rename, or delete. */
export const PUT = api("staff", async ({ req }) => {
  const body = await parseBody(req, z.object({ id: z.string(), name: z.string().trim().min(1).max(120).optional(), memberIds: z.array(z.string()).max(2000).optional() }));
  const g = await db.group.findUnique({ where: { id: body.id } });
  if (!g) throw notFound("Group");
  if (body.name) await db.group.update({ where: { id: g.id }, data: { name: body.name } });
  if (body.memberIds) {
    const students = await db.user.findMany({ where: { id: { in: body.memberIds }, role: "STUDENT" }, select: { id: true } });
    await db.$transaction([
      db.groupMember.deleteMany({ where: { groupId: g.id } }),
      db.groupMember.createMany({ data: students.map((s) => ({ groupId: g.id, userId: s.id })) }),
    ]);
  }
  return { ok: true };
});

export const DELETE = api("staff", async ({ req }) => {
  const id = req.nextUrl.searchParams.get("id");
  if (id) await db.group.deleteMany({ where: { id } });
  return { ok: true };
});
