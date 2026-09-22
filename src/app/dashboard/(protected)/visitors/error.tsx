'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardVisitorsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured error in /dashboard/visitors boundary:', error);
  }, [error]);

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Visitor Analytics</h1>
        <p className="text-sm text-zinc-400">Privacy-conscious anonymous visitor activity from real sessions.</p>
      </header>

      <section className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-white/10 bg-[#111113] p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-white">Unable to load visitor data right now.</h2>
        <p className="mt-1 text-sm text-zinc-400">There was an issue retrieving visitor analytics. Please try reloading or check back shortly.</p>
        <button
          onClick={() => reset()}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#4F8CFF] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </section>
    </main>
  );
}
