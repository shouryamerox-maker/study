import { requirePageUser } from "@/server/auth/guards";
import { executionAvailable, LIMITS } from "@/server/execution";
import { PageHeader } from "@/components/ui";
import { Playground } from "@/components/code/Playground";

export const metadata = { title: "Code Playground" };

export default async function PlaygroundPage() {
  const user = await requirePageUser();
  return (
    <>
      <PageHeader
        title="C Playground"
        description={`Write, compile and run C programs. Code runs in an isolated sandbox with a ${LIMITS.cpuSeconds}s CPU limit and ${LIMITS.memoryKb / 1024} MB memory limit.`}
      />
      <Playground available={executionAvailable()} userId={user.id} />
    </>
  );
}
