import { SectionReveal } from '@/components/ui/SectionReveal';
import { prisma } from '@/lib/database/prisma';
import { EducationCard } from '@/components/experience/EducationCard';
import { ExperienceTimeline } from '@/components/experience/ExperienceTimeline';

function formatYearRange(startDate: Date, endDate?: Date | null, current?: boolean) {
  const start = startDate.getFullYear();
  const end = current || !endDate ? 'Present' : endDate.getFullYear();
  return `${start} — ${end}`;
}

export const revalidate = 30;

export default async function ExperiencePage() {
  const [experiences, education] = await Promise.all([
    prisma.experience.findMany({
      where: { visible: true },
      orderBy: [{ featured: 'desc' }, { orderIndex: 'asc' }],
    }),
    prisma.education.findMany({
      where: { visible: true },
      orderBy: { orderIndex: 'asc' },
    }),
  ]);

  const formattedExperiences = experiences.map((exp) => ({
    id: exp.id,
    role: exp.role,
    company: exp.company,
    location: exp.location,
    employmentType: exp.employmentType,
    current: exp.current,
    year: formatYearRange(exp.startDate, exp.endDate, exp.current),
    startDate: exp.startDate,
    endDate: exp.endDate,
    description: exp.description,
    technologies: exp.technologies,
  }));

  return (
    <div className="flex flex-col pt-6 sm:pt-8 md:pt-10 p-3.5 sm:p-6 md:p-10 lg:p-14 pb-28">
      {/* HEADER */}
      <SectionReveal className="mb-6 md:mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium tracking-tight mb-2 sm:mb-3">
          Experience
        </h1>
        <p className="text-sm md:text-lg text-muted max-w-2xl">
          My professional journey across product design and frontend engineering.
        </p>
      </SectionReveal>

      {/* ANIMATED EXPERIENCE TIMELINE WITHOUT CARDS */}
      <ExperienceTimeline items={formattedExperiences} />

      {/* DIVIDER & EDUCATION SEPARATION */}
      <div className="w-full h-[1px] bg-border-subtle/40 mt-12 md:mt-16 mb-10 md:mb-12"></div>

      {/* EDUCATION */}
      <SectionReveal className="mb-6">
        <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight mb-3">
          Education
        </h2>
        <p className="text-base md:text-lg text-muted max-w-2xl">
          My academic foundation in computer science and technology.
        </p>
      </SectionReveal>

      <div className="flex flex-col gap-4 max-w-4xl w-full">
        {education.length ? (
          education.map((edu) => (
            <EducationCard
              key={edu.id}
              item={{
                id: edu.id,
                degree: edu.degree,
                institution: edu.institution,
                field: edu.field,
                startDate: edu.startDate,
                endDate: edu.endDate,
                score: edu.score,
                description: edu.description,
              }}
            />
          ))
        ) : (
          <p className="py-8 text-sm text-muted">No education data available.</p>
        )}
      </div>
    </div>
  );
}
