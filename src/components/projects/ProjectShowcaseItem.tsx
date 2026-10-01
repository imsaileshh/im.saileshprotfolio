'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Globe } from 'lucide-react';
import { ProjectCover } from '@/components/projects/ProjectCover';
import { getTechLogo } from '@/lib/stack/tech-logos';

export interface ShowcaseProjectItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  year?: string | null;
  coverUrl: string;
  technologies?: string[] | null;
  tags?: string[] | null;
  liveUrl?: string | null;
  hasCaseStudy?: boolean;
  caseStudySlug?: string | null;
  projectType?: 'work' | 'personal';
}

export interface ProjectShowcaseItemProps {
  project: ShowcaseProjectItem;
  index: number;
  projectType?: 'work' | 'personal';
  onLivePreview?: (project: { title: string; liveUrl?: string | null }) => void;
  isCarousel?: boolean;
}

export function ProjectShowcaseItem({
  project,
  index,
  projectType = 'work',
  onLivePreview,
  isCarousel = false,
}: ProjectShowcaseItemProps) {
  const isEven = index % 2 === 0;
  const projectNum = String(index + 1).padStart(2, '0');
  const type = project.projectType || projectType;
  const isPersonal = type === 'personal';

  // Detail link routing:
  // Personal projects: /personal-projects/[slug]
  // Works: /works/[caseStudySlug] (if published case study) or /works/[slug]
  const detailHref = isPersonal
    ? `/personal-projects/${project.slug}`
    : project.hasCaseStudy && project.caseStudySlug
    ? `/works/${project.caseStudySlug}`
    : `/works/${project.slug}`;

  // Fallback category
  const displayCategory =
    project.category || (isPersonal ? 'Personal Project' : 'Website Project');

  // Technologies / tools
  const rawTech =
    Array.isArray(project.technologies) && project.technologies.length > 0
      ? project.technologies
      : Array.isArray(project.tags) && project.tags.length > 0
      ? project.tags
      : [];
  const displayTech = rawTech.slice(0, 5);

  return (
    <motion.article
      initial={isCarousel ? false : { opacity: 0, y: 24 }}
      whileInView={isCarousel ? undefined : { opacity: 1, y: 0 }}
      animate={isCarousel ? { opacity: 1, y: 0 } : undefined}
      viewport={isCarousel ? undefined : { once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center text-left ${
        isCarousel ? 'w-full' : ''
      }`}
    >
      {/* ── IMAGE COLUMN ──
          Mobile: Always order-1 (on top)
          Desktop: order-1 if isEven (Left), order-2 if isOdd (Right)
      */}
      <div
        className={`w-full order-1 ${
          isEven
            ? 'md:order-1 md:col-span-6 lg:col-span-7'
            : 'md:order-2 md:col-span-6 lg:col-span-7'
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
              src={project.coverUrl}
              alt={project.title}
              aspectRatio="16/10"
              className="w-full"
              imageClassName="transition-transform duration-500 ease-out group-hover/img:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 720px"
              fallbackSrc={`/images/projects/project${(index % 4) + 1}.svg`}
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
          isEven
            ? 'md:order-2 md:col-span-6 lg:col-span-5'
            : 'md:order-1 md:col-span-6 lg:col-span-5'
        }`}
      >
        {/* Category Tags + Year */}
        <div className="flex items-center gap-3 mb-2.5">
          <span className="text-xs font-mono tracking-[0.16em] uppercase text-accent font-semibold">
            {displayCategory}
          </span>
          {project.year && (
            <span className="text-[11px] font-mono text-muted/60">
              • {project.year}
            </span>
          )}
        </div>

        {/* Project Title */}
        <Link href={detailHref}>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-display font-semibold tracking-tight text-foreground hover:text-accent transition-colors duration-200 mb-3.5 leading-snug">
            {project.title}
          </h2>
        </Link>

        {/* Project Description */}
        {project.description && (
          <p className="text-sm sm:text-base text-muted leading-relaxed font-normal max-w-[520px] mb-6 line-clamp-3 sm:line-clamp-none">
            {project.description}
          </p>
        )}

        {/* Tools / Technologies Badges */}
        {displayTech.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-7">
            <span className="text-xs font-mono text-muted/70 mr-1">Tools:</span>
            {displayTech.map((tech) => {
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
          {project.hasCaseStudy ? (
            <Link
              href={detailHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent transition-colors duration-200 group/link border-b border-foreground/20 hover:border-accent pb-0.5"
            >
              <span>View case study</span>
              <ArrowUpRight
                size={16}
                className="transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
              />
            </Link>
          ) : (
            <Link
              href={detailHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent transition-colors duration-200 group/link border-b border-foreground/20 hover:border-accent pb-0.5"
            >
              <span>View project</span>
              <ArrowUpRight
                size={16}
                className="transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
              />
            </Link>
          )}

          {project.liveUrl && (
            onLivePreview ? (
              <button
                type="button"
                onClick={() => onLivePreview(project)}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-accent transition-colors cursor-pointer"
              >
                <Globe size={13} />
                <span>Live Preview</span>
              </button>
            ) : (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-accent transition-colors"
              >
                <Globe size={13} />
                <span>Live Preview</span>
              </a>
            )
          )}
        </div>
      </div>
    </motion.article>
  );
}
