import { Suspense } from 'react';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import View from '@/app/dashboard/(protected)/personal-projects/new/page-view';
export const metadata = {
  title: 'Add Personal Project | CMS Dashboard',
};
export default function Page() {
  return <Suspense fallback={<p role="status">Loading…</p>}><DashboardPage view="personal-projects-new" component={View} /></Suspense>;
}
