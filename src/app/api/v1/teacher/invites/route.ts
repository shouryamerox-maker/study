import { z } from "zod";
import { api, conflict, parseBody } from "@/server/http";
import { db } from "@/server/db";
import { emailSchema } from "@/lib/validation";
import { createInvite } from "@/server/services/accounts";
import { sendMail } from "@/server/mail";

export const GET = api("admin", async () => ({
  invites: await db.teacherInvite.findMany({ orderBy: { createdAt: "desc" }, take: 50, select: { id: true, email: true, role: true, expiresAt: true, acceptedAt: true, revokedAt: true, createdAt: true } }),
}));

/** Only administrators can invite staff. The link is shown once and can be emailed. */
export const POST = api("admin", async ({ req, user }) => {
  const body = await parseBody(req, z.object({ email: emailSchema, role: z.enum(["TEACHER", "ADMIN"]).default("TEACHER") }));
  if (await db.user.findUnique({ where: { email: body.email } })) throw conflict("A user with this email already exists. Change their role from the Students page instead.");
  const link = await createInvite(body.email, body.role, user.id);
  const emailed = await sendMail(body.email, "You're invited to Studyline", `You have been invited to join Studyline as a ${body.role.toLowerCase()}.\n\nCreate your account (link valid for 7 days):\n${link}`);
  return { link, emailed };
});

export const DELETE = api("admin", async ({ req }) => {
  const id = req.nextUrl.searchParams.get("id");
  if (id) await db.teacherInvite.updateMany({ where: { id, acceptedAt: null }, data: { revokedAt: new Date() } });
  return { ok: true };
});
