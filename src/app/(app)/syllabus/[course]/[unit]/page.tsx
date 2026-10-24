import { notFound, redirect } from "next/navigation";
import { db } from "@/server/db";

/** Old unit links (/syllabus/<course>/<unit>) now live under /study. */
export default async function OldUnitOutline({ params }: { params: Promise<{ course: string; unit: string }> }) {
  const { course, unit } = await params;
  const exists = await db.unit.findFirst({ where: { slug: unit, course: { slug: course } }, select: { slug: true } });
  if (!exists) notFound();
  redirect(`/study/${course}/${exists.slug}`);
}
