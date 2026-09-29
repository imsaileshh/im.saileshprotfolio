import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { notFound } from 'next/navigation';
import { getMessageDetail } from '@/lib/dashboard/data';
type PageProps = {
  params: Promise<{ id: string }>;
};

export async function loadPage({ params }: PageProps) {
  const { id } = await params;
  let detail: Awaited<ReturnType<typeof getMessageDetail>>;

  try {
    detail = await getMessageDetail(id);
  } catch {
    notFound();
  }

  const { message, previous, next } = detail;
  return { id, message, previous, next };
}
