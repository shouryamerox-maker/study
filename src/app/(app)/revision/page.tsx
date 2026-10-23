import { requirePageUser } from "@/server/auth/guards";
import { db } from "@/server/db";
import { PageHeader } from "@/components/ui";
import { RevisionView } from "@/components/learn/RevisionView";

export const metadata = { title: "Revision" };

const lessonInclude = { lesson: { select: { slug: true, title: true, course: { select: { slug: true } }, chapter: { select: { title: true } } } } } as const;
type L = { slug: string; title: string; course: { slug: string }; chapter: { title: string } };
const ref = (l: L) => ({ href: `/learn/${l.course.slug}/${l.slug}`, title: l.title, chapter: l.chapter.title });

/** Everything the student saved for revision — only their own records. */
export default async function RevisionPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requirePageUser();
  const { tab } = await searchParams;
  const [highlights, notes, bookmarks] = await Promise.all([
    db.highlight.findMany({ where: { userId: user.id }, include: lessonInclude, orderBy: [{ lesson: { chapter: { order: "asc" } } }, { createdAt: "asc" }] }),
    db.note.findMany({ where: { userId: user.id }, include: lessonInclude, orderBy: { updatedAt: "desc" } }),
    db.bookmark.findMany({ where: { userId: user.id }, include: lessonInclude, orderBy: { createdAt: "desc" } }),
  ]);
  return (
    <div className="mx-auto max-w-[820px]">
      <PageHeader title="Revision" description="Your highlighted passages, private notes and bookmarked lessons in one place." />
      <RevisionView
        initialTab={tab === "notes" || tab === "bookmarks" ? tab : "highlights"}
        initial={{
          highlights: highlights.map((h) => ({ id: h.id, text: h.text, color: h.color, createdAt: h.createdAt.toISOString(), lesson: ref(h.lesson) })),
          notes: notes.map((n) => ({ id: n.id, body: n.body, updatedAt: n.updatedAt.toISOString(), lesson: ref(n.lesson) })),
          bookmarks: bookmarks.map((b) => ({ id: b.id, lessonId: b.lessonId, createdAt: b.createdAt.toISOString(), lesson: ref(b.lesson) })),
        }}
      />
    </div>
  );
}
