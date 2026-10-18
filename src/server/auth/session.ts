import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import type { Role, User } from "@prisma/client";
import { db } from "@/server/db";
import { newToken, sha256 } from "./crypto";

export const SESSION_COOKIE = "sl_session";
const SESSION_DAYS = 30;
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

export type SessionUser = Pick<User, "id" | "email" | "name" | "role" | "status" | "avatarColor" | "studentCode">;

export async function createSession(userId: string, kind: "web" | "app" = "web") {
  const token = newToken();
  const h = await headers();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({
    data: {
      tokenHash: sha256(token),
      userId,
      kind,
      expiresAt,
      userAgent: h.get("user-agent")?.slice(0, 255) ?? null,
      ip: clientIp(h),
    },
  });
  if (kind === "web") {
    const jar = await cookies();
    jar.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
    });
  }
  return { token, expiresAt };
}

export function clientIp(h: Headers) {
  return (h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown").slice(0, 64);
}

/** Reads the session token from the cookie (web) or the Authorization header (mobile app). */
async function readToken(): Promise<{ token: string; via: "cookie" | "bearer" } | null> {
  const h = await headers();
  const auth = h.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const token = auth.slice(7).trim();
    if (token) return { token, via: "bearer" };
  }
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return token ? { token, via: "cookie" } : null;
}

/** Resolves the signed-in user for this request (cached per request). */
export const getSession = cache(async (): Promise<{ user: SessionUser; sessionId: string; via: "cookie" | "bearer" } | null> => {
  const t = await readToken();
  if (!t) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: sha256(t.token) },
    include: {
      user: { select: { id: true, email: true, name: true, role: true, status: true, avatarColor: true, studentCode: true } },
    },
  });
  if (!session || session.expiresAt < new Date() || session.user.status !== "ACTIVE") return null;

  if (Date.now() - session.lastUsedAt.getTime() > TOUCH_INTERVAL_MS) {
    // Best-effort activity tracking; never block the request on it.
    const now = new Date();
    await Promise.all([
      db.session.update({ where: { id: session.id }, data: { lastUsedAt: now } }),
      db.user.update({ where: { id: session.user.id }, data: { lastActiveAt: now } }),
    ]).catch(() => undefined);
  }
  return { user: session.user, sessionId: session.id, via: t.via };
});

export async function destroyCurrentSession() {
  const t = await readToken();
  if (t) await db.session.deleteMany({ where: { tokenHash: sha256(t.token) } });
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(userId: string) {
  await db.session.deleteMany({ where: { userId } });
}

export const isStaff = (role: Role) => role === "TEACHER" || role === "ADMIN";
