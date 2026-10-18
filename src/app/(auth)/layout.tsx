import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/session";
import { homeFor } from "@/server/auth/guards";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (s) redirect(homeFor(s.user.role));
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-[420px] shrink-0 flex-col justify-between border-r border-border bg-sidebar p-10 lg:flex">
        <div className="flex items-center gap-2">
          <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden>
            <rect width="64" height="64" rx="14" fill="#a85c40" />
            <path d="M18 22h28M18 32h20M18 42h24" stroke="#faf8f4" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <span className="text-[16px] font-semibold">Studyline</span>
        </div>
        <div>
          <h2 className="text-[22px] font-semibold leading-snug tracking-[-0.01em]">Study chapter by chapter. Practise properly. See exactly where you stand.</h2>
          <ul className="mt-6 space-y-3 text-[13.5px] text-muted">
            <li className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Structured lessons with worked code examples and exercises
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Practice that remembers what you got wrong
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Timed tests with teacher-reviewed results
            </li>
          </ul>
        </div>
        <p className="text-[12px] text-faint">Your progress is saved to your account.</p>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[380px]">{children}</div>
      </div>
    </div>
  );
}
