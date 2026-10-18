import Link from "next/link";
import type { LearningEvent } from "@prisma/client";
import { Badge, Card, CardHeader, EmptyState, ProgressBar, Stat, fmtDate, fmtMarks } from "@/components/ui";
import { ActivityList } from "@/components/learn/ActivityList";
import type { enrolledCoursesWithProgress } from "@/server/services/student";
import type { practiceStats } from "@/server/services/learning";
import { percent } from "@/lib/grading";

type Courses = Awaited<ReturnType<typeof enrolledCoursesWithProgress>>;
type Practice = Awaited<ReturnType<typeof practiceStats>>;
export interface TestRow {
  attemptId: string;
  assessmentId: string;
  title: string;
  attemptNumber: number;
  submittedAt: Date | null;
  score: number | null;
  maxScore: number;
  pending: boolean;
  visible: boolean;
  status: string;
}

/** Shared by "My Progress" (student) and the teacher's individual student report. */
export function StudentProgressReport({
  courses,
  practice,
  tests,
  events,
  activeDays,
  testHref,
  lessonHref = true,
}: {
  courses: Courses;
  practice: Practice;
  tests: TestRow[];
  events: LearningEvent[];
  activeDays: number;
  testHref: (t: TestRow) => string | null;
  lessonHref?: boolean;
}) {
  const visible = tests.filter((t) => t.visible && t.score != null);
  const avg = visible.length ? Math.round((visible.reduce((s, t) => s + percent(t.score!, t.maxScore), 0) / visible.length) * 10) / 10 : null;
  const best = visible.length ? Math.max(...visible.map((t) => percent(t.score!, t.maxScore))) : null;
  const latest = visible.at(-1);
  const totals = courses.reduce((a, c) => ({ done: a.done + c.progress.done, total: a.total + c.progress.total }), { done: 0, total: 0 });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Lessons completed" value={`${totals.done} / ${totals.total}`} hint={`${Math.max(totals.total - totals.done, 0)} remaining`} />
        <Stat label="Practice accuracy" value={practice.accuracy == null ? "—" : `${practice.accuracy}%`} hint={`${practice.questionsAttempted} questions · ${practice.totalSubmissions} submissions`} />
        <Stat label="Average test score" value={avg == null ? "—" : `${avg}%`} hint={best != null ? `Best ${best}% · latest ${latest ? percent(latest.score!, latest.maxScore) : "—"}%` : "No released results"} />
        <Stat label="Active days (30 days)" value={activeDays} hint="Days with recorded learning activity" />
      </div>

      {courses.map(({ tree, progress, progressMap }) => (
        <Card key={tree.id}>
          <CardHeader
            title={tree.title}
            description={`${progress.done} of ${progress.total} lessons · ${progress.chaptersCompleted} of ${progress.chapterCount} chapters complete`}
            action={<span className="text-[15px] font-semibold tabular-nums">{progress.percent}%</span>}
          />
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Unit / chapter</th>
                  <th>Status</th>
                  <th className="w-48">Lessons</th>
                </tr>
              </thead>
              <tbody>
                {tree.units.flatMap((u) =>
                  u.chapters.map((c, i) => {
                    const p = progress.chapters.get(c.id)!;
                    const lessons = c.topics.flatMap((t) => t.lessons);
                    return (
                      <tr key={c.id}>
                        <td>
                          {i === 0 && <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-faint">{u.title}</div>}
                          <details>
                            <summary className="cursor-pointer font-medium">{c.title}</summary>
                            <ul className="mt-1.5 space-y-0.5 pl-1">
                              {lessons.map((l) => {
                                const st = progressMap.get(l.id);
                                return (
                                  <li key={l.id} className="flex items-center gap-2 text-[12.5px]">
                                    <span className={st?.status === "COMPLETED" ? "text-success" : st ? "text-pending" : "text-faint"}>{st?.status === "COMPLETED" ? "●" : st ? "◐" : "○"}</span>
                                    {lessonHref ? (
                                      <Link href={`/learn/${tree.slug}/${l.slug}`} className="hover:text-primary">
                                        {l.title}
                                      </Link>
                                    ) : (
                                      l.title
                                    )}
                                    {st?.completedAt && <span className="text-faint">· {fmtDate(st.completedAt)}</span>}
                                  </li>
                                );
                              })}
                            </ul>
                          </details>
                        </td>
                        <td>
                          <Badge tone={p.state === "completed" ? "success" : p.state === "in_progress" ? "pending" : "neutral"}>{p.state.replace("_", " ")}</Badge>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <ProgressBar value={p.total ? (p.done / p.total) * 100 : 0} tone={p.state === "completed" ? "success" : "primary"} />
                            <span className="w-10 text-right text-[12px] tabular-nums text-muted">
                              {p.done}/{p.total}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  }),
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Test history" />
          {tests.length === 0 ? (
            <EmptyState title="No tests submitted yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Submitted</th>
                    <th className="text-right">Marks</th>
                    <th className="text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((t) => {
                    const href = testHref(t);
                    return (
                      <tr key={t.attemptId}>
                        <td>
                          {href ? (
                            <Link href={href} className="font-medium hover:text-primary">
                              {t.title}
                            </Link>
                          ) : (
                            <span className="font-medium">{t.title}</span>
                          )}
                          <div className="text-[11.5px] text-muted">
                            Attempt {t.attemptNumber}
                            {t.status === "AUTO_SUBMITTED" ? " · auto-submitted" : ""}
                          </div>
                        </td>
                        <td className="text-muted">{fmtDate(t.submittedAt)}</td>
                        <td className="text-right tabular-nums">
                          {t.visible ? `${fmtMarks(t.score)} / ${fmtMarks(t.maxScore)}` : <span className="text-faint">Not released</span>}
                          {t.visible && t.pending && (
                            <div>
                              <Badge tone="pending">Pending review</Badge>
                            </div>
                          )}
                        </td>
                        <td className="text-right tabular-nums">{t.visible && t.score != null ? percent(t.score, t.maxScore) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card>
          <CardHeader title="Practice by chapter" description={practice.weak.length ? `Weak: ${practice.weak.map((w) => w.title).join(", ")}` : undefined} />
          {practice.byChapter.length === 0 ? (
            <EmptyState title="No practice yet" />
          ) : (
            <ul className="divide-y divide-divider">
              {practice.byChapter.map((c) => {
                const pct = Math.round((c.correct / c.attempted) * 100);
                return (
                  <li key={c.slug} className="flex items-center gap-3 px-4 py-2">
                    <span className="min-w-0 flex-1 truncate text-[13px]">{c.title}</span>
                    <ProgressBar value={pct} tone={pct >= 60 ? "success" : "primary"} className="w-24" />
                    <span className="w-20 text-right text-[12px] tabular-nums text-muted">
                      {c.correct}/{c.attempted} ({pct}%)
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Learning history" description="Recorded events — lesson opens are not counted as study time." />
        {events.length === 0 ? <EmptyState title="No activity recorded yet" /> : <ActivityList events={events} />}
      </Card>
    </div>
  );
}
