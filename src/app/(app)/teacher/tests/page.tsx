import { requirePageStaff } from "@/server/auth/guards";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { db } from "@/server/db";
import { Badge, Card, CardHeader, EmptyState, LinkButton, PageHeader, fmtDate, fmtMarks } from "@/components/ui";
import { NewTestForm } from "@/components/teacher/TestActions";

export const metadata = { title: "Tests & Assessments" };

export default async function TeacherTests() {
  await requirePageStaff();
  const [tests, courses] = await Promise.all([
    db.assessment.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        course: { select: { title: true } },
        currentVersion: { select: { version: true, totalMarks: true } },
        attempts: { select: { status: true, gradingStatus: true } },
        _count: { select: { assignments: true } },
      },
    }),
    db.course.findMany({ orderBy: { order: "asc" }, select: { id: true, title: true } }),
  ]);

  return (
    <>
      <PageHeader title="Tests & Assessments" description="Create, publish and assign tests, then review submissions." />
      <Card className="mb-5">
        <CardHeader title="New test" />
        <div className="p-4">{courses.length ? <NewTestForm courses={courses} /> : <p className="text-[13px] text-muted">Create a course first.</p>}</div>
      </Card>
      <Card className="overflow-x-auto">
        {tests.length === 0 ? (
          <EmptyState icon={<ClipboardList size={18} />} title="No tests yet" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Status</th>
                <th className="text-right">Marks</th>
                <th>Assigned</th>
                <th>Deadline</th>
                <th className="text-right">Submitted</th>
                <th className="text-right">To grade</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => {
                const submitted = t.attempts.filter((a) => a.status !== "IN_PROGRESS").length;
                const pending = t.attempts.filter((a) => a.gradingStatus === "PENDING_REVIEW").length;
                return (
                  <tr key={t.id}>
                    <td>
                      <Link href={`/teacher/tests/${t.id}`} className="font-medium hover:text-primary">
                        {t.title}
                      </Link>
                      <div className="text-[12px] text-muted">
                        {t.course.title}
                        {t.currentVersion ? ` · v${t.currentVersion.version}` : ""}
                      </div>
                    </td>
                    <td>
                      <Badge tone={t.status === "PUBLISHED" ? "success" : t.status === "DRAFT" ? "pending" : "neutral"}>{t.status === "ARCHIVED" ? "Closed" : t.status.toLowerCase()}</Badge>
                    </td>
                    <td className="text-right tabular-nums">{fmtMarks(t.currentVersion?.totalMarks)}</td>
                    <td className="text-muted">{t.assignToAll ? "All enrolled" : t._count.assignments ? `${t._count.assignments} assignment(s)` : <span className="text-pending">Not assigned</span>}</td>
                    <td className="text-muted">{fmtDate(t.dueAt, true)}</td>
                    <td className="text-right tabular-nums">{submitted}</td>
                    <td className="text-right tabular-nums">{pending ? <Badge tone="pending">{pending}</Badge> : 0}</td>
                    <td className="whitespace-nowrap text-right">
                      <LinkButton href={`/teacher/tests/${t.id}/results`} size="sm" variant="secondary">
                        Results
                      </LinkButton>{" "}
                      <LinkButton href={`/teacher/tests/${t.id}`} size="sm" variant="ghost">
                        Edit
                      </LinkButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
