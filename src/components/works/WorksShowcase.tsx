'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FolderGit2 } from 'lucide-react';
import { CaseStudyMorphModal, OriginRect, CaseStudyModalWork } from './CaseStudyMorphModal';
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

const CATEGORIES = [
  'Case Studies',
  'Web Development',
  'E-commerce',
  'UI/UX',
] as const;

type CategoryType = typeof CATEGORIES[number];

export function WorksShowcase({ works }: { works: WorkItem[] }) {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('Web Development');

  /* ── Case Study Modal state ── */
  const [selectedWork, setSelectedWork] = useState<CaseStudyModalWork | null>(null);
  const [originRect, setOriginRect] = useState<OriginRect | null>(null);

  /* ── Live Preview Browser Modal state ── */
  const [livePreviewWork, setLivePreviewWork] = useState<WorkItem | null>(null);

  /* Map of work.id → card article element ref */
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

  const setCardRef = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) {
      cardRefs.current.set(id, el);
    } else {
      cardRefs.current.delete(id);
    }
  }, []);

  /* Open modal with captured origin bounding rect */
  const openModal = useCallback((work: WorkItem) => {
    const cardEl = cardRefs.current.get(work.id);
    if (cardEl) {
      const rect = cardEl.getBoundingClientRect();
      setOriginRect({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
    } else {
      setOriginRect(null);
    }
    setSelectedWork({
      id: work.id,
      title: work.title,
      slug: work.slug,
      description: work.description,
      category: work.category,
      year: work.year,
      coverUrl: work.coverUrl,
      technologies: work.technologies,
      liveUrl: work.liveUrl,
      hasCaseStudy: work.hasCaseStudy,
      caseStudySlug: work.caseStudySlug ?? work.slug,
    });
  }, []);

  const closeModal = useCallback(() => {
    setSelectedWork(null);
    setOriginRect(null);
  }, []);

  /* ── Open / Close Live Preview ── */
  const openLivePreview = useCallback((work: WorkItem) => {
    setLivePreviewWork(work);
  }, []);

  const closeLivePreview = useCallback(() => {
    setLivePreviewWork(null);
  }, []);

  /* ── Filter works by category ── */
  const filteredWorks = useMemo(() => {
    return works.filter((work) => {
      const cat = (work.category || '').toLowerCase();
      const title = (work.title || '').toLowerCase();

      if (activeCategory === 'Case Studies') {
        return work.hasCaseStudy || cat.includes('case study') || cat.includes('study');
      }
      if (activeCategory === 'Web Development') {
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
      if (activeCategory === 'E-commerce') {
        return cat.includes('commerce') || cat.includes('shopify') || cat.includes('store') || title.includes('store') || title.includes('commerce');
      }
      if (activeCategory === 'UI/UX') {
        return cat.includes('ui') || cat.includes('ux') || cat.includes('design') || cat.includes('product');
      }

      return false;
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

          {/* ── Small Minimal Category Filter (No "All", 4 Categories) ── */}
          {works.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {CATEGORIES.map((category) => {
                const isActive = activeCategory === category;

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
                    setCardRef={setCardRef}
                    onOpenCaseStudy={openModal}
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

      {/* ── Apple-style Morphing Case Study Modal ── */}
      <CaseStudyMorphModal
        work={selectedWork}
        originRect={originRect}
        onClose={closeModal}
      />

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
