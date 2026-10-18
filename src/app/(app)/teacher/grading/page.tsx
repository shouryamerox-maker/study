import { requirePageStaff } from "@/server/auth/guards";
import Link from "next/link";
import { FileCheck2 } from "lucide-react";
import { db } from "@/server/db";
import { finalizeExpiredAttempts } from "@/server/assessments/attempts";
import { Badge, Card, EmptyState, LinkButton, PageHeader, cn, fmtDate, fmtMarks } from "@/components/ui";

export const metadata = { title: "Submissions & Grading" };

export default async function GradingPage({ searchParams }: { searchParams: Promise<{ filter?: string; test?: string }> }) {
  await requirePageStaff();
  const sp = await searchParams;
  await finalizeExpiredAttempts();
  const filter = sp.filter ?? "pending";
  const [attempts, tests] = await Promise.all([
    db.attempt.findMany({
      where: {
        status: { not: "IN_PROGRESS" },
        ...(filter === "pending" ? { gradingStatus: "PENDING_REVIEW" } : filter === "graded" ? { gradingStatus: "GRADED" } : {}),
        ...(sp.test ? { assessmentId: sp.test } : {}),
      },
      include: { user: { select: { name: true, email: true } }, assessment: { select: { title: true } }, responses: { where: { status: "PENDING_REVIEW" }, select: { id: true } } },
      orderBy: { submittedAt: filter === "pending" ? "asc" : "desc" },
      take: 200,
    }),
    db.assessment.findMany({ where: { attempts: { some: {} } }, select: { id: true, title: true } }),
  ]);
  const inProgress = await db.attempt.count({ where: { status: "IN_PROGRESS" } });

  return (
    <>
      <PageHeader title="Submissions & Grading" description={`Oldest pending first.${inProgress ? ` ${inProgress} attempt${inProgress > 1 ? "s are" : " is"} currently in progress.` : ""}`} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[
          ["pending", "Pending review"],
          ["graded", "Graded"],
          ["all", "All submissions"],
        ].map(([v, l]) => (
          <Link
            key={v}
            href={`/teacher/grading?filter=${v}${sp.test ? `&test=${sp.test}` : ""}`}
            className={cn("rounded-[7px] border px-2.5 py-1 text-[12.5px]", filter === v ? "border-primary bg-primary-soft text-primary-dark" : "border-border bg-surface text-muted hover:text-ink")}
          >
            {l}
          </Link>
        ))}
        <form className="ml-auto" action="/teacher/grading">
          <input type="hidden" name="filter" value={filter} />
          <label htmlFor="test" className="sr-only">
            Test
          </label>
          <select id="test" name="test" defaultValue={sp.test ?? ""} className="input h-8 w-auto" onChange={undefined}>
            <option value="">All tests</option>
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <button type="submit" className="ml-2 text-[12.5px] text-primary">
            Filter
          </button>
        </form>
      </div>
      <Card className="overflow-x-auto">
        {attempts.length === 0 ? (
          <EmptyState icon={<FileCheck2 size={18} />} title={filter === "pending" ? "Nothing waiting for review" : "No submissions"} />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Test</th>
                <th>Attempt</th>
                <th>Submitted</th>
                <th className="text-right">Score so far</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="font-medium">{a.user.name}</div>
                    <div className="text-[12px] text-muted">{a.user.email}</div>
                  </td>
                  <td>{a.assessment.title}</td>
                  <td className="tabular-nums">
                    #{a.attemptNumber}
                    {a.status === "AUTO_SUBMITTED" && <Badge tone="pending" className="ml-1">Auto</Badge>}
                  </td>
                  <td className="whitespace-nowrap text-muted">{fmtDate(a.submittedAt, true)}</td>
                  <td className="text-right tabular-nums">
                    {fmtMarks(a.score)} / {fmtMarks(a.maxScore)}
                  </td>
                  <td>{a.gradingStatus === "PENDING_REVIEW" ? <Badge tone="pending">{a.responses.length} to grade</Badge> : <Badge tone="success">Graded</Badge>}</td>
                  <td className="text-right">
                    <LinkButton href={`/teacher/attempts/${a.id}`} size="sm" variant={a.gradingStatus === "PENDING_REVIEW" ? "primary" : "secondary"}>
                      {a.gradingStatus === "PENDING_REVIEW" ? "Grade" : "Review"}
                    </LinkButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
