import Link from "next/link";
import { Bookmark, NotebookPen } from "lucide-react";
import { requirePageUser } from "@/server/auth/guards";
import { db } from "@/server/db";
import { Card, CardHeader, EmptyState, PageHeader, fmtRelative } from "@/components/ui";

export const metadata = { title: "Bookmarks & Notes" };

export default async function BookmarksPage() {
  const user = await requirePageUser();
  const [bookmarks, notes, recent] = await Promise.all([
    db.bookmark.findMany({ where: { userId: user.id }, include: { lesson: { include: { course: true, chapter: true } } }, orderBy: { createdAt: "desc" } }),
    db.note.findMany({ where: { userId: user.id }, include: { lesson: { include: { course: true, chapter: true } } }, orderBy: { updatedAt: "desc" } }),
    db.lessonProgress.findMany({ where: { userId: user.id }, include: { lesson: { include: { course: true } } }, orderBy: { lastViewedAt: "desc" }, take: 8 }),
  ]);

  return (
    <>
      <PageHeader title="Bookmarks & Notes" description="Saved lessons, your private notes and recently viewed lessons — your revision shortlist." />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Card>
            <CardHeader title={`Bookmarked lessons (${bookmarks.length})`} />
            {bookmarks.length === 0 ? (
              <EmptyState icon={<Bookmark size={18} />} title="No bookmarks yet">
                Press Bookmark on any lesson to keep it here for revision.
              </EmptyState>
            ) : (
              <ul className="divide-y divide-divider">
                {bookmarks.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 px-4 py-2.5">
                    <Bookmark size={14} className="shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/learn/${b.lesson.course.slug}/${b.lesson.slug}`} className="font-medium hover:text-primary">
                        {b.lesson.title}
                      </Link>
                      <div className="text-[12px] text-muted">
                        {b.lesson.course.title} · {b.lesson.chapter.title}
                      </div>
                    </div>
                    <span className="text-[11.5px] text-faint">{fmtRelative(b.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card>
            <CardHeader title={`My notes (${notes.length})`} description="Notes are private to you." />
            {notes.length === 0 ? (
              <EmptyState icon={<NotebookPen size={18} />} title="No notes yet">
                Use the notes panel beside any lesson.
              </EmptyState>
            ) : (
              <ul className="divide-y divide-divider">
                {notes.map((n) => (
                  <li key={n.id} className="px-4 py-3">
                    <Link href={`/learn/${n.lesson.course.slug}/${n.lesson.slug}`} className="text-[12.5px] font-medium text-primary hover:underline">
                      {n.lesson.chapter.title} · {n.lesson.title}
                    </Link>
                    <p className="mt-1 whitespace-pre-wrap text-[13.5px]">{n.body}</p>
                    <div className="mt-1 text-[11.5px] text-faint">Edited {fmtRelative(n.updatedAt)}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <Card className="self-start">
          <CardHeader title="Recently viewed" />
          {recent.length === 0 ? (
            <EmptyState title="Nothing viewed yet" />
          ) : (
            <ul className="divide-y divide-divider">
              {recent.map((p) => (
                <li key={p.id} className="px-4 py-2.5">
                  <Link href={`/learn/${p.lesson.course.slug}/${p.lesson.slug}`} className="text-[13.5px] hover:text-primary">
                    {p.lesson.title}
                  </Link>
                  <div className="text-[11.5px] text-faint">
                    {p.status === "COMPLETED" ? "Completed · " : ""}
                    {fmtRelative(p.lastViewedAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
