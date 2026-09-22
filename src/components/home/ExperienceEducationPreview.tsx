'use client';

import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';

import { SectionReveal, StaggerContainer } from '@/components/ui/SectionReveal';
import { Compass } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';

const experienceRowVariants: Variants = {
  hidden: { opacity: 0, y: 22, x: -10 },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

type PreviewTimelineItem = {
  year: string;
  role: string;
  company: string;
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
  const prefersReducedMotion = useReducedMotion();
  const hasTimelineData = experienceItems.length > 0 || educationItems.length > 0;

  return (
    <SectionReveal id="experience-preview" className="py-4 sm:py-6 md:py-8 relative px-5 sm:px-6 md:px-10 lg:px-16">
      <section ref={sectionRef} className="relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
          <SectionHeader icon={Compass} className="!mb-0">
            <h2 className="text-3xl md:text-4xl lg:text-[40px] font-display font-medium tracking-tight leading-[1.15] mb-2">
              Experience & Education
            </h2>
            <p className="text-muted text-sm md:text-base max-w-xl">
              My professional journey, education and growth across design and frontend development.
            </p>
          </SectionHeader>
        </div>

        <div className="flex flex-col max-w-4xl relative mt-8">
          <div className="absolute left-[20px] md:left-[180px] top-2 bottom-0 w-[1px] bg-border-subtle origin-top" />
          <motion.div
            className="absolute left-[20px] md:left-[180px] top-2 bottom-0 w-[1px] bg-accent origin-top shadow-[0_0_18px_rgba(45,212,191,0.28)]"
            initial={{ scaleY: prefersReducedMotion ? 1 : 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />

          <StaggerContainer className="flex flex-col">
            {hasTimelineData ? experienceItems.map((exp, idx) => (
              <ExperienceRow
                key={idx}
                item={exp}
                isTrending={idx === 0}
              />
            )) : (
              <motion.p variants={experienceRowVariants} className="py-8 pl-[44px] text-sm text-muted md:pl-[180px]">
                No data available.
              </motion.p>
            )}

            {educationItems.length > 0 && (
              <motion.div
                variants={experienceRowVariants}
                className="flex flex-col md:flex-row gap-2 md:gap-8 relative pt-9 pb-3 pl-[44px] md:pl-0"
              >
                <div className="w-full md:w-[150px] shrink-0" />
                <div className="w-full md:flex-1">
                  <div className="text-[11px] font-semibold tracking-[0.14em] text-foreground opacity-55 uppercase flex items-center gap-2">
                    EDUCATION
                  </div>
                </div>
              </motion.div>
            )}

            {educationItems.map((edu, idx) => (
              <ExperienceRow
                key={`edu-${idx}`}
                item={edu}
              />
            ))}
          </StaggerContainer>
        </div>
      </section>
    </SectionReveal>
  );
}

function ExperienceRow({
  item,
  isTrending = false,
}: {
  item: PreviewTimelineItem;
  isTrending?: boolean;
}) {
  return (
    <motion.div
      variants={experienceRowVariants}
      className="flex flex-col md:flex-row gap-2 md:gap-8 relative group pt-5 pb-6 md:py-5 pl-[44px] md:pl-0 cursor-default"
    >
      <div
        className={`absolute left-[20px] md:left-[180px] top-[26px] md:top-[30px] -translate-x-[50%] w-2.5 h-2.5 rounded-full bg-[var(--bg)] border z-10 transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:shadow-[0_0_0_6px_rgba(45,212,191,0.12)] ${
          isTrending ? 'border-accent shadow-[0_0_0_5px_rgba(45,212,191,0.10)]' : 'border-border-subtle'
        }`}
      />

      <div className="w-full md:w-[150px] shrink-0 pt-1">
        <span className="text-xs font-medium text-muted opacity-70 group-hover:opacity-100 group-hover:text-foreground font-mono transition-all duration-300">
          {item.year}
        </span>
      </div>

      <div className="w-full md:flex-1 flex flex-col items-start md:border-none border-b border-border-subtle/50 pb-6 md:pb-0 transition-transform duration-300 ease-out group-hover:translate-x-[8px]">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="text-xl font-display font-medium text-foreground group-hover:text-accent transition-colors duration-300">
            {item.role}
          </h3>
          {isTrending && (
            <span className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[9px] font-mono font-semibold tracking-[0.14em] text-accent">
              TRENDING
            </span>
          )}
        </div>
        <p className="text-sm text-foreground font-medium mb-3 uppercase tracking-wider">
          {item.company}
        </p>
        
        <ul className="text-sm text-muted opacity-70 group-hover:opacity-95 leading-relaxed transition-opacity duration-300 list-disc list-outside ml-4 space-y-1.5 mb-4">
          {item.description.map((desc, i) => (
            <li key={i} className="pl-1 marker:text-muted/50">{desc}</li>
          ))}
        </ul>

        {item.technologies && item.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            {item.technologies.map((tech, i) => (
              <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono tracking-wide text-zinc-400 group-hover:text-zinc-300 group-hover:border-white/20 transition-all duration-300">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
