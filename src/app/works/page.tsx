import { prisma } from '@/lib/database/prisma';
import { WorksShowcase, WorkItem } from '@/components/works/WorksShowcase';
import { WORK_WHERE_CLAUSE } from '@/lib/constants/project-types';

export const metadata = {
  title: 'Works | Sailesh P — Portfolio',
  description: 'Selected client works, commercial websites, web apps, and product design builds.',
};

export const revalidate = 30;

export default async function WorksPage() {
  const dbWorks = await prisma.project.findMany({
    where: {
      published: true,
      archived: false,
      ...WORK_WHERE_CLAUSE,
    },
    include: {
      images: { orderBy: { order: 'asc' } },
      caseStudy: true,
    },
    orderBy: [{ featured: 'desc' }, { orderIndex: 'asc' }],
  });

  const formattedWorks: WorkItem[] = dbWorks.map((work, idx) => ({
    id: work.id,
    title: work.title,
    slug: work.slug,
    description: work.description,
    category: work.category ?? 'Website Project',
    year: work.year ?? work.createdAt.getFullYear().toString(),
    coverUrl: work.images.find((image) => image.isCover)?.url ?? work.images[0]?.url ?? work.coverImageUrl ?? `/images/projects/project${(idx % 4) + 1}.svg`,
    technologies: work.technologies,
    liveUrl: work.liveUrl,
    hasCaseStudy: Boolean(work.caseStudy && work.caseStudy.status === 'PUBLISHED'),
  }));

  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 sm:px-6 md:px-10 lg:px-16 py-10 md:py-16">
      <div className="max-w-6xl mx-auto">
        <WorksShowcase works={formattedWorks} />
      </div>
    </main>
  );
}
