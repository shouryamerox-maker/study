/**
 * `npx prisma db seed` — imports course content and seed assessments.
 * Creates no fake students, scores or activity.
 */
import { PrismaClient } from "@prisma/client";
import { runImport } from "../scripts/import-content";

const db = new PrismaClient();
runImport(db, process.argv.includes("--force"))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
