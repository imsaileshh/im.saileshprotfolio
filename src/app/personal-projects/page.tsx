import { prisma } from '@/lib/database/prisma';
import { PersonalProjectsShowcase, PersonalProjectItem } from '@/components/personal-projects/PersonalProjectsShowcase';
import { PERSONAL_PROJECT_WHERE_CLAUSE } from '@/lib/constants/project-types';
import { getProjectCoverUrl } from '@/lib/projects/cover-image';
import { getPersonalProjectsCategoriesConfig } from '@/app/dashboard/(protected)/settings/works-category-actions';

export const metadata = {
  title: 'Personal Projects | Sailesh P',
  description: 'Explorations, experiments, open source tools, and side projects built with modern technologies.',
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
      include: { images: { orderBy: { order: 'asc' } } },
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
    category: p.category ?? 'Web Development',
    year: p.year ?? p.createdAt.getFullYear().toString(),
    description: p.description,
    technologies: p.technologies,
    coverUrl: getProjectCoverUrl(p, `/images/projects/project${(idx % 4) + 1}.svg`),
    liveUrl: p.liveUrl,
    githubUrl: p.githubUrl,
  }));

  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 sm:px-6 md:px-10 lg:px-14 py-10 md:py-16">
      <div className="max-w-7xl mx-auto">
        <PersonalProjectsShowcase
          projects={projects}
          categories={categoriesConfig.categories}
          showCategoryBar={categoriesConfig.showCategoryBar}
        />
      </div>
    </main>
  );
}
