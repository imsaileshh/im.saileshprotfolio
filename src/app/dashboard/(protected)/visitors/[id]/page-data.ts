import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { getVisitorDetail } from '@/lib/dashboard/data';
type PageProps = {
  params: Promise<{ id: string }>;
};

export async function loadPage({ params }: PageProps) {
  const { id } = await params;
  const { visitor, overview } = await getVisitorDetail(id);
  return { id, visitor, overview };
}
