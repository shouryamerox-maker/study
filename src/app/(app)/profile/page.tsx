import { requirePageUser } from "@/server/auth/guards";
import { db } from "@/server/db";
import { studentReport } from "@/server/services/reports";
import { Avatar, Badge, Card, CardHeader, PageHeader, fmtDate } from "@/components/ui";
import { ProfileForm } from "@/components/account/ProfileForms";
import { StudentProgressReport } from "@/components/reports/StudentProgressReport";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await requirePageUser();
  const [user, r, bookmarks, notes] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: session.id } }),
    studentReport(session.id, { asTeacher: false, eventLimit: 10 }),
    db.bookmark.count({ where: { userId: session.id } }),
    db.note.count({ where: { userId: session.id } }),
  ]);
  const completedChapters = r.courses.reduce((n, c) => n + c.progress.chaptersCompleted, 0);
  const milestones = [
    { done: r.courses.some((c) => c.progress.done > 0), label: "Completed a first lesson" },
    { done: completedChapters > 0, label: "Completed a whole chapter" },
    { done: r.practice.questionsAttempted >= 25, label: "Answered 25 practice questions" },
    { done: r.tests.length > 0, label: "Submitted a first test" },
    { done: r.courses.some((c) => c.progress.percent === 100), label: "Finished a course" },
  ];

  return (
    <>
      <PageHeader title="Profile" />
      <div className="mb-5 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} color={user.avatarColor} size={52} />
            <div className="min-w-0">
              <div className="truncate text-[17px] font-semibold">{user.name}</div>
              <div className="truncate text-[13px] text-muted">{user.email}</div>
            </div>
          </div>
          <dl className="mt-4 space-y-1.5 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-muted">Role</dt>
              <dd className="capitalize">{user.role.toLowerCase()}</dd>
            </div>
            {user.studentCode && (
              <div className="flex justify-between">
                <dt className="text-muted">Student ID</dt>
                <dd className="font-mono">{user.studentCode}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Member since</dt>
              <dd>{fmtDate(user.createdAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Bookmarks · notes</dt>
              <dd>
                {bookmarks} · {notes}
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-muted">Enrolled courses</dt>
              <dd className="flex flex-wrap gap-1">{r.courses.length ? r.courses.map((c) => <Badge key={c.tree.id} tone="primary">{c.tree.title}</Badge>) : <span className="text-faint">None</span>}</dd>
            </div>
          </dl>
          <div className="mt-4 border-t border-divider pt-3">
            <div className="label-caps mb-2">Milestones</div>
            <ul className="space-y-1 text-[13px]">
              {milestones.map((m) => (
                <li key={m.label} className={m.done ? "text-success" : "text-faint"}>
                  {m.done ? "✓" : "○"} {m.label}
                </li>
              ))}
            </ul>
          </div>
        </Card>
        <Card>
          <CardHeader title="Edit profile" />
          <div className="max-w-lg p-5">
            <ProfileForm name={user.name} bio={user.bio} color={user.avatarColor} />
          </div>
        </Card>
      </div>
      <StudentProgressReport {...r} testHref={(t) => (t.visible ? `/tests/${t.assessmentId}/result/${t.attemptId}` : `/tests/${t.assessmentId}`)} />
    </>
  );
}
