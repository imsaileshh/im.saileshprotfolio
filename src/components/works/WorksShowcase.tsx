'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FolderGit2 } from 'lucide-react';
import { ProjectShowcaseItem } from '@/components/projects/ProjectShowcaseItem';
import { MobileProjectCarousel } from '@/components/projects/MobileProjectCarousel';
import { LivePreviewModal } from './LivePreviewModal';

export interface WorkItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  year: string;
  coverUrl: string;
  technologies: string[];
  liveUrl?: string | null;
  previewMode?: 'iframe' | 'external' | string | null;
  previewImageUrl?: string | null;
  hasCaseStudy?: boolean;
  caseStudySlug?: string | null;
}

const DEFAULT_CATEGORIES = [
  'All',
  'Web Development',
  'E-commerce',
  'UI/UX',
];

export interface WorksShowcaseProps {
  works: WorkItem[];
  categories?: string[];
  showCategoryBar?: boolean;
}

export function WorksShowcase({
  works,
  categories,
  showCategoryBar = true,
}: WorksShowcaseProps) {
  // Ensure 'All' is always the first option and categories are unique
  const finalCategories = useMemo(() => {
    const list = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
    const withoutAll = list.filter((c) => c.toLowerCase() !== 'all');
    return ['All', ...Array.from(new Set(withoutAll))];
  }, [categories]);

  const [activeCategory, setActiveCategory] = useState<string>('All');

  /* ── Live Preview Browser Modal state ── */
  const [livePreviewWork, setLivePreviewWork] = useState<{ title: string; liveUrl?: string | null } | null>(null);

  /* ── Open / Close Live Preview ── */
  const openLivePreview = useCallback((work: { title: string; liveUrl?: string | null }) => {
    setLivePreviewWork(work);
  }, []);

  const closeLivePreview = useCallback(() => {
    setLivePreviewWork(null);
  }, []);

  /* ── Filter works by category ── */
  const filteredWorks = useMemo(() => {
    if (!activeCategory || activeCategory.toLowerCase() === 'all') {
      return works;
    }

    return works.filter((work) => {
      const cat = (work.category || '').toLowerCase();
      const title = (work.title || '').toLowerCase();
      const activeLower = activeCategory.toLowerCase();

      if (activeLower === 'case studies') {
        return work.hasCaseStudy || cat.includes('case study') || cat.includes('study');
      }
      if (activeLower === 'web development') {
        return (
          cat.includes('web') ||
          cat.includes('frontend') ||
          cat.includes('fullstack') ||
          cat.includes('development') ||
          cat.includes('app') ||
          cat.includes('selected work') ||
          cat.includes('website')
        );
      }
      if (activeLower === 'e-commerce' || activeLower === 'ecommerce') {
        return (
          cat.includes('commerce') ||
          cat.includes('shopify') ||
          cat.includes('store') ||
          title.includes('store') ||
          title.includes('commerce')
        );
      }
      if (activeLower === 'ui/ux' || activeLower === 'ui' || activeLower === 'ux') {
        return cat.includes('ui') || cat.includes('ux') || cat.includes('design') || cat.includes('product');
      }

      return cat === activeLower || cat.includes(activeLower) || activeLower.includes(cat);
    });
  }, [works, activeCategory]);

  return (
    <>
      <div className="w-full">
        {/* ── Page Header: Icon + Works + Centered Subtitle ── */}
        <div className="text-center max-w-[760px] mx-auto mb-9 md:mb-11">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-3.5">
            <FolderGit2 className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-accent shrink-0" />
            <h1 className="text-3xl sm:text-4xl md:text-[44px] font-display font-semibold tracking-tight text-foreground leading-tight">
              Works
            </h1>
          </div>
          <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
            Client projects, production web applications, e-commerce stores, and digital products.
          </p>
        </div>

        {/* ── Category Filters (Secondary, Compact, Centered) ── */}
        {showCategoryBar && finalCategories.length > 0 && works.length > 0 && (
          <div className="mb-12 md:mb-16 border-b border-border-subtle/40 pb-5">
            <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              {finalCategories.map((category) => {
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
        {filteredWorks.length > 0 ? (
          <>
            {/* Desktop / Tablet: Alternating editorial rows (>=768px) */}
            <div className="hidden md:block space-y-20 md:space-y-28 lg:space-y-36">
              {filteredWorks.map((work, idx) => (
                <ProjectShowcaseItem
                  key={work.id}
                  project={work}
                  index={idx}
                  projectType="work"
                  onLivePreview={openLivePreview}
                />
              ))}
            </div>

            {/* Mobile (<768px): Touch swipe carousel + pagination dots */}
            <div className="block md:hidden w-full">
              <MobileProjectCarousel
                projects={filteredWorks}
                projectType="work"
                onLivePreview={openLivePreview}
              />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border-subtle bg-[var(--card)] p-12 text-center">
            <FolderGit2 size={28} className="mx-auto text-accent mb-3" />
            <p className="text-sm text-muted">No projects in this category yet.</p>
          </div>
        )}
      </div>

      {/* ── Browser Live Preview Modal ── */}
      {livePreviewWork && livePreviewWork.liveUrl && (
        <LivePreviewModal
          open={Boolean(livePreviewWork)}
          url={livePreviewWork.liveUrl}
          title={livePreviewWork.title}
          onClose={closeLivePreview}
        />
      )}
    </>
  );
}
