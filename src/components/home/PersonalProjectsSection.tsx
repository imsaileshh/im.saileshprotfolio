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
  description = 'Independent projects, experiments and digital products created to explore design, development and interaction.',
}: PersonalProjectsSectionProps) {
  const [livePreviewItem, setLivePreviewItem] = useState<{ title: string; liveUrl?: string | null } | null>(null);

  // Show up to 3 featured/published personal projects
  const displayProjects = personalProjects.slice(0, 3);

  if (!displayProjects || displayProjects.length === 0) return null;

  return (
    <section
      id="personal-projects"
      className="relative py-10 sm:py-14 md:py-20 lg:py-24 px-4 sm:px-6 md:px-10 lg:px-14 w-full"
    >
      <div className="max-w-[1240px] mx-auto">
        {/* ── Section Header: Icon + Heading + Centered Subheading ── */}
        <div className="text-center max-w-[760px] mx-auto mb-14 md:mb-20">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-3.5">
            <Terminal className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-accent shrink-0" />
            <h2 className="text-3xl sm:text-4xl md:text-[44px] font-display font-semibold tracking-tight text-foreground leading-tight">
              {heading}
            </h2>
          </div>
          <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
            {description}
          </p>
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

        {/* ── View All Personal Projects CTA ── */}
        <div className="flex justify-center pt-14 md:pt-20">
          <Link
            href="/personal-projects"
            className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[var(--card)] border border-border-subtle/80 hover:border-accent/40 text-sm font-semibold text-foreground hover:text-accent hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
          >
            <span>View all Personal Projects</span>
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
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
