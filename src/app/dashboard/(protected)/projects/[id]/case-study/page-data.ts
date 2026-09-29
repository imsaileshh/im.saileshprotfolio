import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';


export async function loadPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const project = await prisma.project.findUnique({
    where: { id: resolvedParams.id },
    include: {
      caseStudy: {
        include: {
          sections: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  });

  if (!project) notFound();
  return { project };
}
