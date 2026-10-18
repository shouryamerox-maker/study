import { requirePageStaff } from "@/server/auth/guards";

/** Server-side guard: every page under /teacher requires a TEACHER or ADMIN session. */
export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requirePageStaff();
  return children;
}
