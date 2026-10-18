import "server-only";
import type { EventType, Prisma } from "@prisma/client";
import { db } from "@/server/db";

export async function logEvent(
  userId: string,
  type: EventType,
  data: { courseId?: string; lessonId?: string; refId?: string; label?: string; meta?: Prisma.InputJsonValue } = {},
) {
  await db.learningEvent.create({ data: { userId, type, ...data } });
}
