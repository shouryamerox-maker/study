import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/server/auth/guards";
import { shardaCseAiml2026 as programme } from "@content/syllabus/sharda-btech-cse-aiml-2026";
import { PageHeader } from "@/components/ui";
import { SubjectIcon, examSummary } from "@/components/syllabus/SyllabusBits";
import { TopicFinder } from "@/components/syllabus/TopicFinder";

export const metadata = { title: "Semester 1 · Syllabus" };

const SLUG = "semester-1";

export default async function SemesterPage() {
  await requirePageUser();
  const sem = programme.semesters.find((s) => s.slug === SLUG);
  if (!sem) notFound();

  const index = sem.subjects.flatMap((s) =>
    s.units.flatMap((u) => u.topics.map((t) => ({ code: s.code, subject: s.name, unit: u.number, unitTitle: u.title, id: t.id, text: t.text, href: `/syllabus/${SLUG}/${s.code.toLowerCase()}#unit-${u.number}` }))),
  );

  return (
    <div className="mx-auto max-w-[960px]">
      <PageHeader back={{ href: "/syllabus", label: "Back to syllabus" }} title={sem.name} />
      <p className="-mt-3 mb-6 text-[13.5px] text-muted">
        {programme.programme} · Batch {programme.batch} · {sem.subjects.length} subjects
      </p>

      <div className="mb-8">
        <TopicFinder items={index} />
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sem.subjects.map((s) => {
          const ex = examSummary(s);
          return (
            <li key={s.code}>
              <Link href={`/syllabus/${SLUG}/${s.code.toLowerCase()}`} className="group flex h-full flex-col rounded-[12px] border border-border bg-surface p-4 transition-colors duration-150 hover:border-primary">
                <div className="flex items-start gap-3">
                  <SubjectIcon icon={s.icon} />
                  <div className="min-w-0">
                    <div className="font-mono text-[12px] text-muted">{s.code}</div>
                    <h2 className="text-[15px] font-semibold leading-snug group-hover:text-primary">{s.name}</h2>
                  </div>
                </div>
                <div className="mt-auto pt-4 text-[12.5px] text-muted">
                  {s.units.length} units{s.credits != null ? ` · ${s.credits} credit${s.credits === 1 ? "" : "s"}` : ""}
                  <div className="mt-1">
                    {ex.mid ? (
                      <span>
                        Mid-Sem: <span className="font-medium text-ink">{ex.mid}</span>
                      </span>
                    ) : (
                      <span className="text-faint">Exam coverage not specified</span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {sem.sourceNotes.length > 0 && (
        <div className="mt-8 border-t border-divider pt-4 text-[12.5px] text-faint">
          {sem.sourceNotes.map((n, i) => (
            <p key={i}>{n}</p>
          ))}
          <p className="mt-1">
            Source: {programme.sourceFile}, subject list on PDF page {sem.listPage}.
          </p>
        </div>
      )}
    </div>
  );
}
