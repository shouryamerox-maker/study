import { z } from "zod";
import { questionTypes } from "./schema";

const testCase = z.object({ stdin: z.string().default(""), expected: z.string() });
const rubricItem = z.object({ criterion: z.string().min(1), marks: z.number().positive() });
export type RubricItem = z.infer<typeof rubricItem>;

/**
 * A test question as authored by a teacher (or a seed file). `data` is shown to the
 * student; `answer` (key, expected solutions) and `rubric` are teacher/server-only.
 */
export const assessmentQuestionSchema = z
  .object({
    id: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/).optional(),
    type: z.enum(questionTypes),
    prompt: z.string().min(1, "Question text is required."),
    code: z.string().nullish(),
    marks: z.number().positive("Marks must be positive.").max(100),
    data: z
      .object({
        options: z.array(z.object({ id: z.string().min(1), text: z.string().min(1) })).optional(),
        blanks: z.number().int().positive().optional(),
        starterCode: z.string().nullish(),
        sampleTests: z.array(testCase).optional(),
      })
      .default({}),
    answer: z
      .object({
        correct: z.union([z.string(), z.boolean()]).optional(),
        accepted: z.array(z.array(z.string().min(1)).min(1)).optional(),
        caseSensitive: z.boolean().optional(),
        expected: z.string().optional(),
        hiddenTests: z.array(testCase).optional(),
        tests: z.array(testCase).optional(),
        solutionCode: z.string().optional(),
        correctedCode: z.string().optional(),
        expectedOutput: z.string().optional(),
        errors: z.array(z.string()).optional(),
        modelAnswer: z.string().optional(),
      })
      .default({}),
    rubric: z.array(rubricItem).nullish(),
    explanation: z.string().nullish(),
  })
  .superRefine((q, ctx) => {
    const fail = (message: string, path: string[]) => ctx.addIssue({ code: "custom", message, path });
    if (q.type === "MCQ") {
      const opts = q.data.options ?? [];
      if (opts.length < 2) fail("An MCQ needs at least two options.", ["data", "options"]);
      if (new Set(opts.map((o) => o.id)).size !== opts.length) fail("Option ids must be unique.", ["data", "options"]);
      if (typeof q.answer.correct !== "string" || !opts.some((o) => o.id === q.answer.correct)) fail("Choose the correct option.", ["answer", "correct"]);
    }
    if (q.type === "TRUE_FALSE" && typeof q.answer.correct !== "boolean") fail("Choose true or false as the answer.", ["answer", "correct"]);
    if (q.type === "FILL_BLANK") {
      const n = q.answer.accepted?.length ?? 0;
      if (n === 0) fail("Add at least one accepted answer.", ["answer", "accepted"]);
      const marks = (q.prompt.match(/___/g) ?? []).length;
      if (marks !== n) fail(`The prompt has ${marks} blank(s) (___) but ${n} answer list(s).`, ["answer", "accepted"]);
    }
    if (q.type === "OUTPUT_PREDICTION") {
      if (!q.code) fail("Output prediction needs a code snippet.", ["code"]);
      if (q.answer.expected === undefined) fail("Enter the verified expected output.", ["answer", "expected"]);
    }
    if (q.rubric && q.rubric.length > 0) {
      const sum = q.rubric.reduce((s, r) => s + r.marks, 0);
      if (Math.abs(sum - q.marks) > 1e-9) fail(`Rubric marks (${sum}) must add up to the question marks (${q.marks}).`, ["rubric"]);
    }
  });

export const assessmentSectionSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/).optional(),
  title: z.string().min(1),
  instructions: z.string().nullish(),
  questions: z.array(assessmentQuestionSchema),
});

export const assessmentSettingsSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().max(5000).nullish(),
  instructions: z.string().max(10000).nullish(),
  durationMinutes: z.number().int().min(1).max(600).nullish(),
  availableFrom: z.coerce.date().nullish(),
  dueAt: z.coerce.date().nullish(),
  attemptLimit: z.number().int().min(1).max(20).default(1),
  resultRelease: z.enum(["IMMEDIATE", "AFTER_DUE", "MANUAL"]).default("MANUAL"),
  showAnswerKey: z.boolean().default(true),
  assignToAll: z.boolean().default(false),
  coverage: z.array(z.string()).default([]),
});

export const assessmentDefinitionSchema = assessmentSettingsSchema.extend({
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  courseSlug: z.string(),
  sections: z.array(assessmentSectionSchema).min(1),
});

export type AssessmentQuestionInput = z.input<typeof assessmentQuestionSchema>;
export type AssessmentQuestionDef = z.infer<typeof assessmentQuestionSchema>;
export type AssessmentDefinition = z.input<typeof assessmentDefinitionSchema>;

/** Immutable snapshot stored on AssessmentVersion and used for every attempt. */
export interface AssessmentSnapshot {
  title: string;
  instructions: string | null;
  totalMarks: number;
  sections: {
    id: string;
    title: string;
    instructions: string | null;
    questions: (AssessmentQuestionDef & { id: string; number: number })[];
  }[];
}

export function totalMarks(sections: { questions: { marks: number }[] }[]) {
  return Math.round(sections.reduce((s, sec) => s + sec.questions.reduce((a, q) => a + q.marks, 0), 0) * 100) / 100;
}
