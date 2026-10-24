import { describe, expect, it } from "vitest";
import { findSubject, shardaCseAiml2026 } from "@content/syllabus/sharda-btech-cse-aiml-2026";

const sem1 = shardaCseAiml2026.semesters.find((s) => s.slug === "semester-1")!;

describe("Sharda B.Tech CSE-AIML 2026–2030 syllabus map", () => {
  it("has exactly the seven official Semester 1 subjects, in order", () => {
    expect(shardaCseAiml2026.semesters).toHaveLength(1);
    expect(sem1.subjects.map((s) => [s.code, s.name])).toEqual([
      ["CSAI1101", "Fundamentals of Computing and Artificial Intelligence"],
      ["EEE1101", "Basics of Electrical and Electronics Engineering"],
      ["MTT1113", "Calculus and Abstract Algebra"],
      ["IKT1105", "Human Values and Professional Ethics"],
      ["CSCR1300", "Programming for Problem Solving"],
      ["BTT1102", "Introduction to Computational Biology"],
      ["CVT1103", "Environmental Studies"],
    ]);
  });

  it("only cites PDF pages 1–108", () => {
    for (const s of sem1.subjects) {
      const pages = [...s.pages, ...s.units.flatMap((u) => u.pages), s.assessmentPage, s.midSem?.page, s.endSem?.page].filter((p): p is number => p != null);
      for (const p of pages) expect(p >= 1 && p <= 108, `${s.code} page ${p}`).toBe(true);
    }
  });

  it("has numbered units with topics for every subject", () => {
    for (const s of sem1.subjects) {
      expect(s.units.map((u) => u.number)).toEqual([1, 2, 3, 4, 5]);
      for (const u of s.units) {
        expect(u.title.trim()).not.toBe("");
        expect(u.topics.map((t) => t.id)).toEqual(["A", "B", "C"]);
        for (const t of u.topics) expect(t.text.trim().length).toBeGreaterThan(3);
      }
    }
  });

  it("maps exams only to units that exist, with mid-sem inside end-sem", () => {
    for (const s of sem1.subjects) {
      const unitNos = new Set(s.units.map((u) => u.number));
      for (const exam of [s.midSem, s.endSem]) for (const u of exam?.units ?? []) expect(unitNos.has(u)).toBe(true);
      if (s.midSem?.units && s.endSem?.units) for (const u of s.midSem.units) expect(s.endSem.units).toContain(u);
    }
  });

  it("records the verified exam coverage and leaves unspecified coverage empty", () => {
    const mid = (c: string) => findSubject("semester-1", c)!.subject.midSem?.units ?? null;
    expect(mid("CSAI1101")).toEqual([1, 2]);
    expect(mid("EEE1101")).toEqual([1, 2, 3]);
    expect(mid("MTT1113")).toEqual([1, 2, 3]);
    expect(mid("CSCR1300")).toEqual([1, 2, 3]);
    expect(mid("BTT1102")).toEqual([1, 2, 3]);
    expect(findSubject("semester-1", "IKT1105")!.subject.midSem).toBeNull();
    expect(findSubject("semester-1", "IKT1105")!.subject.endSem).toBeNull();
    expect(findSubject("semester-1", "CVT1103")!.subject.midSem).toBeNull();
    expect(findSubject("semester-1", "CVT1103")!.subject.endSem).toBeNull();
  });

  it("does not include subjects from outside the requested list (e.g. IKT1108)", () => {
    expect(findSubject("semester-1", "IKT1108")).toBeNull();
    expect(findSubject("semester-1", "cscr1300")?.subject.code).toBe("CSCR1300");
  });
});
