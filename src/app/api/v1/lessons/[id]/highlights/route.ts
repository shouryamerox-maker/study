import { z } from "zod";
import { api, badRequest, notFound, parseBody } from "@/server/http";
import { db } from "@/server/db";
import { rateLimit } from "@/server/rate-limit";

import { HIGHLIGHT_COLORS } from "@/lib/highlights";

const body = z
  .object({
    blockIndex: z.number().int().min(0).max(10000),
    startOffset: z.number().int().min(0),
    endOffset: z.number().int().min(1),
    text: z.string().min(1).max(4000),
    prefix: z.string().max(64).default(""),
    suffix: z.string().max(64).default(""),
    color: z.enum(HIGHLIGHT_COLORS).default("yellow"),
  })
  .refine((b) => b.endOffset > b.startOffset, "Highlight range is empty.");

/** The signed-in student's own highlights for one lesson. Never anyone else's. */
export const GET = api<{ id: string }>("user", async ({ params, user }) => {
  const highlights = await db.highlight.findMany({
    where: { userId: user.id, lessonId: params.id },
    orderBy: [{ blockIndex: "asc" }, { startOffset: "asc" }],
    select: { id: true, blockIndex: true, startOffset: true, endOffset: true, text: true, prefix: true, suffix: true, color: true },
  });
  return { highlights };
});

/** Creates a highlight; highlighting exactly the same range again just changes its colour. */
export const POST = api<{ id: string }>("user", async ({ req, params, user }) => {
  await rateLimit(`highlight:${user.id}`, 120, 60);
  const input = await parseBody(req, body);
  const lesson = await db.lesson.findUnique({ where: { id: params.id }, select: { id: true, published: true } });
  if (!lesson) throw notFound("Lesson");
  if (input.endOffset - input.startOffset > 4000) throw badRequest("That selection is too long to highlight.");
  const highlight = await db.highlight.upsert({
    where: {
      userId_lessonId_blockIndex_startOffset_endOffset: {
        userId: user.id,
        lessonId: lesson.id,
        blockIndex: input.blockIndex,
        startOffset: input.startOffset,
        endOffset: input.endOffset,
      },
    },
    create: { ...input, userId: user.id, lessonId: lesson.id },
    update: { color: input.color },
    select: { id: true, blockIndex: true, startOffset: true, endOffset: true, text: true, prefix: true, suffix: true, color: true },
  });
  return { highlight };
});
