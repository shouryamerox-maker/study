import { z } from "zod";
import { api, badRequest, parseBody } from "@/server/http";
import { db } from "@/server/db";

const MAX_BYTES = 4 * 1024 * 1024; // stays under serverless request-body limits
const ALLOWED = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

/** Upload (multipart) or link (JSON) a syllabus document / resource. */
export const POST = api("staff", async ({ req, user }) => {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw badRequest("Choose a file to upload.");
    if (file.size > MAX_BYTES) throw badRequest("Files must be 4 MB or smaller. For larger files, add a link instead.");
    if (!ALLOWED.has(file.type)) throw badRequest("Allowed types: PDF, images, plain text, Word and PowerPoint documents.");
    const title = String(form.get("title") || file.name).slice(0, 200);
    const f = await db.fileAsset.create({
      data: {
        title,
        kind: form.get("kind") === "syllabus" ? "syllabus" : "resource",
        courseId: (form.get("courseId") as string) || null,
        chapterId: (form.get("chapterId") as string) || null,
        lessonId: (form.get("lessonId") as string) || null,
        mimeType: file.type,
        sizeBytes: file.size,
        data: Buffer.from(await file.arrayBuffer()),
        uploadedById: user.id,
      },
      select: { id: true, title: true },
    });
    return { file: f };
  }
  const body = await parseBody(
    req,
    z.object({
      title: z.string().trim().min(1).max(200),
      url: z.string().url().refine((u) => /^https?:\/\//.test(u), "Only http(s) links are allowed."),
      kind: z.enum(["syllabus", "resource"]).default("resource"),
      courseId: z.string().nullish(),
      chapterId: z.string().nullish(),
      lessonId: z.string().nullish(),
    }),
  );
  const f = await db.fileAsset.create({
    data: { title: body.title, url: body.url, kind: body.kind, courseId: body.courseId ?? null, chapterId: body.chapterId ?? null, lessonId: body.lessonId ?? null, uploadedById: user.id },
    select: { id: true, title: true },
  });
  return { file: f };
});

export const DELETE = api("staff", async ({ req }) => {
  const id = req.nextUrl.searchParams.get("id");
  if (id) await db.fileAsset.deleteMany({ where: { id } });
  return { ok: true };
});
