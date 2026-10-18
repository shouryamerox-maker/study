/**
 * Imports all registered course content and seed assessments.
 *
 *   npm run content:import             # create new / update seed-owned records
 *   npm run content:import -- --force  # also overwrite records edited in the teacher UI
 */
import { PrismaClient } from "@prisma/client";
import { courses } from "../content/index";
import { assessments } from "../content/assessments/index";
import { importCourse } from "../src/server/content/importer";
import { assessmentDefinitionSchema, totalMarks } from "../src/lib/content/assessment-schema";
import { publishAssessment, saveAssessmentDraft } from "../src/server/assessments/definition";

export async function runImport(db: PrismaClient, force: boolean) {
  for (const course of courses) {
    const r = await importCourse(db, course, { force });
    console.log(`Course ${r.course}: created ${JSON.stringify(r.created)} updated ${JSON.stringify(r.updated)} skipped(edited) ${r.skippedEdited}`);
    if (r.orphanedLessons.length) console.log(`  Lessons no longer in content files (kept): ${r.orphanedLessons.join(", ")}`);
  }

  const owner = await db.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } });
  if (!owner) {
    console.log("No admin account yet — skipping seed assessments. Run `npm run create-admin` and then import again.");
    return;
  }
  for (const def of assessments) {
    const parsed = assessmentDefinitionSchema.parse(def);
    const existing = parsed.slug ? await db.assessment.findUnique({ where: { slug: parsed.slug } }) : null;
    if (existing && !force) {
      console.log(`Assessment ${parsed.slug}: exists, left unchanged (use --force to overwrite).`);
      continue;
    }
    const course = await db.course.findUniqueOrThrow({ where: { slug: parsed.courseSlug } });
    const total = totalMarks(parsed.sections);
    const a = await saveAssessmentDraft(db, {
      slug: parsed.slug,
      courseId: course.id,
      createdById: existing?.createdById ?? owner.id,
      settings: parsed,
      sections: parsed.sections,
    });
    await publishAssessment(db, a.id);
    const qCount = parsed.sections.reduce((n, s) => n + s.questions.length, 0);
    console.log(`Assessment ${parsed.slug}: ${qCount} questions, ${total} marks — published.`);
  }
}

if (process.argv[1]?.includes("import-content")) {
  const db = new PrismaClient({ transactionOptions: { timeout: 60_000, maxWait: 10_000 } });
  runImport(db, process.argv.includes("--force"))
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => db.$disconnect());
}
