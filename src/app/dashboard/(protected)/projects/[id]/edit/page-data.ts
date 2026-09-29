import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';


export async function loadPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = await prisma.project.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!project) notFound();
  
  const categories = await prisma.projectTaxonomy.findMany({
    where: { type: 'category' },
    orderBy: { name: 'asc' },
  });
  return { project, categories };
}
