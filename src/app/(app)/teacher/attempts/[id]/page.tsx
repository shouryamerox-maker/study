import { requirePageStaff } from "@/server/auth/guards";
import { notFound } from "next/navigation";
import { attemptReview } from "@/server/services/teacher";
import { executionAvailable } from "@/server/execution";
import { PageHeader } from "@/components/ui";
import { ReviewWorkspace } from "@/components/teacher/ReviewWorkspace";

export const metadata = { title: "Review attempt" };

export default async function AttemptReviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ q?: string; from?: string }> }) {
  await requirePageStaff();
  const { id } = await params;
  const { q, from } = await searchParams;
  const data = await attemptReview(id);
  if (!data) notFound();
  const { attempt } = data;
  const back =
    from === "student"
      ? { href: `/teacher/students/${attempt.user.id}?tab=tests`, label: `Back to ${attempt.user.name}` }
      : from === "results"
        ? { href: `/teacher/tests/${attempt.assessment.id}/results`, label: "Back to test results" }
        : { href: "/teacher/grading", label: "Back to grading queue" };
  return (
    <>
      <PageHeader
        back={back}
        crumbs={[
          { href: `/teacher/students/${attempt.user.id}`, label: attempt.user.name },
          { href: `/teacher/tests/${attempt.assessment.id}/results`, label: attempt.assessment.title },
          { label: `Attempt ${attempt.attemptNumber}` },
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
