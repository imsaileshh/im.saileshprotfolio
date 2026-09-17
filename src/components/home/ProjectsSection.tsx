'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, Briefcase } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';

const ease = [0.22, 1, 0.36, 1] as const;

function ProjectGridCard({
  project,
  index,
}: {
  project: any;
  index: number;
}) {
  const targetHref = `/works/${project.slug}`;
  const fallbackImg = `/images/projects/project${(index % 4) + 1}.svg`;
  const [imgSrc, setImgSrc] = useState(project.coverUrl || fallbackImg);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100% 0px 100% 0px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease }}
      className="flex shrink-0 w-[85vw] sm:w-[340px] snap-start md:w-full md:max-w-none"
    >
      <Link
        href={targetHref}
        className="group relative w-full flex flex-col rounded-[22px] bg-[var(--card)] border border-border-subtle/80 hover:border-border-subtle p-3.5 sm:p-4 pb-5 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-[0_14px_40px_rgba(0,0,0,0.25)] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent overflow-hidden block"
      >
        {/* ── Top: Visual Image Container ── */}
        <div className="relative w-full aspect-square rounded-[16px] overflow-hidden bg-[#111214] mb-4">
          <Image
            src={imgSrc}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => {
              if (imgSrc !== fallbackImg) setImgSrc(fallbackImg);
            }}
          />

          {/* Top-Right Year Pill Badge */}
          <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-lg bg-black/45 backdrop-blur-md border border-white/10 text-[11px] font-mono font-medium text-white/90 shadow-sm z-10">
            {project.year || '2024'}
          </div>
        </div>

        {/* ── Bottom: Category Label + Arrow Action ── */}
        <div className="flex items-center justify-between gap-3 w-full mb-1">
          <span className="text-[11px] font-mono tracking-[0.14em] uppercase text-muted font-medium transition-colors duration-200 group-hover:text-accent truncate">
            {project.category || 'CASE STUDY'}
          </span>

          <div className="w-7 h-7 rounded-full border border-border-subtle/80 flex items-center justify-center text-muted group-hover:text-accent group-hover:border-accent/40 group-hover:bg-accent/10 transition-all duration-200 shrink-0">
            <ArrowUpRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>

        {/* ── Project Title ── */}
        <h3 className="text-[17px] sm:text-[18px] font-display font-semibold tracking-tight text-foreground leading-snug transition-colors duration-200 group-hover:text-accent line-clamp-1">
          {project.title}
        </h3>
      </Link>
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function ProjectsSection({ projects }: { projects: any[] }) {
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const headerInView = useInView(headerRef, { once: true, margin: '-8% 0px' });

  // Handle active index tracking on scroll
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 16 : el.clientWidth * 0.85;
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), projects.length - 1));
  }, [projects.length]);

  const scrollToIndex = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 16 : el.clientWidth * 0.85;
    el.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
  };

  return (
    <section
      id="projects"
      className="relative py-4 sm:py-6 md:py-8 px-5 sm:px-6 md:px-10 lg:px-16 overflow-hidden md:overflow-visible"
    >
      {/* ── Section header ── */}
      <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
        <SectionHeader icon={Briefcase} className="!mb-0">
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-display font-semibold tracking-tight text-foreground leading-[1.1]">
            Works
          </h2>
          <p className="text-muted text-[15px] md:text-base mt-2 max-w-sm">
            A curated collection of work that tells a story.
          </p>
        </SectionHeader>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={headerInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          transition={{ duration: 0.55, delay: 0.15, ease }}
          className="hidden md:block"
        >
          <Link
            href="/works"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[var(--card)] border border-border-subtle text-[13px] font-semibold text-foreground hover:bg-[var(--nav-active)] hover:border-muted/40 hover:-translate-y-[2px] transition-all duration-200"
          >
            All Works
            <ArrowUpRight
              size={15}
              className="group-hover:translate-x-[2px] group-hover:-translate-y-[2px] transition-transform duration-200"
            />
          </Link>
        </motion.div>
      </div>

      {/* ── Layout: Touch-Swipeable on Mobile (with peek), 3-Column Grid on Tablet/Desktop ── */}
      {projects.length > 0 ? (
        <div className="w-full">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            style={{ WebkitOverflowScrolling: 'touch' }}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-5 px-5 sm:-mx-6 sm:px-6 no-scrollbar overscroll-x-contain md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-7 md:mx-0 md:px-0 md:pb-0"
          >
            {projects.map((project, i) => (
              <ProjectGridCard
                key={project.id ?? i}
                project={project}
                index={i}
              />
            ))}
            {/* Spacer for mobile right padding */}
            <div className="w-1 shrink-0 md:hidden" aria-hidden="true"></div>
          </div>

          {/* Subtle Mobile Pagination Dots */}
          {projects.length > 1 && (
            <div className="flex md:hidden items-center justify-center gap-1.5 pt-3 pb-1">
              {projects.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeIndex
                      ? 'w-6 bg-accent'
                      : 'w-1.5 bg-muted/30 hover:bg-muted/60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Mobile All Works CTA */}
          <div className="flex md:hidden justify-center mt-5">
            <Link
              href="/works"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[var(--card)] border border-border-subtle text-[13px] font-semibold text-foreground hover:bg-[var(--nav-active)] transition-all duration-200"
            >
              All Works
              <ArrowUpRight
                size={14}
                className="group-hover:translate-x-[2px] group-hover:-translate-y-[2px] transition-transform duration-200"
              />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border-subtle rounded-2xl">
          <p className="text-muted text-sm">No featured works yet.</p>
        </div>
      )}
    </section>
  );
}
