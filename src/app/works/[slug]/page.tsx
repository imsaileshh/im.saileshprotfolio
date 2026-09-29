import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';
import { ProjectDetailTemplate, ProjectDetailData, AdjacentProject } from '@/components/projects/ProjectDetailTemplate';
import { WORK_WHERE_CLAUSE } from '@/lib/constants/project-types';
import { LocalBackgroundOverride } from '@/components/theme/LocalBackgroundOverride';
import { getProjectCoverUrl } from '@/lib/projects/cover-image';
import { resolveImageUrl } from '@/lib/media/resolve-image-url';

export const revalidate = 30;

export async function generateStaticParams() {
  const works = await prisma.project.findMany({
    where: {
      published: true,
      archived: false,
      ...WORK_WHERE_CLAUSE,
    },
    select: { slug: true },
  }).catch(() => []);

  return works.map((w) => ({ slug: w.slug }));
}

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
      caseStudy: {
        include: {
          sections: { orderBy: { order: 'asc' } },
        },
      },
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

  const coverUrl = getProjectCoverUrl(project);
  const rawGallery = project.galleryImages && project.galleryImages.length > 0
    ? project.galleryImages
    : project.images.filter((img) => !img.isCover).map((img) => img.url);
  const galleryUrls = (rawGallery || []).map((url) => resolveImageUrl(url) || url).filter(Boolean);

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
    caseStudy: project.caseStudy ? {
      id: project.caseStudy.id,
      title: project.caseStudy.title,
      slug: project.caseStudy.slug,
      description: project.caseStudy.description,
      coverImage: project.caseStudy.coverImage,
      status: project.caseStudy.status,
      metadata: project.caseStudy.metadata,
      sections: project.caseStudy.sections?.map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        order: s.order,
        content: s.content,
        images: (s.images || []).map((img) => resolveImageUrl(img) || img),
        metadata: s.metadata,
      })) || [],
    } : null,
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
