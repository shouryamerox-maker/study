import { describe, expect, it } from "vitest";
import { attemptDeadline, canStart, isPastDeadline, resultsVisible, type AssessmentTiming } from "@/lib/assessment-rules";

const base: AssessmentTiming = {
  status: "PUBLISHED",
  availableFrom: null,
  dueAt: null,
  durationMinutes: 60,
  attemptLimit: 1,
  resultRelease: "MANUAL",
  resultsReleasedAt: null,
};
const t0 = new Date("2026-01-01T10:00:00Z");

describe("attempt deadline", () => {
  it("uses start + duration", () => {
    expect(attemptDeadline(base, t0)?.toISOString()).toBe("2026-01-01T11:00:00.000Z");
  });
  it("is capped by the due date", () => {
    const due = new Date("2026-01-01T10:30:00Z");
    expect(attemptDeadline({ ...base, dueAt: due }, t0)).toEqual(due);
  });
  it("is null for untimed tests without a due date", () => {
    expect(attemptDeadline({ durationMinutes: null, dueAt: null }, t0)).toBeNull();
  });
  it("allows a short grace period", () => {
    const d = new Date("2026-01-01T11:00:00Z");
    expect(isPastDeadline(d, new Date("2026-01-01T11:00:20Z"))).toBe(false);
    expect(isPastDeadline(d, new Date("2026-01-01T11:01:00Z"))).toBe(true);
  });
});

describe("canStart", () => {
  it("blocks drafts, early, late and exhausted attempts", () => {
    expect(canStart({ ...base, status: "DRAFT" }, 0, t0)).toBe("not_published");
    expect(canStart({ ...base, availableFrom: new Date("2026-02-01") }, 0, t0)).toBe("not_open");
    expect(canStart({ ...base, dueAt: new Date("2025-12-01") }, 0, t0)).toBe("closed");
    expect(canStart(base, 1, t0)).toBe("no_attempts_left");
    expect(canStart({ ...base, attemptLimit: 2 }, 1, t0)).toBeNull();
  });
});

describe("result visibility", () => {
  it("never shows results before submission", () => {
    expect(resultsVisible({ ...base, resultRelease: "IMMEDIATE" }, false)).toBe(false);
  });
  it("follows release settings", () => {
    expect(resultsVisible({ ...base, resultRelease: "IMMEDIATE" }, true)).toBe(true);
    expect(resultsVisible(base, true)).toBe(false);
    expect(resultsVisible({ ...base, resultsReleasedAt: t0 }, true)).toBe(true);
    const due = new Date("2026-01-02");
    expect(resultsVisible({ ...base, resultRelease: "AFTER_DUE", dueAt: due }, true, t0)).toBe(false);
    expect(resultsVisible({ ...base, resultRelease: "AFTER_DUE", dueAt: due }, true, new Date("2026-01-03"))).toBe(true);
  });
});
