import { headers } from "next/headers";
import { api, badRequest, parseBody } from "@/server/http";
import { resetSchema } from "@/lib/validation";
import { db } from "@/server/db";
import { hashPassword, sha256 } from "@/server/auth/crypto";
import { clientIp, destroyAllSessions } from "@/server/auth/session";
import { rateLimit } from "@/server/rate-limit";

export const POST = api("public", async ({ req }) => {
  await rateLimit(`reset:${clientIp(await headers())}`, 10, 15 * 60);
  const { token, password } = await parseBody(req, resetSchema);
  const row = await db.passwordResetToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) throw badRequest("This reset link is invalid or has expired.");

  await db.$transaction([
    db.user.update({ where: { id: row.userId }, data: { passwordHash: await hashPassword(password) } }),
    db.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
  ]);
  await destroyAllSessions(row.userId);
  return { ok: true };
});
