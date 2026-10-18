import { z } from "zod";
import { api, notFound, parseBody } from "@/server/http";
import { db } from "@/server/db";

export const GET = api<{ id: string }>("staff", async ({ params }) => {
  const a = await db.assessment.findUnique({ where: { id: params.id }, include: { assignments: { include: { user: { select: { id: true, name: true, email: true } }, group: true } } } });
  if (!a) throw notFound("Test");
  return { assignToAll: a.assignToAll, assignments: a.assignments };
});

const body = z.object({
  assignToAll: z.boolean(),
  userIds: z.array(z.string()).max(2000),
  groupIds: z.array(z.string()).max(200),
  dueAt: z.coerce.date().nullish(),
});

/** Replaces the assignment list. Existing attempts are kept even if a student is unassigned. */
export const PUT = api<{ id: string }>("staff", async ({ req, params }) => {
  const input = await parseBody(req, body);
  const a = await db.assessment.findUnique({ where: { id: params.id } });
  if (!a) throw notFound("Test");
  const users = await db.user.findMany({ where: { id: { in: input.userIds }, role: "STUDENT" }, select: { id: true } });
  const groups = await db.group.findMany({ where: { id: { in: input.groupIds } }, select: { id: true } });
  await db.$transaction([
    db.assessment.update({ where: { id: a.id }, data: { assignToAll: input.assignToAll } }),
    db.assessmentAssignment.deleteMany({ where: { assessmentId: a.id } }),
    db.assessmentAssignment.createMany({
      data: [
        ...users.map((u) => ({ assessmentId: a.id, userId: u.id, dueAt: input.dueAt ?? null })),
        ...groups.map((g) => ({ assessmentId: a.id, groupId: g.id, dueAt: input.dueAt ?? null })),
      ],
    }),
  ]);
  return { ok: true, students: users.length, groups: groups.length };
});
