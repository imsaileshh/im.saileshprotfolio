export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] px-5 sm:px-6 md:px-10 lg:px-16 py-10 md:py-16">
      <div className="max-w-6xl mx-auto w-full animate-pulse flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="h-10 sm:h-12 w-72 rounded-2xl bg-white/[0.08]" />
          <div className="h-4 w-full max-w-lg rounded bg-white/[0.04]" />
        </div>

        {/* Skill Sections */}
        <div className="flex flex-col gap-10">
          {Array.from({ length: 3 }).map((_, secIdx) => (
            <div key={secIdx} className="flex flex-col gap-5">
              <div className="h-6 w-36 rounded-lg bg-white/[0.06]" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 rounded-2xl bg-[var(--card)] border border-white/[0.05] p-3 flex flex-col items-center justify-center gap-2 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/[0.06]" />
                    <div className="h-3.5 w-16 rounded bg-white/[0.04]" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}