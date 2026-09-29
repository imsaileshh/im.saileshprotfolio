import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';


export async function loadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: 'asc' } },
      caseStudy: { include: { sections: { orderBy: { order: 'asc' } } } },
    },
  });

  if (!project) {
    notFound();
  }

  const featuredCount = await prisma.project.count({
    where: {
      projectType: { in: ['Personal Project', 'Open Source'] },
      featured: true,
      archived: false,
      id: { not: id },
    },
  });
  return { project, featuredCount };
}
