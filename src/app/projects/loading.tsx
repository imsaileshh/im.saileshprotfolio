export default function Loading() {
  return (
    <div className="w-full animate-pulse flex flex-col p-5 sm:p-6 md:p-10 lg:p-14 pb-20 gap-10">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-6">
        <div className="h-10 sm:h-12 w-48 rounded-xl bg-white/[0.07]" />
        <div className="h-4 w-full max-w-lg rounded bg-white/[0.04]" />
      </div>

      {/* Filter Category Pills */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-white/[0.04] border border-white/[0.05]" />
        ))}
      </div>

      {/* Project Rows Skeleton */}
      <div className="flex flex-col gap-12 sm:gap-16">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex flex-col md:flex-row gap-6 md:gap-10 items-center">
            {/* Left Image */}
            <div className="w-full md:w-3/5 aspect-[16/10] rounded-2xl bg-white/[0.04] border border-white/[0.06] shrink-0" />
            {/* Right Details */}
            <div className="w-full md:w-2/5 flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="h-4 w-12 rounded bg-white/[0.04]" />
                <div className="h-4 w-24 rounded bg-white/[0.06]" />
              </div>
              <div className="h-8 w-3/4 rounded-lg bg-white/[0.07]" />
              <div className="h-4 w-full rounded bg-white/[0.03]" />
              <div className="h-4 w-5/6 rounded bg-white/[0.03]" />
              <div className="flex gap-2 mt-2">
                <div className="h-4 w-16 rounded bg-white/[0.04]" />
                <div className="h-4 w-16 rounded bg-white/[0.04]" />
                <div className="h-4 w-16 rounded bg-white/[0.04]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
