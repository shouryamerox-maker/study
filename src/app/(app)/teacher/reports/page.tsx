import { requirePageStaff } from "@/server/auth/guards";
import Link from "next/link";
import { db } from "@/server/db";
import { studentDirectory } from "@/server/services/teacher";
import { Card, CardHeader, EmptyState, PageHeader, ProgressBar, Stat } from "@/components/ui";
import { percent } from "@/lib/grading";

export const metadata = { title: "Reports & Analytics" };

export default async function ReportsPage() {
  await requirePageStaff();
  const since = new Date(Date.now() - 28 * 86400000);
  const [directory, chapters, practice, events, attempts] = await Promise.all([
    studentDirectory(),
    db.chapter.findMany({
      orderBy: [{ course: { order: "asc" } }, { unit: { order: "asc" } }, { order: "asc" }],
      include: { course: { select: { title: true } }, lessons: { where: { published: true }, select: { id: true } } },
    }),
    db.practiceAttempt.findMany({ where: { user: { role: "STUDENT" } }, select: { isCorrect: true, question: { select: { chapterId: true } } } }),
    db.learningEvent.findMany({ where: { createdAt: { gte: since }, user: { role: "STUDENT" }, type: { not: "LOGIN" } }, select: { createdAt: true, userId: true } }),
    db.attempt.findMany({ where: { status: { not: "IN_PROGRESS" }, gradingStatus: "GRADED" }, select: { score: true, maxScore: true } }),
  ]);
  const studentIds = directory.map((d) => d.id);
  const completions = await db.lessonProgress.groupBy({ by: ["lessonId"], where: { status: "COMPLETED", userId: { in: studentIds } }, _count: { _all: true } });
  const doneByLesson = new Map(completions.map((c) => [c.lessonId, c._count._all]));

  const practiceByChapter = new Map<string, { n: number; ok: number }>();
  for (const p of practice) {
    const k = p.question.chapterId;
    if (!k) continue;
    const e = practiceByChapter.get(k) ?? { n: 0, ok: 0 };
    e.n++;
    if (p.isCorrect) e.ok++;
    practiceByChapter.set(k, e);
  }

  // Weekly active students for the last 4 weeks.
  const weeks = [3, 2, 1, 0].map((w) => {
    const start = Date.now() - (w + 1) * 7 * 86400000;
    const end = Date.now() - w * 7 * 86400000;
    return { label: w === 0 ? "This week" : `${w} week${w > 1 ? "s" : ""} ago`, n: new Set(events.filter((e) => e.createdAt.getTime() >= start && e.createdAt.getTime() < end).map((e) => e.userId)).size };
  });
  const maxWeek = Math.max(1, ...weeks.map((w) => w.n));
  const dist = [0, 0, 0, 0, 0];
  attempts.forEach((a) => dist[Math.min(4, Math.floor(percent(a.score ?? 0, a.maxScore) / 20))]++);
  const maxDist = Math.max(1, ...dist);

  return (
    <>
      <PageHeader title="Reports & Analytics" description="Class-level views computed from recorded student activity." />
      {directory.length === 0 ? (
        <Card>
          <EmptyState title="No student data yet">Reports fill in as students register, study and submit tests.</EmptyState>
        </Card>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Students" value={directory.length} />
            <Stat label="Average lesson completion" value={`${Math.round(directory.reduce((n, s) => n + s.progress, 0) / directory.length)}%`} />
            <Stat label="Practice answers recorded" value={practice.length} hint={practice.length ? `${Math.round((practice.filter((p) => p.isCorrect).length / practice.length) * 100)}% correct` : undefined} />
            <Stat label="Fully graded test attempts" value={attempts.length} />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader title="Weekly active students" description="Students with any learning event in the week." />
              <div className="flex h-40 items-end gap-4 px-6 pb-4 pt-6">
                {weeks.map((w) => (
                  <div key={w.label} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-[12px] font-semibold tabular-nums">{w.n}</span>
                    <div className="w-full max-w-12 rounded-t-[4px] bg-primary" style={{ height: `${(w.n / maxWeek) * 90}px`, minHeight: 2 }} />
                    <span className="text-[11px] text-muted">{w.label}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader title="Test score distribution" description="Fully graded attempts, all tests." />
              <div className="flex h-40 items-end gap-4 px-6 pb-4 pt-6">
                {dist.map((n, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-[12px] font-semibold tabular-nums">{n}</span>
                    <div className={i < 2 ? "w-full max-w-12 rounded-t-[4px] bg-danger/70" : i < 3 ? "w-full max-w-12 rounded-t-[4px] bg-pending/80" : "w-full max-w-12 rounded-t-[4px] bg-success"} style={{ height: `${(n / maxDist) * 90}px`, minHeight: 2 }} />
                    <span className="text-[11px] text-muted">
                      {i * 20}–{i === 4 ? 100 : i * 20 + 19}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <Card className="overflow-x-auto">
            <CardHeader title="Chapter analytics" description="Completion = share of student-lesson pairs completed. Practice = accuracy of all practice answers in the chapter." />
            <table className="table">
              <thead>
                <tr>
                  <th>Chapter</th>
                  <th className="w-56">Lesson completion</th>
                  <th className="w-56">Practice accuracy</th>
                  <th>Covered in class</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map((c) => {
                  const possible = c.lessons.length * directory.length;
                  const done = c.lessons.reduce((n, l) => n + (doneByLesson.get(l.id) ?? 0), 0);
                  const comp = possible ? Math.round((done / possible) * 100) : 0;
                  const p = practiceByChapter.get(c.id);
                  const acc = p ? Math.round((p.ok / p.n) * 100) : null;
                  return (
                    <tr key={c.id}>
                      <td>
                        <Link href={`/teacher/courses/${c.courseId}`} className="font-medium hover:text-primary">
                          {c.title}
                        </Link>
                        <div className="text-[11.5px] text-muted">{c.course.title}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <ProgressBar value={comp} />
                          <span className="w-10 text-right text-[12px] tabular-nums">{comp}%</span>
                        </div>
                      </td>
                      <td>
                        {acc == null ? (
                          <span className="text-[12px] text-faint">No answers</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <ProgressBar value={acc} tone={acc >= 60 ? "success" : "primary"} />
                            <span className="w-20 text-right text-[12px] tabular-nums">
                              {acc}% ({p!.n})
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="text-[12.5px] text-muted">{c.coveredInClassAt ? c.coveredInClassAt.toLocaleDateString() : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </>
  );
}
