import "server-only";
import { z } from "zod";
import type { Assessment, Attempt, Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { ApiError, badRequest, conflict, forbidden, notFound } from "@/server/http";
import { logEvent } from "@/server/events";
import type { SessionUser } from "@/server/auth/session";
import type { AssessmentSnapshot } from "@/lib/content/assessment-schema";
import {
  attemptTotals,
  gradeResponse,
  statusForManualScore,
  validateManualScore,
  type AnswerKey,
  type ResponseStatus,
} from "@/lib/grading";
import { attemptDeadline, canStart, isPastDeadline, resultsVisible, startBlockMessage } from "@/lib/assessment-rules";

export type SnapshotQuestion = AssessmentSnapshot["sections"][number]["questions"][number];

export const responseInputSchema = z
  .object({
    optionId: z.string().max(40).optional(),
    value: z.boolean().optional(),
    blanks: z.array(z.string().max(500)).max(20).optional(),
    text: z.string().max(20000).optional(),
    code: z.string().max(64000).optional(),
  })
  .strict();

export function snapshotOf(v: { snapshot: Prisma.JsonValue }) {
  return v.snapshot as unknown as AssessmentSnapshot;
}

export function allQuestions<Q>(s: { sections: { questions: Q[] }[] }): Q[] {
  return s.sections.flatMap((sec) => sec.questions);
}

/** Removes answer keys, rubrics and explanations before anything is sent to a student. */
export function studentSafeSnapshot(s: AssessmentSnapshot) {
  return {
    title: s.title,
    instructions: s.instructions,
    totalMarks: s.totalMarks,
    sections: s.sections.map((sec) => ({
      id: sec.id,
      title: sec.title,
      instructions: sec.instructions,
      questions: sec.questions.map((q) => ({
        id: q.id,
        number: q.number,
        type: q.type,
        prompt: q.prompt,
        code: q.code ?? null,
        marks: q.marks,
        data: {
          options: q.data.options,
          blanks: q.type === "FILL_BLANK" ? (q.answer.accepted?.length ?? q.data.blanks ?? 1) : undefined,
          starterCode: q.data.starterCode ?? null,
          sampleTests: q.data.sampleTests,
        },
      })),
    })),
  };
}
export type StudentSnapshot = ReturnType<typeof studentSafeSnapshot>;

export function answerKeyOf(q: SnapshotQuestion): AnswerKey {
  return { type: q.type, ...q.answer } as AnswerKey;
}

/* ── Access ─────────────────────────────────────────────────────────── */

/** Assessments this student may see, with any per-assignment due date override. */
export async function assignedAssessments(userId: string) {
  const [groups, enrollments] = await Promise.all([
    db.groupMember.findMany({ where: { userId }, select: { groupId: true } }),
    db.enrollment.findMany({ where: { userId, status: "active" }, select: { courseId: true } }),
  ]);
  const groupIds = groups.map((g) => g.groupId);
  const list = await db.assessment.findMany({
    where: {
      status: { in: ["PUBLISHED", "ARCHIVED"] },
      OR: [
        { assignToAll: true, courseId: { in: enrollments.map((e) => e.courseId) } },
        { assignments: { some: { userId } } },
        ...(groupIds.length ? [{ assignments: { some: { groupId: { in: groupIds } } } }] : []),
      ],
    },
    include: {
      assignments: { where: { OR: [{ userId }, ...(groupIds.length ? [{ groupId: { in: groupIds } }] : [])] } },
      course: { select: { title: true, slug: true } },
      currentVersion: { select: { totalMarks: true } },
    },
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
  });
  return list.map((a) => {
    const overrides = a.assignments.map((x) => x.dueAt).filter((d): d is Date => d != null);
    const dueOverride = overrides.length ? new Date(Math.max(...overrides.map((d) => d.getTime()))) : null;
    return { ...a, effectiveDueAt: dueOverride ?? a.dueAt, dueOverride };
  });
}

export async function requireAssignedAssessment(user: SessionUser, assessmentId: string) {
  const list = await assignedAssessments(user.id);
  const a = list.find((x) => x.id === assessmentId);
  if (!a) throw notFound("Test");
  return a;
}

/* ── Lifecycle ──────────────────────────────────────────────────────── */

export async function startAttempt(user: SessionUser, assessmentId: string) {
  const a = await requireAssignedAssessment(user, assessmentId);
  if (!a.currentVersionId) throw badRequest("This test has not been published.");

  const open = await db.attempt.findFirst({ where: { assessmentId, userId: user.id, status: "IN_PROGRESS" } });
  if (open) {
    if (isPastDeadline(open.deadlineAt)) await submitAttempt(open.id, "AUTO_SUBMITTED");
    else return open; // resume
  }
  const used = await db.attempt.count({ where: { assessmentId, userId: user.id } });
  const block = canStart(a, used, new Date(), a.dueOverride);
  if (block) throw new ApiError(400, startBlockMessage[block], block);

  const version = await db.assessmentVersion.findUniqueOrThrow({ where: { id: a.currentVersionId } });
  const startedAt = new Date();
  try {
    const attempt = await db.attempt.create({
      data: {
        assessmentId,
        versionId: version.id,
        userId: user.id,
        attemptNumber: used + 1,
        startedAt,
        deadlineAt: attemptDeadline(a, startedAt, a.dueOverride),
        maxScore: version.totalMarks,
      },
    });
    await logEvent(user.id, "TEST_STARTED", { courseId: a.courseId, refId: attempt.id, label: a.title });
    return attempt;
  } catch (e) {
    // Unique (assessment, user, attemptNumber) — a double click created it already.
    if ((e as { code?: string }).code === "P2002") {
      const existing = await db.attempt.findFirst({ where: { assessmentId, userId: user.id, status: "IN_PROGRESS" } });
      if (existing) return existing;
    }
    throw e;
  }
}

async function loadOwnAttempt(user: SessionUser, attemptId: string) {
  const attempt = await db.attempt.findUnique({ where: { id: attemptId }, include: { version: true, assessment: true } });
  if (!attempt || attempt.userId !== user.id) throw notFound("Attempt");
  return attempt;
}

export async function getAttemptForStudent(user: SessionUser, attemptId: string) {
  let attempt = await loadOwnAttempt(user, attemptId);
  if (attempt.status === "IN_PROGRESS" && isPastDeadline(attempt.deadlineAt)) {
    await submitAttempt(attempt.id, "AUTO_SUBMITTED");
    attempt = await loadOwnAttempt(user, attemptId);
  }
  const responses = await db.attemptResponse.findMany({
    where: { attemptId },
    select: { questionId: true, response: true, markedForReview: true, savedAt: true },
  });
  return { attempt, snapshot: studentSafeSnapshot(snapshotOf(attempt.version)), responses };
}

export async function saveResponse(
  user: SessionUser,
  attemptId: string,
  input: { questionId: string; response?: z.infer<typeof responseInputSchema> | null; markedForReview?: boolean },
) {
  const attempt = await loadOwnAttempt(user, attemptId);
  if (attempt.status !== "IN_PROGRESS") throw conflict("This attempt has already been submitted.");
  if (isPastDeadline(attempt.deadlineAt)) {
    await submitAttempt(attempt.id, "AUTO_SUBMITTED");
    throw conflict("Time is up. Your saved answers were submitted automatically.");
  }
  const q = allQuestions(snapshotOf(attempt.version)).find((x) => x.id === input.questionId);
  if (!q) throw badRequest("Unknown question.");

  const data: Prisma.AttemptResponseUncheckedUpdateInput = { savedAt: new Date() };
  if (input.response !== undefined) data.response = (input.response ?? undefined) as Prisma.InputJsonValue | undefined;
  if (input.markedForReview !== undefined) data.markedForReview = input.markedForReview;

  const row = await db.attemptResponse.upsert({
    where: { attemptId_questionId: { attemptId, questionId: q.id } },
    create: {
      attemptId,
      questionId: q.id,
      response: (input.response ?? undefined) as Prisma.InputJsonValue | undefined,
      markedForReview: input.markedForReview ?? false,
    },
    update: data,
    select: { savedAt: true },
  });
  return { savedAt: row.savedAt };
}

/**
 * Finalises an attempt exactly once (concurrent/duplicate submits are no-ops), grades
 * objective questions and marks the rest for review — all in one transaction.
 */
export async function submitAttempt(attemptId: string, mode: "SUBMITTED" | "AUTO_SUBMITTED") {
  const result = await db.$transaction(async (tx) => {
    const claimed = await tx.attempt.updateMany({
      where: { id: attemptId, status: "IN_PROGRESS" },
      data: { status: mode, submittedAt: new Date() },
    });
    const attempt = await tx.attempt.findUniqueOrThrow({ where: { id: attemptId }, include: { version: true } });
    if (claimed.count === 0) return { attempt, alreadySubmitted: true };

    const questions = allQuestions(snapshotOf(attempt.version));
    const existing = await tx.attemptResponse.findMany({ where: { attemptId } });
    const byQ = new Map(existing.map((r) => [r.questionId, r]));
    const items: { status: ResponseStatus; score: number | null }[] = [];

    for (const q of questions) {
      const r = byQ.get(q.id);
      const g = gradeResponse(q.type, answerKeyOf(q), r?.response ?? null, q.marks);
      items.push(g);
      const fields = { autoScore: g.score, score: g.score, status: g.status, evaluation: g.blankResults ? { blankResults: g.blankResults } : undefined };
      if (r) await tx.attemptResponse.update({ where: { id: r.id }, data: fields });
      else await tx.attemptResponse.create({ data: { attemptId, questionId: q.id, ...fields } });
    }
    const totals = attemptTotals(items);
    const updated = await tx.attempt.update({
      where: { id: attemptId },
      data: { score: totals.score, gradingStatus: totals.gradingStatus },
    });
    return { attempt: updated, alreadySubmitted: false };
  });

  if (!result.alreadySubmitted) {
    const a = await db.assessment.findUnique({ where: { id: result.attempt.assessmentId }, select: { title: true, courseId: true } });
    await logEvent(result.attempt.userId, "TEST_SUBMITTED", {
      courseId: a?.courseId,
      refId: attemptId,
      label: a?.title,
      meta: { mode },
    });
  }
  return result;
}

/** Lazily auto-submits attempts whose time has run out (no cron needed on free hosting). */
export async function finalizeExpiredAttempts(where: Prisma.AttemptWhereInput = {}) {
  const cutoff = new Date(Date.now() - 30_000);
  const expired = await db.attempt.findMany({
    where: { ...where, status: "IN_PROGRESS", deadlineAt: { lt: cutoff } },
    select: { id: true },
    take: 200,
  });
  for (const e of expired) await submitAttempt(e.id, "AUTO_SUBMITTED");
  return expired.length;
}

/* ── Results ────────────────────────────────────────────────────────── */

export function canStudentSeeResults(assessment: Assessment, attempt: Attempt) {
  return resultsVisible(assessment, attempt.status !== "IN_PROGRESS");
}

export async function studentResult(user: SessionUser, attemptId: string) {
  const attempt = await loadOwnAttempt(user, attemptId);
  const submitted = attempt.status !== "IN_PROGRESS";
  if (!submitted) throw forbidden("Submit the test to see results.");
  const visible = canStudentSeeResults(attempt.assessment, attempt);
  const snapshot = snapshotOf(attempt.version);
  if (!visible) return { attempt, visible: false as const };

  const responses = await db.attemptResponse.findMany({ where: { attemptId } });
  const byQ = new Map(responses.map((r) => [r.questionId, r]));
  const showKey = attempt.assessment.showAnswerKey && attempt.gradingStatus === "GRADED";
  const safe = studentSafeSnapshot(snapshot);
  const fullById = new Map(allQuestions(snapshot).map((q) => [q.id, q]));
  return {
    attempt,
    visible: true as const,
    showKey,
    snapshot: safe,
    items: allQuestions(safe).map((q) => {
      const r = byQ.get(q.id);
      const full = fullById.get(q.id)!;
      return {
        questionId: q.id,
        response: r?.response ?? null,
        score: r?.status === "PENDING_REVIEW" ? null : (r?.score ?? 0),
        status: (r?.status ?? "UNANSWERED") as ResponseStatus,
        feedback: r?.feedback ?? null,
        blankResults: (r?.evaluation as { blankResults?: boolean[] } | null)?.blankResults ?? null,
        key: showKey ? studentVisibleKey(full) : null,
      };
    }),
  };
}

/** What a student may see of the answer key after results are released. */
function studentVisibleKey(q: SnapshotQuestion) {
  return {
    correct: q.answer.correct ?? null,
    accepted: q.answer.accepted ?? null,
    expected: q.answer.expected ?? null,
    modelAnswer: q.answer.modelAnswer ?? null,
    correctedCode: q.answer.correctedCode ?? null,
    solutionCode: q.answer.solutionCode ?? null,
    explanation: q.explanation ?? null,
  };
}

/* ── Teacher grading ────────────────────────────────────────────────── */

export async function recomputeAttempt(tx: Prisma.TransactionClient, attemptId: string) {
  const rs = await tx.attemptResponse.findMany({ where: { attemptId }, select: { status: true, score: true } });
  const totals = attemptTotals(rs);
  return tx.attempt.update({ where: { id: attemptId }, data: { score: totals.score, gradingStatus: totals.gradingStatus } });
}

export async function gradeAttemptResponse(
  grader: SessionUser,
  responseId: string,
  input: { score: number; feedback?: string | null; reason?: string | null },
) {
  return db.$transaction(async (tx) => {
    const r = await tx.attemptResponse.findUnique({ where: { id: responseId }, include: { attempt: { include: { version: true } } } });
    if (!r) throw notFound("Response");
    if (r.attempt.status === "IN_PROGRESS") throw conflict("This attempt has not been submitted yet.");
    const q = allQuestions(snapshotOf(r.attempt.version)).find((x) => x.id === r.questionId);
    if (!q) throw notFound("Question");

    const err = validateManualScore(input.score, q.marks);
    if (err) throw badRequest(err);

    const previouslyScored = r.status !== "PENDING_REVIEW" && r.score != null;
    const changing = previouslyScored && Math.abs((r.score ?? 0) - input.score) > 1e-9;
    // Changing an automatic mark or a mark already given requires a recorded reason.
    if (changing && !input.reason?.trim()) throw badRequest("Enter a reason for changing an existing mark.");

    const updated = await tx.attemptResponse.update({
      where: { id: r.id },
      data: {
        score: input.score,
        status: statusForManualScore(input.score, q.marks),
        feedback: input.feedback ?? r.feedback,
        gradedById: grader.id,
        gradedAt: new Date(),
      },
    });
    if (!previouslyScored || changing) {
      await tx.gradeAudit.create({
        data: {
          attemptId: r.attemptId,
          responseId: r.id,
          graderId: grader.id,
          kind: previouslyScored ? (r.gradedById ? "regrade" : "override") : "grade",
          previousScore: previouslyScored ? r.score : null,
          newScore: input.score,
          reason: input.reason?.trim() || null,
        },
      });
    }
    const attempt = await recomputeAttempt(tx, r.attemptId);
    return { response: updated, attempt };
  });
}
