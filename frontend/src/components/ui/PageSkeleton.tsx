/** Placeholder while a dynamic page's data loads (also used for the build-time placeholder route). */
export function PageSkeleton() {
  return (
    <div className="container-site pt-4 pb-16" aria-busy="true" aria-label="Loading">
      <div className="mx-auto h-4 w-32 animate-pulse rounded bg-line" />
      <div className="mx-auto mt-3 h-10 w-2/3 animate-pulse rounded bg-line" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-[6/7] animate-pulse rounded-media bg-panel" />
        ))}
      </div>
    </div>
  );
}
