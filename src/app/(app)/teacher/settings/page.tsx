import { requirePageStaff } from "@/server/auth/guards";
import { db } from "@/server/db";
import { executionAvailable, executionProvider } from "@/server/execution";
import { mailConfigured } from "@/server/mail";
import { Badge, Card, CardHeader, PageHeader } from "@/components/ui";
import { PasswordForm } from "@/components/account/ProfileForms";
import { GroupsPanel, InvitePanel } from "@/components/teacher/SettingsPanels";

export const metadata = { title: "Settings" };

export default async function TeacherSettings() {
  const user = await requirePageStaff();
  const [invites, groups, students] = await Promise.all([
    user.role === "ADMIN" ? db.teacherInvite.findMany({ orderBy: { createdAt: "desc" }, take: 30 }) : Promise.resolve([]),
    db.group.findMany({ orderBy: { name: "asc" }, include: { members: { select: { userId: true } } } }),
    db.user.findMany({ where: { role: "STUDENT" }, orderBy: { name: "asc" }, select: { id: true, name: true, email: true } }),
  ]);
  return (
    <>
      <PageHeader title="Settings" description="Platform configuration, staff, groups and your account." />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Platform status" />
          <dl className="divide-y divide-divider text-[13.5px]">
            <div className="flex items-center justify-between px-4 py-2.5">
              <dt>C code execution</dt>
              <dd>{executionAvailable() ? <Badge tone="success">Enabled ({executionProvider()})</Badge> : <Badge tone="pending">Not configured</Badge>}</dd>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <dt>Email (password resets, invitations)</dt>
              <dd>{mailConfigured() ? <Badge tone="success">Configured</Badge> : <Badge tone="pending">Not configured — links are shown to staff instead</Badge>}</dd>
            </div>
          </dl>
          <p className="px-4 pb-3 text-[12px] text-faint">Configured through environment variables. See README → Configuration.</p>
        </Card>
        <Card>
          <CardHeader title="Change your password" />
          <div className="max-w-md p-4">
            <PasswordForm />
          </div>
        </Card>
        {user.role === "ADMIN" && (
          <InvitePanel invites={invites.map((i) => ({ id: i.id, email: i.email, role: i.role, expiresAt: i.expiresAt.toISOString(), acceptedAt: i.acceptedAt?.toISOString() ?? null, revokedAt: i.revokedAt?.toISOString() ?? null }))} />
        )}
        <GroupsPanel groups={groups.map((g) => ({ id: g.id, name: g.name, memberIds: g.members.map((m) => m.userId) }))} students={students} />
      </div>
    </>
  );
}
