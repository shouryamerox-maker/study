import Link from "next/link";
import { ClipboardList, FileCheck2, Users } from "lucide-react";
import { requirePageStaff } from "@/server/auth/guards";
import { db } from "@/server/db";
import { finalizeExpiredAttempts } from "@/server/assessments/attempts";
import { studentDirectory, teacherOverview } from "@/server/services/teacher";
import { Badge, Card, CardHeader, EmptyState, LinkButton, PageHeader, ProgressBar, Stat, fmtRelative } from "@/components/ui";

export const metadata = { title: "Teacher dashboard" };

export default async function TeacherDashboard() {
  const user = await requirePageStaff();
  await finalizeExpiredAttempts();
  const [o, directory, courses] = await Promise.all([
    teacherOverview(),
    studentDirectory(),
    db.course.findMany({ include: { _count: { select: { lessons: { where: { published: true } }, enrollments: { where: { status: "active" } } } } }, orderBy: { order: "asc" } }),
  ]);

  // Students who may need support: based on real results and activity only.
  const support = directory
    .map((s) => {
      const reasons: string[] = [];
      if (s.averageScore != null && s.averageScore < 50) reasons.push(`average test score ${s.averageScore}%`);
      if (s.lastActivity && Date.now() - s.lastActivity.getTime() > 14 * 86400000) reasons.push(`no activity for ${Math.floor((Date.now() - s.lastActivity.getTime()) / 86400000)} days`);
      if (!s.lastActivity && s.courses.length) reasons.push("enrolled but no recorded activity");
      return { s, reasons };
    })
    .filter((x) => x.reasons.length > 0)
    .slice(0, 6);
  const avgProgress = directory.length ? Math.round(directory.reduce((n, s) => n + s.progress, 0) / directory.length) : 0;

  return (
    <>
      <PageHeader
        title={`Good to see you, ${user.name.split(" ")[0]}`}
        description="An overview of your students, tests and grading."
        actions={
          <>
            <LinkButton href="/teacher/grading" variant={o.pendingAttempts ? "primary" : "secondary"}>
              <FileCheck2 size={15} /> Grade submissions{o.pendingAttempts ? ` (${o.pendingAttempts})` : ""}
            </LinkButton>
            <LinkButton href="/teacher/tests" variant="secondary">
              <ClipboardList size={15} /> Tests
            </LinkButton>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Active students" value={o.students} hint="Registered student accounts" />
        <Stat label="Active this week" value={o.activeStudents} hint="Students with learning activity in 7 days" />
        <Stat label="Awaiting grading" value={o.pendingAttempts} tone={o.pendingAttempts ? "pending" : undefined} hint="Submitted attempts with unmarked questions" />
        <Stat label="Average course progress" value={directory.length ? `${avgProgress}%` : "—"} hint="Across all students" />
      </div>

      {o.students === 0 ? (
        <Card className="mb-6">
          <EmptyState icon={<Users size={18} />} title="No students yet">
            Students create their own accounts at <code>/register</code>. Share the site link with your class — their progress and results will appear here.
          </EmptyState>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Tests" action={<Link href="/teacher/tests" className="text-[12.5px] text-primary hover:underline">Manage</Link>} />
          {o.tests.length === 0 ? (
            <EmptyState title="No published tests" />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Test</th>
                  <th className="text-right">Students submitted</th>
                  <th className="text-right">To grade</th>
                  <th className="text-right">Avg (graded)</th>
                </tr>
              </thead>
              <tbody>
                {o.tests.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link href={`/teacher/tests/${t.id}/results`} className="font-medium hover:text-primary">
                        {t.title}
                      </Link>
                      {t.status === "ARCHIVED" && <Badge className="ml-1.5">Closed</Badge>}
                    </td>
                    <td className="text-right tabular-nums">{t.submissions}</td>
                    <td className="text-right tabular-nums">{t.pending ? <Badge tone="pending">{t.pending}</Badge> : "0"}</td>
                    <td className="text-right tabular-nums">{t.average == null ? "—" : `${t.average}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <CardHeader title="Course completion" />
          <ul className="divide-y divide-divider">
            {courses.map((c) => {
              const rows = directory.filter((s) => s.courses.includes(c.title));
              const avg = rows.length ? Math.round(rows.reduce((n, s) => n + s.progress, 0) / rows.length) : 0;
              return (
                <li key={c.id} className="px-4 py-3">
                  <div className="mb-1 flex justify-between text-[13px]">
                    <Link href={`/teacher/courses/${c.id}`} className="font-medium hover:text-primary">
                      {c.title}
                    </Link>
                    <span className="text-muted">
                      {c._count.enrollments} enrolled · {c._count.lessons} lessons
                    </span>
                  </div>
                  <ProgressBar value={avg} label={`${c.title} average progress`} />
                  <div className="mt-1 text-[11.5px] text-faint">Average lesson completion {rows.length ? `${avg}%` : "— (no enrolled students)"}</div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="May need support" description="Based on low average scores or inactivity." />
          {support.length === 0 ? (
            <EmptyState title="Nobody flagged" />
          ) : (
            <ul className="divide-y divide-divider">
              {support.map(({ s, reasons }) => (
                <li key={s.id} className="px-4 py-2.5">
                  <Link href={`/teacher/students/${s.id}`} className="font-medium hover:text-primary">
                    {s.name}
                  </Link>
                  <div className="text-[12.5px] text-muted">{reasons.join(" · ")}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent student activity" />
          {o.recent.length === 0 ? (
            <EmptyState title="No activity yet" />
          ) : (
            <ul className="divide-y divide-divider">
              {o.recent.map((e) => (
                <li key={e.id} className="flex items-center gap-2 px-4 py-2 text-[13px]">
                  <Link href={`/teacher/students/${e.user.id}`} className="font-medium hover:text-primary">
                    {e.user.name}
                  </Link>
                  <span className="min-w-0 flex-1 truncate text-muted">
                    <ActivityInline type={e.type} label={e.label} />
                  </span>
                  <span className="shrink-0 text-[11.5px] text-faint">{fmtRelative(e.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function ActivityInline({ type, label }: { type: string; label: string | null }) {
  const verb: Record<string, string> = {
    LESSON_VIEWED: "opened",
    LESSON_COMPLETED: "completed",
    LESSON_REOPENED: "reopened",
    PRACTICE_SUBMITTED: "answered practice",
    CODE_RUN: "ran code",
    TEST_STARTED: "started",
    TEST_SUBMITTED: "submitted",
    BOOKMARK_ADDED: "bookmarked",
    NOTE_SAVED: "saved a note on",
  };
  return (
    <>
      {verb[type] ?? type} {type !== "CODE_RUN" && type !== "PRACTICE_SUBMITTED" ? label : ""}
    </>
  );
}
