export default function Loading() {
  return (
    <div className="w-full animate-pulse flex flex-col p-5 sm:p-6 md:p-10 lg:p-14 pb-16 max-w-6xl mx-auto gap-12 sm:gap-16">
      {/* 01. Header Skeleton */}
      <div className="flex flex-col gap-4">
        <div className="h-3 w-28 rounded bg-white/[0.05]" />
        <div className="h-10 sm:h-12 w-3/4 max-w-xl rounded-xl bg-white/[0.07]" />
        <div className="h-4 w-full max-w-2xl rounded bg-white/[0.04]" />
        <div className="h-4 w-2/3 max-w-lg rounded bg-white/[0.04]" />
      </div>

      {/* 02. About Hero Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left portrait placeholder */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="w-full max-w-[300px] aspect-[4/5] rounded-2xl bg-white/[0.05] border border-white/[0.06]" />
        </div>
        {/* Right bio text skeleton */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="h-6 w-48 rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-full rounded bg-white/[0.04]" />
          <div className="h-4 w-full rounded bg-white/[0.04]" />
          <div className="h-4 w-5/6 rounded bg-white/[0.04]" />
          <div className="h-4 w-3/4 rounded bg-white/[0.04]" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white/[0.04] border border-white/[0.05] p-3 flex flex-col justify-center gap-2">
                <div className="h-5 w-12 rounded bg-white/[0.06]" />
                <div className="h-3 w-20 rounded bg-white/[0.03]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 03. Capabilities Grid Skeleton */}
      <div className="flex flex-col gap-6">
        <div className="h-6 w-40 rounded-lg bg-white/[0.06]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-6 flex flex-col gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06]" />
              <div className="h-5 w-40 rounded bg-white/[0.06]" />
              <div className="h-3.5 w-full rounded bg-white/[0.03]" />
              <div className="h-3.5 w-4/5 rounded bg-white/[0.03]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
