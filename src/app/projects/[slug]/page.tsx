import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';
import { WORK_WHERE_CLAUSE, PERSONAL_PROJECT_WHERE_CLAUSE } from '@/lib/constants/project-types';

export const revalidate = 60;

export async function generateStaticParams() {
  const projects = await prisma.project.findMany({
    where: {
      published: true,
      archived: false,
    },
    select: { slug: true },
  }).catch(() => []);

  return projects.map((p) => ({ slug: p.slug }));
}

/**
 * /projects/[slug] — Legacy route that redirects to the correct canonical URL.
 *
 * - If the slug belongs to a WORK  →  redirect to /works/[slug]
 * - If the slug belongs to a PERSONAL_PROJECT  →  redirect to /personal-projects/[slug]
 * - Anything else  →  404
 */
export default async function ProjectDetailRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Check if it is a Work first
  const asWork = await prisma.project.findFirst({
    where: {
      slug,
      published: true,
      archived: false,
      ...WORK_WHERE_CLAUSE,
    },
    select: { id: true },
  });

  if (asWork) {
    redirect(`/works/${slug}`);
  }

  // Check if it is a Personal Project
  const asPersonal = await prisma.project.findFirst({
    where: {
      slug,
      published: true,
      archived: false,
      ...PERSONAL_PROJECT_WHERE_CLAUSE,
    },
    select: { id: true },
  });

  if (asPersonal) {
    redirect(`/personal-projects/${slug}`);
  }

  notFound();
}
