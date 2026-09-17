export default function Loading() {
  return (
    <div className="min-h-screen py-8 md:py-12 px-5 sm:px-6 md:px-10 max-w-5xl mx-auto flex flex-col pb-24 w-full">
      <div className="w-full animate-pulse flex flex-col gap-8">
        {/* 01. Header Skeleton */}
        <div className="flex flex-col gap-3">
          <div className="h-3 w-28 rounded bg-white/[0.05]" />
          <div className="h-10 sm:h-12 w-80 rounded-xl bg-white/[0.07]" />
          <div className="h-4 w-full max-w-xl rounded bg-white/[0.04]" />
        </div>

        {/* 02. Availability Status Card Skeleton */}
        <div className="h-14 w-full rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
            <div className="h-3.5 w-64 rounded bg-white/[0.06]" />
          </div>
          <div className="hidden sm:block h-3 w-36 rounded bg-white/[0.03]" />
        </div>

        {/* 03. Grid: Left channels, Right form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
          {/* Left Column */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="h-3 w-32 rounded bg-white/[0.04]" />
              <div className="h-7 w-44 rounded-lg bg-white/[0.06]" />
              <div className="h-4 w-full rounded bg-white/[0.03]" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="h-20 rounded-xl bg-white/[0.03] border border-white/[0.05]" />
              <div className="h-20 rounded-xl bg-white/[0.03] border border-white/[0.05]" />
              <div className="h-14 rounded-xl bg-white/[0.03] border border-white/[0.05]" />
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="md:col-span-7">
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6 sm:p-8 flex flex-col gap-5">
              <div className="flex justify-between pb-3 border-b border-white/[0.06]">
                <div className="h-3 w-20 rounded bg-white/[0.06]" />
                <div className="h-3 w-28 rounded bg-white/[0.04]" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-3 w-24 rounded bg-white/[0.04]" />
                <div className="h-10 w-full rounded-lg bg-white/[0.04] border border-white/[0.06]" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-3 w-28 rounded bg-white/[0.04]" />
                <div className="h-10 w-full rounded-lg bg-white/[0.04] border border-white/[0.06]" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-3 w-32 rounded bg-white/[0.04]" />
                <div className="h-28 w-full rounded-lg bg-white/[0.04] border border-white/[0.06]" />
              </div>
              <div className="h-12 w-full rounded-lg bg-white/[0.08]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
