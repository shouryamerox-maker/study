"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Alert, Button, Field } from "@/components/ui";
import { apiFetch, ClientApiError } from "@/lib/client-api";

export function CourseCreate({ subjects }: { subjects: { id: string; name: string }[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState(subjects.length === 0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      let subjectId = f.get("subjectId") as string;
      if (newSubject) {
        const s = await apiFetch<{ subject: { id: string } }>("/api/v1/teacher/content", { body: { op: "createSubject", name: f.get("subjectName"), kind: f.get("subjectKind") } });
        subjectId = s.subject.id;
      }
      const lang = f.get("codeLanguage") as string;
      const r = await apiFetch<{ course: { id: string } }>("/api/v1/teacher/content", {
        body: { op: "createCourse", subjectId, title: f.get("title"), summary: f.get("summary"), codeLanguage: lang || null },
      });
      router.push(`/teacher/courses/${r.course.id}`);
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Could not create the course.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
      {error && <Alert tone="danger" className="md:col-span-2">{error}</Alert>}
      {newSubject ? (
        <>
          <Field label="New subject name" htmlFor="sn">
            <input id="sn" name="subjectName" className="input" placeholder="e.g. Physics" required />
          </Field>
          <Field label="Subject type" htmlFor="sk" hint="Programming subjects get code examples and the compiler; science subjects get formulas and diagrams.">
            <select id="sk" name="subjectKind" className="input">
              <option value="SCIENCE">Science (Physics, Biology…)</option>
              <option value="PROGRAMMING">Programming</option>
              <option value="GENERAL">General</option>
            </select>
          </Field>
        </>
      ) : (
        <Field label="Subject" htmlFor="sid">
          <select id="sid" name="subjectId" className="input">
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      <div className="flex items-end md:col-span-2">
        <button type="button" className="text-[12.5px] text-primary hover:underline" onClick={() => setNewSubject((v) => !v)}>
          {newSubject ? (subjects.length ? "Use an existing subject" : "") : "+ New subject"}
        </button>
      </div>
      <Field label="Course title" htmlFor="ct">
        <input id="ct" name="title" className="input" required minLength={3} />
      </Field>
      <Field label="Code language" htmlFor="cl" hint="Only for programming courses.">
        <select id="cl" name="codeLanguage" className="input">
          <option value="">None</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
      </Field>
      <Field label="Summary" htmlFor="cs" className="md:col-span-2">
        <textarea id="cs" name="summary" rows={2} className="input" required />
      </Field>
      <div>
        <Button type="submit" disabled={busy}>
          <Plus size={14} /> Create course (unpublished)
        </Button>
      </div>
    </form>
  );
}
