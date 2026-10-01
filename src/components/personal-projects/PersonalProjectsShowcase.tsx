'use client';

import { useState, useMemo, useCallback } from 'react';
import { Terminal, FolderGit2 } from 'lucide-react';
import { ProjectShowcaseItem } from '@/components/projects/ProjectShowcaseItem';
import { MobileProjectCarousel } from '@/components/projects/MobileProjectCarousel';
import { LivePreviewModal } from '@/components/works/LivePreviewModal';

export interface PersonalProjectItem {
  id: string;
  title: string;
  slug: string;
  category?: string | null;
  year?: string | null;
  description?: string | null;
  technologies?: string[] | null;
  tags?: string[] | null;
  coverUrl: string;
  liveUrl?: string | null;
  githubUrl?: string | null;
  hasCaseStudy?: boolean;
  caseStudySlug?: string | null;
  projectType?: 'work' | 'personal';
}

const DEFAULT_CATEGORIES = [
  'All',
  'Case Studies',
  'Web Development',
  'Tools',
  'Experiments',
  'UI/UX',
];

interface PersonalProjectsShowcaseProps {
  projects: PersonalProjectItem[];
  categories?: string[];
  showCategoryBar?: boolean;
}

export function PersonalProjectsShowcase({
  projects,
  categories: propCategories,
  showCategoryBar = true,
}: PersonalProjectsShowcaseProps) {
  const [previewItem, setPreviewItem] = useState<{ title: string; url: string } | null>(null);

  const openLivePreview = useCallback((project: { title: string; liveUrl?: string | null }) => {
    if (project.liveUrl) {
      setPreviewItem({ title: project.title, url: project.liveUrl });
    }
  }, []);

  const closeLivePreview = useCallback(() => {
    setPreviewItem(null);
  }, []);

  // Normalize categories list with 'All' first
  const displayCategories = useMemo(() => {
    const list = propCategories && propCategories.length > 0 ? propCategories : DEFAULT_CATEGORIES;
    const normalized = Array.from(new Set(list.map((c) => c.trim()).filter(Boolean)));
    const withoutAll = normalized.filter((c) => c.toLowerCase() !== 'all');
    return ['All', ...withoutAll];
  }, [propCategories]);

  // Default active category to 'All'
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Filter projects dynamically based on categories
  const filteredProjects = useMemo(() => {
    if (activeCategory.toLowerCase() === 'all') {
      return projects;
    }

    const filtered = projects.filter((project) => {
      const cat = (project.category || '').toLowerCase();
      const title = (project.title || '').toLowerCase();
      const tech = (project.technologies || []).map((t) => t.toLowerCase());
      const activeLower = activeCategory.toLowerCase();

      // Direct exact or substring match with project category
      if (cat === activeLower || cat.includes(activeLower) || activeLower.includes(cat)) {
        return true;
      }

      // Semantic matching for standard categories
      if (activeLower === 'case studies' || activeLower === 'case study') {
        return (
          cat.includes('case') ||
          cat.includes('study') ||
          cat.includes('redesign') ||
          title.includes('case')
        );
      }
      if (activeLower === 'web development' || activeLower === 'web') {
        return (
          cat.includes('web') ||
          cat.includes('frontend') ||
          cat.includes('fullstack') ||
          cat.includes('personal project') ||
          cat.includes('site') ||
          cat.includes('app') ||
          tech.some((t) => t.includes('react') || t.includes('next') || t.includes('typescript') || t.includes('node'))
        );
      }
      if (activeLower === 'tools' || activeLower === 'tool') {
        return (
          cat.includes('tool') ||
          cat.includes('cli') ||
          cat.includes('util') ||
          cat.includes('devtool') ||
          title.includes('cli') ||
          title.includes('tool') ||
          tech.some((t) => t.includes('rust') || t.includes('go') || t.includes('cli'))
        );
      }
      if (activeLower === 'experiments' || activeLower === 'experiment') {
        return (
          cat.includes('experiment') ||
          cat.includes('open source') ||
          cat.includes('proto') ||
          cat.includes('lab') ||
          title.includes('engine') ||
          title.includes('gen')
        );
      }
      if (activeLower === 'ui/ux' || activeLower === 'ui' || activeLower === 'ux') {
        return (
          cat.includes('ui') ||
          cat.includes('ux') ||
          cat.includes('design') ||
          cat.includes('motion') ||
          tech.some((t) => t.includes('framer') || t.includes('tailwind') || t.includes('motion') || t.includes('figma'))
        );
      }

      return false;
    });

    return filtered;
  }, [projects, activeCategory]);

  return (
    <>
      <div className="w-full">
        {/* ── Page Header: Icon + Title + Centered Subtitle ── */}
        <div className="text-center max-w-[760px] mx-auto mb-9 md:mb-11">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-3.5">
            <Terminal className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-accent shrink-0" />
            <h1 className="text-3xl sm:text-4xl md:text-[44px] font-display font-semibold tracking-tight text-foreground leading-tight">
              Personal Projects
            </h1>
          </div>
          <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
            Independent projects, experiments and digital products created to explore design, development and interaction.
          </p>
        </div>

        {/* ── Category Filters (Secondary, Compact, Centered) ── */}
        {showCategoryBar && displayCategories.length > 0 && projects.length > 0 && (
          <div className="mb-12 md:mb-16 border-b border-border-subtle/40 pb-5">
            <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              {displayCategories.map((category) => {
                const isActive = activeCategory.toLowerCase() === category.toLowerCase();

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-foreground text-[var(--bg)] font-medium shadow-xs'
                        : 'border border-border-subtle/60 text-muted hover:text-foreground hover:bg-[var(--card)]'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Editorial Project Rows: Desktop Alternating / Mobile Swipe Carousel ── */}
        {filteredProjects.length > 0 ? (
          <>
            {/* Desktop / Tablet: Alternating editorial rows (>=768px) */}
            <div className="hidden md:block space-y-20 md:space-y-28 lg:space-y-36">
              {filteredProjects.map((project, idx) => (
                <ProjectShowcaseItem
                  key={project.id || idx}
                  project={project}
                  index={idx}
                  projectType="personal"
                  onLivePreview={openLivePreview}
                />
              ))}
            </div>

            {/* Mobile (<768px): Touch swipe carousel + pagination dots */}
            <div className="block md:hidden w-full">
              <MobileProjectCarousel
                projects={filteredProjects}
                projectType="personal"
                onLivePreview={openLivePreview}
              />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border-subtle bg-[var(--card)] p-12 text-center">
            <FolderGit2 size={28} className="mx-auto text-accent mb-3" />
            <p className="text-sm text-muted">No personal projects in this category yet.</p>
          </div>
        )}
      </div>

      {/* ── Browser Live Preview Modal ── */}
      {previewItem && previewItem.url && (
        <LivePreviewModal
          open={Boolean(previewItem)}
          url={previewItem.url}
          title={previewItem.title}
          onClose={closeLivePreview}
        />
      )}
    </>
  );
}
