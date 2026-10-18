import { NextResponse } from "next/server";
import { api, notFound } from "@/server/http";
import { db } from "@/server/db";

/** Serves an uploaded course document to signed-in users. */
export const GET = api<{ id: string }>("user", async ({ params }) => {
  const f = await db.fileAsset.findUnique({ where: { id: params.id } });
  if (!f) throw notFound("File");
  if (f.url) return NextResponse.redirect(f.url);
  if (!f.data) throw notFound("File");
  return new Response(new Uint8Array(f.data), {
    headers: {
      "content-type": f.mimeType ?? "application/octet-stream",
      // Uploaded files are always downloaded/rendered as attachments, never as active HTML.
      "content-disposition": `${f.mimeType === "application/pdf" || f.mimeType?.startsWith("image/") ? "inline" : "attachment"}; filename="${f.title.replace(/[^\w.\- ]/g, "_")}"`,
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
      "cache-control": "private, max-age=300",
    },
  });
});
