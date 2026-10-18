import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageStaff } from "@/server/auth/guards";
import { db } from "@/server/db";
import { studentReport } from "@/server/services/reports";
import { assignedAssessments } from "@/server/assessments/attempts";
import { Avatar, Badge, Card, CardHeader, PageHeader, cn, fmtDate, fmtRelative } from "@/components/ui";
import { StudentProgressReport } from "@/components/reports/StudentProgressReport";
import { StudentAdmin } from "@/components/teacher/StudentAdmin";
import { percent } from "@/lib/grading";

export const metadata = { title: "Student report" };

const TABS = [
  { id: "progress", label: "Learning progress" },
  { id: "tests", label: "Tests" },
  { id: "activity", label: "Activity" },
  { id: "account", label: "Account" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default async function StudentReportPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const tab: Tab = (TABS.find((t) => t.id === sp.tab)?.id ?? "progress") as Tab;
  const viewer = await requirePageStaff();
  const student = await db.user.findUnique({ where: { id }, include: { enrollments: true, groupMemberships: { include: { group: true } } } });
  if (!student) notFound();
  const [r, courses, assigned, bookmarks] = await Promise.all([
    studentReport(id, { asTeacher: true, eventLimit: 80 }),
    db.course.findMany({ orderBy: { order: "asc" } }),
    assignedAssessments(id),
    db.bookmark.count({ where: { userId: id } }),
  ]);
  const enrolledIds = new Set(student.enrollments.filter((e) => e.status === "active").map((e) => e.courseId));
  const attemptedIds = new Set(r.tests.map((t) => t.assessmentId));
  const scored = r.tests.filter((t) => t.score != null);
  const totals = r.courses.reduce((a, c) => ({ done: a.done + c.progress.done, total: a.total + c.progress.total }), { done: 0, total: 0 });
  const pending = r.tests.filter((t) => t.pending).length;

  return (
    <>
      <PageHeader back={{ href: "/teacher/students", label: "Back to students" }} title={student.name} />
      <div className="-mt-3 mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-muted">
        <span className="flex items-center gap-2">
          <Avatar name={student.name} color={student.avatarColor} size={26} />
          {student.email}
          {student.studentCode ? ` · ${student.studentCode}` : ""}
        </span>
        <span>Last active {fmtRelative(student.lastActiveAt)}</span>
        <span>
          Lessons {totals.done}/{totals.total}
        </span>
        <span>
          {r.tests.length} test attempt{r.tests.length === 1 ? "" : "s"}
          {pending ? ` · ${pending} to grade` : ""}
        </span>
        {student.status !== "ACTIVE" && <Badge tone="danger">Suspended</Badge>}
      </div>

      <nav aria-label="Student report sections" className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/teacher/students/${id}?tab=${t.id}`}
            aria-current={tab === t.id ? "page" : undefined}
            className={cn("-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-[13.5px]", tab === t.id ? "border-primary font-medium text-ink" : "border-transparent text-muted hover:text-ink")}
          >
            {t.label}
            {t.id === "tests" && pending > 0 && <Badge tone="pending" className="ml-1.5">{pending}</Badge>}
          </Link>
        ))}
      </nav>

      {tab === "progress" && <StudentProgressReport {...r} show={["stats", "courses", "practice"]} testHref={() => null} />}

      {tab === "tests" && (
        <div className="space-y-5">
          <Card>
            <CardHeader title="Assigned tests" description={`${attemptedIds.size} attempted · ${assigned.filter((a) => !attemptedIds.has(a.id)).length} not attempted`} />
            {assigned.length === 0 ? (
              <p className="px-4 py-3 text-[13px] text-muted">No tests assigned.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th className="text-right">Best</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assigned.map((a) => {
                      const mine = scored.filter((t) => t.assessmentId === a.id);
                      const best = mine.length ? Math.max(...mine.map((t) => percent(t.score!, t.maxScore))) : null;
                      return (
                        <tr key={a.id}>
                          <td className="font-medium">{a.title}</td>
                          <td className="text-muted">{fmtDate(a.effectiveDueAt, true)}</td>
                          <td>{attemptedIds.has(a.id) ? <Badge tone="success">Submitted</Badge> : <Badge>Not attempted</Badge>}</td>
                          <td className="text-right tabular-nums">{best == null ? "—" : `${best}%`}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          <StudentProgressReport {...r} show={["tests"]} testHref={(t) => `/teacher/attempts/${t.attemptId}?from=student`} />
        </div>
      )}

      {tab === "activity" && <StudentProgressReport {...r} show={["activity"]} testHref={() => null} />}

      {tab === "account" && (
        <Card className="max-w-xl">
          <CardHeader title="Manage account" />
          <StudentAdmin
            id={student.id}
            status={student.status}
            studentCode={student.studentCode}
            role={student.role}
            viewerIsAdmin={viewer.role === "ADMIN"}
            courses={courses.map((c) => ({ id: c.id, title: c.title, enrolled: enrolledIds.has(c.id) }))}
          />
          <dl className="grid grid-cols-2 gap-3 border-t border-divider px-4 py-3 text-[13px]">
            <div>
              <dt className="text-muted">Registered</dt>
              <dd>{fmtDate(student.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted">Groups</dt>
              <dd>{student.groupMemberships.map((g) => g.group.name).join(", ") || "—"}</dd>
            </div>
          </dl>
          <p className="border-t border-divider px-4 py-2.5 text-[11.5px] text-faint">The student has {bookmarks} bookmarks. Their private notes are not visible to teachers.</p>
        </Card>
      )}
    </>
  );
}
