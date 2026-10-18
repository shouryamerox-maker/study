import { headers } from "next/headers";
import { api, badRequest, conflict, parseBody } from "@/server/http";
import { acceptInviteSchema } from "@/lib/validation";
import { db } from "@/server/db";
import { hashPassword, sha256 } from "@/server/auth/crypto";
import { clientIp, createSession } from "@/server/auth/session";
import { rateLimit } from "@/server/rate-limit";

/** Creates a staff account from a valid, unused invitation issued by an admin. */
export const POST = api("public", async ({ req }) => {
  await rateLimit(`invite:${clientIp(await headers())}`, 10, 15 * 60);
  const body = await parseBody(req, acceptInviteSchema);
  const invite = await db.teacherInvite.findUnique({ where: { tokenHash: sha256(body.token) } });
  if (!invite || invite.acceptedAt || invite.revokedAt || invite.expiresAt < new Date()) {
    throw badRequest("This invitation is invalid or has expired.");
  }
  if (await db.user.findUnique({ where: { email: invite.email } })) {
    throw conflict("An account already exists for this email. Ask an admin to change its role instead.");
  }
  const user = await db.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: { email: invite.email, name: body.name, passwordHash: await hashPassword(body.password), role: invite.role },
    });
    await tx.teacherInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
    return u;
  });
  await createSession(user.id, "web");
  return { ok: true, redirectTo: "/teacher" };
});
