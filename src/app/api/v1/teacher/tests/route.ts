import { z } from "zod";
import { api, notFound, parseBody } from "@/server/http";
import { db } from "@/server/db";
import { assessmentSettingsSchema } from "@/lib/content/assessment-schema";
import { saveAssessmentDraft } from "@/server/assessments/definition";

export const GET = api("staff", async () => {
  const tests = await db.assessment.findMany({
    orderBy: { updatedAt: "desc" },
    include: { course: { select: { title: true } }, currentVersion: { select: { version: true, totalMarks: true } }, _count: { select: { attempts: true } } },
  });
  return { tests };
});

/** Creates a draft test with one empty section. */
export const POST = api("staff", async ({ req, user }) => {
  const body = await parseBody(req, z.object({ courseId: z.string(), title: z.string().trim().min(3).max(200) }));
  const course = await db.course.findUnique({ where: { id: body.courseId } });
  if (!course) throw notFound("Course");
  const a = await saveAssessmentDraft(db, {
    courseId: course.id,
    createdById: user.id,
    settings: assessmentSettingsSchema.parse({ title: body.title }),
    sections: [{ title: "Section A", instructions: null, questions: [] }],
  });
  return { id: a.id };
});
