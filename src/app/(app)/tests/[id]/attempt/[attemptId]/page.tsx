import { notFound, redirect } from "next/navigation";
import { requirePageUser } from "@/server/auth/guards";
import { getAttemptForStudent } from "@/server/assessments/attempts";
import { executionAvailable } from "@/server/execution";
import { ApiError } from "@/server/http";
import { TestRunner } from "@/components/tests/TestRunner";

export const metadata = { title: "Test in progress" };

export default async function AttemptPage({ params }: { params: Promise<{ id: string; attemptId: string }> }) {
  const { id, attemptId } = await params;
  const user = await requirePageUser();
  let data;
  try {
    data = await getAttemptForStudent(user, attemptId);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  if (data.attempt.assessmentId !== id) notFound();
  if (data.attempt.status !== "IN_PROGRESS") redirect(`/tests/${id}?submitted=1`);

  return (
    <TestRunner
      assessmentId={id}
      attemptId={attemptId}
      title={data.snapshot.title}
      totalMarks={data.snapshot.totalMarks}
      deadlineAt={data.attempt.deadlineAt?.toISOString() ?? null}
      serverTime={new Date().toISOString()}
      sections={data.snapshot.sections}
      initial={data.responses.map((r) => ({ questionId: r.questionId, response: r.response as never, markedForReview: r.markedForReview }))}
      executionAvailable={executionAvailable()}
    />
  );
}
