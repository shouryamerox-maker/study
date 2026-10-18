import { z } from "zod";
import { api, badRequest, conflict, forbidden, notFound, parseBody } from "@/server/http";
import { db } from "@/server/db";
import { destroyAllSessions } from "@/server/auth/session";

const body = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  studentCode: z.string().trim().max(40).nullish(),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).optional(),
  enrollCourseId: z.string().optional(),
});

/** Teachers manage student accounts; only admins can change roles. */
export const PATCH = api<{ id: string }>("staff", async ({ req, params, user }) => {
  const input = await parseBody(req, body);
  const target = await db.user.findUnique({ where: { id: params.id } });
  if (!target) throw notFound("User");
  if (target.id === user.id && (input.role || input.status)) throw badRequest("You cannot change your own role or status.");
  if (input.role && user.role !== "ADMIN") throw forbidden("Only administrators can change roles.");
  if (target.role !== "STUDENT" && user.role !== "ADMIN") throw forbidden("Only administrators can manage staff accounts.");

  if (input.studentCode) {
    const dup = await db.user.findFirst({ where: { studentCode: input.studentCode, id: { not: target.id } } });
    if (dup) throw conflict("That student ID is already in use.");
  }
  await db.user.update({
    where: { id: target.id },
    data: {
      status: input.status,
      role: input.role,
      ...(input.studentCode !== undefined ? { studentCode: input.studentCode || null } : {}),
    },
  });
  if (input.status === "SUSPENDED") await destroyAllSessions(target.id);
  if (input.enrollCourseId) {
    await db.enrollment.upsert({
      where: { userId_courseId: { userId: target.id, courseId: input.enrollCourseId } },
      create: { userId: target.id, courseId: input.enrollCourseId },
      update: { status: "active" },
    });
  }
  return { ok: true };
});
