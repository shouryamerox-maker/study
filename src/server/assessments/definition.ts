/**
 * Saving and publishing assessment definitions. Shared by the teacher editor API and
 * the seed script, so it takes the Prisma client as a parameter (not server-only).
 */
import { randomBytes } from "node:crypto";
import type { Prisma, PrismaClient } from "@prisma/client";
import {
  assessmentSectionSchema,
  assessmentSettingsSchema,
  totalMarks,
  type AssessmentSnapshot,
} from "@/lib/content/assessment-schema";
import type { z } from "zod";

type Settings = z.infer<typeof assessmentSettingsSchema>;
type Section = z.infer<typeof assessmentSectionSchema>;

const newId = (prefix: string) => `${prefix}_${randomBytes(9).toString("hex")}`;

export async function saveAssessmentDraft(
  db: PrismaClient,
  args: { assessmentId?: string; slug?: string; courseId: string; createdById: string; settings: Settings; sections: Section[] },
) {
  const { settings, sections } = args;
  const settingsData = {
    title: settings.title,
    description: settings.description ?? null,
    instructions: settings.instructions ?? null,
    durationMinutes: settings.durationMinutes ?? null,
    availableFrom: settings.availableFrom ?? null,
    dueAt: settings.dueAt ?? null,
    attemptLimit: settings.attemptLimit,
    resultRelease: settings.resultRelease,
    showAnswerKey: settings.showAnswerKey,
    assignToAll: settings.assignToAll,
    coverage: settings.coverage as Prisma.InputJsonValue,
  };

  return db.$transaction(async (tx) => {
    let assessment = args.assessmentId
      ? await tx.assessment.findUniqueOrThrow({ where: { id: args.assessmentId } })
      : args.slug
        ? await tx.assessment.findUnique({ where: { slug: args.slug } })
        : null;

    assessment = assessment
      ? await tx.assessment.update({ where: { id: assessment.id }, data: { ...settingsData, courseId: args.courseId } })
      : await tx.assessment.create({ data: { ...settingsData, slug: args.slug, courseId: args.courseId, createdById: args.createdById } });

    const keepSectionIds: string[] = [];
    const keepQuestionIds: string[] = [];
    for (const [si, s] of sections.entries()) {
      const sectionId = s.id ?? newId("sec");
      keepSectionIds.push(sectionId);
      await tx.assessmentSection.upsert({
        where: { id: sectionId },
        create: { id: sectionId, assessmentId: assessment.id, title: s.title, instructions: s.instructions ?? null, order: si },
        update: { title: s.title, instructions: s.instructions ?? null, order: si, assessmentId: assessment.id },
      });
      for (const [qi, q] of s.questions.entries()) {
        const qid = q.id ?? newId("q");
        keepQuestionIds.push(qid);
        const fields = {
          assessmentId: assessment.id,
          sectionId,
          type: q.type,
          prompt: q.prompt,
          code: q.code ?? null,
          data: q.data as Prisma.InputJsonValue,
          answer: q.answer as Prisma.InputJsonValue,
          rubric: (q.rubric ?? undefined) as Prisma.InputJsonValue | undefined,
          explanation: q.explanation ?? null,
          marks: q.marks,
          order: qi,
        };
        await tx.assessmentQuestion.upsert({ where: { id: qid }, create: { id: qid, ...fields }, update: fields });
      }
    }
    // Draft rows only; published versions keep their own immutable snapshot.
    await tx.assessmentQuestion.deleteMany({ where: { assessmentId: assessment.id, id: { notIn: keepQuestionIds } } });
    await tx.assessmentSection.deleteMany({ where: { assessmentId: assessment.id, id: { notIn: keepSectionIds } } });
    return assessment;
  });
}

/** Loads the editable draft back into definition form. */
export async function loadDraft(db: PrismaClient, assessmentId: string) {
  const a = await db.assessment.findUniqueOrThrow({
    where: { id: assessmentId },
    include: { sections: { orderBy: { order: "asc" }, include: { questions: { orderBy: { order: "asc" } } } } },
  });
  return {
    assessment: a,
    sections: a.sections.map((s) => ({
      id: s.id,
      title: s.title,
      instructions: s.instructions,
      questions: s.questions.map((q) => ({
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        code: q.code,
        marks: q.marks,
        data: q.data as Section["questions"][number]["data"],
        answer: q.answer as Section["questions"][number]["answer"],
        rubric: (q.rubric as Section["questions"][number]["rubric"]) ?? null,
        explanation: q.explanation,
      })),
    })),
  };
}

export async function buildSnapshot(db: PrismaClient, assessmentId: string): Promise<AssessmentSnapshot> {
  const { assessment, sections } = await loadDraft(db, assessmentId);
  let n = 0;
  const parsed = sections.map((s) => assessmentSectionSchema.parse(s));
  return {
    title: assessment.title,
    instructions: assessment.instructions,
    totalMarks: totalMarks(parsed),
    sections: parsed.map((s, i) => ({
      id: s.id ?? sections[i].id,
      title: s.title,
      instructions: s.instructions ?? null,
      questions: s.questions.map((q, j) => ({ ...q, id: q.id ?? sections[i].questions[j].id, number: ++n })),
    })),
  };
}

/**
 * Publishes the current draft as a new immutable version. Unchanged content does not
 * create a new version. Earlier attempts keep pointing at the version they took.
 */
export async function publishAssessment(db: PrismaClient, assessmentId: string) {
  const snapshot = await buildSnapshot(db, assessmentId);
  if (snapshot.sections.every((s) => s.questions.length === 0)) throw new Error("Add at least one question before publishing.");
  return db.$transaction(async (tx) => {
    const latest = await tx.assessmentVersion.findFirst({ where: { assessmentId }, orderBy: { version: "desc" } });
    let versionId = latest?.id;
    if (!latest || JSON.stringify(latest.snapshot) !== JSON.stringify(snapshot)) {
      const v = await tx.assessmentVersion.create({
        data: {
          assessmentId,
          version: (latest?.version ?? 0) + 1,
          totalMarks: snapshot.totalMarks,
          snapshot: snapshot as unknown as Prisma.InputJsonValue,
        },
      });
      versionId = v.id;
    }
    return tx.assessment.update({ where: { id: assessmentId }, data: { status: "PUBLISHED", currentVersionId: versionId } });
  });
}
