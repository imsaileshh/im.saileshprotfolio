import { SectionReveal, StaggerContainer, StaggerItem } from '@/components/ui/SectionReveal';
import { ScrollTimelineLine, ScrollTimelineNode } from '@/components/ui/ScrollTimeline';
import { prisma } from '@/lib/database/prisma';

function formatYearRange(startDate: Date, endDate?: Date | null) {
  const start = startDate.getFullYear();
  const end = endDate ? endDate.getFullYear() : 'Present';
  return `${start} - ${end}`;
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

  return (
    <div className="flex flex-col p-5 sm:p-6 md:p-10 lg:p-14 pb-20">
      {/* HEADER */}
      <SectionReveal className="mb-10 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight mb-4">
          Experience
        </h1>
        <p className="text-lg text-muted max-w-2xl">
          My professional journey across product design and frontend engineering.
        </p>
      </SectionReveal>

      {/* TIMELINE */}
      <div className="flex flex-col max-w-4xl relative">
        <ScrollTimelineLine className="absolute left-4 md:left-[180px] top-2 bottom-0 w-[1px] bg-border-subtle overflow-hidden origin-top" />
        
        <StaggerContainer className="flex flex-col gap-2">
          {experiences.length ? experiences.map((exp, idx) => (
            <StaggerItem key={idx}>
              <div className="flex flex-col md:flex-row gap-2 md:gap-8 relative group p-4 pl-10 md:p-5 md:pl-6 -mx-4 md:-mx-5 rounded-[12px] hover:bg-border-subtle/20 transition-all duration-[250ms] cursor-default">
                {/* Timeline node */}
                <ScrollTimelineNode className="absolute left-[32px] md:left-[204px] top-[24px] md:top-[32px] -translate-x-[50%] w-2 h-2 md:w-2.5 md:h-2.5 rounded-full border z-10" />
                
                <div className="w-full md:w-[150px] shrink-0 pt-0 md:pt-[6px] mb-1 md:mb-0">
                  <span className="text-[11px] md:text-xs font-medium text-muted opacity-80 group-hover:opacity-100 tracking-widest font-mono transition-opacity duration-200">
                    {formatYearRange(exp.startDate, exp.endDate)}
                  </span>
                </div>
                
                <div className="w-full md:flex-1 flex flex-col items-start md:border-none border-b border-border-subtle/30 pb-6 md:pb-0 group-hover:translate-x-1 transition-transform duration-[250ms] ease-out">
                  <h3 className="text-xl font-display font-medium text-foreground mb-1 group-hover:text-accent transition-colors">
                    {exp.role}
                  </h3>
                  <p className="text-[13px] md:text-sm text-foreground font-medium mb-3 uppercase tracking-wider">{exp.company}</p>
                  
                  <p className="text-sm text-muted leading-relaxed">
                    {exp.description.join(' ')}
                  </p>
                </div>
              </div>
            </StaggerItem>
          )) : (
            <StaggerItem>
              <p className="py-8 pl-10 text-sm text-muted md:pl-[210px]">No data available.</p>
            </StaggerItem>
          )}
        </StaggerContainer>
      </div>

      {/* DIVIDER */}
      <div className="w-full h-[1px] bg-border-subtle my-10 md:my-12"></div>

      {/* EDUCATION */}
      <SectionReveal className="mb-10 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight mb-4">
          Education
        </h2>
        <p className="text-lg text-muted max-w-2xl">
          My academic foundation in computer science and technology.
        </p>
      </SectionReveal>

      <div className="flex flex-col max-w-4xl relative">
        <ScrollTimelineLine className="absolute left-4 md:left-[180px] top-2 bottom-0 w-[1px] bg-border-subtle overflow-hidden origin-top" />
        
        <StaggerContainer className="flex flex-col gap-2">
          {education.length ? education.map((edu, idx) => (
            <StaggerItem key={idx}>
              <div className="flex flex-col md:flex-row gap-2 md:gap-8 relative group p-4 pl-10 md:p-5 md:pl-6 -mx-4 md:-mx-5 rounded-[12px] hover:bg-border-subtle/20 transition-all duration-[250ms] cursor-default">
                {/* Timeline node */}
                <ScrollTimelineNode className="absolute left-[32px] md:left-[204px] top-[24px] md:top-[32px] -translate-x-[50%] w-2 h-2 md:w-2.5 md:h-2.5 rounded-full border z-10" />
                
                <div className="w-full md:w-[150px] shrink-0 pt-0 md:pt-[6px] mb-1 md:mb-0">
                  <span className="text-[11px] md:text-xs font-medium text-muted opacity-80 group-hover:opacity-100 tracking-widest font-mono transition-opacity duration-200">
                    {formatYearRange(edu.startDate, edu.endDate)}
                  </span>
                </div>
                
                <div className="w-full md:flex-1 flex flex-col items-start md:border-none border-b border-border-subtle/30 pb-6 md:pb-0 group-hover:translate-x-1 transition-transform duration-[250ms] ease-out">
                  <h3 className="text-xl font-display font-medium text-foreground mb-1 group-hover:text-accent transition-colors">
                    {edu.degree}
                  </h3>
                  <p className="text-[13px] md:text-sm text-foreground font-medium mb-3 uppercase tracking-wider">{edu.institution}</p>
                  
                  <p className="text-sm text-muted leading-relaxed">
                    {edu.description ?? edu.field ?? 'No description available.'}
                  </p>
                </div>
              </div>
            </StaggerItem>
          )) : (
            <StaggerItem>
              <p className="py-8 pl-10 text-sm text-muted md:pl-[210px]">No data available.</p>
            </StaggerItem>
          )}
        </StaggerContainer>
      </div>

    </div>
  );
}
