import { describe, expect, it } from "vitest";
import def from "../content/assessments/c-fundamentals-pointers-50";
import { assessmentDefinitionSchema, totalMarks } from "@/lib/content/assessment-schema";
import { gradeResponse, type AnswerKey } from "@/lib/grading";

const parsed = assessmentDefinitionSchema.parse(def);
const questions = parsed.sections.flatMap((s) => s.questions);

describe("C Fundamentals & Pointers — 50 marks", () => {
  it("is valid and totals exactly 50 marks over 28 questions", () => {
    expect(totalMarks(parsed.sections)).toBe(50);
    expect(questions).toHaveLength(28);
  });

  it("follows the required section distribution", () => {
    const dist = parsed.sections.map((s) => [s.questions.length, s.questions.reduce((a, q) => a + q.marks, 0), s.questions[0].type]);
    expect(dist).toEqual([
      [6, 6, "MCQ"],
      [10, 10, "FILL_BLANK"],
      [6, 12, "OUTPUT_PREDICTION"],
      [3, 9, "DEBUGGING"],
      [2, 8, "SHORT_ANSWER"],
      [1, 5, "CODE_WRITING"],
    ]);
  });

  it("has unique stable question ids", () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every(Boolean)).toBe(true);
  });

  it("gives every manual question a rubric matching its marks", () => {
    for (const q of questions.filter((q) => ["DEBUGGING", "SHORT_ANSWER", "CODE_WRITING"].includes(q.type))) {
      expect(q.rubric?.reduce((s, r) => s + r.marks, 0)).toBe(q.marks);
    }
  });

  it("auto-grades a perfect objective paper to 28 marks", () => {
    let score = 0;
    for (const q of questions) {
      const key = { type: q.type, ...q.answer } as AnswerKey;
      let response: unknown = null;
      if (q.type === "MCQ") response = { optionId: q.answer.correct };
      if (q.type === "FILL_BLANK") response = { blanks: q.answer.accepted!.map((a) => a[0]) };
      if (q.type === "OUTPUT_PREDICTION") response = { text: q.answer.expected };
      if (!response) continue;
      score += gradeResponse(q.type, key, response, q.marks).score ?? 0;
    }
    expect(score).toBe(28);
  });

  it("does not accept wrong-case C keywords where case matters", () => {
    const b10 = questions.find((q) => q.id === "cf50-b10")!;
    expect(gradeResponse("FILL_BLANK", { type: "FILL_BLANK", ...b10.answer } as AnswerKey, { blanks: ["null"] }, 1).score).toBe(0);
  });
});
