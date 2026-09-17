export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] px-5 sm:px-6 md:px-10 lg:px-16 py-10 md:py-16">
      <div className="max-w-4xl mx-auto w-full animate-pulse flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="h-10 sm:h-12 w-80 rounded-2xl bg-white/[0.08]" />
          <div className="h-4 w-full max-w-lg rounded bg-white/[0.04]" />
          
          {/* Tabs */}
          <div className="flex gap-2 pt-3">
            <div className="h-8 w-20 rounded-full bg-white/[0.06]" />
            <div className="h-8 w-28 rounded-full bg-white/[0.04]" />
            <div className="h-8 w-24 rounded-full bg-white/[0.04]" />
          </div>
        </div>

        {/* Timeline Cards Skeleton */}
        <div className="flex flex-col gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-[var(--card)] border border-white/[0.06] p-6 flex flex-col gap-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-col gap-1.5">
                  <div className="h-6 w-48 rounded-lg bg-white/[0.07]" />
                  <div className="h-4 w-36 rounded bg-white/[0.05]" />
                </div>
                <div className="h-6 w-32 rounded-full bg-white/[0.04]" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="h-3.5 w-full rounded bg-white/[0.03]" />
                <div className="h-3.5 w-4/5 rounded bg-white/[0.03]" />
              </div>

              <div className="flex gap-2 pt-2">
                <div className="h-6 w-16 rounded-md bg-white/[0.04]" />
                <div className="h-6 w-16 rounded-md bg-white/[0.04]" />
                <div className="h-6 w-16 rounded-md bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}