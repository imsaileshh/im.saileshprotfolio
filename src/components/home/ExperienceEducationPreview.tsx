'use client';

import { useRef } from 'react';

import { SectionReveal } from '@/components/ui/SectionReveal';
import { Compass } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EducationCard } from '@/components/experience/EducationCard';
import { ExperienceTimeline } from '@/components/experience/ExperienceTimeline';

type PreviewTimelineItem = {
  id?: string;
  year: string;
  role: string;
  company: string;
  degree?: string;
  institution?: string;
  field?: string | null;
  score?: string | null;
  location?: string | null;
  employmentType?: string | null;
  current?: boolean;
  description: string[];
  technologies?: string[];
};

export function ExperienceEducationPreview({
  experienceItems,
  educationItems,
}: {
  experienceItems: PreviewTimelineItem[];
  educationItems: PreviewTimelineItem[];
}) {
  const sectionRef = useRef<HTMLElement | null>(null);

  return (
    <SectionReveal id="experience-preview" className="py-4 sm:py-6 md:py-8 relative px-3.5 sm:px-6 md:px-10 lg:px-16">
      <section ref={sectionRef} className="relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
          <SectionHeader icon={Compass} className="!mb-0">
            <h2 className="text-3xl md:text-4xl lg:text-[40px] font-display font-medium tracking-tight leading-[1.15] mb-2">
              Experience &amp; Education
            </h2>
            <p className="text-muted text-sm md:text-base max-w-xl">
              My professional journey, education and growth across design and frontend development.
            </p>
          </SectionHeader>
        </div>

        <div className="flex flex-col max-w-4xl relative mt-6 md:mt-8 gap-8 sm:gap-10">
          {/* Animated Experience Timeline without outer card boxes */}
          {experienceItems.length > 0 && (
            <div className="flex flex-col gap-3 sm:gap-4 w-full">
              <div className="flex items-center gap-3 mb-1">
                <span className="h-px w-8 bg-accent/50" />
                <h3 className="text-xs font-semibold tracking-[0.16em] uppercase text-foreground/75 font-mono">
                  Experience
                </h3>
              </div>

              <ExperienceTimeline items={experienceItems} />
            </div>
          )}

          {/* Education Cards */}
          {educationItems.length > 0 && (
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center gap-3 mb-1">
                <span className="h-px w-8 bg-accent/50" />
                <h3 className="text-xs font-semibold tracking-[0.16em] uppercase text-foreground/75 font-mono">
                  Education
                </h3>
              </div>
              <div className="flex flex-col gap-4 w-full">
                {educationItems.map((edu, idx) => (
                  <EducationCard
                    key={edu.id || `edu-${idx}`}
                    item={{
                      degree: edu.degree || edu.role,
                      institution: edu.institution || edu.company,
                      year: edu.year,
                      field: edu.field,
                      score: edu.score,
                      description: edu.description,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </SectionReveal>
  );
}
