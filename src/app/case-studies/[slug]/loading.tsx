export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="w-full animate-pulse mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8 lg:py-12 flex flex-col gap-8 sm:gap-10">
        {/* Back Link Skeleton */}
        <div className="h-9 w-28 rounded-full bg-white/[0.05] border border-white/[0.06]" />

        {/* Header & Title Skeleton */}
        <div className="flex flex-col gap-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <div className="h-5 w-24 rounded-full bg-white/[0.06]" />
            <div className="h-5 w-16 rounded-full bg-white/[0.04]" />
          </div>
          <div className="h-10 sm:h-14 w-full rounded-2xl bg-white/[0.08]" />
          <div className="h-4 w-full max-w-xl rounded bg-white/[0.04]" />
          <div className="h-4 w-3/4 max-w-md rounded bg-white/[0.04]" />
        </div>

        {/* Metadata Badges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-white/[0.06]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3 w-16 rounded bg-white/[0.04]" />
              <div className="h-4 w-28 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>

        {/* Giant Hero Cover Skeleton */}
        <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl bg-white/[0.04] border border-white/[0.06]" />

        {/* Content Blocks Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="h-7 w-44 rounded-lg bg-white/[0.06]" />
            <div className="h-4 w-full rounded bg-white/[0.04]" />
            <div className="h-4 w-full rounded bg-white/[0.04]" />
            <div className="h-4 w-5/6 rounded bg-white/[0.04]" />
            <div className="h-52 w-full rounded-2xl bg-white/[0.03] border border-white/[0.05] mt-2" />
          </div>
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-5 flex flex-col gap-4">
              <div className="h-5 w-32 rounded bg-white/[0.06]" />
              <div className="h-3.5 w-full rounded bg-white/[0.03]" />
              <div className="h-3.5 w-4/5 rounded bg-white/[0.03]" />
              <div className="h-10 w-full rounded-xl bg-white/[0.06] mt-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
