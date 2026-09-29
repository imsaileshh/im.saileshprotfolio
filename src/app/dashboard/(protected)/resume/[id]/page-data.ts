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
      sections: { orderBy: { orderIndex: 'asc' } },
      skills: { orderBy: { name: 'asc' } },
      analyses: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { suggestions: true, keywordAnalysis: true, jobDescription: true },
      },
    },
  });

  if (!resume || resume.status === 'Deleted') notFound();
  const latestAnalysis = resume.analyses[0];
  const activeVersion = resume.versions.find((version) => version.id === resume.activeVersionId) ?? resume.versions[0];
  return { id, resume, latestAnalysis, activeVersion };
}
