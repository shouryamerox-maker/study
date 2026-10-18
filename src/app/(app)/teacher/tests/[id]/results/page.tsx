import { requirePageStaff } from "@/server/auth/guards";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { db } from "@/server/db";
import { allQuestions, finalizeExpiredAttempts, snapshotOf } from "@/server/assessments/attempts";
import { assignedStudentIds } from "@/server/services/teacher";
import { Badge, Card, CardHeader, EmptyState, LinkButton, PageHeader, ProgressBar, Stat, fmtDate, fmtMarks } from "@/components/ui";
import { AssignPanel, StatusButtons } from "@/components/teacher/TestActions";
import { percent } from "@/lib/grading";

export const metadata = { title: "Test results" };

export default async function TestResults({ params }: { params: Promise<{ id: string }> }) {
  await requirePageStaff();
  const { id } = await params;
  await finalizeExpiredAttempts({ assessmentId: id });
  const a = await db.assessment.findUnique({
    where: { id },
    include: { currentVersion: true, assignments: true, course: true },
  });
  if (!a) notFound();

  const [attempts, assignedIds, students, groups] = await Promise.all([
    db.attempt.findMany({ where: { assessmentId: id }, include: { user: { select: { id: true, name: true, email: true } }, responses: true, version: { select: { version: true } } }, orderBy: [{ userId: "asc" }, { attemptNumber: "asc" }] }),
    assignedStudentIds(id),
    db.user.findMany({ where: { role: "STUDENT", status: "ACTIVE" }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
    db.group.findMany({ include: { _count: { select: { members: true } } }, orderBy: { name: "asc" } }),
  ]);

  const attemptUserIds = new Set(attempts.map((t) => t.userId));
  const roster = [...new Set([...assignedIds, ...attemptUserIds])];
  const userMap = new Map(students.map((s) => [s.id, s]));
  attempts.forEach((t) => userMap.set(t.user.id, t.user));
  const submitted = attempts.filter((t) => t.status !== "IN_PROGRESS");
  const graded = submitted.filter((t) => t.gradingStatus === "GRADED");
  const avg = graded.length ? Math.round((graded.reduce((n, t) => n + percent(t.score ?? 0, t.maxScore), 0) / graded.length) * 10) / 10 : null;
  const released = !!a.resultsReleasedAt || a.resultRelease === "IMMEDIATE";

  // Question-level statistics on the current version.
  const questions = a.currentVersion ? allQuestions(snapshotOf(a.currentVersion)) : [];
  const qStats = questions.map((q) => {
    const rs = submitted
      .filter((t) => t.versionId === a.currentVersionId)
      .map((t) => t.responses.find((r) => r.questionId === q.id))
      .filter((r) => r && r.status !== "PENDING_REVIEW");
    const avgScore = rs.length ? rs.reduce((n, r) => n + (r!.score ?? 0), 0) / rs.length : null;
    return { q, n: rs.length, avg: avgScore };
  });

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/teacher/tests", label: "Tests & Assessments" }, { label: a.title }]}
        title={a.title}
        description={`${a.course.title} · ${a.currentVersion ? `version ${a.currentVersion.version}, ${fmtMarks(a.currentVersion.totalMarks)} marks` : "not published"} · results ${released ? "released to students" : "not released"}`}
        actions={
          <>
            <StatusButtons id={a.id} status={a.status} released={!!a.resultsReleasedAt} hasVersion={!!a.currentVersionId} resultRelease={a.resultRelease} />
            <a href={`/api/v1/teacher/tests/${a.id}/export`} className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-border bg-surface px-2.5 text-[13px] hover:bg-sidebar">
              <Download size={13} /> Export CSV
            </a>
            <LinkButton href={`/teacher/tests/${a.id}`} variant="ghost" size="sm">
              Edit
            </LinkButton>
          </>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Expected to take" value={roster.length} />
        <Stat label="Submitted" value={new Set(submitted.map((t) => t.userId)).size} hint={`${attempts.filter((t) => t.status === "IN_PROGRESS").length} in progress`} />
        <Stat label="Awaiting grading" value={submitted.filter((t) => t.gradingStatus === "PENDING_REVIEW").length} tone="pending" />
        <Stat label="Average (fully graded)" value={avg == null ? "—" : `${avg}%`} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Card className="overflow-x-auto">
            <CardHeader title="Students" />
            {roster.length === 0 ? (
              <EmptyState title="Nobody is assigned yet">Use the Assign panel to choose students.</EmptyState>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Attempt</th>
                    <th>Submitted</th>
                    <th className="text-right">Score</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {roster.flatMap((uid) => {
                    const u = userMap.get(uid);
                    const mine = attempts.filter((t) => t.userId === uid);
                    if (mine.length === 0)
                      return [
                        <tr key={uid}>
                          <td>
                            <Link href={`/teacher/students/${uid}`} className="font-medium hover:text-primary">
                              {u?.name ?? "Unknown"}
                            </Link>
                          </td>
                          <td>
                            <Badge>Not attempted</Badge>
                          </td>
                          <td colSpan={4} />
                        </tr>,
                      ];
                    return mine.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <Link href={`/teacher/students/${uid}`} className="font-medium hover:text-primary">
                            {t.user.name}
                          </Link>
                          <div className="text-[11.5px] text-muted">{t.user.email}</div>
                        </td>
                        <td>
                          {t.status === "IN_PROGRESS" ? (
                            <Badge tone="pending">In progress</Badge>
                          ) : t.gradingStatus === "PENDING_REVIEW" ? (
                            <Badge tone="pending">Pending review</Badge>
                          ) : (
                            <Badge tone="success">Graded</Badge>
                          )}
                          {t.status === "AUTO_SUBMITTED" && <Badge className="ml-1">Auto</Badge>}
                        </td>
                        <td className="tabular-nums text-muted">
                          #{t.attemptNumber} · v{t.version.version}
                        </td>
                        <td className="whitespace-nowrap text-muted">{fmtDate(t.submittedAt, true)}</td>
                        <td className="text-right tabular-nums">
                          {t.status === "IN_PROGRESS" ? "—" : `${fmtMarks(t.score)} / ${fmtMarks(t.maxScore)} (${percent(t.score ?? 0, t.maxScore)}%)`}
                        </td>
                        <td className="text-right">
                          <LinkButton href={`/teacher/attempts/${t.id}`} size="sm" variant={t.gradingStatus === "PENDING_REVIEW" ? "primary" : "secondary"}>
                            {t.gradingStatus === "PENDING_REVIEW" ? "Grade" : "Open"}
                          </LinkButton>
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            )}
          </Card>
          {qStats.length > 0 && (
            <Card className="overflow-x-auto">
              <CardHeader title="Question analysis" description="Average marks per question (graded responses on the current version)." />
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Question</th>
                    <th className="w-40">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {qStats.map(({ q, n, avg: qa }) => (
                    <tr key={q.id}>
                      <td className="tabular-nums">Q{q.number}</td>
                      <td className="text-[12px] text-muted">{q.type.replace(/_/g, " ").toLowerCase()}</td>
                      <td className="max-w-[360px] truncate text-[13px]">{q.prompt.replace(/[*`#]/g, "").slice(0, 120)}</td>
                      <td>
                        {qa == null ? (
                          <span className="text-faint">—</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <ProgressBar value={(qa / q.marks) * 100} tone={qa / q.marks >= 0.6 ? "success" : "primary"} />
                            <span className="w-16 text-right text-[12px] tabular-nums">
                              {fmtMarks(Math.round(qa * 100) / 100)}/{fmtMarks(q.marks)}
                            </span>
                          </div>
                        )}
                        {n > 0 && <div className="text-[11px] text-faint">{n} responses</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
        <div className="space-y-5">
          <AssignPanel
            id={a.id}
            assignToAll={a.assignToAll}
            students={students}
            groups={groups.map((g) => ({ id: g.id, name: g.name, count: g._count.members }))}
            assignedUserIds={a.assignments.map((x) => x.userId).filter((x): x is string => !!x)}
            assignedGroupIds={a.assignments.map((x) => x.groupId).filter((x): x is string => !!x)}
            dueAt={a.assignments.find((x) => x.dueAt)?.dueAt?.toISOString() ?? null}
          />
        </div>
      </div>
    </>
  );
}
