/** Pure rules for assessment availability and result visibility (unit tested). */

export interface AssessmentTiming {
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  availableFrom: Date | null;
  dueAt: Date | null;
  durationMinutes: number | null;
  attemptLimit: number;
  resultRelease: "IMMEDIATE" | "AFTER_DUE" | "MANUAL";
  resultsReleasedAt: Date | null;
}

/** Seconds of tolerance for network latency when saving right at the deadline. */
export const DEADLINE_GRACE_MS = 30_000;

export function attemptDeadline(a: Pick<AssessmentTiming, "durationMinutes" | "dueAt">, startedAt: Date, dueOverride?: Date | null): Date | null {
  const due = dueOverride ?? a.dueAt;
  const byDuration = a.durationMinutes ? new Date(startedAt.getTime() + a.durationMinutes * 60_000) : null;
  if (byDuration && due) return byDuration < due ? byDuration : due;
  return byDuration ?? due ?? null;
}

export function isPastDeadline(deadlineAt: Date | null, now = new Date()) {
  return deadlineAt != null && now.getTime() > deadlineAt.getTime() + DEADLINE_GRACE_MS;
}

export type StartBlock = "not_published" | "not_open" | "closed" | "no_attempts_left" | null;

export function canStart(a: AssessmentTiming, attemptsUsed: number, now = new Date(), dueOverride?: Date | null): StartBlock {
  if (a.status !== "PUBLISHED") return "not_published";
  if (a.availableFrom && now < a.availableFrom) return "not_open";
  const due = dueOverride ?? a.dueAt;
  if (due && now >= due) return "closed";
  if (attemptsUsed >= a.attemptLimit) return "no_attempts_left";
  return null;
}

export function resultsVisible(a: Pick<AssessmentTiming, "resultRelease" | "resultsReleasedAt" | "dueAt">, submitted: boolean, now = new Date()) {
  if (!submitted) return false;
  if (a.resultsReleasedAt) return true;
  if (a.resultRelease === "IMMEDIATE") return true;
  if (a.resultRelease === "AFTER_DUE") return a.dueAt == null || now >= a.dueAt;
  return false;
}

export const startBlockMessage: Record<Exclude<StartBlock, null>, string> = {
  not_published: "This test is not published.",
  not_open: "This test is not open yet.",
  closed: "The deadline for this test has passed.",
  no_attempts_left: "You have used all allowed attempts.",
};
