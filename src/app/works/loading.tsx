export default function Loading() {
  return (
    <div className="w-full animate-pulse flex flex-col gap-10 px-5 sm:px-6 md:px-10 lg:px-16 py-14">
      {/* Hero skeleton */}
      <div className="flex flex-col gap-5 max-w-2xl">
        <div className="h-3 w-36 rounded bg-white/[0.05]" />
        <div className="h-14 w-80 rounded-xl bg-white/[0.06]" />
        <div className="h-14 w-64 rounded-xl bg-white/[0.08]" />
        <div className="h-4 w-full max-w-md rounded bg-white/[0.04]" />
        <div className="h-4 w-3/4 max-w-md rounded bg-white/[0.04]" />
        <div className="flex gap-3 mt-2">
          <div className="h-11 w-36 rounded-xl bg-white/[0.07]" />
          <div className="h-11 w-28 rounded-xl bg-white/[0.04]" />
        </div>
      </div>
      {/* Projects row skeleton */}
      <div className="flex flex-col gap-4">
        <div className="h-5 w-32 rounded bg-white/[0.05]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/[0.04] aspect-[4/3]" />
          ))}
        </div>
      </div>
    </div>
  );
}