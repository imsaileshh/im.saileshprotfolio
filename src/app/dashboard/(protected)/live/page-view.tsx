'use client';
import { Activity } from 'lucide-react';
import { formatShortId } from '@/lib/dashboard/presentation';
import type { loadPage } from './page-data';

export default function DashboardLivePage({ live }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Live Visitors Monitor</h1>
        <p className="text-sm text-zinc-400">
          Active sessions are real sessions where lastSeenAt is within the last {live.timeout} minutes.
        </p>
      </header>

      <section className="rounded-lg border border-white/10 bg-[#111113] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Active visitor count</p>
            <p className="mt-2 text-3xl font-semibold text-white">{live.sessions.length}</p>
          </div>
          <Activity className="h-8 w-8 text-[#4F8CFF]" />
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-[#111113]">
        {live.sessions.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Current page</th>
                  <th className="px-4 py-3">Device type</th>
                  <th className="px-4 py-3">Session started</th>
                  <th className="px-4 py-3">Last activity</th>
                  <th className="px-4 py-3">Referrer/source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {live.sessions.map((session) => (
                  <tr key={session.id} className="text-zinc-300">
                    <td className="px-4 py-3 font-mono text-xs">{formatShortId(session.id)}</td>
                    <td className="px-4 py-3">{session.exitPage ?? session.entryPage}</td>
                    <td className="px-4 py-3">{session.deviceType ?? 'Unknown'}</td>
                    <td className="px-4 py-3">{session.startedAt.toLocaleString()}</td>
                    <td className="px-4 py-3">{session.lastSeenAt.toLocaleString()}</td>
                    <td className="px-4 py-3">{session.referrer ?? session.visitor.source ?? 'Direct'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex h-56 items-center justify-center">
            <p className="text-sm text-zinc-500">No active visitors right now.</p>
          </div>
        )}
      </section>
    </main>
  );
}
