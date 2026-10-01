import { prisma } from '@/lib/database/prisma';
import { ProjectsSection } from '@/components/home/ProjectsSection';
import { PersonalProjectsSection, PersonalProjectItem } from '@/components/home/PersonalProjectsSection';
import { AboutSection } from '@/components/home/AboutSection';
import { StackPreview } from '@/components/home/StackPreview';
import { HomeHero } from '@/components/home/HomeHero';
import { ExperienceEducationPreview } from '@/components/home/ExperienceEducationPreview';
import { ContactCTASection } from '@/components/home/ContactCTASection';
import { WORK_WHERE_CLAUSE, PERSONAL_PROJECT_WHERE_CLAUSE } from '@/lib/constants/project-types';
import { resolveHomepageConfig, HomepageConfig } from '@/types/homepage-cms';
import { getProjectCoverUrl } from '@/lib/projects/cover-image';
import { isCaseStudyAvailable } from '@/lib/projects/case-study-utils';

export const revalidate = 30;

function formatYearRange(startDate: Date, endDate?: Date | null, isCurrent?: boolean) {
  const startYear = startDate.getFullYear();
  const endYear = endDate ? endDate.getFullYear() : 'Present';
  
  const end = endDate || (isCurrent ? new Date() : new Date());
  const diffInMonths = (end.getFullYear() - startDate.getFullYear()) * 12 + (end.getMonth() - startDate.getMonth());
  const years = Math.floor(diffInMonths / 12);
  const months = diffInMonths % 12;
  
  let durationStr = '';
  if (years > 0) durationStr += `${years} yr${years > 1 ? 's' : ''} `;
  if (months > 0 || years === 0) durationStr += `${months} mo${months > 1 ? 's' : ''}`;
  durationStr = durationStr.trim();
  
  return `${startYear} - ${endYear} · ${durationStr}`;
}

export default async function HomePage() {
  const [workProjects, dbPersonalProjects, experienceItems, educationItems, settings, skillSections] = await Promise.all([
    // 01. Works (Client Deliverables & Commercial Case Studies)
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
            sections: { select: { id: true } },
          },
        },
      },
      orderBy: [{ featured: 'desc' }, { orderIndex: 'asc' }, { createdAt: 'desc' }],
    }),
    // 02. Personal Projects (Independent Builds, Experiments & Open Source)
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
            sections: { select: { id: true } },
          },
        },
      },
      orderBy: [{ featured: 'desc' }, { orderIndex: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.experience.findMany({
      where: { visible: true },
      orderBy: [{ featured: 'desc' }, { orderIndex: 'asc' }],
      take: 3,
    }),
    prisma.education.findMany({
      where: { visible: true },
      orderBy: { orderIndex: 'asc' },
      take: 2,
    }),
    prisma.siteSettings.findUnique({
      where: { id: 'singleton' },
    }),
    prisma.skillSection.findMany({
      where: { visible: true },
      orderBy: { orderIndex: 'asc' },
      include: {
        skills: {
          where: { visible: true },
          orderBy: { orderIndex: 'asc' }
        }
      }
    })
  ]);

  const defaultWorkIds = workProjects.slice(0, 3).map((p) => p.id);
  const defaultPersonalIds = dbPersonalProjects.slice(0, 3).map((p) => p.id);

  const config: HomepageConfig = resolveHomepageConfig(
    settings?.homepageConfig as unknown as Partial<HomepageConfig> | null,
    settings?.heroContent as Record<string, unknown> | null,
    settings?.aboutContent as Record<string, unknown> | null,
    defaultWorkIds,
    defaultPersonalIds
  );

  // Map raw DB Work projects to card objects
  const allWorkCards = workProjects.map((project, index) => {
    const safeCover = getProjectCoverUrl(project, `/images/projects/project${(index % 4) + 1}.svg`);

    return {
      ...project,
      coverUrl: safeCover,
      description: (project.description && !project.description.includes('Invalid url'))
        ? project.description
        : 'Client project featuring modern UI/UX design, responsive frontend architecture, and interactive web experience.',
      category: project.category ?? 'Website Project',
      year: project.year ?? project.createdAt.getFullYear().toString(),
      hasCaseStudy: isCaseStudyAvailable(project.caseStudy),
      caseStudySlug: project.caseStudy?.slug ?? null,
      projectType: 'work' as const,
    };
  });

  // Filter and order Work cards according to homepageConfig
  const selectedWorkIds = config.sections.works.selectedProjectIds || [];
  const activeWorkCards = selectedWorkIds.length > 0
    ? selectedWorkIds
        .map((id) => allWorkCards.find((c) => c.id === id))
        .filter((c): c is (typeof allWorkCards)[0] => Boolean(c))
    : allWorkCards.slice(0, 3);

  // Map raw DB Personal Projects to card objects
  const allPersonalCards: PersonalProjectItem[] = dbPersonalProjects.map((p, index) => {
    const safeCover = getProjectCoverUrl(p, `/images/projects/project${(index % 4) + 1}.svg`);

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category ?? 'Personal Project',
      year: p.year ?? p.createdAt.getFullYear().toString(),
      description: (p.description && !p.description.includes('Invalid url'))
        ? p.description
        : 'Independent project exploring modern design, frontend development, and interactive digital experiences.',
      technologies: p.technologies,
      coverUrl: safeCover,
      liveUrl: p.liveUrl,
      githubUrl: p.githubUrl,
      hasCaseStudy: isCaseStudyAvailable(p.caseStudy),
      caseStudySlug: p.caseStudy?.slug ?? null,
      projectType: 'personal' as const,
    };
  });

  // Filter and order Personal Project cards according to homepageConfig
  const selectedPersonalIds = config.sections.personalProjects.selectedProjectIds || [];
  const activePersonalCards = selectedPersonalIds.length > 0
    ? selectedPersonalIds
        .map((id) => allPersonalCards.find((c) => c.id === id))
        .filter((c): c is PersonalProjectItem => Boolean(c))
    : allPersonalCards.slice(0, 3);

  const formattedExperience = experienceItems.map((item) => ({
    id: item.id,
    year: formatYearRange(item.startDate, item.endDate, item.current),
    role: item.role,
    company: item.company,
    location: item.location,
    employmentType: item.employmentType,
    current: item.current,
    description: item.description,
    technologies: item.technologies,
  }));

  const formattedEducation = educationItems.map((item) => ({
    id: item.id,
    year: formatYearRange(item.startDate, item.endDate),
    role: item.degree,
    company: item.institution,
    degree: item.degree,
    institution: item.institution,
    field: item.field,
    score: item.score,
    description: item.description ? [item.description] : [],
  }));

  // Renderers for reorderable homepage sections
  const sectionRenderers: Record<string, () => React.ReactNode> = {
    hero: () => (
      config.sections.hero.visible ? (
        <HomeHero key="hero" heroContent={config.sections.hero} />
      ) : null
    ),
    works: () => (
      config.sections.works.visible && activeWorkCards.length > 0 ? (
        <ProjectsSection
          key="works"
          projects={activeWorkCards}
          label={config.sections.works.label}
          heading={config.sections.works.heading || 'Works'}
          description={
            config.sections.works.description && config.sections.works.description !== 'A curated collection of work that tells a story.'
              ? config.sections.works.description
              : 'Client projects, production web applications, e-commerce stores, and digital products.'
          }
        />
      ) : null
    ),
    'personal-projects': () => (
      config.sections.personalProjects.visible && activePersonalCards.length > 0 ? (
        <PersonalProjectsSection
          key="personal-projects"
          personalProjects={activePersonalCards}
          label={config.sections.personalProjects.label}
          heading={config.sections.personalProjects.heading || 'Personal Projects'}
          description={
            config.sections.personalProjects.description && config.sections.personalProjects.description !== 'Independent projects, experiments, and things I build.'
              ? config.sections.personalProjects.description
              : 'Independent projects, experiments and digital products created to explore design, development and interaction.'
          }
        />
      ) : null
    ),
    about: () => (
      config.sections.about.visible ? (
        <AboutSection key="about" aboutContent={config.sections.about} />
      ) : null
    ),
    stack: () => (
      config.sections.stack.visible && skillSections.length > 0 ? (
        <StackPreview key="stack" skillSections={skillSections} />
      ) : null
    ),
  };

  return (
    <div className="flex flex-col gap-8 sm:gap-10 md:gap-12 lg:gap-14 pb-12">
      {/* ── Dynamic Reorderable Sections (Hero, Works, Personal Projects, About, Stack) ── */}
      {config.sectionOrder.map((sectionId) => {
        const renderSection = sectionRenderers[sectionId];
        return renderSection ? renderSection() : null;
      })}

      {/* ── 06. Experience & Education Section ── */}
      <ExperienceEducationPreview 
        experienceItems={formattedExperience} 
        educationItems={formattedEducation} 
      />

      {/* ── 07. Contact CTA Section ── */}
      <ContactCTASection />
    </div>
  );
}
