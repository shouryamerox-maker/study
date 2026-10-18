import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type z, type ZodTypeAny } from "zod";
import type { Role } from "@prisma/client";
import { getSession, isStaff, type SessionUser } from "@/server/auth/session";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "error",
    public details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (msg: string, details?: unknown) => new ApiError(400, msg, "bad_request", details);
export const unauthorized = () => new ApiError(401, "You need to sign in.", "unauthorized");
export const forbidden = (msg = "You do not have permission to do that.") => new ApiError(403, msg, "forbidden");
export const notFound = (what = "Resource") => new ApiError(404, `${what} not found.`, "not_found");
export const conflict = (msg: string) => new ApiError(409, msg, "conflict");

type Ctx<P> = { params: Promise<P> };

type Access = "public" | "user" | "staff" | "admin";

interface HandlerArgs<P> {
  req: NextRequest;
  params: P;
  user: SessionUser;
}

/**
 * Wraps a route handler with authentication, authorization, CSRF origin checks and
 * consistent JSON error responses. Every API route goes through this.
 */
export function api<P = Record<string, string>>(
  access: Access,
  handler: (args: HandlerArgs<P>) => Promise<unknown>,
) {
  return async (req: NextRequest, ctx: Ctx<P>) => {
    try {
      const session = await getSession();
      if (access !== "public") {
        if (!session) throw unauthorized();
        if (access === "staff" && !isStaff(session.user.role)) throw forbidden();
        if (access === "admin" && session.user.role !== "ADMIN") throw forbidden();
      }
      // Cookie-authenticated mutations must come from our own origin (CSRF defence).
      // Bearer-token requests (mobile app) are not vulnerable to CSRF.
      if (req.method !== "GET" && req.method !== "HEAD" && session?.via !== "bearer") {
        assertSameOrigin(req);
      }
      const params = (await ctx.params) ?? ({} as P);
      const result = await handler({ req, params, user: session?.user as SessionUser });
      if (result instanceof Response) return result;
      return NextResponse.json(result ?? { ok: true });
    } catch (err) {
      return errorResponse(err);
    }
  };
}

function assertSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return; // same-origin form posts from older browsers / server-to-server
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    if (new URL(origin).host !== host) throw forbidden("Cross-origin request blocked.");
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw forbidden("Cross-origin request blocked.");
  }
}

export function errorResponse(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: { code: err.code, message: err.message, details: err.details } }, { status: err.status });
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "validation",
          message: err.issues[0]?.message ?? "Invalid input.",
          details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
      },
      { status: 422 },
    );
  }
  console.error("[api] unhandled error", err);
  return NextResponse.json({ error: { code: "internal", message: "Something went wrong. Please try again." } }, { status: 500 });
}

export async function parseBody<S extends ZodTypeAny>(req: NextRequest, schema: S): Promise<z.infer<S>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw badRequest("Request body must be JSON.");
  }
  return schema.parse(raw);
}

export function requireRole(user: SessionUser, ...roles: Role[]) {
  if (!roles.includes(user.role)) throw forbidden();
}
