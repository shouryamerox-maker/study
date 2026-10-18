import { requirePageStaff } from "@/server/auth/guards";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { loadDraft } from "@/server/assessments/definition";
import { Alert, LinkButton, PageHeader } from "@/components/ui";
import { TestEditor } from "@/components/teacher/TestEditor";

export const metadata = { title: "Edit test" };

export default async function EditTestPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageStaff();
  const { id } = await params;
  const exists = await db.assessment.findUnique({ where: { id }, select: { id: true } });
  if (!exists) notFound();
  const { assessment: a, sections } = await loadDraft(db, id);
  const [attempts, chapters] = await Promise.all([
    db.attempt.count({ where: { assessmentId: id } }),
    db.chapter.findMany({ where: { courseId: a.courseId }, orderBy: [{ unit: { order: "asc" } }, { order: "asc" }], select: { slug: true, title: true } }),
  ]);

  return (
    <>
      <PageHeader
        back={{ href: "/teacher/tests", label: "Back to tests" }}
        title={a.title}
        actions={
          <LinkButton href={`/teacher/tests/${id}/results`} variant="secondary" size="sm">
            Results & assignment
          </LinkButton>
        }
      />
      {attempts > 0 && (
        <Alert tone="pending" className="mb-4">
          {attempts} attempt{attempts > 1 ? "s have" : " has"} been made. Edits create a new version when you publish; submitted attempts keep the exact questions the student saw.
        </Alert>
      )}
      <TestEditor
        id={id}
        status={a.status}
        hasAttempts={attempts > 0}
        chapters={chapters}
        initialSettings={{
          title: a.title,
          description: a.description,
          instructions: a.instructions,
          durationMinutes: a.durationMinutes,
          availableFrom: a.availableFrom?.toISOString() ?? null,
          dueAt: a.dueAt?.toISOString() ?? null,
          attemptLimit: a.attemptLimit,
          resultRelease: a.resultRelease,
          showAnswerKey: a.showAnswerKey,
          assignToAll: a.assignToAll,
          coverage: (a.coverage as string[] | null) ?? [],
        }}
        initialSections={JSON.parse(JSON.stringify(sections))}
      />
    </>
  );
}
