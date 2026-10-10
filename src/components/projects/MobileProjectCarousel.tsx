'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ProjectShowcaseItem, ShowcaseProjectItem } from './ProjectShowcaseItem';

export interface MobileProjectCarouselProps {
  projects: ShowcaseProjectItem[];
  projectType?: 'work' | 'personal';
  onLivePreview?: (project: { title: string; liveUrl?: string | null }) => void;
}

export function MobileProjectCarousel({
  projects,
  projectType = 'work',
  onLivePreview,
}: MobileProjectCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const isInteractingRef = useRef(false);

  // Reset to slide 0 when projects list or filter changes
  useEffect(() => {
    activeIndexRef.current = 0;
    setActiveIndex(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'instant' });
    }
  }, [projects]);

  const rafId = useRef<number | null>(null);
  const slideWidthRef = useRef<number>(0);

  // Cache container width and update on resize to avoid reading layout on scroll
  useEffect(() => {
    const updateWidth = () => {
      if (scrollRef.current) {
        slideWidthRef.current = scrollRef.current.clientWidth;
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth, { passive: true });
    return () => {
      window.removeEventListener('resize', updateWidth);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  // Track active slide accurately based on scroll position (batched via RAF, no forced reflow)
  const handleScroll = useCallback(() => {
    if (rafId.current !== null) return;
    rafId.current = window.requestAnimationFrame(() => {
      rafId.current = null;
      const container = scrollRef.current;
      if (!container) return;

      let slideWidth = slideWidthRef.current;
      if (!slideWidth) {
        slideWidth = container.clientWidth;
        slideWidthRef.current = slideWidth;
      }
      if (!slideWidth) return;

      const scrollLeft = container.scrollLeft;
      const newIndex = Math.round(scrollLeft / slideWidth);
      const clampedIndex = Math.max(0, Math.min(newIndex, projects.length - 1));

      if (clampedIndex !== activeIndexRef.current) {
        activeIndexRef.current = clampedIndex;
        setActiveIndex(clampedIndex);
      }
    });
  }, [projects.length]);

  // Click on pagination dot smoothly scrolls to the target slide
  const scrollToSlide = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    let slideWidth = slideWidthRef.current;
    if (!slideWidth) {
      slideWidth = container.clientWidth;
      slideWidthRef.current = slideWidth;
    }
    container.scrollTo({
      left: index * slideWidth,
      behavior: 'smooth',
    });

    activeIndexRef.current = index;
    setActiveIndex(index);
  }, []);

  if (!projects || projects.length === 0) return null;

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden">
      {/* ── Native CSS Scroll Snapping Touch Carousel ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth overscroll-x-contain no-scrollbar scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {projects.map((project, idx) => (
          <div
            key={project.id || idx}
            className="flex-none w-full min-w-0 snap-start snap-always"
          >
            <ProjectShowcaseItem
              project={project}
              index={idx}
              projectType={projectType}
              onLivePreview={onLivePreview}
              isCarousel
            />
          </div>
        ))}
      </div>

      {/* ── Minimal Clickable Pagination Dots ── */}
      {projects.length > 1 && (
        <div
          className="flex items-center justify-center gap-2 pt-6 pb-2"
          role="tablist"
          aria-label="Project slide navigation"
        >
          {projects.map((project, idx) => {
            const isActive = idx === activeIndex;

            return (
              <button
                key={project.id || idx}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`Go to project ${idx + 1}: ${project.title}`}
                onClick={() => scrollToSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? 'w-2 h-2 bg-accent shadow-xs'
                    : 'w-1.5 h-1.5 bg-muted/40 hover:bg-muted/70'
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
