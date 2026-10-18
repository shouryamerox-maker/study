import { api } from "@/server/http";
import { studentDirectory } from "@/server/services/teacher";

export const GET = api("staff", async ({ req }) => {
  const sp = req.nextUrl.searchParams;
  return { students: await studentDirectory({ q: sp.get("q") ?? undefined, courseId: sp.get("course") ?? undefined }) };
});
