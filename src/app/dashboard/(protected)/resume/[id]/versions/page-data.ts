import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';
type PageProps = {
  params: Promise<{ id: string }>;
};

export async function loadPage({ params }: PageProps) {
  const { id } = await params;
  const resume = await prisma.resume.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: 'desc' } } },
  });

  if (!resume || resume.status === 'Deleted') notFound();
  return { id, resume };
}
