'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Globe } from 'lucide-react';
import { getTechLogo } from '@/lib/stack/tech-logos';
import { ProjectCover } from '@/components/projects/ProjectCover';
import type { WorkItem } from './WorksShowcase';

export interface WorkCardProps {
  work: WorkItem;
  index: number;
  onOpenLivePreview: (work: WorkItem) => void;
}

export function WorkCard({
  work,
  index,
  onOpenLivePreview,
}: WorkCardProps) {
  return (
    <article
      className="group relative flex flex-col justify-between rounded-[22px] bg-[var(--card)] border border-border-subtle/80 hover:border-border-subtle p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-[0_16px_44px_rgba(0,0,0,0.3)] text-left w-full h-auto"
    >
      {/* ── Top Visual Cover ── */}
      <div className="relative w-full mb-4 block group/cover">
        <ProjectCover
          src={work.coverUrl}
          alt={work.title}
          aspectRatio="16/9"
          className="rounded-[16px] border border-border-subtle/40"
          imageClassName="ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
          fallbackSrc={`/images/projects/project${(index % 4) + 1}.svg`}
        />

        {/* Top Right Year Pill */}
        <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10.5px] font-mono text-white/90 shadow-sm z-10">
          {work.year}
        </div>


      </div>

      {/* ── Category ── */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-mono tracking-[0.14em] uppercase text-accent font-semibold">
          {work.category}
        </span>
      </div>

      {/* ── Title ── */}
      <Link href={`/works/${work.slug}`}>
        <h2 className="text-lg sm:text-xl font-display font-semibold tracking-tight text-foreground leading-snug transition-colors duration-200 group-hover:text-accent mb-2">
          {work.title}
        </h2>
      </Link>

      {/* ── Description ── */}
      <p className="text-xs sm:text-sm text-muted leading-relaxed font-normal mb-5 flex-1 line-clamp-2">
        {work.description?.includes('Invalid url')
          ? 'Selected client work showcasing responsive design and clean execution.'
          : work.description}
      </p>

      {/* ── Tech Stack Badges ── */}
      {work.technologies && work.technologies.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          {work.technologies.slice(0, 3).map((tech) => {
            const logo = getTechLogo(tech);

            return (
              <span
                key={tech}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--sidebar)] border border-border-subtle/60 text-[10.5px] font-mono text-foreground"
              >
                {logo && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={logo.url}
                    alt=""
                    width={11}
                    height={11}
                    className="w-2.5 h-2.5 object-contain shrink-0"
                    style={logo.filter ? { filter: logo.filter } : undefined}
                  />
                )}
                <span>{tech}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center justify-between pt-3 border-t border-border-subtle/50 mt-auto gap-2">
        <Link
          href={`/works/${work.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground group-hover:text-accent transition-colors"
        >
          <span>Explore Work</span>
          <ArrowUpRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>

        <div className="flex items-center gap-2">


          {/* Live Browser Preview Trigger Button */}
          {work.liveUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onOpenLivePreview(work);
              }}
              className="text-xs font-mono text-muted hover:text-accent flex items-center gap-1 transition-colors cursor-pointer"
              aria-label={`Open live preview for ${work.title}`}
            >
              <Globe size={12} />
              <span>Live</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
