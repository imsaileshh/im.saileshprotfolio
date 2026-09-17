'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, Github, Globe, Terminal } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BrowserPreviewModal } from '@/components/ui/BrowserPreviewModal';

const ease = [0.22, 1, 0.36, 1] as const;

export type PersonalProjectItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category?: string | null;
  year?: string | null;
  technologies?: string[];
  coverUrl: string;
  liveUrl?: string | null;
  githubUrl?: string | null;
  featured?: boolean;
};

function PersonalProjectHomeCard({
  project,
  index,
  onPreview,
}: {
  project: PersonalProjectItem;
  index: number;
  onPreview: (project: PersonalProjectItem) => void;
}) {
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
      <div className="group relative flex flex-col rounded-[22px] bg-[var(--card)] border border-border-subtle/80 hover:border-border-subtle p-3.5 sm:p-4 pb-5 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-[0_14px_40px_rgba(0,0,0,0.25)] text-left w-full">
        
        {/* ── Top: Visual Image Preview ── */}
        <Link
          href={`/personal-projects/${project.slug}`}
          className="relative w-full aspect-[16/10] rounded-[16px] overflow-hidden bg-[#111214] mb-4 block"
        >
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
          {project.year && (
            <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-lg bg-black/45 backdrop-blur-md border border-white/10 text-[11px] font-mono font-medium text-white/90 shadow-sm z-10">
              {project.year}
            </div>
          )}
        </Link>

        {/* ── Meta: Category Label ── */}
        <div className="flex items-center justify-between gap-3 w-full mb-1">
          <span className="text-[11px] font-mono tracking-[0.14em] uppercase text-accent font-semibold truncate">
            {project.category || 'EXPERIMENT'}
          </span>

          <Link
            href={`/personal-projects/${project.slug}`}
            className="w-7 h-7 rounded-full border border-border-subtle/80 flex items-center justify-center text-muted group-hover:text-accent group-hover:border-accent/40 group-hover:bg-accent/10 transition-all duration-200 shrink-0"
          >
            <ArrowUpRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        {/* ── Project Title ── */}
        <h3 className="text-[17px] sm:text-[18px] font-display font-semibold tracking-tight text-foreground leading-snug transition-colors duration-200 group-hover:text-accent line-clamp-1 mb-2">
          <Link href={`/personal-projects/${project.slug}`}>
            {project.title}
          </Link>
        </h3>

        {/* ── Short Description ── */}
        <p className="text-xs sm:text-[13px] text-muted leading-relaxed line-clamp-2 mb-4 flex-1">
          {project.description}
        </p>

        {/* ── Technologies ── */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded-md bg-black/20 dark:bg-white/5 border border-border-subtle text-[11px] font-mono text-muted"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono text-muted">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>
        )}

        {/* ── Bottom External Links ── */}
        <div className="flex items-center justify-between border-t border-border-subtle/60 pt-3 mt-auto">
          <div className="flex items-center gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors"
                title="GitHub Repository"
              >
                <Github size={15} />
              </a>
            )}
            {project.liveUrl && (
              <button
                type="button"
                onClick={() => onPreview(project)}
                className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-white/5 transition-colors cursor-pointer"
                title="Open In-App Live Preview"
              >
                <Globe size={15} />
              </button>
            )}
          </div>

          <Link
            href={`/personal-projects/${project.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
          >
            <span>View Project</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

      </div>
    </motion.div>
  );
}

export function PersonalProjectsSection({
  personalProjects,
}: {
  personalProjects: PersonalProjectItem[];
}) {
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewProject, setPreviewProject] = useState<PersonalProjectItem | null>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-8% 0px' });

  // Handle active index tracking on scroll
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 16 : el.clientWidth * 0.85;
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), personalProjects.length - 1));
  }, [personalProjects.length]);

  const scrollToIndex = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 16 : el.clientWidth * 0.85;
    el.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
  };

  if (!personalProjects || personalProjects.length === 0) return null;

  return (
    <section
      id="personal-projects"
      className="relative py-4 sm:py-6 md:py-8 px-5 sm:px-6 md:px-10 lg:px-16"
    >
      {/* ── Section Header ── */}
      <div
        ref={headerRef}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8"
      >
        <SectionHeader icon={Terminal} className="!mb-0">
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-display font-semibold tracking-tight text-foreground leading-[1.1]">
            Personal Projects
          </h2>
          <p className="text-muted text-[15px] md:text-base mt-2 max-w-md">
            Independent projects, experiments, and things I build.
          </p>
        </SectionHeader>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={headerInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          transition={{ duration: 0.55, delay: 0.15, ease }}
          className="hidden md:block"
        >
          <Link
            href="/personal-projects"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[var(--card)] border border-border-subtle text-[13px] font-semibold text-foreground hover:bg-[var(--nav-active)] hover:border-muted/40 hover:-translate-y-[2px] transition-all duration-200"
          >
            All Personal Projects
            <ArrowUpRight
              size={15}
              className="group-hover:translate-x-[2px] group-hover:-translate-y-[2px] transition-transform duration-200"
            />
          </Link>
        </motion.div>
      </div>

      {/* ── Touch-Swipeable Carousel on Mobile, 3-Column Grid on Desktop ── */}
      <div className="w-full">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{ WebkitOverflowScrolling: 'touch' }}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-5 px-5 sm:-mx-6 sm:px-6 no-scrollbar overscroll-x-contain md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-7 md:mx-0 md:px-0 md:pb-0"
        >
          {personalProjects.slice(0, 3).map((project, i) => (
            <PersonalProjectHomeCard
              key={project.id}
              project={project}
              index={i}
              onPreview={(p) => setPreviewProject(p)}
            />
          ))}
          {/* Spacer for mobile right padding */}
          <div className="w-1 shrink-0 md:hidden" aria-hidden="true"></div>
        </div>

        {/* Subtle Mobile Pagination Dots */}
        {personalProjects.length > 1 && (
          <div className="flex md:hidden items-center justify-center gap-1.5 pt-3 pb-1">
            {personalProjects.slice(0, 3).map((_, idx) => (
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

        {/* Mobile All Personal Projects CTA */}
        <div className="flex md:hidden justify-center mt-5">
          <Link
            href="/personal-projects"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[var(--card)] border border-border-subtle text-[13px] font-semibold text-foreground hover:bg-[var(--nav-active)] transition-all duration-200"
          >
            All Personal Projects
            <ArrowUpRight
              size={14}
              className="group-hover:translate-x-[2px] group-hover:-translate-y-[2px] transition-transform duration-200"
            />
          </Link>
        </div>
      </div>

      {/* Browser Preview Modal */}
      {previewProject && previewProject.liveUrl && (
        <BrowserPreviewModal
          isOpen={!!previewProject}
          onClose={() => setPreviewProject(null)}
          title={`${previewProject.title} — Live Preview`}
          url={previewProject.liveUrl}
          defaultDevice="desktop"
        />
      )}
    </section>
  );
}
