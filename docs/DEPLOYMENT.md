# Putting Studyline online (free)

This setup uses:

- **Aiven** for a free MySQL database;
- **GitHub** to store the code;
- **Vercel** for free hosting.

Expect it to take about 20–30 minutes.

> Free plans change over time. Check each provider's current limits when you sign up. Vercel's free "Hobby" plan is meant for non-commercial use.

---

## 1. Create the database (Aiven)

1. Sign up at **aiven.io**, then choose **Create service → MySQL → Free plan**.
2. Pick a cloud region. Remember it, because you'll match the website region to it in step 5.
3. When the service is **Running**, open it and copy the **Service URI**. It looks like this:
   ```
   mysql://avnadmin:PASSWORD@mysql-xxxx.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED
   ```
4. Change the end of the URI so it works with Prisma. Replace `?ssl-mode=REQUIRED` with `?sslaccept=accept_invalid_certs`:
   ```
   mysql://avnadmin:PASSWORD@mysql-xxxx.aivencloud.com:12345/defaultdb?sslaccept=accept_invalid_certs
   ```
   This keeps the connection encrypted. It skips certificate checking because Aiven uses its own certificate authority. That is fine for a personal or class site.

## 2. Set up the database from your computer

In the project folder:

1. Put the URI from step 1 in `.env` as `DATABASE_URL="…"`.
2. Run:

```bash
npx prisma migrate deploy                                            # create all tables
npm run create-admin -- --email you@example.com --name "Your Name"   # your admin login (asks for a password)
npm run content:import                                               # C course + 50-mark test
```

You should see `Course c-programming: created …` and `Assessment … 50 marks — published.`

## 3. Put the code on GitHub

1. Create a **private** repository on github.com, for example `studyline`.
2. In the project folder, run:

```bash
git init
git add .
git commit -m "Studyline initial version"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/studyline.git
git push -u origin main
```

`.env` is in `.gitignore`, so your passwords are **not** uploaded.

## 4. Deploy on Vercel

1. Sign up at **vercel.com** with your GitHub account.
2. Choose **Add New → Project** and import the `studyline` repository. The framework is detected as Next.js automatically.
3. Before deploying, open **Environment Variables** and add:

| Name | Value |
|---|---|
| `DATABASE_URL` | the URI from step 1 |
| `APP_URL` | `https://YOUR-PROJECT.vercel.app` (you can fix this after the first deploy) |
| `EXECUTION_PROVIDER` | `none` (until step 6) |

4. Click **Deploy**. When it finishes, open the site and sign in with the admin account from step 2.

## 5. Make it fast

In Vercel, open **Project → Settings → Functions → Function Region** and pick the region closest to your Aiven database. Every page talks to the database, so a distant region makes the site slow.

## 6. (Optional) Turn on C code running

1. Sign up at **rapidapi.com** and subscribe to **Judge0 CE** on the free (Basic) plan.
2. Copy your **X-RapidAPI-Key**.
3. In Vercel, add these environment variables:

| Name | Value |
|---|---|
| `EXECUTION_PROVIDER` | `judge0` |
| `JUDGE0_URL` | `https://judge0-ce.p.rapidapi.com` |
| `JUDGE0_HOST` | `judge0-ce.p.rapidapi.com` |
| `JUDGE0_KEY` | your RapidAPI key |

4. Open **Deployments → … → Redeploy**.

The free Judge0 plan has a small daily request limit. For a whole class you will probably need a paid plan or a self-hosted Judge0 or Piston on a small server. Code always runs in Judge0's sandbox, never on your website server.

## 7. (Optional) Email

Brevo's free SMTP is enough for password resets and invites. Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `SMTP_FROM` in Vercel, then redeploy. Without email, teachers generate reset links on the student's page and share them.

## 8. First steps on the live site

1. Sign in as admin and go to **Settings → Invite teachers** if other teachers need access.
2. Share `https://YOUR-PROJECT.vercel.app/register` with students.
3. Go to **Tests & Assessments → the 50-mark test → Results & assignment**, then assign it to students or a group.
4. When submissions arrive, mark them under **Submissions & Grading**, then click **Release results**.

## Updating the site later

- **Code changes:** `git push`. Vercel redeploys automatically.
- **Database schema changes:** run `npx prisma migrate deploy` with `DATABASE_URL` pointing at the live database.
- **New content files:** run `npm run content:import` against the live database. Lessons edited in the teacher portal are not overwritten.
