import { notFound } from "next/navigation";
import { requirePageStaff } from "@/server/auth/guards";
import { db } from "@/server/db";
import { studentReport } from "@/server/services/reports";
import { assignedAssessments } from "@/server/assessments/attempts";
import { Avatar, Badge, Card, CardHeader, PageHeader, fmtDate, fmtRelative } from "@/components/ui";
import { StudentProgressReport } from "@/components/reports/StudentProgressReport";
import { StudentAdmin } from "@/components/teacher/StudentAdmin";
import { percent } from "@/lib/grading";

export const metadata = { title: "Student report" };

export default async function StudentReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await requirePageStaff();
  const student = await db.user.findUnique({ where: { id }, include: { enrollments: true, groupMemberships: { include: { group: true } } } });
  if (!student) notFound();
  const [r, courses, assigned, bookmarks] = await Promise.all([
    studentReport(id, { asTeacher: true, eventLimit: 60 }),
    db.course.findMany({ orderBy: { order: "asc" } }),
    assignedAssessments(id),
    db.bookmark.count({ where: { userId: id } }),
  ]);
  const enrolledIds = new Set(student.enrollments.filter((e) => e.status === "active").map((e) => e.courseId));
  const attemptedIds = new Set(r.tests.map((t) => t.assessmentId));
  const scored = r.tests.filter((t) => t.score != null);

  return (
    <>
      <PageHeader crumbs={[{ href: "/teacher/students", label: "Students" }, { label: student.name }]} title={student.name} description={`${student.email}${student.studentCode ? ` · ${student.studentCode}` : ""}`} />
      <div className="mb-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Card className="flex flex-wrap items-center gap-4 p-4">
            <Avatar name={student.name} color={student.avatarColor} size={44} />
            <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-1 text-[13px] sm:grid-cols-4">
              <div>
                <dt className="text-muted">Registered</dt>
                <dd>{fmtDate(student.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted">Last active</dt>
                <dd>{fmtRelative(student.lastActiveAt)}</dd>
              </div>
              <div>
                <dt className="text-muted">Account</dt>
                <dd>{student.status === "ACTIVE" ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Suspended</Badge>}</dd>
              </div>
              <div>
                <dt className="text-muted">Groups</dt>
                <dd>{student.groupMemberships.map((g) => g.group.name).join(", ") || "—"}</dd>
              </div>
            </dl>
          </Card>
          <Card>
            <CardHeader title="Assigned tests" description={`${attemptedIds.size} attempted · ${assigned.filter((a) => !attemptedIds.has(a.id)).length} not attempted`} />
            {assigned.length === 0 ? (
              <p className="px-4 py-3 text-[13px] text-muted">No tests assigned.</p>
            ) : (
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
            )}
          </Card>
        </div>
        <Card className="self-start">
          <CardHeader title="Manage account" />
          <StudentAdmin
            id={student.id}
            status={student.status}
            studentCode={student.studentCode}
            role={student.role}
            viewerIsAdmin={viewer.role === "ADMIN"}
            courses={courses.map((c) => ({ id: c.id, title: c.title, enrolled: enrolledIds.has(c.id) }))}
          />
          <p className="border-t border-divider px-4 py-2.5 text-[11.5px] text-faint">The student has {bookmarks} bookmarks. Their private notes are not visible to teachers.</p>
        </Card>
      </div>
      <StudentProgressReport {...r} lessonHref testHref={(t) => `/teacher/attempts/${t.attemptId}`} />
    </>
  );
}
