import { api } from "@/server/http";
import { latestResults, practiceQuestions, toStudentQuestion } from "@/server/services/practice";
import { practiceStats } from "@/server/services/learning";

/** GET /api/v1/practice?lessonId=…|chapterId=…|mode=revision */
export const GET = api("user", async ({ req, user }) => {
  const sp = req.nextUrl.searchParams;
  const mode = sp.get("mode");
  let where = {};
  if (mode === "revision") {
    const stats = await practiceStats(user.id);
    where = { id: { in: stats.incorrectQuestionIds } };
  } else if (sp.get("lessonId")) where = { lessonId: sp.get("lessonId")! };
  else if (sp.get("chapterId")) where = { chapterId: sp.get("chapterId")! };
  const qs = await practiceQuestions(where);
  const latest = await latestResults(user.id, qs.map((q) => q.id));
  return { questions: qs.map((q) => ({ ...toStudentQuestion(q), lastResult: latest.get(q.id) ?? null })) };
});
