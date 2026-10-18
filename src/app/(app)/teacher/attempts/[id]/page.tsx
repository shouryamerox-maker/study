import { requirePageStaff } from "@/server/auth/guards";
import { notFound } from "next/navigation";
import { attemptReview } from "@/server/services/teacher";
import { executionAvailable } from "@/server/execution";
import { PageHeader } from "@/components/ui";
import { ReviewWorkspace } from "@/components/teacher/ReviewWorkspace";

export const metadata = { title: "Review attempt" };

export default async function AttemptReviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ q?: string }> }) {
  await requirePageStaff();
  const { id } = await params;
  const { q } = await searchParams;
  const data = await attemptReview(id);
  if (!data) notFound();
  const { attempt } = data;
  return (
    <>
      <PageHeader
        crumbs={[
          { href: "/teacher/grading", label: "Submissions & Grading" },
          { href: `/teacher/tests/${attempt.assessment.id}/results`, label: attempt.assessment.title },
          { label: `${attempt.user.name} · attempt ${attempt.attemptNumber}` },
        ]}
        title={`${attempt.user.name} — ${attempt.assessment.title}`}
      />
      <ReviewWorkspace
        initialQuestionId={q}
        executionAvailable={executionAvailable()}
        attempt={{
          id: attempt.id,
          status: attempt.status,
          inProgress: attempt.status === "IN_PROGRESS",
          attemptNumber: attempt.attemptNumber,
          version: attempt.version.version,
          startedAt: attempt.startedAt.toISOString(),
          submittedAt: attempt.submittedAt?.toISOString() ?? null,
          score: attempt.score,
          maxScore: attempt.maxScore,
          gradingStatus: attempt.gradingStatus,
          student: attempt.user,
          resultsReleased: !!attempt.assessment.resultsReleasedAt || attempt.assessment.resultRelease === "IMMEDIATE",
        }}
        others={data.others.map((o) => ({ ...o, submittedAt: o.submittedAt?.toISOString() ?? null }))}
        sections={data.snapshot.sections.map((s) => ({ id: s.id, title: s.title, questionIds: s.questions.map((q) => q.id) }))}
        items={JSON.parse(JSON.stringify(data.items))}
      />
    </>
  );
}
