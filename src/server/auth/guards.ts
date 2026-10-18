import "server-only";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { getSession, isStaff, type SessionUser } from "./session";

/** For server components / pages. Redirects instead of throwing. */
export async function requirePageUser(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) redirect("/login");
  return s.user;
}

export async function requirePageStaff(): Promise<SessionUser> {
  const user = await requirePageUser();
  if (!isStaff(user.role)) redirect("/dashboard");
  return user;
}

export async function requirePageAdmin(): Promise<SessionUser> {
  const user = await requirePageUser();
  if (user.role !== "ADMIN") redirect("/teacher");
  return user;
}

export function homeFor(role: Role) {
  return isStaff(role) ? "/teacher" : "/dashboard";
}
