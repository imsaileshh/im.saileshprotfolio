'use client';

import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { decodeDashboardData } from '@/lib/dashboard/transport';

export function DashboardPage<T extends object>({
  view, component: View, children,
}: { view: string; component: ComponentType<T>; children?: ReactNode }) {
  const params = useParams<{ id?: string }>();
  const search = useSearchParams().toString();
  const router = useRouter();
  const [revision, setRevision] = useState(0);
  const key = `${view}:${params.id ?? ''}:${search}:${revision}`;
  const [state, setState] = useState<{ key: string; data?: T; error?: string }>({ key: '' });
  useEffect(() => {
    const refresh = () => setRevision(value => value + 1);
    window.addEventListener('dashboard:refresh', refresh);
    window.addEventListener('focus', refresh);
    return () => { window.removeEventListener('dashboard:refresh', refresh); window.removeEventListener('focus', refresh); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams(search);
    query.set('_view', view);
    if (params.id) query.set('_id', params.id);
    fetch(`/api/dashboard/page-data?${query}`, { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (response.status === 401) { router.replace('/dashboard/login'); return; }
        if (!response.ok) throw new Error(response.status === 404 ? 'This item could not be found.' : 'Unable to load this page. Please try again.');
        const data = decodeDashboardData<T>(await response.json());
        if (!controller.signal.aborted) setState({ key, data });
      })
      .catch(error => { if (!controller.signal.aborted) setState({ key, error: error.message }); });
    return () => controller.abort();
  }, [key, view, params.id, search, router]);
  if (state.key !== key) return <p role="status" className="text-sm text-zinc-400">Loading…</p>;
  if (state.error) return <div role="alert" className="space-y-3 text-sm text-zinc-400"><p>{state.error}</p><button className="rounded-lg bg-[#4F8CFF] px-4 py-2 text-white" onClick={() => setRevision(value => value + 1)}>Retry</button></div>;
  if (!state.data) return null;
  return <View {...state.data}>{children}</View>;
}
