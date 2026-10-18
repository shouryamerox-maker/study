import Link from "next/link";
import { ResetForm } from "@/components/auth/AuthForms";
import { Alert } from "@/components/ui";

export const metadata = { title: "Set a new password" };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <>
      <h1 className="mb-6 text-[22px] font-semibold tracking-[-0.01em]">Set a new password</h1>
      {token ? <ResetForm token={token} /> : <Alert tone="danger">This reset link is incomplete. Request a new one.</Alert>}
      <p className="mt-6 text-center text-[13.5px]">
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
