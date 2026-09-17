export default function Loading() {
  return (
    <div className="w-full animate-pulse p-6 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 rounded-xl bg-white/[0.07]" />
          <div className="h-4 w-72 rounded bg-white/[0.04]" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 rounded-xl bg-white/[0.05]" />
          <div className="h-10 w-32 rounded-xl bg-white/[0.08]" />
        </div>
      </div>

      {/* 4 Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-white/[0.04]" />
              <div className="w-8 h-8 rounded-lg bg-white/[0.05]" />
            </div>
            <div className="h-7 w-28 rounded-lg bg-white/[0.08]" />
            <div className="h-3 w-36 rounded bg-white/[0.03]" />
          </div>
        ))}
      </div>

      {/* Main Data Table / Content Card */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="h-5 w-36 rounded bg-white/[0.06]" />
          <div className="h-8 w-24 rounded-lg bg-white/[0.04]" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05]" />
                <div className="h-4 w-36 rounded bg-white/[0.05]" />
              </div>
              <div className="h-4 w-20 rounded bg-white/[0.04]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
