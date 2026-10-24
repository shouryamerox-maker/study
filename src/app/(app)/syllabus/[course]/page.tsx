import { notFound, redirect } from "next/navigation";
import { db } from "@/server/db";

/**
 * Course outlines (study material) moved to /study/<course>. /syllabus is now the official
 * university syllabus. Old links keep working through this redirect.
 */
export default async function OldCourseOutline({ params, searchParams }: { params: Promise<{ course: string }>; searchParams: Promise<{ open?: string }> }) {
  const { course } = await params;
  const { open } = await searchParams;
  const exists = await db.course.findUnique({ where: { slug: course }, select: { slug: true } });
  if (!exists) notFound();
  redirect(`/study/${exists.slug}${open ? `?open=${encodeURIComponent(open)}` : ""}`);
}
