'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatShortId, conversionEventTypes } from '@/lib/dashboard/presentation';
import type { loadPage } from './page-data';

export default function DashboardVisitorDetailPage({ id, visitor, overview }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6">
      <header>
        <Link href="/dashboard/visitors" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft size={16} /> Back to visitors</Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight flex items-center gap-2">
          <span>{visitor.referralName ? visitor.referralName : `Anonymous Visitor ${formatShortId(visitor.id)}`}</span>
          {visitor.referralName && <span className="text-xs font-mono font-normal text-zinc-500">({formatShortId(visitor.id)})</span>}
        </h1>
        <p className="text-sm text-zinc-400">Real activity timeline from stored analytics events.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Total Sessions', overview.sessions],
          ['Total Page Views', overview.pageViews],
          ['Total Events', overview.events],
          ['Conversions', overview.conversions],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-white/10 bg-[#111113] p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-white/10 bg-[#111113] p-5">
        <h2 className="text-base font-semibold text-white">Session History</h2>
        {visitor.visitorSessions.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="py-3 pr-4">Session ID</th>
                  <th className="py-3 pr-4">Platform</th>
                  <th className="py-3 pr-4">Referral / Profile</th>
                  <th className="py-3 pr-4">Started At</th>
                  <th className="py-3 pr-4">Last Seen</th>
                  <th className="py-3 pr-4">Duration</th>
                  <th className="py-3 pr-4">Device</th>
                  <th className="py-3 pr-4">Browser</th>
                  <th className="py-3 pr-4">Entry Page</th>
                  <th className="py-3 pr-4">Exit Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visitor.visitorSessions.map((session) => (
                  <tr key={session.id} className="text-zinc-300">
                    <td className="py-3 pr-4 font-mono text-xs">{formatShortId(session.id)}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border border-white/10 bg-white/[0.04] text-zinc-200">
                        {session.platform || visitor.platform || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-zinc-400">
                      {session.referralName || visitor.referralName || (session.referralCode ? `@${session.referralCode}` : 'None')}
                    </td>
                    <td className="py-3 pr-4">{session.startedAt.toLocaleString()}</td>
                    <td className="py-3 pr-4">{session.lastSeenAt.toLocaleString()}</td>
                    <td className="py-3 pr-4">{Math.max(0, Math.round((session.lastSeenAt.getTime() - session.startedAt.getTime()) / 1000))}s</td>
                    <td className="py-3 pr-4">{session.deviceType ?? 'Unknown'}</td>
                    <td className="py-3 pr-4">{session.browser ?? 'Unknown'}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{session.entryPage}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{session.exitPage ?? 'Unknown'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="mt-4 text-sm text-zinc-500">No data available.</p>}
      </section>

      <section className="rounded-lg border border-white/10 bg-[#111113] p-5">
        <h2 className="text-base font-semibold text-white">Visitor Journey</h2>
        {visitor.events.length ? (
          <ol className="mt-5 space-y-4">
            {visitor.events.map((event) => (
              <li key={event.id} className="flex gap-3">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${conversionEventTypes.includes(event.eventType as (typeof conversionEventTypes)[number]) ? 'bg-emerald-400' : 'bg-[#4F8CFF]'}`} />
                <div>
                  <p className="text-sm font-medium text-white">{event.pagePath}</p>
                  <p className="text-xs text-zinc-500">{event.eventType} at {event.timestamp.toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : <p className="mt-4 text-sm text-zinc-500">No data available.</p>}
      </section>
    </main>
  );
}
