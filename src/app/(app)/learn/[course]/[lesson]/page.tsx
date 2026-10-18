import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, Lock } from "lucide-react";
import { requirePageUser } from "@/server/auth/guards";
import { isStaff } from "@/server/auth/session";
import { db } from "@/server/db";
import { getCourseTree, isLessonLocked, orderedLessons, progressMap } from "@/server/services/learning";
import { latestResults, toStudentQuestion } from "@/server/services/practice";
import { blocksSchema } from "@/lib/content/schema";
import { executionAvailable } from "@/server/execution";
import { Alert, Badge, Card, CardHeader, EmptyState, LinkButton, PageHeader, cn } from "@/components/ui";
import { LessonBlocks } from "@/components/content/LessonBlocks";
import { BookmarkButton, CompleteButton, NotesPanel, ViewTracker } from "@/components/learn/LessonControls";
import { PracticeQuestion } from "@/components/practice/PracticeQuestion";

export async function generateMetadata({ params }: { params: Promise<{ course: string; lesson: string }> }) {
  const { course, lesson } = await params;
  const l = await db.lesson.findFirst({ where: { slug: lesson, course: { slug: course } }, select: { title: true } });
  return { title: l?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<{ course: string; lesson: string }> }) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const user = await requirePageUser();
  const staff = isStaff(user.role);

  const tree = await getCourseTree(courseSlug, { includeUnpublished: staff });
  if (!tree) notFound();
  const lesson = await db.lesson.findUnique({ where: { courseId_slug: { courseId: tree.id, slug: lessonSlug } } });
  if (!lesson || (!lesson.published && !staff)) notFound();

  const chapter = tree.units.flatMap((u) => u.chapters).find((c) => c.id === lesson.chapterId)!;
  const unit = tree.units.find((u) => u.chapters.some((c) => c.id === chapter.id))!;

  if (!staff && (await isLessonLocked(user.id, lesson))) {
    return (
      <>
        <PageHeader title={lesson.title} crumbs={[{ href: `/syllabus/${tree.slug}`, label: tree.title }, { label: chapter.title }]} />
        <Card>
          <EmptyState icon={<Lock size={18} />} title="This lesson is locked">
            Your teacher has not opened this chapter yet, or it requires an earlier chapter to be completed first.
          </EmptyState>
        </Card>
      </>
    );
  }

  const parsed = blocksSchema.safeParse(lesson.blocks);
  const all = orderedLessons(tree);
  const idx = all.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  const [progress, bookmark, notes, questions] = await Promise.all([
    progressMap(user.id, tree.id),
    db.bookmark.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } } }),
    db.note.findMany({ where: { userId: user.id, lessonId: lesson.id }, orderBy: { updatedAt: "desc" } }),
    db.question.findMany({ where: { lessonId: lesson.id }, orderBy: { order: "asc" } }),
  ]);
  const latest = await latestResults(user.id, questions.map((q) => q.id));
  const completed = progress.get(lesson.id)?.status === "COMPLETED";
  const runnable = tree.codeLanguage === "c" && executionAvailable();
  const chapterLessons = chapter.topics.flatMap((t) => t.lessons.map((l) => ({ ...l, topic: t.title })));

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <ViewTracker lessonId={lesson.id} enabled={!staff} />
      <article className="min-w-0">
        <PageHeader
          crumbs={[
            { href: "/syllabus", label: "Syllabus" },
            { href: `/syllabus/${tree.slug}`, label: tree.title },
            { label: unit.title },
            { label: chapter.title },
          ]}
          title={lesson.title}
          description={lesson.summary}
          actions={!staff ? <BookmarkButton lessonId={lesson.id} bookmarked={!!bookmark} /> : <LinkButton href={`/teacher/lessons/${lesson.id}`} variant="secondary" size="sm">Edit lesson</LinkButton>}
        />
        <div className="-mt-2 mb-5 flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock size={13} /> ~{lesson.estMinutes} min
          </span>
          {completed && <Badge tone="success">Completed</Badge>}
          {tree.isStarterContent && <Badge tone="neutral">Starter content</Badge>}
          {!lesson.published && <Badge tone="pending">Unpublished</Badge>}
          {tree.codeLanguage === "c" && !executionAvailable() && <Badge tone="pending">Code execution not configured</Badge>}
        </div>

        <Card className="px-5 py-6 sm:px-8">
          {parsed.success ? (
            <LessonBlocks blocks={parsed.data} lessonId={lesson.id} runnable={runnable} />
          ) : (
            <Alert tone="danger" title="This lesson's content could not be displayed">
              The stored content does not match the content format. A teacher should open the lesson editor to fix it.
            </Alert>
          )}
        </Card>

        {questions.length > 0 && (
          <section className="mt-6" aria-labelledby="practice-h">
            <h2 id="practice-h" className="mb-1 text-[17px] font-semibold">
              Check your understanding
            </h2>
            <p className="mb-3 text-[13px] text-muted">Answers are checked on the server and saved to your practice history.</p>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <PracticeQuestion key={q.id} number={i + 1} q={{ ...toStudentQuestion(q), lastResult: latest.get(q.id) ?? null }} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          {!staff ? <CompleteButton lessonId={lesson.id} completed={completed} nextHref={next ? `/learn/${tree.slug}/${next.slug}` : null} /> : <span />}
          <nav aria-label="Lesson navigation" className="flex gap-2">
            {prev && (
              <LinkButton variant="secondary" href={`/learn/${tree.slug}/${prev.slug}`} title={prev.title}>
                <ChevronLeft size={15} /> Previous
              </LinkButton>
            )}
            {next && (
              <LinkButton variant="secondary" href={`/learn/${tree.slug}/${next.slug}`} title={next.title}>
                Next <ChevronRight size={15} />
              </LinkButton>
            )}
          </nav>
        </div>
      </article>

      <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
        <Card>
          <CardHeader title={chapter.title} description={`${chapterLessons.filter((l) => progress.get(l.id)?.status === "COMPLETED").length} of ${chapterLessons.length} lessons complete`} />
          <ol className="py-1.5">
            {chapterLessons.map((l) => {
              const st = progress.get(l.id)?.status;
              return (
                <li key={l.id}>
                  <Link
                    href={`/learn/${tree.slug}/${l.slug}`}
                    aria-current={l.id === lesson.id ? "page" : undefined}
                    className={cn("flex items-start gap-2 px-4 py-1.5 text-[13px] hover:bg-sidebar", l.id === lesson.id && "bg-primary-soft/50 font-medium")}
                  >
                    <span
                      className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full border", st === "COMPLETED" ? "border-success bg-success" : st ? "border-pending bg-pending-soft" : "border-faint")}
                      aria-label={st === "COMPLETED" ? "Completed" : st ? "In progress" : "Not started"}
                    />
                    {l.title}
                  </Link>
                </li>
              );
            })}
          </ol>
        </Card>
        {!staff && (
          <Card>
            <CardHeader title="My notes" />
            <div className="p-4">
              <NotesPanel lessonId={lesson.id} initial={notes.map((n) => ({ id: n.id, body: n.body, updatedAt: n.updatedAt.toISOString() }))} />
            </div>
          </Card>
        )}
      </aside>
    </div>
  );
}
