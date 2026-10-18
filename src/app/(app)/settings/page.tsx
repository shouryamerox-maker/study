import { requirePageUser } from "@/server/auth/guards";
import { db } from "@/server/db";
import { Card, CardHeader, PageHeader, fmtRelative } from "@/components/ui";
import { PasswordForm } from "@/components/account/ProfileForms";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requirePageUser();
  const sessions = await db.session.findMany({ where: { userId: user.id, expiresAt: { gt: new Date() } }, orderBy: { lastUsedAt: "desc" }, take: 10 });
  return (
    <>
      <PageHeader title="Settings" description="Account security." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Change password" />
          <div className="max-w-md p-5">
            <PasswordForm />
          </div>
        </Card>
        <Card className="self-start">
          <CardHeader title="Signed-in devices" description="Sessions expire automatically after 30 days." />
          <ul className="divide-y divide-divider">
            {sessions.map((s) => (
              <li key={s.id} className="px-4 py-2.5 text-[13px]">
                <div className="truncate">{s.userAgent ?? "Unknown device"}</div>
                <div className="text-[11.5px] text-faint">
                  {s.kind === "app" ? "Mobile app · " : ""}last active {fmtRelative(s.lastUsedAt)}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
