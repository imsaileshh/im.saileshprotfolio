'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Calendar, Award } from 'lucide-react';

export type EducationCardItem = {
  id?: string;
  degree: string;
  institution: string;
  year?: string;
  startDate?: Date | string;
  endDate?: Date | string | null;
  field?: string | null;
  score?: string | null;
  description?: string | string[] | null;
};

export function EducationCard({ item }: { item: EducationCardItem }) {
  const yearText = item.year || formatDates(item.startDate, item.endDate);
  const descriptionText = Array.isArray(item.description)
    ? item.description.join(' ')
    : item.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="group relative w-full bg-[var(--card)]/60 hover:bg-[var(--card)] border border-white/10 hover:border-accent/30 rounded-xl p-4 sm:p-5 md:p-6 transition-all duration-300 hover:-translate-y-0.5 shadow-md hover:shadow-lg hover:shadow-accent/5 cursor-default flex flex-col gap-3 md:gap-4"
    >
      {/* Mobile Top Header (< sm) */}
      <div className="flex items-center justify-between gap-2 sm:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-accent">
            <GraduationCap size={16} className="text-accent" />
          </div>
          {yearText && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted/80">
              <Calendar size={12} className="text-muted/60" />
              <span>{yearText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Top Header (>= sm) */}
      <div className="hidden sm:flex items-start gap-4">
        {/* Education Icon Box */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-accent transition-colors duration-300 group-hover:border-accent/30 group-hover:bg-accent/10">
          <GraduationCap size={18} className="text-accent" />
        </div>

        {/* Header Metadata */}
        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg md:text-xl font-semibold text-foreground tracking-tight group-hover:text-accent transition-colors duration-300">
              {item.degree}
              {item.field && (
                <span className="text-foreground/80 font-normal"> — {item.field}</span>
              )}
            </h3>
          </div>

          <p className="text-sm font-medium text-foreground/80 tracking-wide">
            {item.institution}
          </p>

          {yearText && (
            <div className="flex items-center gap-1.5 text-xs text-muted/80 font-mono mt-0.5">
              <Calendar size={13} className="text-muted/60" />
              <span>{yearText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Title & Institution Block (< sm) */}
      <div className="sm:hidden flex flex-col gap-0.5">
        <h3 className="text-base font-semibold text-foreground tracking-tight leading-snug">
          {item.degree}
          {item.field && (
            <span className="text-foreground/80 font-normal"> — {item.field}</span>
          )}
        </h3>

        <p className="text-xs font-medium text-foreground/80 tracking-wide">
          {item.institution}
        </p>
      </div>

      {/* Description */}
      {descriptionText && (
        <p className="text-xs sm:text-sm md:text-[15px] leading-relaxed text-muted font-normal">
          {descriptionText}
        </p>
      )}

      {/* Optional Score / Tag Chips */}
      {item.score && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pl-0 md:pl-[60px]">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/[0.03] border border-white/10 rounded-lg text-xs font-mono text-foreground/80">
            <Award size={12} className="text-accent" />
            <span>{item.score}</span>
          </span>
        </div>
      )}
    </motion.div>
  );
}

function formatDates(startDate?: Date | string, endDate?: Date | string | null) {
  if (!startDate) return '';
  const start = new Date(startDate).getFullYear();
  const end = endDate ? new Date(endDate).getFullYear() : 'Present';
  return `${start} — ${end}`;
}
