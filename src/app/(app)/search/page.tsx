import Link from "next/link";
import { Search } from "lucide-react";
import { requirePageUser } from "@/server/auth/guards";
import { isStaff } from "@/server/auth/session";
import { db } from "@/server/db";
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requirePageUser();
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const staff = isStaff(user.role);
  const published = staff ? {} : { published: true };

  const [subjects, chapters, lessons, questions] =
    q.length < 2
      ? [[], [], [], []]
      : await Promise.all([
          db.course.findMany({ where: { ...published, OR: [{ title: { contains: q } }, { summary: { contains: q } }, { subject: { name: { contains: q } } }] }, include: { subject: true }, take: 10 }),
          db.chapter.findMany({ where: { course: published, OR: [{ title: { contains: q } }, { summary: { contains: q } }] }, include: { course: true }, take: 20 }),
          db.lesson.findMany({
            where: { ...published, course: published, OR: [{ title: { contains: q } }, { summary: { contains: q } }, { slug: { contains: q } }] },
            include: { course: true, chapter: true },
            take: 30,
          }),
          db.question.findMany({ where: { course: published, prompt: { contains: q } }, include: { chapter: true }, take: 20 }),
        ]);
  const total = subjects.length + chapters.length + lessons.length + questions.length;

  return (
    <>
      <PageHeader title="Search" description={q ? `Results for “${q}”` : "Search across courses, chapters, lessons and practice questions."} />
      <form action="/search" className="mb-5 flex max-w-xl gap-2">
        <label htmlFor="q" className="sr-only">
          Search
        </label>
        <input id="q" name="q" defaultValue={q} className="input" placeholder="e.g. pointer arithmetic, scanf, recursion" autoFocus />
      </form>
      {q.length >= 2 && total === 0 && (
        <Card>
          <EmptyState icon={<Search size={18} />} title="No matches">
            Try a shorter or different term.
          </EmptyState>
        </Card>
      )}
      <div className="space-y-4">
        {subjects.length > 0 && (
          <Card>
            <CardHeader title="Courses" />
            <ul className="divide-y divide-divider">
              {subjects.map((c) => (
                <li key={c.id} className="px-4 py-2.5">
                  <Link href={`/syllabus/${c.slug}`} className="font-medium hover:text-primary">
                    {c.title}
                  </Link>{" "}
                  <Badge>{c.subject.name}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {chapters.length > 0 && (
          <Card>
            <CardHeader title="Chapters" />
            <ul className="divide-y divide-divider">
              {chapters.map((c) => (
                <li key={c.id} className="px-4 py-2.5">
                  <Link href={`/syllabus/${c.course.slug}`} className="font-medium hover:text-primary">
                    {c.title}
                  </Link>
                  <div className="text-[12px] text-muted">{c.course.title}</div>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {lessons.length > 0 && (
          <Card>
            <CardHeader title="Lessons" />
            <ul className="divide-y divide-divider">
              {lessons.map((l) => (
                <li key={l.id} className="px-4 py-2.5">
                  <Link href={`/learn/${l.course.slug}/${l.slug}`} className="font-medium hover:text-primary">
                    {l.title}
                  </Link>
                  <div className="text-[12px] text-muted">
                    {l.chapter.title} · {l.summary}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {questions.length > 0 && (
          <Card>
            <CardHeader title="Practice questions" />
            <ul className="divide-y divide-divider">
              {questions.map((qq) => (
                <li key={qq.id} className="px-4 py-2.5">
                  <Link href={qq.chapterId ? `/practice?chapter=${qq.chapterId}` : "/practice"} className="line-clamp-2 text-[13.5px] hover:text-primary">
                    {qq.prompt}
                  </Link>
                  <div className="text-[12px] text-muted">{qq.chapter?.title}</div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}
