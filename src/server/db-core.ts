import { PrismaClient } from "@prisma/client";

/** Shared Prisma client (no "server-only" marker so middleware can import it). */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    // Remote free-tier databases add latency per query; multi-step saves (tests, grading)
    // need more than Prisma's 5 s default.
    transactionOptions: { timeout: 30_000, maxWait: 10_000 },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
