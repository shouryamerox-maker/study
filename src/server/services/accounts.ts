import "server-only";
import type { Role } from "@prisma/client";
import { db } from "@/server/db";
import { newToken, sha256 } from "@/server/auth/crypto";
import { appUrl } from "@/server/mail";

export async function createResetLink(userId: string) {
  const token = newToken();
  await db.passwordResetToken.create({
    data: { userId, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });
  return appUrl(`/reset-password?token=${token}`);
}

export async function createInvite(email: string, role: Role, invitedById: string) {
  const token = newToken();
  await db.teacherInvite.create({
    data: { email, role, invitedById, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });
  return appUrl(`/invite/${token}`);
}
