/**
 * Subject-agnostic content model.
 *
 * Lessons are stored as an ordered list of typed blocks. Every subject (C, Physics,
 * Biology, ...) is built from the same block vocabulary; subject-specific behaviour
 * (e.g. running C code) is attached to blocks, not to page templates.
 *
 * This file is shared by the content importer, the teacher lesson editor (validation)
 * and the lesson renderer. Keep it free of server-only imports.
 */
import { z } from "zod";

const md = z.string().min(1);

export const codeLanguage = z.enum(["c", "cpp", "python", "java", "javascript", "text", "shell"]);
export type CodeLanguage = z.infer<typeof codeLanguage>;

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text: z.string().min(1), level: z.union([z.literal(2), z.literal(3)]).default(2) }),
  z.object({ type: z.literal("markdown"), md }),
  z.object({ type: z.literal("objectives"), items: z.array(z.string().min(1)).min(1) }),
  z.object({ type: z.literal("definition"), term: z.string().min(1), md }),
  z.object({
    type: z.literal("callout"),
    variant: z.enum(["info", "tip", "warning", "exam", "note"]),
    title: z.string().optional(),
    md,
  }),
  z.object({
    type: z.literal("syntax"),
    language: codeLanguage.default("c"),
    code: z.string().min(1),
    md: z.string().optional(),
  }),
  z.object({
    type: z.literal("code"),
    language: codeLanguage.default("c"),
    title: z.string().optional(),
    code: z.string().min(1),
    /** Show a "Run" button that opens the code in the sandboxed runner. */
    runnable: z.boolean().default(false),
    stdin: z.string().optional(),
    /** Verified expected output (shown as "Expected output"). */
    output: z.string().optional(),
    /** Line-by-line or range explanation. `lines` is e.g. "1" or "3-5". */
    walkthrough: z.array(z.object({ lines: z.string().min(1), text: md })).optional(),
  }),
  z.object({ type: z.literal("output"), title: z.string().optional(), text: z.string() }),
  z.object({
    type: z.literal("table"),
    caption: z.string().optional(),
    headers: z.array(z.string()).min(1),
    rows: z.array(z.array(z.string())).min(1),
  }),
  z.object({
    type: z.literal("mistakes"),
    items: z
      .array(
        z.object({
          title: z.string().min(1),
          wrong: z.string().optional(),
          right: z.string().optional(),
          md,
        }),
      )
      .min(1),
  }),
  z.object({ type: z.literal("examPoints"), items: z.array(z.string().min(1)).min(1) }),
  z.object({ type: z.literal("recap"), items: z.array(z.string().min(1)).min(1) }),
  z.object({
    type: z.literal("exercise"),
    id: z.string().min(1),
    kind: z.enum(["write", "predict", "debug", "concept"]),
    title: z.string().min(1),
    prompt: md,
    starterCode: z.string().optional(),
    hint: z.string().optional(),
    solution: z.string().optional(),
    solutionCode: z.string().optional(),
    expectedOutput: z.string().optional(),
  }),
  z.object({ type: z.literal("math"), tex: z.string().min(1), display: z.boolean().default(true), caption: z.string().optional() }),
  z.object({ type: z.literal("image"), src: z.string().min(1), alt: z.string().min(1), caption: z.string().optional() }),
  z.object({
    type: z.literal("diagram"),
    src: z.string().min(1),
    alt: z.string().min(1),
    caption: z.string().optional(),
    /** Labels positioned in percentages of the image box. */
    labels: z.array(z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100), text: z.string().min(1) })).default([]),
  }),
  z.object({
    type: z.literal("workedExample"),
    title: z.string().min(1),
    problem: md,
    steps: z.array(md).min(1),
    answer: md,
  }),
  z.object({ type: z.literal("resource"), title: z.string().min(1), url: z.string().min(1), description: z.string().optional() }),
]);

export type Block = z.infer<typeof blockSchema>;
export type BlockInput = z.input<typeof blockSchema>;
export const blocksSchema = z.array(blockSchema);

/* ------------------------------------------------------------------ */
/* Practice questions (question bank). Answer keys never reach the     */
/* browser before the student submits an attempt.                      */
/* ------------------------------------------------------------------ */

export const questionTypes = [
  "MCQ",
  "TRUE_FALSE",
  "FILL_BLANK",
  "SHORT_ANSWER",
  "OUTPUT_PREDICTION",
  "DEBUGGING",
  "CODE_WRITING",
  "LONG_ANSWER",
] as const;
export type QuestionType = (typeof questionTypes)[number];

const option = z.object({ id: z.string().min(1), text: z.string().min(1) });
const testCase = z.object({ stdin: z.string().default(""), expected: z.string() });

export const practiceQuestionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("MCQ"),
    slug: z.string().min(1),
    prompt: md,
    code: z.string().optional(),
    options: z.array(option).min(2),
    correct: z.string().min(1),
    explanation: z.string().optional(),
    hint: z.string().optional(),
  }),
  z.object({
    type: z.literal("TRUE_FALSE"),
    slug: z.string().min(1),
    prompt: md,
    code: z.string().optional(),
    correct: z.boolean(),
    explanation: z.string().optional(),
    hint: z.string().optional(),
  }),
  z.object({
    type: z.literal("FILL_BLANK"),
    slug: z.string().min(1),
    /** Use "___" once per blank in the prompt. */
    prompt: md,
    code: z.string().optional(),
    /** accepted[i] is the list of accepted answers for blank i. */
    accepted: z.array(z.array(z.string().min(1)).min(1)).min(1),
    caseSensitive: z.boolean().default(false),
    explanation: z.string().optional(),
    hint: z.string().optional(),
  }),
  z.object({
    type: z.literal("OUTPUT_PREDICTION"),
    slug: z.string().min(1),
    prompt: md,
    code: z.string().min(1),
    expected: z.string(),
    explanation: z.string().optional(),
    hint: z.string().optional(),
  }),
  z.object({
    type: z.literal("CODE_WRITING"),
    slug: z.string().min(1),
    prompt: md,
    starterCode: z.string().optional(),
    sampleTests: z.array(testCase).min(1),
    hiddenTests: z.array(testCase).default([]),
    solutionCode: z.string().optional(),
    explanation: z.string().optional(),
    hint: z.string().optional(),
  }),
]);
export type PracticeQuestion = z.infer<typeof practiceQuestionSchema>;
export type PracticeQuestionInput = z.input<typeof practiceQuestionSchema>;

/* ------------------------------------------------------------------ */
/* Course content files (content/<course>/...)                         */
/* ------------------------------------------------------------------ */

export const lessonContentSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  estMinutes: z.number().int().positive().default(15),
  blocks: blocksSchema.min(1),
  practice: z.array(practiceQuestionSchema).default([]),
});

export const topicContentSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  lessons: z.array(lessonContentSchema).min(1),
});

export const chapterContentSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  topics: z.array(topicContentSchema).min(1),
});

export const unitContentSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().optional(),
  chapters: z.array(chapterContentSchema).min(1),
});

export const courseContentSchema = z.object({
  subject: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    kind: z.enum(["PROGRAMMING", "SCIENCE", "GENERAL"]),
    description: z.string().optional(),
  }),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  level: z.string().default("Beginner"),
  /** Language used by runnable code blocks / the playground. Null for non-programming subjects. */
  codeLanguage: codeLanguage.nullable().default(null),
  /** Starter content is clearly labelled until the official syllabus is supplied. */
  isStarterContent: z.boolean().default(true),
  units: z.array(unitContentSchema).min(1),
});

export type LessonContent = z.input<typeof lessonContentSchema>;
export type TopicContent = z.input<typeof topicContentSchema>;
export type ChapterContent = z.input<typeof chapterContentSchema>;
export type UnitContent = z.input<typeof unitContentSchema>;
export type CourseContent = z.input<typeof courseContentSchema>;
