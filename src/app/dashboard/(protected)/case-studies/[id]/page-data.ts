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

  const caseStudy = await prisma.caseStudy.findUnique({
    where: { id },
    include: {
      sections: { orderBy: { order: 'asc' } },
      project: true,
    },
  });

  if (!caseStudy) {
    notFound();
  }
  return { caseStudy };
}
