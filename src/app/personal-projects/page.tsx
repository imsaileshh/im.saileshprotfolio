import { prisma } from '@/lib/database/prisma';
import { PersonalProjectsShowcase, PersonalProjectItem } from '@/components/personal-projects/PersonalProjectsShowcase';
import { PERSONAL_PROJECT_WHERE_CLAUSE } from '@/lib/constants/project-types';
import { getProjectCoverUrl } from '@/lib/projects/cover-image';
import { getPersonalProjectsCategoriesConfig } from '@/app/dashboard/(protected)/settings/works-category-actions';
import { isCaseStudyAvailable } from '@/lib/projects/case-study-utils';

export const metadata = {
  title: 'Personal Projects | Sailesh P',
  description: 'Independent projects, experiments and digital products created to explore design, development and interaction.',
};

export const revalidate = 30;

export default async function PersonalProjectsPage() {
  const [dbProjects, categoriesConfig] = await Promise.all([
    // Query ONLY personal projects and open source experiments from DB
    prisma.project.findMany({
      where: {
        published: true,
        archived: false,
        ...PERSONAL_PROJECT_WHERE_CLAUSE,
      },
      include: {
        images: { orderBy: { order: 'asc' } },
        caseStudy: {
          select: {
            id: true,
            slug: true,
            status: true,
            coverImage: true,
            sections: { select: { id: true } },
          },
        },
      },
      orderBy: [{ featured: 'desc' }, { orderIndex: 'asc' }, { createdAt: 'desc' }],
    }),
    getPersonalProjectsCategoriesConfig().catch(() => ({
      showCategoryBar: true,
      categories: ['All', 'Case Studies', 'Web Development', 'Tools', 'Experiments', 'UI/UX'],
    })),
  ]);

  const projects: PersonalProjectItem[] = dbProjects.map((p, idx) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category ?? 'Personal Project',
    year: p.year ?? p.createdAt.getFullYear().toString(),
    description: (p.description && !p.description.includes('Invalid url'))
      ? p.description
      : 'Independent project exploring modern design, frontend development, and interactive digital experiences.',
    technologies: p.technologies,
    coverUrl: getProjectCoverUrl(p, `/images/projects/project${(idx % 4) + 1}.svg`),
    liveUrl: p.liveUrl,
    githubUrl: p.githubUrl,
    hasCaseStudy: isCaseStudyAvailable(p.caseStudy),
    caseStudySlug: p.caseStudy?.slug ?? null,
  }));

  return (
    <main
      data-page-version="personal-projects-editorial-v2"
      className="min-h-screen bg-[var(--bg)] px-4 sm:px-6 md:px-10 lg:px-14 py-8 md:py-14 lg:py-16"
    >
      <div className="max-w-[1240px] mx-auto">
        <PersonalProjectsShowcase
          projects={projects}
          categories={categoriesConfig.categories}
          showCategoryBar={categoriesConfig.showCategoryBar}
        />
      </div>
    </main>
  );
}
