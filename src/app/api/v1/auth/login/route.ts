import { headers } from "next/headers";
import { api, ApiError, parseBody } from "@/server/http";
import { loginSchema } from "@/lib/validation";
import { db } from "@/server/db";
import { verifyPassword } from "@/server/auth/crypto";
import { clientIp, createSession } from "@/server/auth/session";
import { rateLimit } from "@/server/rate-limit";
import { logEvent } from "@/server/events";
import { homeFor } from "@/server/auth/guards";

// Used to keep timing similar when the email does not exist.
const DUMMY_HASH = "$2b$12$J10QGpt5oP4bNL/JNi.PYOQCrWPSGjlHThJhTb0gY0s1G/ygF.foW";

export const POST = api("public", async ({ req }) => {
  const ip = clientIp(await headers());
  const body = await parseBody(req, loginSchema);
  await rateLimit(`login:ip:${ip}`, 30, 15 * 60);
  await rateLimit(`login:email:${body.email}`, 8, 15 * 60);

  const user = await db.user.findUnique({ where: { email: body.email } });
  const ok = await verifyPassword(body.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw new ApiError(401, "Incorrect email or password.", "invalid_credentials");
  if (user.status !== "ACTIVE") throw new ApiError(403, "This account is suspended. Contact your teacher.", "suspended");

  const { token, expiresAt } = await createSession(user.id, body.client);
  await db.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
  await logEvent(user.id, "LOGIN");

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    redirectTo: homeFor(user.role),
    // The bearer token is only returned to the mobile app; browsers get an httpOnly cookie.
    ...(body.client === "app" ? { token, expiresAt } : {}),
  };
});
