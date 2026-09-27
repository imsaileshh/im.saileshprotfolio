'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import {
  Briefcase,
  Code2,
  Laptop,
  PenTool,
  Rocket,
  CalendarDays,
  MapPin,
} from 'lucide-react';

export type ExperienceItemType = {
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

export function ExperienceTimeline({ items }: { items: ExperienceItemType[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 85%', 'end 60%'],
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  if (!items || items.length === 0) {
    return <p className="py-8 text-sm text-muted">No experience data available.</p>;
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl pl-5 sm:pl-7 md:pl-9">
      {/* Background Faint Timeline Line */}
      <div className="absolute left-[7px] sm:left-[9px] md:left-[11px] top-3 bottom-3 w-px bg-white/10 pointer-events-none" />

      {/* Animated Active Teal Line (grows as user scrolls) */}
      <motion.div
        className="absolute left-[7px] sm:left-[9px] md:left-[11px] top-3 bottom-3 w-px bg-accent origin-top pointer-events-none shadow-[0_0_5px_rgba(45,212,191,0.35)]"
        style={{
          scaleY: shouldReduceMotion ? 1 : scaleY,
        }}
      />

      {/* Experience Items */}
      <div className="flex flex-col w-full">
        {items.map((item, idx) => (
          <SingleExperienceItem
            key={item.id || `exp-${idx}`}
            item={item}
            isLast={idx === items.length - 1}
            shouldReduceMotion={Boolean(shouldReduceMotion)}
          />
        ))}
      </div>
    </div>
  );
}

function SingleExperienceItem({
  item,
  isLast,
  shouldReduceMotion,
}: {
  item: ExperienceItemType;
  isLast: boolean;
  shouldReduceMotion: boolean;
}) {
  const IconComponent = getExperienceIcon(item.role, item.company, item.employmentType);
  const isCurrent = item.current || (typeof item.year === 'string' && item.year.toLowerCase().includes('present'));

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col gap-3 group ${isLast ? 'pb-2' : 'pb-10 sm:pb-12 md:pb-12'}`}
    >
      {/* Animated Timeline Node */}
      <motion.div
        initial={shouldReduceMotion ? { scale: 1, opacity: 1 } : { scale: 0.75, opacity: 0.4 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`absolute -left-[20px] sm:-left-[27px] md:-left-[33px] top-1.5 -translate-x-1/2 z-10 rounded-full transition-all duration-300 ${
          isCurrent
            ? 'w-3 h-3 sm:w-3.5 sm:h-3.5 border border-accent bg-accent shadow-[0_0_6px_rgba(45,212,191,0.45)]'
            : 'w-2.5 h-2.5 sm:w-3 sm:h-3 border border-accent/50 bg-[var(--bg)] group-hover:border-accent group-hover:bg-accent/60'
        }`}
      >
        {/* Single subtle activation pulse on entry for Current Role */}
        {isCurrent && !shouldReduceMotion && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0.7 }}
            whileInView={{ scale: 1.5, opacity: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border border-accent pointer-events-none"
          />
        )}
      </motion.div>

      {/* Header Row */}
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Icon Box */}
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/[0.05] text-accent transition-colors duration-300 group-hover:border-accent/40 group-hover:bg-accent/10 mt-0.5">
          <IconComponent size={18} className="text-accent" />
        </div>

        {/* Content Header */}
        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          {/* Date Row + Current Role Badge Inline */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
              <CalendarDays size={12} className="text-zinc-500/80" />
              <span>{item.year || formatDates(item.startDate, item.endDate, item.current)}</span>
            </div>

            {isCurrent && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-[9.5px] font-mono font-semibold uppercase tracking-wider text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                CURRENT ROLE
              </span>
            )}
          </div>

          <div className="mt-1">
            {/* Company Name */}
            <p className="text-[12px] sm:text-[12.5px] font-semibold tracking-wider text-zinc-300 uppercase">
              {item.company}
              {item.employmentType && (
                <span className="text-zinc-500 font-normal lowercase"> · {item.employmentType}</span>
              )}
            </p>

            {/* Role Title */}
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-foreground tracking-tight group-hover:text-accent transition-colors duration-200">
              {item.role}
            </h3>
          </div>

          {/* Location */}
          {item.location && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
              <MapPin size={12} className="text-zinc-500/80" />
              <span>{item.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description Bullet Points */}
      {item.description && item.description.length > 0 && (
        <ul className="space-y-2 text-sm sm:text-[14.5px] leading-6 text-zinc-400 font-normal mt-1 pl-1">
          {item.description.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400/60 mt-2 shrink-0 group-hover:bg-accent transition-colors" />
              <span className="flex-1 text-zinc-400">{bullet}</span>
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
              className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11px] sm:text-xs font-mono tracking-wide text-zinc-300 transition-colors duration-200 group-hover:border-teal-400/20"
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
