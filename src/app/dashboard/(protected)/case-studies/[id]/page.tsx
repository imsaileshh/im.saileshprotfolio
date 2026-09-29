export function generateStaticParams() { return []; }
import { Suspense } from 'react';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import View from '@/app/dashboard/(protected)/case-studies/[id]/page-view';
export const metadata = {
  title: 'Edit Case Study | CMS Dashboard',
};
export default function Page() {
  return <Suspense fallback={<p role="status">Loading…</p>}><DashboardPage view="case-studies-detail" component={View} /></Suspense>;
}
