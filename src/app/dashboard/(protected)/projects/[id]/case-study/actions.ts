'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';

export async function revalidateCaseStudyPaths(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { slug: true },
    });

    // Revalidate the admin dashboard pages
    revalidatePath('/dashboard/projects');
    revalidatePath(`/dashboard/projects/${projectId}/case-study`);
    revalidatePath(`/dashboard/projects/${projectId}/edit`);

    // Revalidate the public facing pages so the new content/images show immediately
    revalidatePath('/works');
    revalidatePath('/');
    if (project?.slug) {
      revalidatePath(`/works/${project.slug}`);
    }
  } catch (error) {
    console.error('Failed to revalidate paths:', error);
  }
}
