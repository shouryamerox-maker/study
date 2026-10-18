import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/session";
import { homeFor } from "@/server/auth/guards";

export default async function Home() {
  const s = await getSession();
  redirect(s ? homeFor(s.user.role) : "/login");
}
