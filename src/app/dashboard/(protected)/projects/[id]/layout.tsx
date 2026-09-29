import { Suspense } from 'react';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import View from '@/app/dashboard/(protected)/projects/[id]/layout-view';

export default function Page({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<p role="status">Loading…</p>}><DashboardPage view="projects-detail-layout" component={View}>{children}</DashboardPage></Suspense>;
}
