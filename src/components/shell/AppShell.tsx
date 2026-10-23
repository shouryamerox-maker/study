import { Search } from "lucide-react";
import type { SessionUser } from "@/server/auth/session";
import { isStaff } from "@/server/auth/session";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const staff = isStaff(user.role);
  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Sidebar staff={staff} />
      <div className="lg:pl-56" data-shell-content>
        <header data-shell-header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-page/90 pl-14 pr-4 backdrop-blur-[2px] lg:px-6">
          <form action="/search" role="search" className="relative w-full max-w-md">
            <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" aria-hidden />
            <label htmlFor="global-search" className="sr-only">
              Search lessons, chapters, questions and your notes
            </label>
            <input id="global-search" name="q" type="search" placeholder="Search lessons, chapters, your notes…" className="input h-8 bg-surface pl-8 text-[13px]" />
          </form>
          <div className="ml-auto">
            <UserMenu name={user.name} email={user.email} role={user.role} color={user.avatarColor} staff={staff} />
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-[1280px] px-4 py-6 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
