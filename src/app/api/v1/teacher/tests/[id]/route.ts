import { z } from "zod";
import { api, notFound, parseBody } from "@/server/http";
import { db } from "@/server/db";
import { assessmentSectionSchema, assessmentSettingsSchema, totalMarks } from "@/lib/content/assessment-schema";
import { loadDraft, saveAssessmentDraft } from "@/server/assessments/definition";

/** Full editable definition including answer keys (staff only). */
export const GET = api<{ id: string }>("staff", async ({ params }) => {
  const exists = await db.assessment.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!exists) throw notFound("Test");
  return loadDraft(db, params.id);
});

const body = z.object({
  settings: assessmentSettingsSchema,
  sections: z.array(assessmentSectionSchema).min(1, "A test needs at least one section."),
});

/** Saves the draft. Published versions (and attempts made on them) are not affected until re-published. */
export const PUT = api<{ id: string }>("staff", async ({ req, params, user }) => {
  const a = await db.assessment.findUnique({ where: { id: params.id } });
  if (!a) throw notFound("Test");
  const input = await parseBody(req, body);
  await saveAssessmentDraft(db, { assessmentId: a.id, courseId: a.courseId, createdById: user.id, settings: input.settings, sections: input.sections });
  return { ok: true, totalMarks: totalMarks(input.sections), savedAt: new Date() };
});

export const DELETE = api<{ id: string }>("staff", async ({ params }) => {
  const a = await db.assessment.findUnique({ where: { id: params.id }, include: { _count: { select: { attempts: true } } } });
  if (!a) throw notFound("Test");
  if (a._count.attempts > 0) {
    // Never destroy student submissions — archive instead.
    await db.assessment.update({ where: { id: a.id }, data: { status: "ARCHIVED" } });
    return { archived: true };
  }
  await db.assessment.update({ where: { id: a.id }, data: { currentVersionId: null } });
  await db.assessment.delete({ where: { id: a.id } });
  return { deleted: true };
});
