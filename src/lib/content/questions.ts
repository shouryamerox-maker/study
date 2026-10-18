import type { PracticeQuestion } from "./schema";
import type { AnswerKey } from "@/lib/grading";

/** Splits an authored question into a student-safe `data` part and a server-only `answer` key. */
export function splitPracticeQuestion(q: PracticeQuestion) {
  const base = { type: q.type, prompt: q.prompt, explanation: q.explanation ?? null, hint: q.hint ?? null };
  switch (q.type) {
    case "MCQ":
      return { ...base, code: q.code ?? null, data: { options: q.options }, answer: { type: "MCQ", correct: q.correct } satisfies AnswerKey };
    case "TRUE_FALSE":
      return { ...base, code: q.code ?? null, data: {}, answer: { type: "TRUE_FALSE", correct: q.correct } satisfies AnswerKey };
    case "FILL_BLANK":
      return {
        ...base,
        code: q.code ?? null,
        data: { blanks: q.accepted.length },
        answer: { type: "FILL_BLANK", accepted: q.accepted, caseSensitive: q.caseSensitive } satisfies AnswerKey,
      };
    case "OUTPUT_PREDICTION":
      return { ...base, code: q.code, data: {}, answer: { type: "OUTPUT_PREDICTION", expected: q.expected } satisfies AnswerKey };
    case "CODE_WRITING":
      return {
        ...base,
        code: null,
        data: { starterCode: q.starterCode ?? null, sampleTests: q.sampleTests },
        answer: { type: "CODE_WRITING", sampleTests: q.sampleTests, hiddenTests: q.hiddenTests, solutionCode: q.solutionCode } satisfies AnswerKey,
      };
  }
}
