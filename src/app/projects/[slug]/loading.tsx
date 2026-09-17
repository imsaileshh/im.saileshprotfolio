export default function Loading() {
  return (
    <div className="w-full animate-pulse px-5 sm:px-6 md:px-10 lg:px-16 py-12 flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="h-8 w-32 rounded-full bg-white/[0.05]" />
      <div className="flex flex-col gap-3">
        <div className="h-4 w-24 rounded bg-white/[0.04]" />
        <div className="h-10 sm:h-12 w-80 rounded-xl bg-white/[0.07]" />
      </div>
      <div className="w-full aspect-[16/10] rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
      <div className="flex flex-col gap-3">
        <div className="h-4 w-full rounded bg-white/[0.04]" />
        <div className="h-4 w-3/4 rounded bg-white/[0.04]" />
      </div>
    </div>
  );
}
