import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, ClipboardCheck, GraduationCap, Highlighter, RotateCcw } from "lucide-react";
import { requirePageUser } from "@/server/auth/guards";
import { isStaff } from "@/server/auth/session";
import { db } from "@/server/db";
import { continueLearning, practiceStats } from "@/server/services/learning";
import { enrolledCoursesWithProgress } from "@/server/services/student";
import { assignedAssessments, canStudentSeeResults, finalizeExpiredAttempts } from "@/server/assessments/attempts";
import { Badge, EmptyState, LinkButton, ProgressBar, fmtDate, fmtMarks, fmtRelative } from "@/components/ui";
import { percent } from "@/lib/grading";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const user = await requirePageUser();
  if (isStaff(user.role)) redirect("/teacher");
  await finalizeExpiredAttempts({ userId: user.id });

  const [courses, cont, tests, attempts, practice, recent, revisionCounts] = await Promise.all([
    enrolledCoursesWithProgress(user.id),
    continueLearning(user.id),
    assignedAssessments(user.id),
    db.attempt.findMany({ where: { userId: user.id }, include: { assessment: true }, orderBy: { startedAt: "desc" } }),
    practiceStats(user.id),
    db.lessonProgress.findMany({
      where: { userId: user.id, lesson: { published: true } },
      orderBy: { lastViewedAt: "desc" },
      take: 4,
      include: { lesson: { select: { slug: true, title: true, course: { select: { slug: true } }, chapter: { select: { title: true } } } } },
    }),
    Promise.all([db.highlight.count({ where: { userId: user.id } }), db.note.count({ where: { userId: user.id } }), db.bookmark.count({ where: { userId: user.id } })]),
  ]);

  const firstName = user.name.split(" ")[0];
  const revision = { highlights: revisionCounts[0], notes: revisionCounts[1], bookmarks: revisionCounts[2] };
  const now = new Date();
  const current = cont ? courses.find((c) => c.tree.id === cont.lesson.courseId) : courses[0];
  const chapterProgress = cont && current ? current.progress.chapters.get(cont.lesson.chapterId) : null;

  const pendingTests = tests
    .map((t) => {
      const mine = attempts.filter((a) => a.assessmentId === t.id);
      const open = mine.find((a) => a.status === "IN_PROGRESS");
      const closed = t.effectiveDueAt && t.effectiveDueAt < now;
      const available = !open && !closed && mine.length < t.attemptLimit && t.status === "PUBLISHED" && !(t.availableFrom && t.availableFrom > now);
      return { t, open, available };
    })
    .filter((x) => x.open || x.available);
  const released = attempts.filter((a) => a.status !== "IN_PROGRESS" && canStudentSeeResults(a.assessment, a)).slice(0, 3);
  const awaiting = attempts.filter((a) => a.status !== "IN_PROGRESS" && !canStudentSeeResults(a.assessment, a)).length;

  // One recommended step, chosen from real data in priority order.
  const openAttempt = pendingTests.find((x) => x.open);
  const dueSoon = pendingTests
    .filter((x) => x.available && x.t.effectiveDueAt && x.t.effectiveDueAt.getTime() - now.getTime() < 3 * 86400000)
    .sort((a, b) => a.t.effectiveDueAt!.getTime() - b.t.effectiveDueAt!.getTime())[0];
  const weak = practice.weak[0];
  const step = openAttempt
    ? { text: `Finish your test “${openAttempt.t.title}” — your answers are saved.`, href: `/tests/${openAttempt.t.id}/attempt/${openAttempt.open!.id}`, cta: "Resume test", icon: ClipboardCheck }
    : dueSoon
      ? { text: `“${dueSoon.t.title}” is due ${fmtDate(dueSoon.t.effectiveDueAt, true)}.`, href: `/tests/${dueSoon.t.id}`, cta: "Open test", icon: ClipboardCheck }
      : weak
        ? { text: `Revise ${weak.title}: ${weak.correct} of ${weak.attempted} of your latest practice answers are correct.`, href: `/practice?chapter=${weak.id}`, cta: "Practise", icon: RotateCcw }
        : null;

  if (courses.length === 0) {
    return (
      <div className="mx-auto max-w-[760px]">
        <h1 className="text-[24px] font-semibold tracking-[-0.01em]">Welcome, {firstName}</h1>
        <div className="mt-6 rounded-[12px] border border-border bg-surface">
          <EmptyState icon={<GraduationCap size={18} />} title="Start by enrolling in a course" action={<LinkButton href="/courses">Browse courses</LinkButton>}>
            Once you enrol, your next lesson, tests and progress appear here.
          </EmptyState>
        </div>
        {pendingTests.length > 0 && <TestsList pending={pendingTests} released={[]} awaiting={0} />}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[960px]">
      <h1 className="text-[24px] font-semibold tracking-[-0.01em]">Welcome back, {firstName}</h1>

      {/* Primary action */}
      <section className="mt-5 rounded-[14px] border border-border bg-surface p-6" aria-labelledby="continue-h">
        <div className="text-[12.5px] font-medium text-primary">{cont?.reason === "resume" ? "Continue where you left off" : cont?.reason === "course_complete" ? "You finished this course" : "Your next lesson"}</div>
        {cont ? (
          <>
            <h2 id="continue-h" className="mt-1 text-[22px] font-semibold leading-snug tracking-[-0.01em]">
              {cont.lesson.title}
            </h2>
            <p className="mt-1 text-[13.5px] text-muted">
              {cont.lesson.course.title} · {cont.lesson.chapter.title}
            </p>
          </>
        ) : (
          <h2 id="continue-h" className="mt-1 text-[22px] font-semibold">
            Start {current?.tree.title}
          </h2>
        )}
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {chapterProgress && (
            <div>
              <div className="mb-1.5 flex justify-between text-[12.5px]">
                <span className="text-muted">This chapter</span>
                <span className="tabular-nums">
                  {chapterProgress.done} of {chapterProgress.total} lessons
                </span>
              </div>
              <ProgressBar value={chapterProgress.total ? (chapterProgress.done / chapterProgress.total) * 100 : 0} label="Chapter progress" />
            </div>
          )}
          {current && (
            <div>
              <div className="mb-1.5 flex justify-between text-[12.5px]">
                <span className="text-muted">Whole course</span>
                <span className="tabular-nums">{current.progress.percent}%</span>
              </div>
              <ProgressBar value={current.progress.percent} tone="success" label="Course progress" />
            </div>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <LinkButton href={cont ? `/learn/${cont.lesson.course.slug}/${cont.lesson.slug}` : "/learn"}>
            <BookOpen size={15} /> {cont?.reason === "resume" ? "Continue lesson" : "Start lesson"}
          </LinkButton>
          {current && (
            <LinkButton href={`/syllabus/${current.tree.slug}${cont ? `?open=${cont.lesson.chapterId}#ch-${cont.lesson.chapterId}` : ""}`} variant="secondary">
              View syllabus
            </LinkButton>
          )}
        </div>
      </section>

      {step && (
        <Link href={step.href} className="mt-3 flex items-center gap-3 rounded-[12px] border border-[#ead1c5] bg-primary-soft/50 px-5 py-3.5 hover:bg-primary-soft">
          <step.icon size={17} className="shrink-0 text-primary" aria-hidden />
          <span className="min-w-0 flex-1 text-[14px]">
            <span className="font-medium">Recommended next: </span>
            {step.text}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-primary">
            {step.cta} <ArrowRight size={14} />
          </span>
        </Link>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <TestsList pending={pendingTests} released={released} awaiting={awaiting} />
        <section>
          <SectionTitle title="Recently studied" href="/progress" linkLabel="My progress" />
          {recent.length === 0 ? (
            <p className="text-[13.5px] text-muted">Lessons you open will appear here.</p>
          ) : (
            <ul className="space-y-0.5">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link href={`/learn/${p.lesson.course.slug}/${p.lesson.slug}`} className="-mx-3 flex items-center gap-3 rounded-[8px] px-3 py-2 hover:bg-surface">
                    <span className={p.status === "COMPLETED" ? "h-2 w-2 shrink-0 rounded-full bg-success" : "h-2 w-2 shrink-0 rounded-full border border-pending"} aria-label={p.status === "COMPLETED" ? "Completed" : "In progress"} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px]">{p.lesson.title}</span>
                      <span className="block truncate text-[12px] text-muted">{p.lesson.chapter.title}</span>
                    </span>
                    <span className="shrink-0 text-[11.5px] text-faint">{fmtRelative(p.lastViewedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/revision" className="mt-6 flex items-center gap-3 rounded-[10px] border border-border bg-surface px-4 py-3 hover:border-primary">
            <Highlighter size={16} className="shrink-0 text-primary" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium">Revision</span>
              <span className="block text-[12px] text-muted">
                {revision.highlights} highlight{revision.highlights === 1 ? "" : "s"} · {revision.notes} note{revision.notes === 1 ? "" : "s"} · {revision.bookmarks} bookmark{revision.bookmarks === 1 ? "" : "s"}
              </span>
            </span>
            <ArrowRight size={14} className="shrink-0 text-faint" aria-hidden />
          </Link>
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between border-b border-divider pb-2">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      <Link href={href} className="text-[12.5px] font-medium text-primary hover:underline">
        {linkLabel}
      </Link>
    </div>
  );
}

type Pending = { t: Awaited<ReturnType<typeof assignedAssessments>>[number]; open?: { id: string }; available: boolean };
type Released = { id: string; assessmentId: string; score: number | null; maxScore: number; gradingStatus: string; submittedAt: Date | null; assessment: { title: string } };

function TestsList({ pending, released, awaiting }: { pending: Pending[]; released: Released[]; awaiting: number }) {
  return (
    <section>
      <SectionTitle title="Tests" href="/tests" linkLabel="All tests" />
      {pending.length === 0 && released.length === 0 ? (
        <p className="text-[13.5px] text-muted">{awaiting ? `${awaiting} submitted test${awaiting > 1 ? "s are" : " is"} waiting for your teacher to release results.` : "No tests assigned right now."}</p>
      ) : (
        <ul className="space-y-1">
          {pending.map(({ t, open }) => (
            <li key={t.id}>
              <Link href={open ? `/tests/${t.id}/attempt/${open.id}` : `/tests/${t.id}`} className="-mx-3 flex items-center gap-3 rounded-[8px] px-3 py-2.5 hover:bg-surface">
                <ClipboardCheck size={16} className="shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium">{t.title}</span>
                  <span className="block text-[12px] text-muted">
                    {t.currentVersion?.totalMarks ?? "—"} marks{t.durationMinutes ? ` · ${t.durationMinutes} min` : ""}
                    {t.effectiveDueAt ? ` · due ${fmtDate(t.effectiveDueAt, true)}` : ""}
                  </span>
                </span>
                {open ? <Badge tone="pending">In progress</Badge> : <Badge tone="primary">To do</Badge>}
              </Link>
            </li>
          ))}
          {released.map((a) => (
            <li key={a.id}>
              <Link href={`/tests/${a.assessmentId}/result/${a.id}`} className="-mx-3 flex items-center gap-3 rounded-[8px] px-3 py-2.5 hover:bg-surface">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px]">{a.assessment.title}</span>
                  <span className="block text-[12px] text-muted">Result · submitted {fmtDate(a.submittedAt)}</span>
                </span>
                <span className="text-right text-[13.5px] font-semibold tabular-nums">
                  {fmtMarks(a.score)}/{fmtMarks(a.maxScore)}
                  <span className="block text-[11.5px] font-normal text-muted">{a.gradingStatus === "PENDING_REVIEW" ? "partly graded" : `${percent(a.score ?? 0, a.maxScore)}%`}</span>
                </span>
              </Link>
            </li>
          ))}
          {awaiting > 0 && <li className="pt-1 text-[12.5px] text-faint">{awaiting} more awaiting release by your teacher.</li>}
        </ul>
      )}
    </section>
  );
}
