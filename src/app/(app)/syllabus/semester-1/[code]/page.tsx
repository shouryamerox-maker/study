import Link from "next/link";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { requirePageUser } from "@/server/auth/guards";
import { findSubject, shardaCseAiml2026 as programme, type ExamCoverage, type SyllabusSubject } from "@content/syllabus/sharda-btech-cse-aiml-2026";
import { PageHeader, cn } from "@/components/ui";
import { PdfRef, SubjectIcon, unitsLabel } from "@/components/syllabus/SyllabusBits";
import { semester1Academics } from "@content/syllabus/sharda-btech-cse-aiml-2026-outcomes";

const SLUG = "semester-1";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const f = findSubject(SLUG, (await params).code);
  return { title: f ? `${f.subject.code} · ${f.subject.name}` : "Subject" };
}

function ExamCard({ label, exam, subject }: { label: string; exam: ExamCoverage | null; subject: SyllabusSubject }) {
  return (
    <div className="flex-1 rounded-[12px] border border-border bg-surface p-4">
      <div className="text-[12px] font-semibold uppercase tracking-[0.05em] text-primary">{label}</div>
      {exam ? (
        <>
          <div className="mt-1 text-[18px] font-semibold">
            {exam.units ? (exam.units.length === subject.units.length ? `All units (${unitsLabel(exam.units)})` : unitsLabel(exam.units)) : "Units not specified"}
          </div>
          <div className="text-[13px] text-muted">
            {exam.name} · {exam.marks}
          </div>
          {exam.units && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {exam.units.map((u) => (
                <a key={u} href={`#unit-${u}`} className="rounded-[6px] bg-primary-soft px-2 py-0.5 text-[12.5px] font-medium text-primary-dark hover:bg-[#efd9cd]">
                  Unit {u}
                </a>
              ))}
            </div>
          )}
          <p className="mt-3 text-[12.5px] italic text-muted">
            “{exam.statement}” <PdfRef pages={exam.page} className="not-italic" />
          </p>
        </>
      ) : (
        <p className="mt-1 text-[14px] text-muted">Exam coverage not specified in the provided syllabus.</p>
      )}
    </div>
  );
}

export default async function SubjectSyllabus({ params }: { params: Promise<{ code: string }> }) {
  await requirePageUser();
  const found = findSubject(SLUG, (await params).code);
  if (!found) notFound();
  const { subject: s, semester } = found;
  const mid = new Set(s.midSem?.units ?? []);
  const end = new Set(s.endSem?.units ?? []);
  const noCoverage = !s.midSem && !s.endSem;
  const academics = semester1Academics[s.code];
  const idx = semester.subjects.findIndex((x) => x.code === s.code);
  const prev = semester.subjects[idx - 1];
  const next = semester.subjects[idx + 1];

  return (
    <div className="mx-auto max-w-[820px]">
      <PageHeader back={{ href: `/syllabus/${SLUG}`, label: `Back to ${semester.name}` }} title={s.name} />
      <div className="-mt-3 mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
        <SubjectIcon icon={s.icon} size={15} />
        <span>
          Course code <span className="font-mono font-medium text-ink">{s.code}</span>
        </span>
        <span>{s.credits != null ? `${s.credits} credit${s.credits === 1 ? "" : "s"}` : "Credits not specified"}</span>
        {s.contactHours && <span>{s.contactHours}</span>}
        {s.courseType && <span>{s.courseType}</span>}
      </div>

      {/* What each exam covers */}
      <section aria-labelledby="exams-h" className="mb-10">
        <h2 id="exams-h" className="mb-3 text-[16px] font-semibold">
          Exam coverage
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ExamCard label="Mid-Semester" exam={s.midSem} subject={s} />
          <ExamCard label="End-Semester" exam={s.endSem} subject={s} />
        </div>
        {s.assessment && (
          <p className="mt-3 text-[13px] text-muted">
            <span className="font-medium text-ink">Marks distribution:</span> {s.assessment} {s.assessmentPage && <PdfRef pages={s.assessmentPage} />}
          </p>
        )}
        {noCoverage && (
          <p className="mt-2 flex items-start gap-1.5 text-[12.5px] text-faint">
            <Info size={13} className="mt-0.5 shrink-0" aria-hidden /> Exam coverage not specified in the provided syllabus.
          </p>
        )}
      </section>

      {/* Units */}
      <section aria-labelledby="units-h">
        <h2 id="units-h" className="mb-3 text-[16px] font-semibold">
          Units
        </h2>
        <div className="space-y-4">
          {s.units.map((u) => (
            <article key={u.number} id={`unit-${u.number}`} className="scroll-mt-20 rounded-[12px] border border-border bg-surface px-5 py-4 target:border-primary target:ring-2 target:ring-primary/20">
              <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.05em] text-faint">Unit {u.number}</div>
                  <h3 className="text-[16.5px] font-semibold leading-snug">{u.title}</h3>
                </div>
                {!noCoverage && (
                  <div className="flex shrink-0 gap-1.5 pt-0.5">
                    <span className={cn("rounded-[6px] px-2 py-0.5 text-[11.5px] font-medium", mid.has(u.number) ? "bg-primary-soft text-primary-dark" : "bg-divider/60 text-faint line-through")} title={mid.has(u.number) ? "In the Mid-Semester exam" : "Not in the Mid-Semester exam"}>
                      Mid-Sem
                    </span>
                    <span className={cn("rounded-[6px] px-2 py-0.5 text-[11.5px] font-medium", end.has(u.number) ? "bg-success-soft text-success" : "bg-divider/60 text-faint line-through")} title={end.has(u.number) ? "In the End-Semester exam" : "Not in the End-Semester exam"}>
                      End-Sem
                    </span>
                  </div>
                )}
              </div>
              <ol className="mt-3 space-y-2">
                {u.topics.map((t) => (
                  <li key={t.id} className="flex gap-3 text-[14.5px] leading-relaxed">
                    <span className="w-4 shrink-0 font-mono text-[12.5px] leading-[1.75] text-faint">{t.id}</span>
                    <span className="min-w-0">{t.text}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-3 flex flex-wrap gap-x-3 text-[11.5px] text-faint">
                {u.hours && <span>Hours (L-T-P-SL): {u.hours}</span>}
                <PdfRef pages={u.pages} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {academics && (
        <section aria-labelledby="co-h" className="mt-10">
          <h2 id="co-h" className="text-[16px] font-semibold">
            Course outcomes
          </h2>
          <p className="mb-3 mt-0.5 text-[12.5px] text-muted">What you should be able to do after this course. Official wording first, then a simple explanation (not official text).</p>
          <ol className="divide-y divide-divider overflow-hidden rounded-[12px] border border-border bg-surface">
            {academics.outcomes.map((o) => (
              <li key={o.id} className="px-5 py-3.5">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-mono text-[12.5px] font-semibold text-primary">{/^d/.test(o.id) ? `Outcome ${o.id}` : o.id}</span>
                  {o.level && <span className="text-[11.5px] text-faint">{o.level}</span>}
                  {o.kind === "lab" && <span className="rounded-[5px] bg-divider/70 px-1.5 text-[11px] text-muted">Lab only</span>}
                </div>
                <p className="mt-1 text-[14px] leading-relaxed">{o.statement}</p>
                <p className="mt-1 text-[13px] text-muted">
                  <span className="font-medium text-success">In simple words:</span> {o.simple}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-1.5 text-right">
            <PdfRef pages={academics.outcomesPages} />
          </p>

          <h2 className="mt-8 text-[16px] font-semibold">Course objectives</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed">
            {academics.objectives.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
          <p className="mt-1.5 text-right">
            <PdfRef pages={academics.objectivesPage} />
          </p>
        </section>
      )}

      {s.sourceNotes.length > 0 && (
        <section className="mt-8 rounded-[10px] bg-sidebar px-4 py-3" aria-labelledby="notes-h">
          <h2 id="notes-h" className="text-[12.5px] font-semibold text-muted">
            Notes on the source document
          </h2>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-[12.5px] text-muted">
            {s.sourceNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-[12px] text-faint">
        Source: {programme.sourceFile}, PDF pages {s.pages[0]}–{s.pages[1]}. This page shows the official syllabus only; lessons and practice are under Study Material.
      </p>

      <nav aria-label="Other subjects" className="mt-8 grid gap-2 border-t border-border pt-5 sm:grid-cols-2">
        {prev ? (
          <Link href={`/syllabus/${SLUG}/${prev.code.toLowerCase()}`} className="group rounded-[8px] px-3 py-2 hover:bg-surface">
            <span className="block text-[12px] text-muted">← Previous subject</span>
            <span className="block truncate text-[14px] font-medium group-hover:text-primary">{prev.name}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/syllabus/${SLUG}/${next.code.toLowerCase()}`} className="group rounded-[8px] px-3 py-2 text-right hover:bg-surface">
            <span className="block text-[12px] text-muted">Next subject →</span>
            <span className="block truncate text-[14px] font-medium group-hover:text-primary">{next.name}</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
