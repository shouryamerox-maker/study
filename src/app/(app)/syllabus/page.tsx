import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { requirePageUser } from "@/server/auth/guards";
import { shardaCseAiml2026 as programme } from "@content/syllabus/sharda-btech-cse-aiml-2026";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Syllabus" };

/** Official university syllabus — separate from Study Material. */
export default async function SyllabusHome() {
  await requirePageUser();
  return (
    <div className="mx-auto max-w-[820px]">
      <PageHeader title="Syllabus" description="Your official university syllabus: subjects, units, topics and what each exam covers." />
      <div className="-mt-1 mb-6 text-[13.5px] text-muted">
        <span className="font-medium text-ink">{programme.university}</span> · {programme.programme} · Batch {programme.batch}
      </div>
      <ul className="overflow-hidden rounded-[12px] border border-border bg-surface">
        {programme.semesters.map((s, i) => (
          <li key={s.slug} className={i > 0 ? "border-t border-divider" : undefined}>
            <Link href={`/syllabus/${s.slug}`} className="group flex items-center gap-4 px-5 py-5 hover:bg-sidebar">
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-semibold group-hover:text-primary">{s.name}</span>
                <span className="mt-0.5 block text-[13px] text-muted">
                  {s.subjects.length} subjects · {s.subjects.map((x) => x.code).join(", ")}
                </span>
              </span>
              <ChevronRight size={18} className="text-faint group-hover:text-primary" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-start gap-2 text-[12.5px] text-faint">
        <FileText size={13} className="mt-0.5 shrink-0" aria-hidden />
        Source: {programme.sourceFile} ({programme.sourcePages}). Other semesters will appear here when they are added. Lessons and practice are under Study Material.
      </p>
    </div>
  );
}
