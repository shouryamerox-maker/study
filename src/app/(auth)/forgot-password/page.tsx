import Link from "next/link";
import { ForgotForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Forgot password" };

export default function ForgotPage() {
  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-[-0.01em]">Reset your password</h1>
      <p className="mb-6 mt-1 text-[13.5px] text-muted">Enter your account email and we will send you a reset link.</p>
      <ForgotForm />
      <p className="mt-6 text-center text-[13.5px]">
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
