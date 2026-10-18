import { api, ApiError, parseBody } from "@/server/http";
import { changePasswordSchema } from "@/lib/validation";
import { db } from "@/server/db";
import { hashPassword, verifyPassword } from "@/server/auth/crypto";
import { rateLimit } from "@/server/rate-limit";

export const POST = api("user", async ({ req, user }) => {
  await rateLimit(`chpw:${user.id}`, 10, 15 * 60);
  const body = await parseBody(req, changePasswordSchema);
  const row = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(body.currentPassword, row.passwordHash))) {
    throw new ApiError(400, "Your current password is incorrect.", "invalid_password");
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(body.newPassword) } });
  return { ok: true };
});
