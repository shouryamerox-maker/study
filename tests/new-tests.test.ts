import { describe, expect, it } from "vitest";
import bio from "../content/assessments/bio-unit-1-practice-test";
import c2 from "../content/assessments/c-fundamentals-to-pointers-2";
import { assessmentDefinitionSchema, totalMarks } from "@/lib/content/assessment-schema";
import { gradeResponse, type AnswerKey } from "@/lib/grading";

const parse = (d: unknown) => assessmentDefinitionSchema.parse(d);
const typesOf = (d: ReturnType<typeof parse>) => d.sections.flatMap((s) => s.questions.map((q) => q.type));
const count = (types: string[], t: string) => types.filter((x) => x === t).length;

describe("Biology — Unit 1 Practice Test", () => {
  const d = parse(bio);
  const qs = d.sections.flatMap((s) => s.questions);
  it("has 15 MCQ, 5 short answer, 1 long answer = 21 questions, 40 marks", () => {
    const t = typesOf(d);
    expect(t).toHaveLength(21);
    expect([count(t, "MCQ"), count(t, "SHORT_ANSWER"), count(t, "LONG_ANSWER")]).toEqual([15, 5, 1]);
    expect(totalMarks(d.sections)).toBe(40);
  });
  it("has rubrics matching marks for manual questions and unique ids", () => {
    for (const q of qs.filter((q) => q.type !== "MCQ")) expect(q.rubric!.reduce((s, r) => s + r.marks, 0)).toBe(q.marks);
    expect(new Set(qs.map((q) => q.id)).size).toBe(21);
  });
  it("auto-grades a perfect Section A to 15", () => {
    const score = qs.filter((q) => q.type === "MCQ").reduce((s, q) => s + (gradeResponse("MCQ", { type: "MCQ", correct: q.answer.correct as string }, { optionId: q.answer.correct }, q.marks).score ?? 0), 0);
    expect(score).toBe(15);
  });
});

describe("C Programming — Fundamentals to Pointers (Test 2)", () => {
  const d = parse(c2);
  const qs = d.sections.flatMap((s) => s.questions);
  it("has 10 MCQ, 5 fill-in, 5 debugging, 1 program = 21 questions, 50 marks", () => {
    const t = typesOf(d);
    expect(t).toHaveLength(21);
    expect([count(t, "MCQ"), count(t, "FILL_BLANK"), count(t, "DEBUGGING"), count(t, "CODE_WRITING")]).toEqual([10, 5, 5, 1]);
    expect(totalMarks(d.sections)).toBe(50);
  });
  it("auto-grades perfect Sections A and B to 20, tolerating spaces", () => {
    let score = 0;
    for (const q of qs) {
      const key = { type: q.type, ...q.answer } as AnswerKey;
      if (q.type === "MCQ") score += gradeResponse("MCQ", key, { optionId: q.answer.correct }, q.marks).score ?? 0;
      if (q.type === "FILL_BLANK") score += gradeResponse("FILL_BLANK", key, { blanks: q.answer.accepted!.map((a) => " " + a[0].replace(/ /g, "") + " ") }, q.marks).score ?? 0;
    }
    expect(score).toBe(20);
  });
  it("gives partial credit for one wrong blank and rejects wrong operators", () => {
    const b1 = qs.find((q) => q.id === "ct2-b1")!;
    const key = { type: "FILL_BLANK", ...b1.answer } as AnswerKey;
    expect(gradeResponse("FILL_BLANK", key, { blanks: ["&n", "="] }, 2)).toMatchObject({ score: 1, status: "PARTIAL" });
    expect(gradeResponse("FILL_BLANK", key, { blanks: ["n", "!="] }, 2).score).toBe(0);
  });
  it("does not test topics beyond pointers", () => {
    const text = JSON.stringify(c2);
    for (const banned of ["malloc", "struct ", "fopen", "FILE *", "#define SQUARE"]) expect(text.includes(banned), banned).toBe(false);
  });
});
