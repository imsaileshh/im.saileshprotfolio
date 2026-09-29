import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { prisma } from '@/lib/database/prisma';
import { notFound } from 'next/navigation';


export async function loadPage({ params }: { params: any }) {
  const resolvedParams = await params;
  const project = await prisma.project.findUnique({
    where: { id: resolvedParams.id },
    select: { title: true, published: true, archived: true, id: true }
  });
  
  if (!project) notFound();
  return { project };
}
