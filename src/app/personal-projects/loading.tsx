export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] px-5 sm:px-6 md:px-10 lg:px-16 py-10 md:py-16">
      <div className="max-w-6xl mx-auto w-full animate-pulse flex flex-col gap-10">
        {/* Page Header */}
        <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
          <div className="h-10 sm:h-12 w-64 rounded-2xl bg-white/[0.08]" />
          <div className="h-4 w-80 sm:w-96 rounded bg-white/[0.04]" />
        </div>

        {/* Personal Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[22px] bg-[var(--card)] border border-white/[0.06] p-4 sm:p-5 flex flex-col gap-4 shadow-sm"
            >
              <div className="relative w-full aspect-[16/10] rounded-[16px] bg-white/[0.04] overflow-hidden">
                <div className="absolute top-3 right-3 h-5 w-12 rounded-md bg-white/[0.08]" />
              </div>
              <div className="h-3 w-28 rounded bg-white/[0.05]" />
              <div className="h-6 w-3/4 rounded-lg bg-white/[0.07]" />
              <div className="flex flex-col gap-2">
                <div className="h-3.5 w-full rounded bg-white/[0.03]" />
                <div className="h-3.5 w-4/5 rounded bg-white/[0.03]" />
              </div>
              <div className="flex gap-1.5 mt-1">
                <div className="h-6 w-14 rounded-md bg-white/[0.04]" />
                <div className="h-6 w-16 rounded-md bg-white/[0.04]" />
              </div>
              <div className="pt-3 border-t border-white/[0.05] flex justify-between items-center mt-auto">
                <div className="h-4 w-24 rounded bg-white/[0.05]" />
                <div className="h-4 w-16 rounded bg-white/[0.03]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}