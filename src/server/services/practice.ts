import "server-only";
import type { Prisma, Question } from "@prisma/client";
import { db } from "@/server/db";

/** Practice question as sent to a student: no answer key. */
export function toStudentQuestion(q: Pick<Question, "id" | "slug" | "type" | "prompt" | "code" | "data" | "hint" | "lessonId" | "chapterId">) {
  const data = q.data as { options?: { id: string; text: string }[]; blanks?: number; starterCode?: string | null; sampleTests?: { stdin: string; expected: string }[] };
  return {
    id: q.id,
    slug: q.slug,
    type: q.type,
    prompt: q.prompt,
    code: q.code,
    hint: q.hint,
    lessonId: q.lessonId,
    chapterId: q.chapterId,
    options: data.options ?? null,
    blanks: data.blanks ?? null,
    starterCode: data.starterCode ?? null,
    sampleTests: data.sampleTests ?? null,
  };
}
export type StudentQuestion = ReturnType<typeof toStudentQuestion>;

/** The student's most recent result per question (for showing "solved" / "try again"). */
export async function latestResults(userId: string, questionIds: string[]) {
  if (questionIds.length === 0) return new Map<string, boolean>();
  const rows = await db.practiceAttempt.findMany({
    where: { userId, questionId: { in: questionIds } },
    orderBy: { createdAt: "asc" },
    select: { questionId: true, isCorrect: true },
  });
  const m = new Map<string, boolean>();
  for (const r of rows) m.set(r.questionId, r.isCorrect);
  return m;
}

export async function practiceQuestions(where: Prisma.QuestionWhereInput) {
  return db.question.findMany({ where, orderBy: [{ chapter: { order: "asc" } }, { order: "asc" }] });
}
