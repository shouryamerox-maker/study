import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/server/auth/guards";
import { db } from "@/server/db";
import { assignedAssessments, canStudentSeeResults, finalizeExpiredAttempts, snapshotOf } from "@/server/assessments/attempts";
import { canStart, startBlockMessage } from "@/lib/assessment-rules";
import { Alert, Badge, Card, CardHeader, PageHeader, fmtDate, fmtMarks } from "@/components/ui";
import { Markdown } from "@/components/content/Markdown";
import { StartTestButton } from "@/components/tests/StartTestButton";

export default async function TestOverview({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ submitted?: string }> }) {
  const { id } = await params;
  const { submitted } = await searchParams;
  const user = await requirePageUser();
  await finalizeExpiredAttempts({ userId: user.id, assessmentId: id });
  const a = (await assignedAssessments(user.id)).find((x) => x.id === id);
  if (!a) notFound();

  const [attempts, version] = await Promise.all([
    db.attempt.findMany({ where: { userId: user.id, assessmentId: id }, orderBy: { attemptNumber: "asc" } }),
    a.currentVersionId ? db.assessmentVersion.findUnique({ where: { id: a.currentVersionId } }) : null,
  ]);
  const open = attempts.find((t) => t.status === "IN_PROGRESS");
  const used = attempts.length;
  const block = open ? null : canStart(a, used, new Date(), a.dueOverride);
  const snap = version ? snapshotOf(version) : null;

  return (
    <>
      <PageHeader crumbs={[{ href: "/tests", label: "Tests & Results" }, { label: a.title }]} title={a.title} description={a.description} />
      {submitted && (
        <Alert tone="success" className="mb-5" title="Your test was submitted">
          Your answers have been recorded. {a.resultRelease === "IMMEDIATE" ? "You can view your result below." : "Your teacher will release the results."}
        </Alert>
      )}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader title="Instructions" />
          <div className="p-5">{a.instructions ? <Markdown>{a.instructions}</Markdown> : <p className="text-muted">No special instructions.</p>}</div>
          {snap && (
            <div className="border-t border-divider px-5 py-4">
              <div className="label-caps mb-2">Structure</div>
              <ul className="space-y-1 text-[13.5px]">
                {snap.sections.map((s) => (
                  <li key={s.id} className="flex justify-between gap-3">
                    <span>{s.title}</span>
                    <span className="tabular-nums text-muted">{fmtMarks(s.questions.reduce((n, q) => n + q.marks, 0))} marks</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
        <div className="space-y-4">
          <Card className="p-4">
            <dl className="space-y-2 text-[13.5px]">
              <div className="flex justify-between">
                <dt className="text-muted">Total marks</dt>
                <dd className="font-semibold tabular-nums">{fmtMarks(version?.totalMarks)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Duration</dt>
                <dd>{a.durationMinutes ? `${a.durationMinutes} minutes` : "Untimed"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Opens</dt>
                <dd>{a.availableFrom ? fmtDate(a.availableFrom, true) : "Now"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Deadline</dt>
                <dd>{a.effectiveDueAt ? fmtDate(a.effectiveDueAt, true) : "None"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Attempts used</dt>
                <dd className="tabular-nums">
                  {attempts.filter((t) => t.status !== "IN_PROGRESS").length} / {a.attemptLimit}
                </dd>
              </div>
            </dl>
            <div className="mt-4">
              {open ? (
                <StartTestButton assessmentId={a.id} resume duration={a.durationMinutes} marks={version?.totalMarks ?? null} />
              ) : block ? (
                <p className="text-[13px] text-muted">{startBlockMessage[block]}</p>
              ) : (
                <StartTestButton assessmentId={a.id} resume={false} duration={a.durationMinutes} marks={version?.totalMarks ?? null} />
              )}
            </div>
          </Card>
          {attempts.filter((t) => t.status !== "IN_PROGRESS").length > 0 && (
            <Card>
              <CardHeader title="Your attempts" />
              <ul className="divide-y divide-divider">
                {attempts
                  .filter((t) => t.status !== "IN_PROGRESS")
                  .map((t) => {
                    const visible = canStudentSeeResults(a, t);
                    return (
                      <li key={t.id} className="px-4 py-2.5 text-[13px]">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Attempt {t.attemptNumber}</span>
                          {t.status === "AUTO_SUBMITTED" && <Badge tone="pending">Auto-submitted</Badge>}
                        </div>
                        <div className="text-muted">Submitted {fmtDate(t.submittedAt, true)}</div>
                        {visible ? (
                          <Link href={`/tests/${a.id}/result/${t.id}`} className="mt-1 inline-block text-primary hover:underline">
                            {fmtMarks(t.score)} / {fmtMarks(t.maxScore)} — view result
                            {t.gradingStatus === "PENDING_REVIEW" ? " (partly graded)" : ""}
                          </Link>
                        ) : (
                          <div className="mt-1 text-faint">Result not released yet</div>
                        )}
                      </li>
                    );
                  })}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
