/**
 * Pure grading logic — no database, no framework. Used by practice checks, test
 * submission and the teacher review screen, and covered by unit tests.
 */
import type { QuestionType } from "@/lib/content/schema";

export type ResponseStatus = "UNANSWERED" | "CORRECT" | "INCORRECT" | "PARTIAL" | "PENDING_REVIEW";

export interface TestCase {
  stdin: string;
  expected: string;
}

export type AnswerKey =
  | { type: "MCQ"; correct: string }
  | { type: "TRUE_FALSE"; correct: boolean }
  | { type: "FILL_BLANK"; accepted: string[][]; caseSensitive?: boolean }
  | { type: "OUTPUT_PREDICTION"; expected: string }
  | { type: "CODE_WRITING"; hiddenTests?: TestCase[]; sampleTests?: TestCase[]; solutionCode?: string }
  | { type: "DEBUGGING"; correctedCode?: string; expectedOutput?: string; tests?: TestCase[]; errors?: string[] }
  | { type: "SHORT_ANSWER"; modelAnswer?: string }
  | { type: "LONG_ANSWER"; modelAnswer?: string };

export type StudentResponse =
  | { optionId?: string }
  | { value?: boolean }
  | { blanks?: string[] }
  | { text?: string; code?: string };

export interface GradeResult {
  status: ResponseStatus;
  /** null = needs a teacher (manual question that was answered). */
  score: number | null;
  /** Per-blank correctness for fill-in-the-blank. */
  blankResults?: boolean[];
}

export const MANUAL_TYPES: QuestionType[] = ["SHORT_ANSWER", "LONG_ANSWER", "DEBUGGING", "CODE_WRITING"];
export const isManualType = (t: QuestionType) => MANUAL_TYPES.includes(t);

const round2 = (n: number) => Math.round(n * 100) / 100;

export function normalizeBlank(s: string, caseSensitive = false) {
  const v = s.trim().replace(/\s+/g, " ");
  return caseSensitive ? v : v.toLowerCase();
}

function blankMatches(given: string, accepted: string[], caseSensitive: boolean) {
  const g = normalizeBlank(given, caseSensitive);
  if (!g) return false;
  const gNoSpace = g.replace(/\s/g, "");
  return accepted.some((a) => {
    const n = normalizeBlank(a, caseSensitive);
    // Whitespace inside code tokens is not meaningful ("int *p" == "int* p").
    return n === g || n.replace(/\s/g, "") === gNoSpace;
  });
}

/** Line-ending, trailing-space and surrounding-blank-line insensitive; otherwise exact. */
export function normalizeOutput(s: string) {
  return s
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/, ""))
    .join("\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "");
}

export function outputsMatch(actual: string, expected: string) {
  return normalizeOutput(actual) === normalizeOutput(expected);
}

export function isEmptyResponse(type: QuestionType, r: unknown): boolean {
  if (r == null || typeof r !== "object") return true;
  const o = r as Record<string, unknown>;
  switch (type) {
    case "MCQ":
      return typeof o.optionId !== "string" || o.optionId === "";
    case "TRUE_FALSE":
      return typeof o.value !== "boolean";
    case "FILL_BLANK":
      return !Array.isArray(o.blanks) || o.blanks.every((b) => typeof b !== "string" || b.trim() === "");
    default: {
      const text = typeof o.text === "string" ? o.text.trim() : "";
      const code = typeof o.code === "string" ? o.code.trim() : "";
      return text === "" && code === "";
    }
  }
}

/**
 * Grades one response. Objective types are graded fully; manual types return
 * PENDING_REVIEW (never silently awarded marks) unless unanswered.
 */
export function gradeResponse(type: QuestionType, key: AnswerKey, response: unknown, marks: number): GradeResult {
  if (isEmptyResponse(type, response)) return { status: "UNANSWERED", score: 0 };
  const r = response as Record<string, unknown>;

  switch (type) {
    case "MCQ": {
      const ok = key.type === "MCQ" && r.optionId === key.correct;
      return { status: ok ? "CORRECT" : "INCORRECT", score: ok ? marks : 0 };
    }
    case "TRUE_FALSE": {
      const ok = key.type === "TRUE_FALSE" && r.value === key.correct;
      return { status: ok ? "CORRECT" : "INCORRECT", score: ok ? marks : 0 };
    }
    case "FILL_BLANK": {
      if (key.type !== "FILL_BLANK") return { status: "PENDING_REVIEW", score: null };
      const given = Array.isArray(r.blanks) ? (r.blanks as unknown[]) : [];
      const results = key.accepted.map((acc, i) => blankMatches(typeof given[i] === "string" ? (given[i] as string) : "", acc, key.caseSensitive ?? false));
      const correct = results.filter(Boolean).length;
      const score = round2((marks * correct) / key.accepted.length);
      const status: ResponseStatus = correct === results.length ? "CORRECT" : correct === 0 ? "INCORRECT" : "PARTIAL";
      return { status, score, blankResults: results };
    }
    case "OUTPUT_PREDICTION": {
      const ok = key.type === "OUTPUT_PREDICTION" && outputsMatch(String(r.text ?? ""), key.expected);
      return { status: ok ? "CORRECT" : "INCORRECT", score: ok ? marks : 0 };
    }
    default:
      return { status: "PENDING_REVIEW", score: null };
  }
}

/** Validates a teacher-entered mark: within [0, max] in steps of 0.25. */
export function validateManualScore(score: number, max: number): string | null {
  if (!Number.isFinite(score)) return "Enter a number.";
  if (score < 0) return "Marks cannot be negative.";
  if (score > max) return `Marks cannot exceed ${max}.`;
  if (Math.abs(score * 4 - Math.round(score * 4)) > 1e-9) return "Use steps of 0.25 marks.";
  return null;
}

export function statusForManualScore(score: number, max: number): ResponseStatus {
  if (score >= max) return "CORRECT";
  if (score <= 0) return "INCORRECT";
  return "PARTIAL";
}

export interface ScoredItem {
  status: ResponseStatus;
  score: number | null;
}

/** Totals for an attempt. `pending` > 0 means the total is provisional. */
export function attemptTotals(items: ScoredItem[]) {
  let score = 0;
  let pending = 0;
  for (const it of items) {
    if (it.status === "PENDING_REVIEW" || it.score == null) pending++;
    else score += it.score;
  }
  return { score: round2(score), pending, gradingStatus: pending > 0 ? ("PENDING_REVIEW" as const) : ("GRADED" as const) };
}

export function percent(score: number, max: number) {
  if (max <= 0) return 0;
  return Math.round((score / max) * 1000) / 10;
}
