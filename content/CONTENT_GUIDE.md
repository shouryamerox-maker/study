# Content authoring guide

Course content lives in `content/<course-slug>/`. Each course has a `course.ts` manifest
(subject, units, chapter imports) and one file per chapter in `chapters/`.

Content is validated by `src/lib/content/schema.ts` (zod) and imported into the database
with `npm run content:import`. Records are matched by **slug**, so renaming a title is safe,
but changing a slug creates a new record (progress on the old one is kept but orphaned).

## Chapter file format

```ts
import type { ChapterContent } from "../../../src/lib/content/schema";

const chapter: ChapterContent = {
  slug: "pointers",                 // lowercase-kebab, unique within the course
  title: "Pointers",
  summary: "One or two sentences.",
  topics: [
    {
      slug: "what-is-a-pointer",
      title: "What is a pointer?",
      lessons: [
        {
          slug: "pointer-basics",     // unique within the whole course
          title: "Addresses and pointer variables",
          summary: "...",
          estMinutes: 20,
          blocks: [ /* see block types below */ ],
          practice: [ /* auto-graded practice questions */ ],
        },
      ],
    },
  ],
};

export default chapter;
```

Validate with: `npx tsx scripts/validate-chapter.ts content/c-programming/chapters/16-pointers.ts`

## Block types (see schema.ts for exact fields)

| type | purpose |
|---|---|
| `heading` | `{ text, level: 2|3 }` section heading |
| `markdown` | `{ md }` explanation text (GitHub-flavoured markdown, inline `code`, tables allowed) |
| `objectives` | `{ items: string[] }` learning objectives — first block of every lesson |
| `definition` | `{ term, md }` key terminology |
| `callout` | `{ variant: info|tip|warning|exam|note, title?, md }` |
| `syntax` | `{ language: "c", code, md? }` general syntax form |
| `code` | `{ language, title?, code, runnable, stdin?, output?, walkthrough?: [{ lines: "1" or "3-5", text }] }` |
| `output` | `{ title?, text }` standalone output display |
| `table` | `{ caption?, headers, rows }` |
| `mistakes` | `{ items: [{ title, wrong?, right?, md }] }` common mistakes with fixes |
| `examPoints` | `{ items }` important exam points |
| `recap` | `{ items }` short recap — near the end of every lesson |
| `exercise` | `{ id, kind: write|predict|debug|concept, title, prompt, starterCode?, hint?, solution?, solutionCode?, expectedOutput? }` |
| `math` | `{ tex, display, caption? }` KaTeX formula (science subjects) |
| `image` / `diagram` | `{ src, alt, caption?, labels? }` |
| `workedExample` | `{ title, problem, steps[], answer }` |
| `resource` | `{ title, url, description? }` |

## Practice question types (auto-graded on the server; answers are never sent to the browser before checking)

- `MCQ` — `{ slug, prompt, code?, options: [{id:"a",text}], correct: "b", explanation?, hint? }`
- `TRUE_FALSE` — `{ slug, prompt, code?, correct: boolean, explanation? }`
- `FILL_BLANK` — `{ slug, prompt (one "___" per blank), accepted: [["answer","alt"]], caseSensitive?, explanation? }`
- `OUTPUT_PREDICTION` — `{ slug, prompt, code, expected, explanation? }`
- `CODE_WRITING` — `{ slug, prompt, starterCode?, sampleTests: [{stdin, expected}], hiddenTests: [...], solutionCode?, explanation? }`

Practice slugs and exercise ids must be globally unique — prefix them with the chapter
number, e.g. `c16-deref-mcq-1`, `c16-ex-swap`.

## Adding a new subject (e.g. Physics)

1. Create `content/physics-mechanics/course.ts` with `subject: { slug: "physics", kind: "SCIENCE" }`
   and `codeLanguage: null`.
2. Write chapters using `markdown`, `math`, `workedExample`, `diagram`, `table` blocks and
   MCQ / FILL_BLANK / TRUE_FALSE practice.
3. Register the course in `content/index.ts` and run `npm run content:import`.

No application code changes are needed.
