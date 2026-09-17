'use client';

import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { VisitorDetailsModal } from './VisitorDetailsModal';

export type VisitorRow = {
  id: string;
  firstSeen: string | Date;
  lastSeen: string | Date;
  referrer: string | null;
  deviceType: string | null;
  browser?: string | null;
  os?: string | null;
  landingPage: string | null;
  visitTime: string | Date;
  sessionDurationSeconds: number;
  resumeViewed: boolean;
  resumeDownloaded: boolean;
};

export function VisitorTable({ visitors }: { visitors: VisitorRow[] }) {
  const [selectedVisitor, setSelectedVisitor] = useState<string | null>(null);
  if (!visitors.length) return <div className="flex h-56 items-center justify-center"><p className="text-sm text-zinc-500">No analytics data available yet.</p></div>;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-[900px] divide-y divide-white/10 text-sm">
          <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-4 py-3">Anonymous visitor</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Landing page</th><th className="px-4 py-3">Device</th><th className="px-4 py-3">Visit time</th><th className="px-4 py-3">Session duration</th><th className="px-4 py-3" /></tr></thead>
          <tbody className="divide-y divide-white/10">{visitors.map((visitor) => <tr key={visitor.id} className="text-zinc-300"><td className="px-4 py-3 font-mono text-xs">{visitor.id.slice(0, 8).toUpperCase()}</td><td className="px-4 py-3">{visitor.referrer ?? 'Direct'}</td><td className="max-w-[180px] truncate px-4 py-3">{visitor.landingPage ?? 'Unknown'}</td><td className="px-4 py-3">{visitor.deviceType ?? 'Unknown'}</td><td className="px-4 py-3">{new Date(visitor.visitTime).toLocaleString()}</td><td className="px-4 py-3">{visitor.sessionDurationSeconds}s</td><td className="px-4 py-3"><button onClick={() => setSelectedVisitor(visitor.id)} className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/10"><UserRound size={14} /> Details</button></td></tr>)}</tbody>
        </table>
      </div>
      <VisitorDetailsModal visitorId={selectedVisitor} onClose={() => setSelectedVisitor(null)} />
    </>
  );
}
