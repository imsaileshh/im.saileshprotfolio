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
        {/* ── Section Header Row: Left Icon Box + Heading | Right Action Button ── */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10 w-full">
          {/* Left: Icon Box + Heading */}
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] bg-[var(--card)] border border-border-subtle text-accent shadow-xs shrink-0">
              <Terminal size={22} strokeWidth={2} className="text-accent" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-display font-semibold tracking-tight text-foreground leading-[1.15] truncate">
              {heading}
            </h2>
          </div>

          {/* Right Action Button: Simple Rounded Rectangle */}
          <Link
            href="/personal-projects"
            className="group inline-flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-[10px] bg-[var(--card)] border border-border-subtle hover:border-accent/40 hover:bg-[var(--nav-active)] text-xs sm:text-sm font-semibold text-foreground hover:text-accent transition-all duration-200 shrink-0 shadow-xs"
          >
            <span>All Personal Projects</span>
            <ArrowRight
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
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
