'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, Briefcase } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProjectCover } from '@/components/projects/ProjectCover';
import { getTechLogo } from '@/lib/stack/tech-logos';

const ease = [0.22, 1, 0.36, 1] as const;

export interface ProjectCardItem {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  description?: string | null;
  category?: string | null;
  year?: string | null;
  tags?: string[];
  technologies?: string[];
  [key: string]: unknown;
}

function ProjectGridCard({
  project,
  index,
}: {
  project: ProjectCardItem;
  index: number;
}) {
  const targetHref = `/works/${project.slug}`;
  const fallbackImg = `/images/projects/project${(index % 4) + 1}.svg`;

  // Extract up to 3 tags/technologies for preview
  const rawTags = (Array.isArray(project.technologies) && project.technologies.length > 0)
    ? project.technologies
    : (Array.isArray(project.tags) && project.tags.length > 0)
    ? project.tags
    : [];
  const displayTags = rawTags.filter(Boolean).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease }}
      className="w-[82vw] min-w-[82vw] max-w-[330px] shrink-0 snap-start md:w-auto md:min-w-0 md:max-w-none md:shrink md:snap-align-none flex"
    >
      <Link
        href={targetHref}
        className="group relative w-full flex flex-col justify-between rounded-[22px] bg-[var(--card)] border border-border-subtle/80 hover:border-accent/40 p-4 sm:p-5 md:p-6 transition-all duration-300 hover:-translate-y-1.5 shadow-md hover:shadow-[0_20px_44px_rgba(0,0,0,0.35)] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent overflow-hidden h-auto"
      >
        <div className="flex flex-col flex-1">
          {/* ── Visual Image Container ── */}
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-[16px] bg-zinc-900/80 border border-white/[0.08] mb-4">
            <ProjectCover
              src={project.coverUrl}
              alt={project.title}
              aspectRatio="16/9"
              className="w-full h-full"
              imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 420px"
              fallbackSrc={fallbackImg}
            />

            {/* Top Right Year Pill */}
            <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10.5px] font-mono text-white/90 shadow-sm z-10">
              {project.year || '2026'}
            </div>
          </div>

          {/* ── Category Label ── */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-mono tracking-[0.14em] uppercase text-accent font-semibold">
              {project.category || 'CASE STUDY'}
            </span>
          </div>

          {/* ── Title ── */}
          <h3 className="text-base sm:text-lg md:text-xl font-display font-semibold text-foreground tracking-tight group-hover:text-accent transition-colors duration-200 leading-snug mb-2 line-clamp-2">
            {project.title}
          </h3>

          {/* ── Description ── */}
          {project.description && (
            <p className="text-xs sm:text-sm text-muted leading-relaxed font-normal line-clamp-2 mb-4">
              {project.description}
            </p>
          )}

          {/* ── Technology Tags with Devicon Icons ── */}
          {displayTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-4 mt-auto">
              {displayTags.map((tag) => {
                const logo = getTechLogo(tag);
                return (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--sidebar)] border border-border-subtle/60 text-[11px] font-mono text-foreground"
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
                    <span>{tag}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer CTA Action Bar ── */}
        <div className="flex items-center justify-between pt-3.5 border-t border-border-subtle/50 mt-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
            <span>Explore Work</span>
            <ArrowUpRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 group-hover:border-accent/40 group-hover:bg-accent/10 group-hover:text-accent transition-all duration-200">
            <ArrowUpRight size={13} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function ProjectsSection({
  projects,
  label,
  heading = 'Works',
  description = 'A curated collection of work that tells a story.',
}: {
  projects: ProjectCardItem[];
  label?: string;
  heading?: string;
  description?: string;
}) {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-8% 0px' });

  // Display top 3 cards in the Works section
  const displayProjects = projects.slice(0, 3);

  return (
    <section
      id="projects"
      className="relative py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-10 lg:px-16 overflow-visible w-full"
    >
      {/* ── Section header ── */}
      <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8 w-full">
        <SectionHeader icon={Briefcase} className="!mb-0">
          {label && (
            <span className="text-[11px] font-mono font-medium tracking-[0.18em] uppercase text-accent mb-1 block">
              {label}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-display font-semibold tracking-tight text-foreground leading-[1.1]">
            {heading}
          </h2>
          <p className="text-muted text-[15px] md:text-base mt-2 max-w-lg">
            {description}
          </p>
        </SectionHeader>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={headerInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          transition={{ duration: 0.55, delay: 0.15, ease }}
          className="hidden md:block shrink-0"
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

      {/* ── Mobile Horizontal Swipe Carousel, Desktop Grid ── */}
      {displayProjects.length > 0 ? (
        <div className="w-full overflow-visible">
          <div
            style={{ WebkitOverflowScrolling: 'touch' }}
            className="flex w-full gap-4 overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-smooth overscroll-x-contain no-scrollbar scrollbar-hide px-4 pb-4 -mx-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8 md:overflow-visible md:px-0 md:mx-0 md:pb-0"
          >
            {displayProjects.map((project, i) => (
              <ProjectGridCard
                key={project.id ?? i}
                project={project}
                index={i}
              />
            ))}
            {/* Right edge swipe spacer */}
            <div className="w-1 shrink-0 md:hidden" aria-hidden="true" />
          </div>

          {/* Mobile All Works CTA */}
          <div className="flex md:hidden justify-center mt-8">
            <Link
              href="/works"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-[var(--card)] border border-border-subtle text-[13px] font-semibold text-foreground hover:bg-[var(--nav-active)] transition-all duration-200"
            >
              All Works
              <ArrowUpRight
                size={15}
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
