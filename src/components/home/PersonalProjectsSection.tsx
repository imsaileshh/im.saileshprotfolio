'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Terminal } from 'lucide-react';
import { ProjectShowcaseItem, ShowcaseProjectItem } from '@/components/projects/ProjectShowcaseItem';
import { MobileProjectCarousel } from '@/components/projects/MobileProjectCarousel';
import { LivePreviewModal } from '@/components/works/LivePreviewModal';

export type PersonalProjectItem = ShowcaseProjectItem;

export interface PersonalProjectsSectionProps {
  personalProjects: PersonalProjectItem[];
  label?: string;
  heading?: string;
  description?: string;
}

export function PersonalProjectsSection({
  personalProjects,
  heading = 'Personal Projects',
}: PersonalProjectsSectionProps) {
  const [livePreviewItem, setLivePreviewItem] = useState<{ title: string; liveUrl?: string | null } | null>(null);

  // Show up to 3 featured/published personal projects
  const displayProjects = personalProjects.slice(0, 3);

  if (!displayProjects || displayProjects.length === 0) return null;

  return (
    <section
      id="personal-projects"
      className="relative py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-10 lg:px-14 w-full"
    >
      <div className="max-w-[1240px] mx-auto">
        {/* ── Section Header Row: Mobile 2-Row (Icon + Heading / Right-Aligned Button) | Desktop 1-Row ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-10 w-full">
          {/* Left / Row 1: Icon Box + Full Heading */}
          <div className="flex items-center gap-3 sm:gap-3.5 md:gap-4 min-w-0 w-full md:w-auto">
            <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-[12px] sm:rounded-[14px] bg-[var(--card)] border border-border-subtle text-accent shadow-xs shrink-0">
              <Terminal size={20} strokeWidth={2} className="text-accent sm:w-[22px] sm:h-[22px]" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[40px] font-display font-semibold tracking-tight text-foreground leading-tight whitespace-normal break-words min-w-0">
              {heading}
            </h2>
          </div>

          {/* Right / Row 2: Right-aligned Button on mobile, auto on desktop */}
          <div className="flex w-full justify-end md:w-auto shrink-0">
            <Link
              href="/personal-projects"
              className="group inline-flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-[10px] bg-[var(--card)] border border-border-subtle hover:border-accent/40 hover:bg-[var(--nav-active)] text-xs sm:text-sm font-semibold text-foreground hover:text-accent transition-all duration-200 shadow-xs whitespace-nowrap"
            >
              <span>All Personal Projects</span>
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1 sm:w-[15px] sm:h-[15px]"
              />
            </Link>
          </div>
        </div>

        {/* ── Desktop Editorial Project Rows (Alternating Layout) ── */}
        <div className="hidden md:block space-y-20 md:space-y-28 lg:space-y-36">
          {displayProjects.map((project, idx) => (
            <ProjectShowcaseItem
              key={project.id || idx}
              project={project}
              index={idx}
              projectType="personal"
              onLivePreview={(p) => setLivePreviewItem(p)}
            />
          ))}
        </div>

        {/* ── Mobile Touch Swipe Carousel + Pagination Dots (<768px) ── */}
        <div className="block md:hidden w-full">
          <MobileProjectCarousel
            projects={displayProjects}
            projectType="personal"
            onLivePreview={(p) => setLivePreviewItem(p)}
          />
        </div>
      </div>

      {/* ── Browser Live Preview Modal ── */}
      {livePreviewItem && livePreviewItem.liveUrl && (
        <LivePreviewModal
          open={Boolean(livePreviewItem)}
          url={livePreviewItem.liveUrl}
          title={livePreviewItem.title}
          onClose={() => setLivePreviewItem(null)}
        />
      )}
    </section>
  );
}
