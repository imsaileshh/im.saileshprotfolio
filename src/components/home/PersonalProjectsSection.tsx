'use client';

import { useState } from 'react';
import { Terminal } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ProjectShowcaseItem, ShowcaseProjectItem } from '@/components/projects/ProjectShowcaseItem';
import { MobileProjectCarousel } from '@/components/projects/MobileProjectCarousel';
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader';

const LivePreviewModal = dynamic(
  () => import('@/components/works/LivePreviewModal').then((m) => m.LivePreviewModal)
);

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
        <HomeSectionHeader
          icon={Terminal}
          heading={heading}
          viewAllHref="/personal-projects"
          actionText="All Personal Projects"
          isPersonal={true}
        />

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
