import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { api, notFound, parseBody } from "@/server/http";
import { db } from "@/server/db";
import { blocksSchema } from "@/lib/content/schema";

const body = z.object({
  title: z.string().trim().min(1).max(200),
  summary: z.string().max(2000).nullish(),
  estMinutes: z.number().int().min(1).max(600),
  published: z.boolean(),
  blocks: blocksSchema.min(1, "A lesson needs at least one block."),
});

/** Saves lesson content after validating every block against the content schema. */
export const PUT = api<{ id: string }>("staff", async ({ req, params }) => {
  const lesson = await db.lesson.findUnique({ where: { id: params.id } });
  if (!lesson) throw notFound("Lesson");
  const input = await parseBody(req, body);
  const changed = JSON.stringify(lesson.blocks) !== JSON.stringify(input.blocks);
  const updated = await db.lesson.update({
    where: { id: lesson.id },
    data: {
      title: input.title,
      summary: input.summary ?? null,
      estMinutes: input.estMinutes,
      published: input.published,
      blocks: input.blocks as unknown as Prisma.InputJsonValue,
      source: "EDITED",
      ...(changed ? { version: { increment: 1 } } : {}),
    },
  });
  return { version: updated.version, updatedAt: updated.updatedAt };
});
