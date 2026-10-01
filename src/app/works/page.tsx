import { prisma } from '@/lib/database/prisma';
import { WorksShowcase, WorkItem } from '@/components/works/WorksShowcase';
import { WORK_WHERE_CLAUSE } from '@/lib/constants/project-types';
import { getProjectCoverUrl } from '@/lib/projects/cover-image';
import { isCaseStudyAvailable } from '@/lib/projects/case-study-utils';

export const metadata = {
  title: 'Works | Sailesh P — Portfolio',
  description: 'Selected client works, commercial websites, web apps, and product design builds.',
};

export const revalidate = 30;

export default async function WorksPage() {
  const [dbWorks, settings, taxonomies] = await Promise.all([
    prisma.project.findMany({
      where: {
        published: true,
        archived: false,
        ...WORK_WHERE_CLAUSE,
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
      orderBy: [{ featured: 'desc' }, { orderIndex: 'asc' }],
    }),
    prisma.siteSettings.findUnique({
      where: { id: 'singleton' },
      select: { homepageConfig: true },
    }),
    prisma.projectTaxonomy.findMany({
      where: { type: 'category' },
      orderBy: { name: 'asc' },
    }).catch(() => []),
  ]);

  const hpConfig = (settings?.homepageConfig as Record<string, unknown>) || {};
  const worksPage = (hpConfig.worksPage as Record<string, unknown>) || {};
  const showCategoryBar = worksPage.showCategoryBar !== false;

  let categories: string[] = [];
  if (Array.isArray(worksPage.categories) && worksPage.categories.length > 0) {
    categories = worksPage.categories;
  } else if (taxonomies.length > 0) {
    categories = taxonomies.map((t) => t.name);
  } else {
    // Derive from existing works
    const distinct = Array.from(new Set(dbWorks.map((w) => w.category).filter((c): c is string => Boolean(c))));
    categories = distinct.length > 0 ? distinct : ['Web Development', 'E-commerce', 'UI/UX'];
  }

  const formattedWorks: WorkItem[] = dbWorks.map((work, idx) => {
    const safeCover = getProjectCoverUrl(work, `/images/projects/project${(idx % 4) + 1}.svg`);

    const cleanDescription = (work.description && !work.description.includes('Invalid url'))
      ? work.description
      : 'Client project featuring modern UI/UX design, responsive frontend architecture, and interactive web experience.';

    const workRecord = work as unknown as Record<string, unknown>;
    const previewMode = (workRecord.previewMode as string | undefined) ?? 'iframe';
    const previewImageUrl = (workRecord.previewImageUrl as string | undefined) || (workRecord.coverImageUrl as string | undefined) || safeCover;

    return {
      id: work.id,
      title: work.title,
      slug: work.slug,
      description: cleanDescription,
      category: work.category ?? 'Website Project',
      year: work.year ?? work.createdAt.getFullYear().toString(),
      coverUrl: safeCover,
      technologies: work.technologies,
      liveUrl: work.liveUrl,
      previewMode,
      previewImageUrl,
      hasCaseStudy: isCaseStudyAvailable(work.caseStudy),
      caseStudySlug: work.caseStudy?.slug ?? null,
    };
  });

  return (
    <main
      data-page-version="works-editorial-v2"
      className="min-h-screen bg-[var(--bg)] px-4 sm:px-6 md:px-10 lg:px-14 py-8 md:py-14 lg:py-16"
    >
      <div className="max-w-[1240px] mx-auto">
        <WorksShowcase
          works={formattedWorks}
          categories={categories}
          showCategoryBar={showCategoryBar}
        />
      </div>
    </main>
  );
}
