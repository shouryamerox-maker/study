"use client";

import { Button, Card } from "@/components/ui";

export default function AppError({ reset, error }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card className="mx-auto mt-10 max-w-lg p-8 text-center">
      <h1 className="text-[18px] font-semibold">Something went wrong</h1>
      <p className="mt-2 text-[13.5px] text-muted">The page could not be loaded. Your saved work is not affected.{error.digest ? ` (ref ${error.digest})` : ""}</p>
      <Button className="mt-5" onClick={reset}>
        Try again
      </Button>
    </Card>
  );
}
