import { SectionReveal } from '@/components/ui/SectionReveal';
import { prisma } from '@/lib/database/prisma';
import { ProjectsSection } from '@/components/home/ProjectsSection';
import { PersonalProjectsSection, PersonalProjectItem } from '@/components/home/PersonalProjectsSection';
import { AboutSection } from '@/components/home/AboutSection';
import { StackPreview } from '@/components/home/StackPreview';
import { HomeHero } from '@/components/home/HomeHero';
import { ExperienceEducationPreview } from '@/components/home/ExperienceEducationPreview';
import { LetsTalkButton } from '@/components/hire/LetsTalkButton';
import { ContactCTASection } from '@/components/home/ContactCTASection';
import { WORK_WHERE_CLAUSE, PERSONAL_PROJECT_WHERE_CLAUSE } from '@/lib/constants/project-types';

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
    // 01. Works ONLY (Client Deliverables & Commercial Case Studies)
    prisma.project.findMany({
      where: { 
        published: true, 
        archived: false,
        ...WORK_WHERE_CLAUSE,
      },
      include: { images: { orderBy: { order: 'asc' } } },
      orderBy: [{ featured: 'desc' }, { orderIndex: 'asc' }, { createdAt: 'desc' }],
      take: 3,
    }),
    // 02. Personal Projects ONLY (Independent Builds, Experiments & Open Source)
    prisma.project.findMany({
      where: { 
        published: true, 
        archived: false,
        ...PERSONAL_PROJECT_WHERE_CLAUSE,
      },
      include: { images: { orderBy: { order: 'asc' } } },
      orderBy: [{ featured: 'desc' }, { orderIndex: 'asc' }, { createdAt: 'desc' }],
      take: 3,
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
      orderBy: { orderIndex: 'asc' },
      include: {
        skills: {
          where: { visible: true },
          orderBy: { orderIndex: 'asc' }
        }
      }
    })
  ]);

  const projectCards = workProjects.map((project, index) => ({
    ...project,
    coverUrl: project.images.find((image) => image.isCover)?.url ?? project.images[0]?.url ?? project.coverImageUrl ?? `/images/projects/project${(index % 4) + 1}.svg`,
    category: project.category ?? 'Case Study',
    year: project.year ?? project.createdAt.getFullYear().toString(),
  }));

  const personalProjectCards: PersonalProjectItem[] = dbPersonalProjects.map((p, index) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category ?? 'Web Development',
    year: p.year ?? p.createdAt.getFullYear().toString(),
    description: p.description,
    technologies: p.technologies,
    coverUrl: p.images.find((img) => img.isCover)?.url ?? p.images[0]?.url ?? p.coverImageUrl ?? `/images/projects/project${(index % 4) + 1}.svg`,
    liveUrl: p.liveUrl,
    githubUrl: p.githubUrl,
  }));

  const formattedExperience = experienceItems.map((item) => ({
    year: formatYearRange(item.startDate, item.endDate, item.current),
    role: item.role,
    company: item.company,
    description: item.description,
    technologies: item.technologies,
  }));

  const formattedEducation = educationItems.map((item) => ({
    year: formatYearRange(item.startDate, item.endDate),
    role: item.degree,
    company: item.institution,
    description: item.description ? [item.description] : [],
  }));

  return (
    <div className="flex flex-col gap-8 sm:gap-10 md:gap-12 lg:gap-14 pb-12">
      {/* ── 01. Hero Section ── */}
      <HomeHero />

      {/* ── 02. Works Section (Professional & Client Works ONLY) ── */}
      {projectCards.length > 0 && (
        <ProjectsSection projects={projectCards} />
      )}

      {/* ── 03. Personal Projects Section (Independent & Experiments ONLY) ── */}
      {personalProjectCards.length > 0 && (
        <PersonalProjectsSection personalProjects={personalProjectCards} />
      )}

      {/* ── 04. About Me Section ── */}
      <AboutSection />

      {/* ── 05. Stack Section ── */}
      <StackPreview skillSections={skillSections} />

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
