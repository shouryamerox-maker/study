import { headers } from "next/headers";
import { api, conflict, parseBody } from "@/server/http";
import { registerSchema } from "@/lib/validation";
import { db } from "@/server/db";
import { hashPassword } from "@/server/auth/crypto";
import { clientIp, createSession } from "@/server/auth/session";
import { rateLimit } from "@/server/rate-limit";
import { logEvent } from "@/server/events";

/** Public self-registration always creates a STUDENT. Staff accounts come from invites. */
export const POST = api("public", async ({ req }) => {
  const ip = clientIp(await headers());
  await rateLimit(`register:${ip}`, 10, 60 * 60);
  const body = await parseBody(req, registerSchema);

  const existing = await db.user.findUnique({ where: { email: body.email } });
  if (existing) throw conflict("An account with this email already exists. Try signing in.");

  const user = await db.user.create({
    data: {
      email: body.email,
      name: body.name,
      passwordHash: await hashPassword(body.password),
      role: "STUDENT",
    },
    select: { id: true, name: true, email: true, role: true },
  });
  await createSession(user.id, "web");
  await logEvent(user.id, "LOGIN", { label: "Registered" });
  return { user };
});
