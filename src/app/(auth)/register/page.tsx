import Link from "next/link";
import { RegisterForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-[-0.01em]">Create your student account</h1>
      <p className="mb-6 mt-1 text-[13.5px] text-muted">Teachers join through an invitation from an administrator.</p>
      <RegisterForm />
      <p className="mt-6 text-center text-[13.5px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
