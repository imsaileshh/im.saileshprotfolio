import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';
import { ProjectDetailTemplate, ProjectDetailData, AdjacentProject } from '@/components/projects/ProjectDetailTemplate';
import { WORK_WHERE_CLAUSE } from '@/lib/constants/project-types';
import { LocalBackgroundOverride } from '@/components/theme/LocalBackgroundOverride';

export const revalidate = 30;

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  // 1. Fetch current work project (EXCLUDING Personal Projects)
  const project = await prisma.project.findFirst({
    where: {
      slug: resolvedParams.slug,
      published: true,
      archived: false,
      ...WORK_WHERE_CLAUSE,
    },
    include: {
      images: { orderBy: { order: 'asc' } },
      caseStudy: true,
    },
  });

  if (!project) notFound();

  // 2. Fetch all published works to find Previous & Next
  const allWorks = await prisma.project.findMany({
    where: {
      published: true,
      archived: false,
      ...WORK_WHERE_CLAUSE,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
    },
    orderBy: [{ featured: 'desc' }, { orderIndex: 'asc' }, { createdAt: 'desc' }],
  });

  const currentIndex = allWorks.findIndex((p) => p.slug === project.slug);
  const prevProject: AdjacentProject | null = currentIndex > 0 ? allWorks[currentIndex - 1] : null;
  const nextProject: AdjacentProject | null = currentIndex >= 0 && currentIndex < allWorks.length - 1 ? allWorks[currentIndex + 1] : null;

  const coverUrl = project.images.find((img) => img.isCover)?.url || project.images[0]?.url || project.coverImageUrl || '/images/projects/project1.svg';
  const galleryUrls = project.galleryImages && project.galleryImages.length > 0
    ? project.galleryImages
    : project.images.filter((img) => !img.isCover).map((img) => img.url);

  const formattedData: ProjectDetailData = {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    longText: project.longText,
    projectType: 'Client Work',
    category: project.category || 'SELECTED WORK',
    year: project.year || project.createdAt.getFullYear().toString(),
    role: project.role || 'Lead Product Designer & Developer',
    client: project.client,
    technologies: project.technologies,
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
    coverUrl: coverUrl,
    galleryUrls: galleryUrls,
    caseStudy: project.caseStudy ? { slug: project.caseStudy.slug, status: project.caseStudy.status } : null,
    customGlowColor: project.useCustomBackground ? project.customBackground : null,
  };

  return (
    <>
      <ProjectDetailTemplate
        project={formattedData}
        prevProject={prevProject}
        nextProject={nextProject}
        backHref="/works"
        backLabel="Back to Works"
      />
    </>
  );
}
