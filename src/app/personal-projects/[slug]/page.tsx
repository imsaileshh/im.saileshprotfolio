import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';
import { ProjectDetailTemplate, ProjectDetailData, AdjacentProject } from '@/components/projects/ProjectDetailTemplate';
import { PERSONAL_PROJECT_WHERE_CLAUSE } from '@/lib/constants/project-types';
import { LocalBackgroundOverride } from '@/components/theme/LocalBackgroundOverride';
import { getProjectCoverUrl } from '@/lib/projects/cover-image';

export const revalidate = 30;

export async function generateStaticParams() {
  const projects = await prisma.project.findMany({
    where: {
      published: true,
      archived: false,
      ...PERSONAL_PROJECT_WHERE_CLAUSE,
    },
    select: { slug: true, caseStudy: { select: { slug: true } } },
  }).catch(() => []);

  const params: { slug: string }[] = [];
  for (const p of projects) {
    if (p.slug) params.push({ slug: p.slug });
    if (p.caseStudy?.slug && p.caseStudy.slug !== p.slug) {
      params.push({ slug: p.caseStudy.slug });
    }
  }
  return params;
}

export default async function PersonalProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  // 1. Fetch current personal project (EXCLUSIVELY Personal Projects / Open Source)
  // Support finding by project slug OR by associated case study slug
  const project = await prisma.project.findFirst({
    where: {
      OR: [
        { slug: resolvedParams.slug },
        { caseStudy: { slug: resolvedParams.slug } },
      ],
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

  // Robustly resolve Case Study: if not loaded on the relation, check by projectId or slug
  let caseStudyRecord = project.caseStudy;
  if (!caseStudyRecord) {
    caseStudyRecord = await prisma.caseStudy.findFirst({
      where: {
        OR: [
          { projectId: project.id },
          { slug: resolvedParams.slug },
          { slug: project.slug },
          { slug: `${project.slug}-case-study` },
        ],
      },
      include: {
        sections: { orderBy: { order: 'asc' } },
      },
    });
  }

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

  const coverUrl = getProjectCoverUrl(project);
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
    caseStudy: caseStudyRecord ? {
      id: caseStudyRecord.id,
      title: caseStudyRecord.title,
      slug: caseStudyRecord.slug,
      description: caseStudyRecord.description,
      coverImage: caseStudyRecord.coverImage,
      status: caseStudyRecord.status,
      metadata: caseStudyRecord.metadata,
      sections: caseStudyRecord.sections?.map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        order: s.order,
        content: s.content,
        images: s.images,
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
      backHref="/personal-projects"
      backLabel="Back to Personal Projects"
    />
    </>
  );
}
