import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ArrowRight, Bookmark, BookOpen, ClipboardCheck, GraduationCap, History } from "lucide-react";
import { requirePageUser } from "@/server/auth/guards";
import { isStaff } from "@/server/auth/session";
import { db } from "@/server/db";
import { continueLearning, practiceStats, recentActivity } from "@/server/services/learning";
import { enrolledCoursesWithProgress } from "@/server/services/student";
import { assignedAssessments, canStudentSeeResults, finalizeExpiredAttempts } from "@/server/assessments/attempts";
import { Badge, Card, CardHeader, EmptyState, LinkButton, PageHeader, ProgressBar, Stat, fmtDate, fmtMarks } from "@/components/ui";
import { ActivityList } from "@/components/learn/ActivityList";
import { percent } from "@/lib/grading";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const user = await requirePageUser();
  if (isStaff(user.role)) redirect("/teacher");
  await finalizeExpiredAttempts({ userId: user.id });

  const [courses, cont, tests, attempts, practice, events, bookmarks] = await Promise.all([
    enrolledCoursesWithProgress(user.id),
    continueLearning(user.id),
    assignedAssessments(user.id),
    db.attempt.findMany({ where: { userId: user.id }, include: { assessment: true }, orderBy: { startedAt: "desc" } }),
    practiceStats(user.id),
    recentActivity(user.id, 8),
    db.bookmark.findMany({ where: { userId: user.id }, include: { lesson: { include: { course: { select: { slug: true } } } } }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const firstName = user.name.split(" ")[0];
  const totals = courses.reduce((a, c) => ({ done: a.done + c.progress.done, total: a.total + c.progress.total }), { done: 0, total: 0 });
  const overall = totals.total ? Math.round((totals.done / totals.total) * 100) : 0;
  const now = new Date();
  const pendingTests = tests.filter((t) => {
    const mine = attempts.filter((a) => a.assessmentId === t.id);
    const open = mine.some((a) => a.status === "IN_PROGRESS");
    const closed = t.effectiveDueAt && t.effectiveDueAt < now;
    return open || (!closed && mine.length < t.attemptLimit && t.status === "PUBLISHED");
  });
  const released = attempts.filter((a) => a.status !== "IN_PROGRESS" && canStudentSeeResults(a.assessment, a)).slice(0, 4);
  const current = cont ? courses.find((c) => c.tree.id === cont.lesson.courseId) : courses[0];

  return (
    <>
      <PageHeader title={`Welcome back, ${firstName}`} description="Here is where you are and what to do next." />

      {courses.length === 0 ? (
        <Card className="mb-6">
          <EmptyState icon={<GraduationCap size={18} />} title="Start by enrolling in a course" action={<LinkButton href="/courses">Browse courses</LinkButton>}>
            Once you enrol, your progress, tests and practice history will appear here.
          </EmptyState>
        </Card>
      ) : (
        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Card className="flex flex-col justify-between p-5">
            <div>
              <div className="label-caps mb-1.5">{cont?.reason === "resume" ? "Continue learning" : cont?.reason === "course_complete" ? "Course complete" : "Up next"}</div>
              {cont ? (
                <>
                  <div className="text-[12.5px] text-muted">
                    {cont.lesson.course.title} · {cont.lesson.chapter.title}
                  </div>
                  <h2 className="mt-0.5 text-[19px] font-semibold tracking-[-0.01em]">{cont.lesson.title}</h2>
                </>
              ) : (
                <h2 className="text-[19px] font-semibold">Start your first lesson</h2>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <LinkButton href={cont ? `/learn/${cont.lesson.course.slug}/${cont.lesson.slug}` : "/learn"}>
                <BookOpen size={15} /> {cont?.reason === "resume" ? "Resume lesson" : "Start lesson"}
              </LinkButton>
              {current && (
                <LinkButton href={`/syllabus/${current.tree.slug}`} variant="secondary">
                  View syllabus
                </LinkButton>
              )}
            </div>
          </Card>
          <Card className="p-5">
            <div className="label-caps mb-2">Overall completion</div>
            <div className="flex items-baseline gap-2">
              <span className="text-[30px] font-semibold tabular-nums">{overall}%</span>
              <span className="text-[13px] text-muted">
                {totals.done} of {totals.total} lessons
              </span>
            </div>
            <ProgressBar value={overall} className="mt-2" label="Overall completion" />
            {current && (
              <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <dt className="text-muted">Chapters completed</dt>
                  <dd className="font-semibold tabular-nums">{current.progress.chaptersCompleted}</dd>
                </div>
                <div>
                  <dt className="text-muted">Chapters remaining</dt>
                  <dd className="font-semibold tabular-nums">{current.progress.chapterCount - current.progress.chaptersCompleted}</dd>
                </div>
              </dl>
            )}
          </Card>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Lessons completed" value={totals.done} hint={`${Math.max(totals.total - totals.done, 0)} remaining`} />
        <Stat label="Practice accuracy" value={practice.accuracy == null ? "—" : `${practice.accuracy}%`} hint={`${practice.questionsAttempted} questions attempted`} />
        <Stat label="Tests to do" value={pendingTests.length} tone={pendingTests.length ? "pending" : undefined} />
        <Stat label="Tests submitted" value={attempts.filter((a) => a.status !== "IN_PROGRESS").length} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Assigned tests" action={<Link href="/tests" className="text-[12.5px] text-primary hover:underline">All tests</Link>} />
          {pendingTests.length === 0 ? (
            <EmptyState icon={<ClipboardCheck size={18} />} title="No tests waiting for you" />
          ) : (
            <ul className="divide-y divide-divider">
              {pendingTests.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <Link href={`/tests/${t.id}`} className="font-medium hover:text-primary">
                      {t.title}
                    </Link>
                    <div className="text-[12px] text-muted">
                      {t.currentVersion?.totalMarks ?? "—"} marks{t.durationMinutes ? ` · ${t.durationMinutes} min` : ""}
                      {t.effectiveDueAt ? ` · due ${fmtDate(t.effectiveDueAt, true)}` : ""}
                    </div>
                  </div>
                  {attempts.some((a) => a.assessmentId === t.id && a.status === "IN_PROGRESS") ? <Badge tone="pending">In progress</Badge> : <Badge tone="primary">To do</Badge>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent results" action={<Link href="/tests" className="text-[12.5px] text-primary hover:underline">History</Link>} />
          {released.length === 0 ? (
            <EmptyState icon={<History size={18} />} title="No released results yet">
              Results appear here once your teacher releases them.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-divider">
              {released.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <Link href={`/tests/${a.assessmentId}/result/${a.id}`} className="font-medium hover:text-primary">
                      {a.assessment.title}
                    </Link>
                    <div className="text-[12px] text-muted">Submitted {fmtDate(a.submittedAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums">
                      {fmtMarks(a.score)} / {fmtMarks(a.maxScore)}
                    </div>
                    {a.gradingStatus === "PENDING_REVIEW" ? <Badge tone="pending">Partly graded</Badge> : <span className="text-[12px] text-muted">{percent(a.score ?? 0, a.maxScore)}%</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Needs more practice" description="Chapters where under 60% of your latest practice answers are correct." />
          {practice.weak.length === 0 ? (
            <EmptyState icon={<AlertCircle size={18} />} title={practice.questionsAttempted ? "No weak areas right now" : "No practice data yet"}>
              {practice.questionsAttempted ? "Keep going — this updates as you practise." : "Answer practice questions at the end of lessons to see where to focus."}
            </EmptyState>
          ) : (
            <ul className="divide-y divide-divider">
              {practice.weak.slice(0, 5).map((w) => (
                <li key={w.slug} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="min-w-0 flex-1 text-[13.5px] font-medium">{w.title}</span>
                  <span className="text-[12.5px] tabular-nums text-danger">
                    {w.correct}/{w.attempted} correct
                  </span>
                </li>
              ))}
              <li className="px-4 py-2.5">
                <Link href="/practice?mode=revision" className="inline-flex items-center gap-1 text-[13px] text-primary hover:underline">
                  Revise incorrect answers <ArrowRight size={13} />
                </Link>
              </li>
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent activity" />
          {events.length === 0 ? <EmptyState title="No activity yet" /> : <ActivityList events={events} />}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Bookmarks" action={<Link href="/bookmarks" className="text-[12.5px] text-primary hover:underline">All bookmarks & notes</Link>} />
          {bookmarks.length === 0 ? (
            <EmptyState icon={<Bookmark size={18} />} title="No bookmarks yet">
              Use the Bookmark button on any lesson to save it for revision.
            </EmptyState>
          ) : (
            <ul className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
              {bookmarks.map((b) => (
                <li key={b.id}>
                  <Link href={`/learn/${b.lesson.course.slug}/${b.lesson.slug}`} className="flex items-center gap-2 px-4 py-2.5 text-[13.5px] hover:bg-sidebar hover:text-primary">
                    <Bookmark size={13} className="text-primary" /> {b.lesson.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
