'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FolderGit2, ArrowUpRight, Globe } from 'lucide-react';
import Link from 'next/link';
import { ProjectCover } from '@/components/projects/ProjectCover';
import { getTechLogo } from '@/lib/stack/tech-logos';
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

        {/* ── Editorial Project Rows (Alternating Layout) ── */}
        {filteredWorks.length > 0 ? (
          <div className="space-y-20 md:space-y-28 lg:space-y-36">
            {filteredWorks.map((work, idx) => {
              const projectNum = String(idx + 1).padStart(2, '0');
              const isEven = idx % 2 === 0;
              const detailHref = work.hasCaseStudy && work.caseStudySlug
                ? `/works/${work.caseStudySlug}`
                : `/works/${work.slug}`;

              return (
                <motion.article
                  key={work.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center text-left"
                >
                  {/* ── IMAGE COLUMN ──
                      Mobile: Always order-1 (on top)
                      Desktop: order-1 if isEven (Left), order-2 if isOdd (Right)
                  */}
                  <div
                    className={`w-full order-1 ${
                      isEven ? 'md:order-1 md:col-span-6 lg:col-span-7' : 'md:order-2 md:col-span-6 lg:col-span-7'
                    }`}
                  >
                    <Link href={detailHref} className="block group/img relative">
                      <div className="relative w-full rounded-[18px] sm:rounded-[22px] overflow-hidden border border-border-subtle/60 bg-[var(--card)] transition-all duration-300 group-hover/img:border-border-subtle group-hover/img:shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
                        {/* Project Number Badge Overlay */}
                        <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-xs font-mono font-medium text-white tracking-widest">
                          {projectNum}
                        </div>

                        {/* Cover Image */}
                        <ProjectCover
                          src={work.coverUrl}
                          alt={work.title}
                          aspectRatio="16/10"
                          className="w-full"
                          imageClassName="transition-transform duration-500 ease-out group-hover/img:scale-[1.02]"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 720px"
                          fallbackSrc={`/images/projects/project${(idx % 4) + 1}.svg`}
                        />
                      </div>
                    </Link>
                  </div>

                  {/* ── CONTENT COLUMN ──
                      Mobile: Always order-2 (below image)
                      Desktop: order-2 if isEven (Right), order-1 if isOdd (Left)
                  */}
                  <div
                    className={`w-full order-2 flex flex-col justify-center ${
                      isEven ? 'md:order-2 md:col-span-6 lg:col-span-5' : 'md:order-1 md:col-span-6 lg:col-span-5'
                    }`}
                  >
                    {/* Category Tags + Year */}
                    <div className="flex items-center gap-3 mb-2.5">
                      <span className="text-xs font-mono tracking-[0.16em] uppercase text-accent font-semibold">
                        {work.category}
                      </span>
                      {work.year && (
                        <span className="text-[11px] font-mono text-muted/60">
                          • {work.year}
                        </span>
                      )}
                    </div>

                    {/* Project Title */}
                    <Link href={detailHref}>
                      <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-display font-semibold tracking-tight text-foreground hover:text-accent transition-colors duration-200 mb-3.5 leading-snug">
                        {work.title}
                      </h2>
                    </Link>

                    {/* Project Description */}
                    <p className="text-sm sm:text-base text-muted leading-relaxed font-normal max-w-[520px] mb-6">
                      {work.description}
                    </p>

                    {/* Tools / Technologies Badges */}
                    {work.technologies && work.technologies.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-7">
                        <span className="text-xs font-mono text-muted/70 mr-1">Tools:</span>
                        {work.technologies.slice(0, 5).map((tech) => {
                          const logo = getTechLogo(tech);

                          return (
                            <span
                              key={tech}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--card)] border border-border-subtle/70 text-[11px] font-mono text-foreground/90"
                            >
                              {logo && (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={logo.url}
                                  alt=""
                                  width={12}
                                  height={12}
                                  className="w-3 h-3 object-contain shrink-0"
                                  style={logo.filter ? { filter: logo.filter } : undefined}
                                />
                              )}
                              <span>{tech}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* CTAs */}
                    <div className="flex flex-wrap items-center gap-5 pt-1">
                      {work.hasCaseStudy ? (
                        <Link
                          href={detailHref}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent transition-colors duration-200 group/link border-b border-foreground/20 hover:border-accent pb-0.5"
                        >
                          <span>View case study</span>
                          <ArrowUpRight size={16} className="transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                        </Link>
                      ) : (
                        <Link
                          href={detailHref}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent transition-colors duration-200 group/link border-b border-foreground/20 hover:border-accent pb-0.5"
                        >
                          <span>View project</span>
                          <ArrowUpRight size={16} className="transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                        </Link>
                      )}

                      {work.liveUrl && (
                        <button
                          type="button"
                          onClick={() => openLivePreview(work)}
                          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-accent transition-colors cursor-pointer"
                        >
                          <Globe size={13} />
                          <span>Live Preview</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
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
