import { Suspense } from 'react';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import View from '@/app/dashboard/(protected)/projects/new/page-view';

export default function Page() {
  return <Suspense fallback={<p role="status">Loading…</p>}><DashboardPage view="projects-new" component={View} /></Suspense>;
}
