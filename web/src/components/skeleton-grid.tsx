export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-3xl bg-card p-3.5 clay">
          <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-muted" />
          <div className="space-y-2 px-1.5 pt-3.5">
            <div className="h-4 w-16 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
