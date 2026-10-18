/**
 * Validate one or more chapter content files against the content schema.
 * Usage: npx tsx scripts/validate-chapter.ts content/c-programming/chapters/01-introduction.ts [...]
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chapterContentSchema } from "../src/lib/content/schema";

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("Pass at least one chapter file.");
    process.exit(1);
  }
  let failed = false;
  for (const f of files) {
    const mod = await import(pathToFileURL(path.resolve(f)).href);
    const data = mod.default?.default ?? mod.default;
    const res = chapterContentSchema.safeParse(data);
    if (!res.success) {
      failed = true;
      console.error(`✗ ${f}`);
      for (const issue of res.error.issues.slice(0, 20)) console.error(`  ${issue.path.join(".")}: ${issue.message}`);
      continue;
    }
    const ch = res.data;
    const lessons = ch.topics.flatMap((t) => t.lessons);
    const practice = lessons.flatMap((l) => l.practice);
    const blocks = lessons.reduce((n, l) => n + l.blocks.length, 0);
    const slugs = new Set<string>();
    for (const q of practice) {
      if (slugs.has(q.slug)) {
        failed = true;
        console.error(`✗ ${f}: duplicate practice slug ${q.slug}`);
      }
      slugs.add(q.slug);
    }
    console.log(`✓ ${f}: ${ch.topics.length} topics, ${lessons.length} lessons, ${blocks} blocks, ${practice.length} practice questions`);
  }
  process.exit(failed ? 1 : 0);
}

main();
