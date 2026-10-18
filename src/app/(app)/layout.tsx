import { AppShell } from "@/components/shell/AppShell";
import { requirePageUser } from "@/server/auth/guards";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();
  return <AppShell user={user}>{children}</AppShell>;
}
