import "server-only";
import { db } from "@/server/db";
import { ApiError } from "@/server/http";

/**
 * Fixed-window limiter stored in the database, so it works across serverless instances.
 * Throws 429 when `limit` is exceeded within `windowSec`.
 */
export async function rateLimit(key: string, limit: number, windowSec: number) {
  const now = new Date();
  const windowStartCutoff = new Date(now.getTime() - windowSec * 1000);
  const row = await db.rateLimit.findUnique({ where: { key } });
  if (!row || row.windowStart < windowStartCutoff) {
    await db.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    });
    return;
  }
  if (row.count >= limit) {
    const retry = Math.ceil((row.windowStart.getTime() + windowSec * 1000 - now.getTime()) / 1000);
    throw new ApiError(429, `Too many attempts. Try again in ${Math.max(retry, 1)} seconds.`, "rate_limited");
  }
  await db.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
}
