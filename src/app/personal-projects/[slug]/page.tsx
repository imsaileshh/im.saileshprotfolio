import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';
import { ProjectDetailTemplate, ProjectDetailData, AdjacentProject } from '@/components/projects/ProjectDetailTemplate';
import { PERSONAL_PROJECT_WHERE_CLAUSE } from '@/lib/constants/project-types';
import { LocalBackgroundOverride } from '@/components/theme/LocalBackgroundOverride';

export const revalidate = 30;

export default async function PersonalProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  // 1. Fetch current personal project (EXCLUSIVELY Personal Projects / Open Source)
  const project = await prisma.project.findFirst({
    where: {
      slug: resolvedParams.slug,
      published: true,
      archived: false,
      ...PERSONAL_PROJECT_WHERE_CLAUSE,
    },
    include: {
      images: { orderBy: { order: 'asc' } },
      caseStudy: {
        include: {
          sections: { orderBy: { order: 'asc' } },
        },
      },
    },
  });

  if (!project) notFound();

  // 2. Fetch all published personal projects to find Previous & Next
  const allPersonal = await prisma.project.findMany({
    where: {
      published: true,
      archived: false,
      ...PERSONAL_PROJECT_WHERE_CLAUSE,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
    },
    orderBy: [{ featured: 'desc' }, { orderIndex: 'asc' }, { createdAt: 'desc' }],
  });

  const currentIndex = allPersonal.findIndex((p) => p.slug === project.slug);
  const prevProject: AdjacentProject | null = currentIndex > 0 ? allPersonal[currentIndex - 1] : null;
  const nextProject: AdjacentProject | null = currentIndex >= 0 && currentIndex < allPersonal.length - 1 ? allPersonal[currentIndex + 1] : null;

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
    projectType: 'Personal Project',
    category: project.category || 'CLI / DEVTOOL',
    year: project.year || project.createdAt.getFullYear().toString(),
    role: project.role || 'Independent Developer & Creator',
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
      backHref="/personal-projects"
      backLabel="Back to Personal Projects"
    />
    </>
  );
}
