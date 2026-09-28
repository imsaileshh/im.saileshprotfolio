'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';

export async function revalidateCaseStudyPaths(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { slug: true, caseStudy: { select: { slug: true } } },
    });

    // Revalidate the admin dashboard pages
    revalidatePath('/dashboard/projects');
    revalidatePath(`/dashboard/projects/${projectId}/case-study`);
    revalidatePath(`/dashboard/projects/${projectId}/edit`);

    // Revalidate public routes immediately
    revalidatePath('/works');
    revalidatePath('/case-studies');
    revalidatePath('/');
    if (project?.slug) {
      revalidatePath(`/works/${project.slug}`);
      revalidatePath(`/projects/${project.slug}`);
    }
    if (project?.caseStudy?.slug) {
      revalidatePath(`/case-studies/${project.caseStudy.slug}`);
    }
  } catch (error) {
    console.error('Failed to revalidate paths:', error);
  }
}
