import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/server/db-core";

/**
 * Hard access boundary for the teacher portal. Runs before any page or layout renders,
 * so teacher data can never be streamed to a non-staff user. (Pages also check again.)
 */
export async function middleware(req: NextRequest) {
  const token = req.cookies.get("sl_session")?.value;
  const login = new URL(`/login?next=${encodeURIComponent(req.nextUrl.pathname)}`, req.url);
  if (!token) return NextResponse.redirect(login);
  const session = await prisma.session.findUnique({
    where: { tokenHash: createHash("sha256").update(token).digest("hex") },
    select: { expiresAt: true, user: { select: { role: true, status: true } } },
  });
  if (!session || session.expiresAt < new Date() || session.user.status !== "ACTIVE") return NextResponse.redirect(login);
  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher", "/teacher/:path*"],
  runtime: "nodejs",
};
