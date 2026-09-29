import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { getLiveVisitors } from '@/lib/dashboard/data';


export async function loadPage(_props: DashboardPageInput) {
  const live = await getLiveVisitors();
  return { live };
}
