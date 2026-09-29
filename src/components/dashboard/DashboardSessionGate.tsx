'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardMobileNav } from '@/components/dashboard/DashboardMobileNav';

type User = { id: string; name: string | null; email: string; role: string };

// This gates the UI only. Every private read and mutation is authorized again
// on the server, before the dashboard API invokes a loader or operation.
export function DashboardSessionGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/auth/session', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (response.status === 401) { router.replace('/dashboard/login'); return; }
        if (!response.ok) throw new Error('Unable to verify your session.');
        const result = await response.json();
        if (result.user?.role !== 'ADMIN') throw new Error('Unauthorized Access');
        if (!controller.signal.aborted) setUser(result.user);
      })
      .catch(reason => { if (!controller.signal.aborted) setError(reason.message); });
    return () => controller.abort();
  }, [router, attempt]);
  if (!user) return <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white"><div role={error ? 'alert' : 'status'}>{error || 'Loading dashboard…'}{error && <button className="ml-4 underline" onClick={() => { setError(''); setAttempt(value => value + 1); }}>Retry</button>}</div></div>;
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white md:h-screen md:flex-row md:overflow-hidden">
      <div className="hidden shrink-0 md:flex h-full"><Sidebar user={user} /></div>
      <DashboardMobileNav />
      <main className="min-w-0 flex-1 h-full overflow-y-auto p-4 sm:p-6 md:p-8 overscroll-y-contain no-scrollbar">{children}</main>
    </div>
  );
}
