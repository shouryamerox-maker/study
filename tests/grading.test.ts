import { describe, expect, it } from "vitest";
import {
  attemptTotals,
  gradeResponse,
  normalizeOutput,
  outputsMatch,
  percent,
  statusForManualScore,
  validateManualScore,
} from "@/lib/grading";

describe("MCQ / true-false", () => {
  it("awards full marks only for the correct option", () => {
    expect(gradeResponse("MCQ", { type: "MCQ", correct: "b" }, { optionId: "b" }, 1)).toEqual({ status: "CORRECT", score: 1 });
    expect(gradeResponse("MCQ", { type: "MCQ", correct: "b" }, { optionId: "a" }, 1)).toEqual({ status: "INCORRECT", score: 0 });
  });
  it("treats a missing answer as unanswered", () => {
    expect(gradeResponse("MCQ", { type: "MCQ", correct: "b" }, {}, 1)).toEqual({ status: "UNANSWERED", score: 0 });
    expect(gradeResponse("MCQ", { type: "MCQ", correct: "b" }, null, 1)).toEqual({ status: "UNANSWERED", score: 0 });
  });
  it("grades true/false", () => {
    expect(gradeResponse("TRUE_FALSE", { type: "TRUE_FALSE", correct: false }, { value: false }, 1).score).toBe(1);
    expect(gradeResponse("TRUE_FALSE", { type: "TRUE_FALSE", correct: false }, { value: true }, 1).score).toBe(0);
  });
});

describe("fill in the blank", () => {
  const key = { type: "FILL_BLANK" as const, accepted: [["&", "ampersand"]] };
  it("ignores harmless whitespace and case", () => {
    expect(gradeResponse("FILL_BLANK", key, { blanks: ["  & "] }, 1).score).toBe(1);
    expect(gradeResponse("FILL_BLANK", key, { blanks: ["Ampersand"] }, 1).score).toBe(1);
  });
  it("rejects semantically different answers", () => {
    expect(gradeResponse("FILL_BLANK", key, { blanks: ["*"] }, 1)).toMatchObject({ status: "INCORRECT", score: 0 });
    expect(gradeResponse("FILL_BLANK", key, { blanks: ["&&"] }, 1).score).toBe(0);
  });
  it("treats whitespace inside code tokens as insignificant", () => {
    const k = { type: "FILL_BLANK" as const, accepted: [["int *p"]] };
    expect(gradeResponse("FILL_BLANK", k, { blanks: ["int* p"] }, 1).score).toBe(1);
    expect(gradeResponse("FILL_BLANK", k, { blanks: ["int*p"] }, 1).score).toBe(1);
  });
  it("respects case-sensitive keys", () => {
    const k = { type: "FILL_BLANK" as const, accepted: [["NULL"]], caseSensitive: true };
    expect(gradeResponse("FILL_BLANK", k, { blanks: ["null"] }, 1).score).toBe(0);
    expect(gradeResponse("FILL_BLANK", k, { blanks: ["NULL"] }, 1).score).toBe(1);
  });
  it("gives proportional partial credit for multi-blank questions", () => {
    const k = { type: "FILL_BLANK" as const, accepted: [["a"], ["b"]] };
    expect(gradeResponse("FILL_BLANK", k, { blanks: ["a", "x"] }, 2)).toMatchObject({ status: "PARTIAL", score: 1, blankResults: [true, false] });
  });
});

describe("output prediction", () => {
  it("normalises line endings and trailing whitespace only", () => {
    expect(normalizeOutput("a \r\nb\t\n\n")).toBe("a\nb");
    expect(outputsMatch("10 20\n", "10 20")).toBe(true);
    expect(outputsMatch("10  20", "10 20")).toBe(false);
    expect(outputsMatch("1020", "10 20")).toBe(false);
  });
  it("grades predicted output", () => {
    const key = { type: "OUTPUT_PREDICTION" as const, expected: "x = 5\ny = 6" };
    expect(gradeResponse("OUTPUT_PREDICTION", key, { text: "x = 5\r\ny = 6\n" }, 2).score).toBe(2);
    expect(gradeResponse("OUTPUT_PREDICTION", key, { text: "x = 5" }, 2).score).toBe(0);
  });
});

describe("manual questions", () => {
  it("never silently awards marks to answered subjective questions", () => {
    expect(gradeResponse("SHORT_ANSWER", { type: "SHORT_ANSWER" }, { text: "Because..." }, 4)).toEqual({ status: "PENDING_REVIEW", score: null });
    expect(gradeResponse("CODE_WRITING", { type: "CODE_WRITING" }, { code: "int main(){}" }, 5).status).toBe("PENDING_REVIEW");
    expect(gradeResponse("DEBUGGING", { type: "DEBUGGING" }, { code: "fixed" }, 3).score).toBeNull();
  });
  it("scores unanswered subjective questions as zero without review", () => {
    expect(gradeResponse("LONG_ANSWER", { type: "LONG_ANSWER" }, { text: "   " }, 5)).toEqual({ status: "UNANSWERED", score: 0 });
  });
  it("validates teacher marks", () => {
    expect(validateManualScore(2.5, 4)).toBeNull();
    expect(validateManualScore(4.5, 4)).toMatch(/exceed/);
    expect(validateManualScore(-1, 4)).toMatch(/negative/);
    expect(validateManualScore(1.3, 4)).toMatch(/0.25/);
    expect(statusForManualScore(4, 4)).toBe("CORRECT");
    expect(statusForManualScore(2, 4)).toBe("PARTIAL");
    expect(statusForManualScore(0, 4)).toBe("INCORRECT");
  });
});

describe("attempt totals", () => {
  it("sums graded items and flags pending ones", () => {
    const t = attemptTotals([
      { status: "CORRECT", score: 1 },
      { status: "PARTIAL", score: 1.5 },
      { status: "PENDING_REVIEW", score: null },
      { status: "UNANSWERED", score: 0 },
    ]);
    expect(t).toEqual({ score: 2.5, pending: 1, gradingStatus: "PENDING_REVIEW" });
    expect(attemptTotals([{ status: "CORRECT", score: 50 }]).gradingStatus).toBe("GRADED");
    expect(percent(37.5, 50)).toBe(75);
  });
});
