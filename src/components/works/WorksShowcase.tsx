'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FolderGit2 } from 'lucide-react';
import { WorkCard } from './WorkCard';
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
  const [livePreviewWork, setLivePreviewWork] = useState<WorkItem | null>(null);

  /* ── Open / Close Live Preview ── */
  const openLivePreview = useCallback((work: WorkItem) => {
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

      // Exact or partial match for any custom category (e.g. "Mobile Apps", "SaaS", "Branding")
      return cat === activeLower || cat.includes(activeLower) || activeLower.includes(cat);
    });
  }, [works, activeCategory]);

  return (
    <>
      <div className="space-y-10">

        {/* ── Page Header: Works + Short Description ── */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-display font-semibold tracking-tight text-foreground leading-[1.1]">
            Works
          </h1>
          <p className="text-muted text-sm sm:text-base leading-relaxed font-normal">
            Client projects, production web applications, e-commerce stores, and digital products.
          </p>

          {/* ── Category Filter Bar (Supports Hide / Unhide & All Option) ── */}
          {showCategoryBar && finalCategories.length > 0 && works.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {finalCategories.map((category) => {
                const isActive = activeCategory.toLowerCase() === category.toLowerCase();

                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-foreground text-[var(--bg)] font-medium shadow-xs'
                        : 'border border-border-subtle bg-[var(--card)] text-muted hover:text-foreground hover:bg-[var(--nav-active)]'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Works Carousel on Mobile, Grid on Desktop (md+) ── */}
        {filteredWorks.length > 0 ? (
          <div className="w-full overflow-visible">
            <div
              style={{ WebkitOverflowScrolling: 'touch' }}
              className="flex w-full gap-4 overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-smooth overscroll-x-contain no-scrollbar scrollbar-hide px-4 pb-4 -mx-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-7 lg:gap-8 md:overflow-visible md:px-0 md:mx-0 md:pb-0"
            >
              {filteredWorks.map((work, idx) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: (idx % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="w-[82vw] min-w-[82vw] max-w-[330px] shrink-0 snap-start md:w-auto md:min-w-0 md:max-w-none md:shrink md:snap-align-none flex"
                >
                  <WorkCard
                    work={work}
                    index={idx}
                    onOpenLivePreview={openLivePreview}
                  />
                </motion.div>
              ))}
              {/* Spacer for right edge swipe padding on mobile */}
              <div className="w-1 shrink-0 md:hidden" aria-hidden="true" />
            </div>
          </div>
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
