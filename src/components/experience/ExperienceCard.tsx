'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  Code2,
  Laptop,
  PenTool,
  Rocket,
  CalendarDays,
  MapPin,
} from 'lucide-react';

export type ExperienceCardItem = {
  id?: string;
  role: string;
  company: string;
  year?: string;
  startDate?: Date | string;
  endDate?: Date | string | null;
  current?: boolean;
  location?: string | null;
  employmentType?: string | null;
  description: string[];
  technologies?: string[];
};

export function ExperienceCard({ item }: { item: ExperienceCardItem }) {
  const IconComponent = getExperienceIcon(item.role, item.company, item.employmentType);
  const isCurrent = item.current || (typeof item.year === 'string' && item.year.toLowerCase().includes('present'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col gap-3 group pb-10 sm:pb-12 md:pb-14"
    >
      {/* Header Row */}
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Icon Box */}
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/[0.06] text-accent transition-colors duration-300 group-hover:border-accent/40 group-hover:bg-accent/10 mt-0.5">
          <IconComponent size={18} className="text-accent" />
        </div>

        {/* Content Header */}
        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted/80">
              <CalendarDays size={13} className="text-muted/60" />
              <span>{item.year || formatDates(item.startDate, item.endDate, item.current)}</span>
            </div>

            {isCurrent && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-[9.5px] font-mono font-semibold uppercase tracking-wider text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                CURRENT ROLE
              </span>
            )}
          </div>

          <div className="mt-0.5">
            <p className="text-[12.5px] sm:text-[13px] font-semibold tracking-wider text-foreground/85 uppercase">
              {item.company}
              {item.employmentType && (
                <span className="text-muted/60 font-normal lowercase"> · {item.employmentType}</span>
              )}
            </p>

            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-foreground tracking-tight group-hover:text-accent transition-colors duration-300">
              {item.role}
            </h3>
          </div>

          {item.location && (
            <div className="flex items-center gap-1.5 text-xs text-muted/70 mt-0.5">
              <MapPin size={12} className="text-muted/60" />
              <span>{item.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description Bullets */}
      {item.description && item.description.length > 0 && (
        <ul className="space-y-1.5 text-xs sm:text-sm leading-relaxed text-muted font-normal mt-1 pl-1">
          {item.description.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/70 mt-1.5 shrink-0 group-hover:bg-accent transition-colors" />
              <span className="flex-1 text-foreground/90">{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Technology Tags */}
      {item.technologies && item.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 pl-1">
          {item.technologies.map((tech, idx) => (
            <span
              key={idx}
              className="rounded-md border border-white/10 bg-white/[0.025] px-2.5 py-1 text-[11px] sm:text-xs font-mono tracking-wide text-zinc-300 transition-colors duration-300 group-hover:border-accent/20"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function getExperienceIcon(role: string, company: string, employmentType?: string | null) {
  const text = `${role} ${company} ${employmentType || ''}`.toLowerCase();
  if (text.includes('intern')) return Code2;
  if (text.includes('design') || text.includes('ui/ux') || text.includes('figma')) return PenTool;
  if (text.includes('architect') || text.includes('lead') || text.includes('senior')) return Rocket;
  if (text.includes('frontend') || text.includes('developer') || text.includes('engineer')) return Laptop;
  if (text.includes('full stack') || text.includes('stack')) return Code2;
  return Briefcase;
}

function formatDates(startDate?: Date | string, endDate?: Date | string | null, current?: boolean) {
  if (!startDate) return '';
  const start = new Date(startDate).getFullYear();
  const end = current || !endDate ? 'Present' : new Date(endDate).getFullYear();
  return `${start} — ${end}`;
}
