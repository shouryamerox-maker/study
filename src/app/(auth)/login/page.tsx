import Link from "next/link";
import { LoginForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <>
      <h1 className="text-[22px] font-semibold tracking-[-0.01em]">Sign in</h1>
      <p className="mb-6 mt-1 text-[13.5px] text-muted">Welcome back. Pick up where you left off.</p>
      <LoginForm next={next} />
      <p className="mt-6 text-center text-[13.5px] text-muted">
        New student?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
