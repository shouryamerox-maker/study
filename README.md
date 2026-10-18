# Studyline

A learning website with a **student portal** and a **teacher portal**.

- **Students:** lessons, syllabus, practice, a C code playground, timed tests, results and progress.
- **Teachers:** student directory and reports, test authoring and assignment, grading with rubrics and an audit trail, syllabus and lesson editing.

It ships with one complete course, **C Programming: From Zero to Pointers and Beyond**: 24 chapters, 70 lessons and 311 auto-graded practice questions. It also includes a fully written **50-mark C test**. Other subjects (Physics, Biology, C++…) are added as content. They do not need code changes.

> The C course is **starter content**, not your official syllabus. It is labelled that way on the site and can be edited or replaced.

## Run it on your computer

You need Node 20+ and a MySQL database (local, or a free cloud one; see `docs/DEPLOYMENT.md`).

```bash
npm install
cp .env.example .env                 # put your DATABASE_URL in it
npx prisma migrate deploy            # create the tables
npm run create-admin -- --email you@example.com --name "Your Name"
npm run content:import               # load the C course and the 50-mark test
npm run dev                          # open http://localhost:3000
```

- Students sign up at `/register`. They always get the Student role.
- Teachers are invited by an admin from **Teacher portal → Settings**. Nobody can pick "Teacher" when signing up.
- The 50-mark test is published but not assigned. Assign it from **Tests & Assessments → Results**.

## Put it online

Follow **`docs/DEPLOYMENT.md`** to set up a free Aiven MySQL database and free Vercel hosting.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Run locally |
| `npm run build` / `npm start` | Production build / serve |
| `npm test` | Unit tests |
| `npm run typecheck` | TypeScript check |
| `npm run db:deploy` | Apply database migrations |
| `npm run db:migrate` | Make a new migration after editing `prisma/schema.prisma` |
| `npm run content:import` | Load or update course content (safe to re-run) |
| `npm run create-admin -- --email … --name …` | Create or promote an admin |

## Adding your syllabus and subjects

Read **`content/CONTENT_GUIDE.md`**. You can:

- edit chapters and lessons directly in **Teacher portal → Courses & Syllabus**;
- upload syllabus PDFs there;
- or add content files under `content/` and run `npm run content:import`.

Student progress is kept when content changes.

## Optional features

| Feature | Without it | To enable |
|---|---|---|
| Running C code | Run buttons say "not available". Teachers grade code by reading it. | Set `EXECUTION_PROVIDER=judge0` and the Judge0 keys |
| Email | Teachers copy reset and invite links from the portal | Set the `SMTP_*` variables |

## Project layout

```
content/              course content + seed tests (CONTENT_GUIDE.md explains the format)
prisma/               database schema and migrations
scripts/              create-admin, import-content, validate-chapter
src/app/(auth)/       login, register, password reset, invitations
src/app/(app)/        student pages
src/app/(app)/teacher teacher pages
src/app/api/v1/       server API
src/server/           auth, database, grading, tests, code execution, rate limits
src/lib/              shared logic (content schema, grading rules, validation)
src/components/       UI components
tests/                automated tests
```
