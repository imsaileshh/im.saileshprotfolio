'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

type VisitorDetailsModalProps = {
  visitorId: string | null;
  onClose: () => void;
};

type VisitorDetails = {
  visitor: {
    id: string;
    referrer: string | null;
    deviceType: string | null;
    browser: string | null;
    os: string | null;
    visitorSessions: Array<{
      id: string;
      startedAt: string;
      lastSeenAt: string;
      entryPage: string;
      exitPage: string | null;
    }>;
    events: Array<{ id: string; eventType: string; pagePath: string; timestamp: string }>;
  };
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function VisitorDetailsModal({ visitorId, onClose }: VisitorDetailsModalProps) {
  const [data, setData] = useState<VisitorDetails | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!visitorId) return;
    setData(null);
    setError(false);
    void fetch(`/api/dashboard/visitors/${visitorId}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Failed'))))
      .then(setData)
      .catch(() => setError(true));
  }, [visitorId]);

  if (!visitorId) return null;

  const latestSession = data?.visitor.visitorSessions[0];
  const duration = latestSession
    ? Math.max(0, Math.round((new Date(latestSession.lastSeenAt).getTime() - new Date(latestSession.startedAt).getTime()) / 1000))
    : 0;
  const resumeViewed = data?.visitor.events.some((event) => event.eventType === 'resume_view');
  const resumeDownloaded = data?.visitor.events.some((event) => event.eventType === 'resume_download');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Visitor details">
      <button aria-label="Close visitor details" className="absolute inset-0 cursor-default" onClick={onClose} />
      <section className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-white/10 bg-[#111113] p-5 text-white shadow-2xl sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">Anonymous session profile</p>
            <h2 className="mt-1 font-mono text-lg">{visitorId.slice(0, 8).toUpperCase()}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white"><X size={18} /></button>
        </div>

        {error ? <p className="mt-8 text-sm text-red-300">Unable to load visitor details.</p> : !data ? <p className="mt-8 text-sm text-zinc-500">Loading visitor details…</p> : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Source', data.visitor.referrer ?? 'Direct'],
                ['Device', data.visitor.deviceType ?? 'Unknown'],
                ['Browser', data.visitor.browser ?? 'Unknown'],
                ['OS', data.visitor.os ?? 'Unknown'],
                ['Landing page', latestSession?.entryPage ?? 'Unknown'],
                ['Duration', `${duration}s`],
                ['Resume viewed', resumeViewed ? 'Yes' : 'No'],
                ['Resume downloaded', resumeDownloaded ? 'Yes' : 'No'],
              ].map(([label, value]) => <div key={label} className="rounded-lg border border-white/10 bg-black/20 p-3"><p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-1 truncate text-sm text-zinc-200">{value}</p></div>)}
            </div>
            <p className="mt-5 text-xs text-zinc-500">Latest activity: {latestSession ? formatDate(latestSession.lastSeenAt) : 'No session data'}</p>
            <div className="mt-6">
              <h3 className="text-sm font-semibold">Pages and interactions</h3>
              {data.visitor.events.length ? <ol className="mt-3 space-y-2">{data.visitor.events.slice(-20).reverse().map((event) => <li key={event.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2 text-xs"><span className="truncate text-zinc-300">{event.pagePath}</span><span className="shrink-0 text-zinc-500">{event.eventType} · {formatDate(event.timestamp)}</span></li>)}</ol> : <p className="mt-3 text-sm text-zinc-500">No analytics data available yet.</p>}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
