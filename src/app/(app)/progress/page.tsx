import { requirePageUser } from "@/server/auth/guards";
import { studentReport } from "@/server/services/reports";
import { PageHeader } from "@/components/ui";
import { StudentProgressReport } from "@/components/reports/StudentProgressReport";

export const metadata = { title: "My Progress" };

export default async function ProgressPage() {
  const user = await requirePageUser();
  const r = await studentReport(user.id, { asTeacher: false, eventLimit: 40 });
  return (
    <>
      <PageHeader title="My Progress" description="Your lesson completion, practice performance and test results, calculated from your saved activity." />
      <StudentProgressReport {...r} testHref={(t) => (t.visible ? `/tests/${t.assessmentId}/result/${t.attemptId}` : `/tests/${t.assessmentId}`)} />
    </>
  );
}
