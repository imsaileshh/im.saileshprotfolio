'use client';
import { Route } from 'lucide-react';
import { formatShortId } from '@/lib/dashboard/presentation';
import type { loadPage } from './page-data';

export default function DashboardJourneysPage({ query, journeys }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visitor Journeys</h1>
          <p className="text-sm text-zinc-400">Session timelines generated from real analytics events in timestamp order.</p>
        </div>
        <form className="flex flex-wrap gap-2">
          <select name="range" defaultValue={query.range} className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white">
            <option value="today">Today</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="last90">Last 90 Days</option>
          </select>
          <input name="device" placeholder="Device" className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white" />
          <select name="converted" className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white">
            <option value="">All sessions</option>
            <option value="true">Converted</option>
            <option value="false">Non-converted</option>
          </select>
          <button className="h-10 rounded-lg bg-[#4F8CFF] px-4 text-sm font-semibold text-white">Filter</button>
        </form>
      </header>

      {journeys.length ? (
        <section className="space-y-4">
          {journeys.map((session) => (
            <article key={session.id} className="rounded-lg border border-white/10 bg-[#111113] p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-mono text-sm text-white">Session {formatShortId(session.id)}</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Entry {session.entryPage} / Exit {session.exitPage ?? session.dropOffPoint} / Duration {session.durationSeconds}s
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded border border-white/10 px-2 py-1 text-zinc-300">{session.deviceType ?? 'Unknown device'}</span>
                  <span className="rounded border border-white/10 px-2 py-1 text-zinc-300">{session.conversionEvent ?? 'No conversion event'}</span>
                  <span className="rounded border border-white/10 px-2 py-1 text-zinc-300">Drop-off: {session.dropOffPoint}</span>
                </div>
              </div>

              {session.events.length ? (
                <ol className="mt-5 grid gap-3">
                  {session.events.map((event) => (
                    <li key={event.id} className="flex gap-3 rounded border border-white/10 p-3">
                      <Route className="mt-0.5 h-4 w-4 shrink-0 text-[#4F8CFF]" />
                      <div>
                        <p className="text-sm font-medium text-white">{event.pagePath}</p>
                        <p className="mt-1 text-xs text-zinc-500">{event.eventType} / {event.timestamp.toLocaleString()}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-5 text-sm text-zinc-500">No data available.</p>
              )}
            </article>
          ))}
        </section>
      ) : (
        <section className="flex h-64 items-center justify-center rounded-lg border border-white/10 bg-[#111113]">
          <p className="text-sm text-zinc-500">No data available.</p>
        </section>
      )}
    </main>
  );
}
