export default function Loading() {
  return (
    <div className="w-full animate-pulse px-5 sm:px-6 md:px-10 lg:px-16 py-12 flex flex-col gap-6">
      <div className="h-8 w-48 rounded-lg bg-white/[0.06]" />
      <div className="h-4 w-72 rounded-lg bg-white/[0.04]" />
      <div className="flex flex-col gap-4 mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white/[0.04] h-24" />
        ))}
      </div>
    </div>
  );
}