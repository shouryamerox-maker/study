import Link from "next/link";
import { PenLine, RotateCcw } from "lucide-react";
import { requirePageUser } from "@/server/auth/guards";
import { db } from "@/server/db";
import { practiceStats } from "@/server/services/learning";
import { latestResults, toStudentQuestion } from "@/server/services/practice";
import { Alert, Badge, Card, EmptyState, LinkButton, PageHeader, ProgressBar, Stat, cn } from "@/components/ui";
import { PracticeQuestion } from "@/components/practice/PracticeQuestion";

export const metadata = { title: "Practice" };

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ chapter?: string; mode?: string; type?: string }> }) {
  const sp = await searchParams;
  const user = await requirePageUser();
  const stats = await practiceStats(user.id);

  const chapters = await db.chapter.findMany({
    where: { questions: { some: {} }, course: { published: true } },
    orderBy: [{ course: { order: "asc" } }, { unit: { order: "asc" } }, { order: "asc" }],
    select: { id: true, title: true, slug: true, course: { select: { title: true, slug: true } }, _count: { select: { questions: true } } },
  });
  const byChapter = new Map(stats.byChapter.map((c) => [c.slug, c]));

  const revision = sp.mode === "revision";
  const chapter = sp.chapter ? chapters.find((c) => c.id === sp.chapter) : null;
  const where = revision
    ? { id: { in: stats.incorrectQuestionIds } }
    : chapter
      ? { chapterId: chapter.id, ...(sp.type ? { type: sp.type as never } : {}) }
      : null;
  const questions = where ? await db.question.findMany({ where, orderBy: [{ chapter: { order: "asc" } }, { order: "asc" }] }) : [];
  const latest = await latestResults(user.id, questions.map((q) => q.id));

  if (where) {
    return (
      <>
        <PageHeader
          crumbs={[{ href: "/practice", label: "Practice" }, { label: revision ? "Revision set" : chapter!.title }]}
          title={revision ? "Revision: questions you got wrong" : chapter!.title}
          description={revision ? "Your latest answer to each of these was incorrect. Get them right to clear them from this list." : `${questions.length} practice questions in this chapter.`}
        />
        {!revision && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {[
              ["", "All"],
              ["MCQ", "Multiple choice"],
              ["TRUE_FALSE", "True/false"],
              ["FILL_BLANK", "Fill in the blank"],
              ["OUTPUT_PREDICTION", "Predict output"],
              ["CODE_WRITING", "Write code"],
            ].map(([v, l]) => (
              <Link
                key={v}
                href={`/practice?chapter=${chapter!.id}${v ? `&type=${v}` : ""}`}
                className={cn("rounded-[7px] border px-2.5 py-1 text-[12.5px]", (sp.type ?? "") === v ? "border-primary bg-primary-soft text-primary-dark" : "border-border bg-surface text-muted hover:text-ink")}
              >
                {l}
              </Link>
            ))}
          </div>
        )}
        {questions.length === 0 ? (
          <Card>
            <EmptyState icon={<PenLine size={18} />} title={revision ? "Nothing to revise" : "No questions here yet"}>
              {revision ? "You have no outstanding incorrect answers. Well done." : "Try another filter."}
            </EmptyState>
          </Card>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <PracticeQuestion key={q.id} number={i + 1} q={{ ...toStudentQuestion(q), lastResult: latest.get(q.id) ?? null }} />
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Practice"
        description="Topic-based practice from each chapter. Every answer is checked on the server and saved."
        actions={
          <LinkButton href="/practice?mode=revision" variant={stats.incorrectQuestionIds.length ? "primary" : "secondary"}>
            <RotateCcw size={14} /> Revise mistakes ({stats.incorrectQuestionIds.length})
          </LinkButton>
        }
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Questions attempted" value={stats.questionsAttempted} />
        <Stat label="Currently correct" value={stats.correctNow} tone="success" />
        <Stat label="Accuracy" value={stats.accuracy == null ? "—" : `${stats.accuracy}%`} hint="Based on your latest answer to each question" />
      </div>
      {chapters.length === 0 ? (
        <Alert>No practice questions have been published yet.</Alert>
      ) : (
        <Card className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Chapter</th>
                <th>Course</th>
                <th className="text-right">Questions</th>
                <th>Your progress</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {chapters.map((c) => {
                const s = byChapter.get(c.slug);
                return (
                  <tr key={c.id}>
                    <td className="font-medium">{c.title}</td>
                    <td className="text-muted">{c.course.title}</td>
                    <td className="text-right tabular-nums">{c._count.questions}</td>
                    <td className="min-w-[180px]">
                      {s ? (
                        <div className="flex items-center gap-2">
                          <ProgressBar value={(s.attempted / c._count.questions) * 100} className="w-24" />
                          <span className="text-[12px] text-muted">
                            {s.attempted} tried · {s.correct} correct
                          </span>
                          {s.correct / s.attempted < 0.6 && s.attempted >= 2 && <Badge tone="danger">Weak</Badge>}
                        </div>
                      ) : (
                        <span className="text-[12px] text-faint">Not started</span>
                      )}
                    </td>
                    <td className="text-right">
                      <LinkButton href={`/practice?chapter=${c.id}`} size="sm" variant="secondary">
                        Practise
                      </LinkButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
