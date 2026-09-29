export function generateStaticParams() { return []; }
import { Suspense } from 'react';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import View from '@/app/dashboard/(protected)/projects/[id]/success/page-view';

export default function Page() {
  return <Suspense fallback={<p role="status">Loading…</p>}><DashboardPage view="projects-detail-success" component={View} /></Suspense>;
}
