'use client';

import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { VisitorDetailsModal } from './VisitorDetailsModal';

export type VisitorRow = {
  id: string;
  visitor: string;
  platform: string;
  source: string;
  firstSeen: string | Date;
  lastSeen: string | Date;
  referrer: string | null;
  referralCode?: string | null;
  referralName?: string | null;
  referralSource?: string | null;
  deviceType: string | null;
  browser?: string | null;
  os?: string | null;
  landingPage: string | null;
  visitTime: string | Date;
  sessionDurationSeconds: number;
  resumeViewed: boolean;
  resumeDownloaded: boolean;
  sessions?: number;
  pages?: number;
  interactions?: number;
  conversions?: number;
};

function getPlatformBadgeClass(platform: string) {
  switch (platform) {
    case 'LinkedIn':
      return 'bg-[#0A66C2]/15 text-[#70B5F9] border-[#0A66C2]/30';
    case 'Behance':
      return 'bg-[#0057FF]/15 text-[#5993FF] border-[#0057FF]/30';
    case 'Dribbble':
      return 'bg-[#EA4C89]/15 text-[#FF7CAE] border-[#EA4C89]/30';
    case 'GitHub':
      return 'bg-white/10 text-zinc-200 border-white/15';
    case 'Instagram':
      return 'bg-[#E4405F]/15 text-[#FF708F] border-[#E4405F]/30';
    case 'Facebook':
      return 'bg-[#1877F2]/15 text-[#63A4FF] border-[#1877F2]/30';
    case 'X / Twitter':
      return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    case 'YouTube':
      return 'bg-[#FF0000]/15 text-[#FF6666] border-[#FF0000]/30';
    case 'WhatsApp':
      return 'bg-[#25D366]/15 text-[#5EF496] border-[#25D366]/30';
    case 'Google':
      return 'bg-[#4285F4]/15 text-[#8AB4F8] border-[#4285F4]/30';
    case 'Bing':
      return 'bg-[#008373]/15 text-[#47D7C4] border-[#008373]/30';
    case 'Direct':
      return 'bg-white/[0.03] text-zinc-400 border-white/10';
    default:
      return 'bg-white/[0.04] text-zinc-300 border-white/10';
  }
}

export function VisitorTable({ visitors }: { visitors: VisitorRow[] }) {
  const [selectedVisitor, setSelectedVisitor] = useState<string | null>(null);
  if (!visitors.length) {
    return (
      <div className="flex h-56 items-center justify-center">
        <p className="text-sm text-zinc-500">No visitor data yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-[1000px] divide-y divide-white/10 text-sm">
          <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Visitor</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Landing page</th>
              <th className="px-4 py-3">Device</th>
              <th className="px-4 py-3">Browser</th>
              <th className="px-4 py-3">Visit time</th>
              <th className="px-4 py-3">Session duration</th>
              <th className="px-4 py-3 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {visitors.map((visitor) => {
              const isAttributed = visitor.visitor && visitor.visitor !== 'Anonymous';
              return (
                <tr key={visitor.id} className="text-zinc-300 transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    {isAttributed ? (
                      <div className="flex items-center gap-1.5 font-medium text-[#4F8CFF]">
                        <span>{visitor.visitor}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-400 font-normal">Anonymous</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border ${getPlatformBadgeClass(
                        visitor.platform
                      )}`}
                    >
                      {visitor.platform || 'Unknown'}
                    </span>
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-zinc-300">
                    {visitor.source || visitor.referrer || 'Direct'}
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-3 font-mono text-xs text-zinc-400">
                    {visitor.landingPage || '/'}
                  </td>
                  <td className="px-4 py-3">{visitor.deviceType || 'Unknown'}</td>
                  <td className="px-4 py-3">{visitor.browser || 'Unknown'}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {new Date(visitor.visitTime).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                    {visitor.sessionDurationSeconds}s
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedVisitor(visitor.id)}
                      className="inline-flex items-center gap-1.5 rounded border border-white/10 px-2.5 py-1 text-xs text-white transition-colors hover:bg-white/10 cursor-pointer"
                    >
                      <UserRound size={13} /> Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <VisitorDetailsModal visitorId={selectedVisitor} onClose={() => setSelectedVisitor(null)} />
    </>
  );
}
