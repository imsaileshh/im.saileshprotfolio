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
    include: {
      versions: { orderBy: { versionNumber: 'desc' } },
      analyses: {
        orderBy: { createdAt: 'desc' },
        include: {
          jobDescription: true,
          keywordAnalysis: { orderBy: [{ importance: 'asc' }, { keyword: 'asc' }] },
          suggestions: { orderBy: { createdAt: 'asc' } },
        },
      },
    },
  });

  if (!resume || resume.status === 'Deleted') notFound();
  const latestAnalysis = resume.analyses[0];
  return { id, resume, latestAnalysis };
}
