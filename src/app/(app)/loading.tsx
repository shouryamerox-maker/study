export default function Loading() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-7 w-64 rounded-[8px] bg-divider" />
      <div className="grid gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-[12px] bg-divider/70" />
        ))}
      </div>
      <div className="h-64 rounded-[12px] bg-divider/60" />
    </div>
  );
}
