export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] px-5 sm:px-6 md:px-10 lg:px-16 py-10 md:py-16">
      <div className="max-w-5xl mx-auto w-full animate-pulse flex flex-col gap-8 sm:gap-10">
        {/* Back Link */}
        <div className="h-9 w-28 rounded-full bg-white/[0.05] border border-white/[0.06]" />

        {/* Title & Metadata */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 rounded bg-white/[0.06]" />
            <div className="h-4 w-12 rounded bg-white/[0.04]" />
          </div>
          <div className="h-10 sm:h-14 w-3/4 max-w-2xl rounded-2xl bg-white/[0.08]" />
        </div>

        {/* Hero Visual */}
        <div className="w-full aspect-[16/10] rounded-2xl bg-white/[0.04] border border-white/[0.06]" />

        {/* Details & Tech Stack */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
          <div className="md:col-span-8 flex flex-col gap-4">
            <div className="h-5 w-32 rounded bg-white/[0.06]" />
            <div className="h-4 w-full rounded bg-white/[0.04]" />
            <div className="h-4 w-full rounded bg-white/[0.04]" />
            <div className="h-4 w-4/5 rounded bg-white/[0.04]" />
          </div>
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="h-5 w-24 rounded bg-white/[0.06]" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-7 w-20 rounded-lg bg-white/[0.04]" />
              ))}
            </div>
            <div className="h-11 w-full rounded-xl bg-white/[0.07] mt-2" />
          </div>
        </div>

        {/* Gallery Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-white/[0.03] border border-white/[0.05]" />
          ))}
        </div>
      </div>
    </div>
  );
}