import type { LearningEvent } from "@prisma/client";
import { BookOpen, CheckCircle2, ClipboardCheck, Code2, FileEdit, PenLine, Bookmark, LogIn, Play, RotateCcw } from "lucide-react";
import { fmtRelative } from "@/components/ui";

const meta: Record<string, { icon: typeof BookOpen; verb: string }> = {
  LOGIN: { icon: LogIn, verb: "Signed in" },
  LESSON_VIEWED: { icon: BookOpen, verb: "Opened lesson" },
  LESSON_COMPLETED: { icon: CheckCircle2, verb: "Completed lesson" },
  LESSON_REOPENED: { icon: RotateCcw, verb: "Marked lesson incomplete" },
  PRACTICE_SUBMITTED: { icon: PenLine, verb: "Answered practice question" },
  CODE_RUN: { icon: Code2, verb: "Ran code" },
  TEST_STARTED: { icon: Play, verb: "Started test" },
  TEST_SUBMITTED: { icon: ClipboardCheck, verb: "Submitted test" },
  BOOKMARK_ADDED: { icon: Bookmark, verb: "Bookmarked" },
  NOTE_SAVED: { icon: FileEdit, verb: "Saved a note on" },
};

export function ActivityList({ events, showCorrectness = true }: { events: LearningEvent[]; showCorrectness?: boolean }) {
  return (
    <ul className="divide-y divide-divider">
      {events.map((e) => {
        const m = meta[e.type] ?? { icon: BookOpen, verb: e.type };
        const Icon = m.icon;
        const correct = (e.meta as { correct?: boolean } | null)?.correct;
        const mode = (e.meta as { mode?: string } | null)?.mode;
        return (
          <li key={e.id} className="flex items-start gap-3 px-4 py-2.5">
            <Icon size={15} className="mt-0.5 shrink-0 text-muted" aria-hidden />
            <div className="min-w-0 flex-1 text-[13px]">
              <span className="text-muted">{m.verb}</span>{" "}
              {e.label && e.type !== "CODE_RUN" && <span className="font-medium">{e.label}</span>}
              {e.type === "CODE_RUN" && e.label && <span className="text-muted">({e.label})</span>}
              {showCorrectness && correct !== undefined && <span className={correct ? "text-success" : "text-danger"}> · {correct ? "correct" : "incorrect"}</span>}
              {mode === "AUTO_SUBMITTED" && <span className="text-pending"> · auto-submitted at time limit</span>}
            </div>
            <time className="shrink-0 text-[11.5px] text-faint" dateTime={e.createdAt.toISOString()} title={e.createdAt.toLocaleString()}>
              {fmtRelative(e.createdAt)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
