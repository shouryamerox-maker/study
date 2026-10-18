import { AcceptInviteForm } from "@/components/auth/AuthForms";
import { Alert } from "@/components/ui";
import { db } from "@/server/db";
import { sha256 } from "@/server/auth/crypto";

export const metadata = { title: "Accept invitation" };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await db.teacherInvite.findUnique({ where: { tokenHash: sha256(token) } });
  const valid = invite && !invite.acceptedAt && !invite.revokedAt && invite.expiresAt > new Date();
  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-[-0.01em]">Join as a teacher</h1>
      <p className="mb-6 mt-1 text-[13.5px] text-muted">You were invited to the Studyline teacher portal.</p>
      {valid ? <AcceptInviteForm token={token} email={invite.email} /> : <Alert tone="danger">This invitation is invalid, already used, or expired. Ask the administrator for a new link.</Alert>}
    </>
  );
}
