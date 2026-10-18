import { api, parseBody } from "@/server/http";
import { db } from "@/server/db";
import { profileSchema } from "@/lib/validation";

/** Students may edit only these fields — never role, status, email or marks. */
export const PATCH = api("user", async ({ req, user }) => {
  const body = await parseBody(req, profileSchema);
  const updated = await db.user.update({
    where: { id: user.id },
    data: { name: body.name, bio: body.bio ?? null, avatarColor: body.avatarColor ?? undefined },
    select: { id: true, name: true, bio: true, avatarColor: true },
  });
  return { user: updated };
});
