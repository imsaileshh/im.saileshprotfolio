'use client';

import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { decodeDashboardData } from '@/lib/dashboard/transport';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

export function DashboardPage<T extends object>({
  view,
  component: View,
  children,
}: {
  view: string;
  component: ComponentType<T>;
  children?: ReactNode;
}) {
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
    return () => {
      window.removeEventListener('dashboard:refresh', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams(search);
    query.set('_view', view);
    if (params.id) query.set('_id', params.id);

    fetch(`/api/dashboard/page-data?${query}`, { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (response.status === 401) {
          router.replace('/dashboard/login');
          return;
        }
        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? 'This item could not be found.'
              : 'Unable to load this page. Please try again.'
          );
        }
        const data = decodeDashboardData<T>(await response.json());
        if (!controller.signal.aborted) setState({ key, data });
      })
      .catch(error => {
        if (!controller.signal.aborted) setState({ key, error: error.message });
      });

    return () => controller.abort();
  }, [key, view, params.id, search, router]);

  if (state.key !== key) return <DashboardSkeleton />;
  if (state.error) {
    return (
      <div
        role="alert"
        className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-white space-y-4 max-w-lg mx-auto mt-12 text-center"
      >
        <p className="text-sm text-red-200">{state.error}</p>
        <button
          className="rounded-lg bg-[#4F8CFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#3b72e0] transition-colors"
          onClick={() => setRevision(value => value + 1)}
        >
          Retry
        </button>
      </div>
    );
  }
  if (!state.data) return <DashboardSkeleton />;
  return <View {...state.data}>{children}</View>;
}
