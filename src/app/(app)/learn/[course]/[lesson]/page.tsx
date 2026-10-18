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
import { Alert, BackLink, Badge, EmptyState, LinkButton, cn } from "@/components/ui";
import { Disclosure } from "@/components/Disclosure";
import { LessonBlocks } from "@/components/content/LessonBlocks";
import { BookmarkButton, CompleteButton, NotesPanel, ViewTracker } from "@/components/learn/LessonControls";
import { PracticeQuestion } from "@/components/practice/PracticeQuestion";

export async function generateMetadata({ params }: { params: Promise<{ course: string; lesson: string }> }) {
  const { course, lesson } = await params;
  const l = await db.lesson.findFirst({ where: { slug: lesson, course: { slug: course } }, select: { title: true } });
  return { title: l?.title ?? "Lesson" };
}

function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[12.5px] text-muted">
      {items.map((c, i) => (
        <span key={i} className="inline-flex min-w-0 items-center gap-1">
          {i > 0 && <ChevronRight size={12} className="text-faint" aria-hidden />}
          {c.href ? (
            <Link href={c.href} className="truncate hover:text-ink">
              {c.label}
            </Link>
          ) : (
            <span className="truncate">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
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
  // Returning to the syllabus re-opens this chapter and scrolls to it.
  const syllabusHref = `/syllabus/${tree.slug}?open=${chapter.id}#ch-${chapter.id}`;
  const shortUnit = unit.title.replace(/^Unit\s+\d+\s*·\s*/, "");
  const crumbs = [{ href: `/syllabus/${tree.slug}`, label: tree.title }, { label: shortUnit }, { href: syllabusHref, label: chapter.title }];

  if (!staff && (await isLessonLocked(user.id, lesson))) {
    return (
      <div className="mx-auto max-w-[760px]">
        <BackLink href={syllabusHref} label="Back to syllabus" />
        <Crumbs items={crumbs} />
        <h1 className="mt-2 text-[24px] font-semibold">{lesson.title}</h1>
        <EmptyState icon={<Lock size={18} />} title="This lesson is locked">
          Your teacher has not opened this chapter yet, or it requires an earlier chapter to be completed first.
        </EmptyState>
      </div>
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
  const chapterLessons = chapter.topics.flatMap((t) => t.lessons);
  const chapterDone = chapterLessons.filter((l) => progress.get(l.id)?.status === "COMPLETED").length;
  const position = chapterLessons.findIndex((l) => l.id === lesson.id) + 1;

  const chapterNav = (
    <ol className="space-y-0.5">
      {chapterLessons.map((l, i) => {
        const st = progress.get(l.id)?.status;
        const here = l.id === lesson.id;
        return (
          <li key={l.id}>
            <Link
              href={`/learn/${tree.slug}/${l.slug}`}
              aria-current={here ? "page" : undefined}
              className={cn("flex items-start gap-2 rounded-[6px] px-2 py-1.5 text-[13px] hover:bg-sidebar", here ? "bg-primary-soft font-medium text-primary-dark" : "text-ink/85")}
            >
              <span
                className={cn("mt-[3px] flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-[8px]", st === "COMPLETED" ? "border-success bg-success text-white" : st ? "border-pending" : "border-faint")}
                aria-label={st === "COMPLETED" ? "Completed" : st ? "In progress" : "Not started"}
              >
                {st === "COMPLETED" ? "✓" : ""}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-faint">{i + 1}.</span> {l.title}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="mx-auto grid max-w-[1120px] gap-8 xl:grid-cols-[minmax(0,760px)_260px] xl:justify-center">
      <ViewTracker lessonId={lesson.id} enabled={!staff} />
      <article className="min-w-0">
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <BackLink href={syllabusHref} label="Back to syllabus" className="mb-0" />
            {staff ? (
              <LinkButton href={`/teacher/lessons/${lesson.id}`} variant="ghost" size="sm">
                Edit lesson
              </LinkButton>
            ) : (
              <BookmarkButton lessonId={lesson.id} bookmarked={!!bookmark} />
            )}
          </div>
          <div className="mt-3">
            <Crumbs items={crumbs} />
          </div>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.015em]">{lesson.title}</h1>
          {lesson.summary && <p className="mt-2 text-[15px] leading-relaxed text-muted">{lesson.summary}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock size={13} aria-hidden /> About {lesson.estMinutes} min
            </span>
            <span>
              Lesson {position} of {chapterLessons.length} in this chapter
            </span>
            {!staff && (completed ? <Badge tone="success">Completed</Badge> : progress.has(lesson.id) ? <Badge tone="pending">In progress</Badge> : null)}
            {!lesson.published && <Badge tone="pending">Unpublished</Badge>}
          </div>
        </header>

        {/* Small screens: chapter navigation as a collapsed section above the lesson. */}
        <div className="mb-6 rounded-[10px] border border-border bg-surface xl:hidden">
          <Disclosure
            title={<span className="text-[13.5px] font-medium">In this chapter · {chapter.title}</span>}
            meta={<span className="text-[12px] tabular-nums text-muted">{chapterDone}/{chapterLessons.length}</span>}
            buttonClassName="px-3 py-2.5"
            panelClassName="px-2 pb-2"
          >
            {chapterNav}
          </Disclosure>
        </div>

        {parsed.success ? (
          <LessonBlocks blocks={parsed.data} lessonId={lesson.id} runnable={runnable} />
        ) : (
          <Alert tone="danger" title="This lesson's content could not be displayed">
            The stored content does not match the content format. A teacher should open the lesson editor to fix it.
          </Alert>
        )}

        {questions.length > 0 && (
          <section className="mt-12" aria-labelledby="practice-h">
            <h2 id="practice-h" className="text-[20px] font-semibold tracking-[-0.01em]">
              Practice questions
            </h2>
            <p className="mb-4 mt-1 text-[13.5px] text-muted">Check your understanding. Answers are checked and saved to your practice history.</p>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <PracticeQuestion key={q.id} number={i + 1} q={{ ...toStudentQuestion(q), lastResult: latest.get(q.id) ?? null }} />
              ))}
            </div>
          </section>
        )}

        <footer className="mt-12 rounded-[12px] border border-border bg-surface p-5">
          {!staff && (
            <div className="mb-4">
              <div className="mb-2 text-[14px] font-semibold">{completed ? "You have completed this lesson." : "Finished reading?"}</div>
              <CompleteButton lessonId={lesson.id} completed={completed} nextHref={next ? `/learn/${tree.slug}/${next.slug}` : null} />
            </div>
          )}
          <nav aria-label="Lesson navigation" className={cn("grid gap-2 sm:grid-cols-2", !staff && "border-t border-divider pt-4")}>
            {prev ? (
              <Link href={`/learn/${tree.slug}/${prev.slug}`} className="group rounded-[8px] px-3 py-2 hover:bg-sidebar">
                <span className="flex items-center gap-1 text-[12px] text-muted">
                  <ChevronLeft size={13} /> Previous lesson
                </span>
                <span className="block truncate text-[14px] font-medium group-hover:text-primary">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/learn/${tree.slug}/${next.slug}`} className="group rounded-[8px] px-3 py-2 text-right hover:bg-sidebar">
                <span className="flex items-center justify-end gap-1 text-[12px] text-muted">
                  Next lesson <ChevronRight size={13} />
                </span>
                <span className="block truncate text-[14px] font-medium group-hover:text-primary">{next.title}</span>
              </Link>
            ) : (
              <Link href={syllabusHref} className="rounded-[8px] px-3 py-2 text-right text-[14px] font-medium text-primary hover:bg-sidebar">
                End of course — back to syllabus
              </Link>
            )}
          </nav>
        </footer>
      </article>

      <aside className="hidden space-y-5 xl:sticky xl:top-20 xl:block xl:self-start" aria-label="Chapter navigation">
        <div>
          <div className="mb-1 px-2 text-[11.5px] font-semibold uppercase tracking-[0.05em] text-faint">In this chapter</div>
          <Link href={syllabusHref} className="mb-2 block px-2 text-[13.5px] font-semibold hover:text-primary">
            {chapter.title}
          </Link>
          {!staff && (
            <div className="mb-2 px-2 text-[12px] text-muted">
              {chapterDone} of {chapterLessons.length} lessons complete
            </div>
          )}
          {chapterNav}
        </div>
        {!staff && (
          <div className="border-t border-divider pt-4">
            <Disclosure
              title={<span className="text-[13.5px] font-medium">My notes</span>}
              meta={notes.length ? <span className="text-[12px] text-muted">{notes.length}</span> : undefined}
              defaultOpen={notes.length > 0}
              buttonClassName="px-2 py-1"
              panelClassName="mt-2 px-2"
            >
              <NotesPanel lessonId={lesson.id} initial={notes.map((n) => ({ id: n.id, body: n.body, updatedAt: n.updatedAt.toISOString() }))} />
            </Disclosure>
          </div>
        )}
      </aside>

      {!staff && (
        <div className="rounded-[10px] border border-border bg-surface xl:hidden">
          <Disclosure title={<span className="text-[13.5px] font-medium">My notes</span>} buttonClassName="px-3 py-2.5" panelClassName="px-3 pb-3">
            <NotesPanel lessonId={lesson.id} initial={notes.map((n) => ({ id: n.id, body: n.body, updatedAt: n.updatedAt.toISOString() }))} />
          </Disclosure>
        </div>
      )}
    </div>
  );
}
