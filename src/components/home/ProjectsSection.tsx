'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, Briefcase } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProjectCover } from '@/components/projects/ProjectCover';

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
      viewport={{ once: true, margin: '100% 0px 100% 0px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease }}
      className="w-full flex"
    >
      <Link
        href={targetHref}
        className="group relative w-full flex flex-col justify-between rounded-[20px] bg-[#1a1b1e] dark:bg-[var(--card)] bg-gradient-to-b from-white/[0.035] to-transparent border border-white/[0.08] hover:border-white/[0.18] p-3.5 sm:p-4 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent overflow-hidden"
      >
        <div>
          {/* ── Top: Visual Image Container ── */}
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-[14px] bg-zinc-900 border border-white/[0.06] mb-3.5 sm:mb-4">
            <ProjectCover
              src={project.coverUrl}
              alt={project.title}
              aspectRatio="16/9"
              className="w-full h-full"
              imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
              fallbackSrc={fallbackImg}
            />
          </div>

          {/* ── Meta: Category Label & Year ── */}
          <div className="flex items-center justify-between gap-3 w-full">
            <span className="text-[10.5px] font-mono tracking-[0.16em] uppercase text-zinc-400 font-medium transition-colors duration-200 group-hover:text-accent truncate">
              {project.category || 'CASE STUDY'}
            </span>

            <span className="text-xs font-mono text-zinc-500 shrink-0">
              {project.year || '2026'}
            </span>
          </div>

          {/* ── Title & Interactive Arrow Button ── */}
          <div className="mt-2.5 flex items-start justify-between gap-3 w-full">
            <h3 className="text-[17px] sm:text-[18px] lg:text-[19px] font-semibold tracking-tight text-white dark:text-foreground group-hover:text-accent transition-colors duration-200 line-clamp-1">
              {project.title}
            </h3>

            <div className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-zinc-400 transition-all duration-300 group-hover:border-teal-400/40 group-hover:bg-teal-400/10 group-hover:text-accent">
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </div>
          </div>

          {/* ── Short Description Preview ── */}
          {project.description && (
            <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-zinc-400 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        {/* ── Technology / Skill Tags (Max 3) ── */}
        {displayTags.length > 0 && (
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-0.5">
            {displayTags.map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-zinc-400 font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
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
      className="relative py-4 sm:py-6 md:py-8 px-5 sm:px-6 md:px-10 lg:px-16 overflow-hidden md:overflow-visible w-full"
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

      {/* ── 3-Column Responsive Grid on Desktop, 2 on Tablet, 1 on Mobile ── */}
      {displayProjects.length > 0 ? (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 w-full">
            {displayProjects.map((project, i) => (
              <ProjectGridCard
                key={project.id ?? i}
                project={project}
                index={i}
              />
            ))}
          </div>

          {/* Mobile All Works CTA */}
          <div className="flex md:hidden justify-center mt-6">
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
