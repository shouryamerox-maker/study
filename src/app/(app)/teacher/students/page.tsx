import { requirePageStaff } from "@/server/auth/guards";
import Link from "next/link";
import { Users } from "lucide-react";
import { db } from "@/server/db";
import { studentDirectory } from "@/server/services/teacher";
import { Avatar, Badge, Button, Card, EmptyState, PageHeader, ProgressBar, fmtDate, fmtRelative } from "@/components/ui";

export const metadata = { title: "Students" };

type SP = { q?: string; course?: string; status?: string; progress?: string; tests?: string; sort?: string };

export default async function StudentsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requirePageStaff();
  const sp = await searchParams;
  const [rowsAll, courses] = await Promise.all([studentDirectory({ q: sp.q?.trim() || undefined, courseId: sp.course || undefined, status: sp.status }), db.course.findMany({ orderBy: { order: "asc" } })]);

  let rows = rowsAll;
  if (sp.progress === "none") rows = rows.filter((r) => r.lessonsCompleted === 0);
  if (sp.progress === "lt50") rows = rows.filter((r) => r.progress > 0 && r.progress < 50);
  if (sp.progress === "gte50") rows = rows.filter((r) => r.progress >= 50 && r.progress < 100);
  if (sp.progress === "done") rows = rows.filter((r) => r.progress === 100);
  if (sp.tests === "none") rows = rows.filter((r) => r.testsAttempted === 0);
  if (sp.tests === "attempted") rows = rows.filter((r) => r.testsAttempted > 0);
  if (sp.tests === "pending") rows = rows.filter((r) => r.pendingGrading > 0);
  const sorters: Record<string, (a: (typeof rows)[number], b: (typeof rows)[number]) => number> = {
    name: (a, b) => a.name.localeCompare(b.name),
    progress: (a, b) => b.progress - a.progress,
    score: (a, b) => (b.averageScore ?? -1) - (a.averageScore ?? -1),
    activity: (a, b) => (b.lastActivity?.getTime() ?? 0) - (a.lastActivity?.getTime() ?? 0),
  };
  rows = [...rows].sort(sorters[sp.sort ?? "name"] ?? sorters.name);

  return (
    <>
      <PageHeader title="Students" description={`${rowsAll.length} student${rowsAll.length === 1 ? "" : "s"}${rows.length !== rowsAll.length ? ` · ${rows.length} shown` : ""}`} />
      <Card className="mb-4 p-3">
        <form className="flex flex-wrap items-end gap-2" action="/teacher/students">
          <div className="min-w-[200px] flex-1">
            <label htmlFor="q" className="mb-1 block text-[12px] text-muted">
              Search
            </label>
            <input id="q" name="q" defaultValue={sp.q} placeholder="Name, email or student ID" className="input h-8" />
          </div>
          {[
            { name: "course", label: "Course", value: sp.course, options: [["", "All courses"], ...courses.map((c) => [c.id, c.title])] },
            { name: "progress", label: "Progress", value: sp.progress, options: [["", "Any"], ["none", "Not started"], ["lt50", "Under 50%"], ["gte50", "50–99%"], ["done", "Completed"]] },
            { name: "tests", label: "Tests", value: sp.tests, options: [["", "Any"], ["attempted", "Attempted a test"], ["none", "No tests"], ["pending", "Awaiting grading"]] },
            { name: "status", label: "Account", value: sp.status, options: [["", "Any"], ["ACTIVE", "Active"], ["SUSPENDED", "Suspended"]] },
            { name: "sort", label: "Sort by", value: sp.sort, options: [["name", "Name"], ["progress", "Progress"], ["score", "Average score"], ["activity", "Last activity"]] },
          ].map((f) => (
            <div key={f.name}>
              <label htmlFor={f.name} className="mb-1 block text-[12px] text-muted">
                {f.label}
              </label>
              <select id={f.name} name={f.name} defaultValue={f.value ?? ""} className="input h-8 w-auto pr-8">
                {f.options.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <Button type="submit" size="sm" className="h-8">
            Apply
          </Button>
          <Link href="/teacher/students" className="h-8 px-2 text-[13px] leading-8 text-muted hover:text-ink">
            Clear
          </Link>
        </form>
      </Card>
      <Card className="overflow-x-auto">
        {rows.length === 0 ? (
          <EmptyState icon={<Users size={18} />} title={rowsAll.length ? "No students match these filters" : "No students registered yet"} />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Enrolled</th>
                <th className="w-44">Course progress</th>
                <th className="text-right">Lessons</th>
                <th className="text-right">Tests</th>
                <th className="text-right">Latest</th>
                <th className="text-right">Average</th>
                <th>Last activity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link href={`/teacher/students/${s.id}`} className="flex items-center gap-2.5">
                      <Avatar name={s.name} color={s.avatarColor} size={28} />
                      <span className="min-w-0">
                        <span className="block font-medium hover:text-primary">{s.name}</span>
                        <span className="block text-[12px] text-muted">
                          {s.email}
                          {s.studentCode ? ` · ${s.studentCode}` : ""}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="text-muted">{fmtDate(s.enrolledAt)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <ProgressBar value={s.progress} />
                      <span className="w-9 text-right text-[12px] tabular-nums">{s.progress}%</span>
                    </div>
                  </td>
                  <td className="text-right tabular-nums">
                    {s.lessonsCompleted}/{s.lessonsTotal}
                  </td>
                  <td className="text-right tabular-nums">
                    {s.testsAttempted}
                    {s.pendingGrading > 0 && <Badge tone="pending" className="ml-1">{s.pendingGrading} to grade</Badge>}
                  </td>
                  <td className="text-right tabular-nums">{s.latestScore == null ? "—" : `${s.latestScore}%`}</td>
                  <td className="text-right tabular-nums">{s.averageScore == null ? "—" : `${s.averageScore}%`}</td>
                  <td className="whitespace-nowrap text-muted">{fmtRelative(s.lastActivity)}</td>
                  <td>{s.status === "ACTIVE" ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Suspended</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
