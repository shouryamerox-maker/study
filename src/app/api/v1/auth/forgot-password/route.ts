import { headers } from "next/headers";
import { api, parseBody } from "@/server/http";
import { forgotSchema } from "@/lib/validation";
import { db } from "@/server/db";
import { clientIp } from "@/server/auth/session";
import { rateLimit } from "@/server/rate-limit";
import { createResetLink } from "@/server/services/accounts";
import { mailConfigured, sendMail } from "@/server/mail";

/** Always responds the same way so the endpoint cannot be used to discover accounts. */
export const POST = api("public", async ({ req }) => {
  const ip = clientIp(await headers());
  await rateLimit(`forgot:${ip}`, 5, 15 * 60);
  const { email } = await parseBody(req, forgotSchema);
  const user = await db.user.findUnique({ where: { email } });
  if (user && user.status === "ACTIVE") {
    const link = await createResetLink(user.id);
    await sendMail(
      user.email,
      "Reset your Studyline password",
      `Hi ${user.name},\n\nUse this link to set a new password (valid for 1 hour):\n${link}\n\nIf you did not request this, you can ignore this email.`,
    );
  }
  return {
    ok: true,
    emailEnabled: mailConfigured(),
  };
});
