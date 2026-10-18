import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card max-w-md p-8 text-center">
        <p className="label-caps mb-2">404</p>
        <h1 className="text-[20px] font-semibold">Page not found</h1>
        <p className="mt-2 text-[13.5px] text-muted">The page may have moved, or you may not have access to it.</p>
        <Link href="/" className="mt-5 inline-block text-[13.5px] font-medium text-primary hover:underline">
          Go to your dashboard
        </Link>
      </div>
    </div>
  );
}
