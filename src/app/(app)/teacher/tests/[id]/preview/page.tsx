import { requirePageStaff } from "@/server/auth/guards";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { buildSnapshot } from "@/server/assessments/definition";
import { studentSafeSnapshot } from "@/server/assessments/attempts";
import { Alert, Badge, Card, PageHeader, fmtMarks } from "@/components/ui";
import { Markdown } from "@/components/content/Markdown";
import { CodeView } from "@/components/content/CodeView";

export const metadata = { title: "Preview test" };

/** Shows the draft exactly as students will receive it (answer keys stripped). */
export default async function PreviewTest({ params }: { params: Promise<{ id: string }> }) {
  await requirePageStaff();
  const { id } = await params;
  const a = await db.assessment.findUnique({ where: { id } });
  if (!a) notFound();
  let snap;
  try {
    snap = studentSafeSnapshot(await buildSnapshot(db, id));
  } catch {
    return (
      <>
        <PageHeader crumbs={[{ href: `/teacher/tests/${id}`, label: a.title }, { label: "Preview" }]} title="Preview" />
        <Alert tone="danger">The draft has validation errors. Open the editor and save it to see what needs fixing.</Alert>
      </>
    );
  }
  return (
    <>
      <PageHeader crumbs={[{ href: "/teacher/tests", label: "Tests" }, { href: `/teacher/tests/${id}`, label: a.title }, { label: "Preview" }]} title={snap.title} description={`Student view of the current draft · ${fmtMarks(snap.totalMarks)} marks`} />
      <Alert className="mb-5">This is what students see. Answer keys, rubrics and hidden tests are not included.</Alert>
      {a.instructions && (
        <Card className="mb-5 p-5">
          <Markdown>{a.instructions}</Markdown>
        </Card>
      )}
      {snap.sections.map((s) => (
        <section key={s.id} className="mb-6">
          <h2 className="text-[15px] font-semibold">{s.title}</h2>
          {s.instructions && <p className="mb-2 text-[13px] text-muted">{s.instructions}</p>}
          <div className="space-y-3">
            {s.questions.map((q) => (
              <Card key={q.id} className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[13px] font-semibold">Q{q.number}</span>
                  <Badge>{fmtMarks(q.marks)} marks</Badge>
                  <Badge>{q.type.replace(/_/g, " ").toLowerCase()}</Badge>
                </div>
                <Markdown className="text-[14px]">{q.prompt}</Markdown>
                {q.code && <CodeView code={q.code} className="mt-2" />}
                {q.data.options && (
                  <ul className="mt-2 space-y-1">
                    {q.data.options.map((o) => (
                      <li key={o.id} className="rounded-[7px] border border-divider px-3 py-1.5 text-[13.5px]">
                        <span className="mr-2 font-mono text-[12px] text-muted">{o.id.toUpperCase()}.</span>
                        <Markdown inline className="text-[13.5px]">{o.text}</Markdown>
                      </li>
                    ))}
                  </ul>
                )}
                {q.data.sampleTests && q.data.sampleTests.length > 0 && <p className="mt-2 text-[12.5px] text-muted">{q.data.sampleTests.length} sample test(s) visible to students.</p>}
              </Card>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
