import { api, forbidden, notFound } from "@/server/http";
import { db } from "@/server/db";
import { createResetLink } from "@/server/services/accounts";

/** Generates a one-hour password reset link for the teacher to pass on (when email is not configured). */
export const POST = api<{ id: string }>("staff", async ({ params, user }) => {
  const target = await db.user.findUnique({ where: { id: params.id } });
  if (!target) throw notFound("User");
  if (target.role !== "STUDENT" && user.role !== "ADMIN") throw forbidden();
  return { link: await createResetLink(target.id), expiresInMinutes: 60 };
});
