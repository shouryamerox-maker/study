import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { requirePageUser } from "@/server/auth/guards";
import { db } from "@/server/db";
import { assignedAssessments, canStudentSeeResults, finalizeExpiredAttempts } from "@/server/assessments/attempts";
import { Badge, Card, EmptyState, PageHeader, fmtDate, fmtMarks } from "@/components/ui";
import { percent } from "@/lib/grading";

export const metadata = { title: "Tests & Results" };

type Row = { id: string; title: string; course: string; marks: number | null; duration: number | null; due: Date | null; state: "todo" | "in_progress" | "upcoming" | "submitted" | "missed" | "closed"; result: string | null; pending: boolean; attemptsText: string };

const stateBadge = {
  todo: <Badge tone="primary">Available</Badge>,
  in_progress: <Badge tone="pending">In progress</Badge>,
  upcoming: <Badge>Upcoming</Badge>,
  submitted: <Badge tone="success">Submitted</Badge>,
  missed: <Badge tone="danger">Missed</Badge>,
  closed: <Badge>Closed</Badge>,
};

export default async function TestsPage() {
  const user = await requirePageUser();
  await finalizeExpiredAttempts({ userId: user.id });
  const [list, attempts] = await Promise.all([assignedAssessments(user.id), db.attempt.findMany({ where: { userId: user.id }, orderBy: { attemptNumber: "desc" } })]);
  const now = new Date();

  const rows: Row[] = list.map((a) => {
    const mine = attempts.filter((t) => t.assessmentId === a.id);
    const latest = mine[0];
    const due = a.effectiveDueAt;
    let state: Row["state"];
    if (mine.some((t) => t.status === "IN_PROGRESS")) state = "in_progress";
    else if (a.availableFrom && a.availableFrom > now) state = "upcoming";
    else if (mine.length > 0 && (mine.length >= a.attemptLimit || (due && due < now) || a.status !== "PUBLISHED")) state = "submitted";
    else if (due && due < now) state = mine.length ? "submitted" : "missed";
    else if (a.status !== "PUBLISHED") state = mine.length ? "submitted" : "closed";
    else state = mine.length ? "submitted" : "todo";
    if (state === "submitted" && mine.length < a.attemptLimit && a.status === "PUBLISHED" && !(due && due < now)) state = "todo";
    const visible = latest && latest.status !== "IN_PROGRESS" && canStudentSeeResults(a, latest);
    return {
      id: a.id,
      title: a.title,
      course: a.course.title,
      marks: a.currentVersion?.totalMarks ?? null,
      duration: a.durationMinutes,
      due,
      state,
      result: visible ? `${fmtMarks(latest.score)} / ${fmtMarks(latest.maxScore)} (${percent(latest.score ?? 0, latest.maxScore)}%)` : null,
      pending: !!visible && latest.gradingStatus === "PENDING_REVIEW",
      attemptsText: `${mine.filter((t) => t.status !== "IN_PROGRESS").length} / ${a.attemptLimit}`,
    };
  });

  const groups: [string, Row[]][] = [
    ["To do", rows.filter((r) => r.state === "todo" || r.state === "in_progress")],
    ["Upcoming", rows.filter((r) => r.state === "upcoming")],
    ["Completed", rows.filter((r) => r.state === "submitted" || r.state === "missed" || r.state === "closed")],
  ];

  return (
    <>
      <PageHeader title="Tests & Results" description="Tests assigned to you, their deadlines and your released results." />
      {rows.length === 0 ? (
        <Card>
          <EmptyState icon={<ClipboardCheck size={18} />} title="No tests assigned yet">
            When your teacher assigns a test, it will appear here.
          </EmptyState>
        </Card>
      ) : (
        groups
          .filter(([, r]) => r.length)
          .map(([label, r]) => (
            <section key={label} className="mb-6">
              <h2 className="label-caps mb-2">{label}</h2>
              <Card className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Status</th>
                      <th className="text-right">Marks</th>
                      <th>Duration</th>
                      <th>Deadline</th>
                      <th>Attempts</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <Link href={`/tests/${t.id}`} className="font-medium hover:text-primary">
                            {t.title}
                          </Link>
                          <div className="text-[12px] text-muted">{t.course}</div>
                        </td>
                        <td>{stateBadge[t.state]}</td>
                        <td className="text-right tabular-nums">{t.marks ?? "—"}</td>
                        <td className="text-muted">{t.duration ? `${t.duration} min` : "Untimed"}</td>
                        <td className="text-muted">{t.due ? fmtDate(t.due, true) : "—"}</td>
                        <td className="tabular-nums text-muted">{t.attemptsText}</td>
                        <td>
                          {t.result ? (
                            <span className="tabular-nums">
                              {t.result} {t.pending && <Badge tone="pending">Partly graded</Badge>}
                            </span>
                          ) : t.state === "submitted" ? (
                            <span className="text-[12.5px] text-faint">Not released</span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </section>
          ))
      )}
    </>
  );
}
