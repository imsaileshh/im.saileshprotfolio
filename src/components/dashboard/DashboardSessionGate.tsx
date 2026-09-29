'use client';

import { type ReactNode } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardMobileNav } from '@/components/dashboard/DashboardMobileNav';
import { DashboardAuthProvider, useDashboardAuth } from '@/components/dashboard/DashboardAuthProvider';

function DashboardShell({ children }: { children: ReactNode }) {
  const { user } = useDashboardAuth();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white md:h-screen md:flex-row md:overflow-hidden">
      <div className="hidden shrink-0 md:flex h-full">
        <Sidebar user={user} />
      </div>
      <DashboardMobileNav />
      <main className="min-w-0 flex-1 h-full overflow-y-auto p-4 sm:p-6 md:p-8 overscroll-y-contain no-scrollbar">
        {children}
      </main>
    </div>
  );
}

// This gates the UI only. Every private read and mutation is authorized again
// on the server, before the dashboard API invokes a loader or operation.
export function DashboardSessionGate({ children }: { children: ReactNode }) {
  return (
    <DashboardAuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardAuthProvider>
  );
}
