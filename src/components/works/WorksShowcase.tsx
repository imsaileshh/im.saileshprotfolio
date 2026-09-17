'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, FolderGit2, Globe } from 'lucide-react';
import { getTechLogo } from '@/lib/stack/tech-logos';

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
  hasCaseStudy?: boolean;
}

const CATEGORIES = [
  'Case Studies',
  'Web Development',
  'E-commerce',
  'UI/UX',
] as const;

type CategoryType = typeof CATEGORIES[number];

function ProjectCoverImage({ src, alt, index }: { src: string; alt: string; index: number }) {
  const fallback = `/images/projects/project${(index % 4) + 1}.svg`;
  const [imgSrc, setImgSrc] = useState(src || fallback);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      onError={() => {
        if (imgSrc !== fallback) {
          setImgSrc(fallback);
        }
      }}
    />
  );
}

export function WorksShowcase({ works }: { works: WorkItem[] }) {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('Web Development');

  // Filter works dynamically based on the 4 strict categories (No "All")
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

      {/* ── Works Grid ── */}
      {filteredWorks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
          {filteredWorks.map((work, idx) => (
            <article
              key={work.id}
              className="group relative flex flex-col rounded-[22px] bg-[var(--card)] border border-border-subtle/80 hover:border-border-subtle p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-[0_16px_44px_rgba(0,0,0,0.3)] text-left"
            >
              {/* Top Visual */}
              <Link
                href={`/works/${work.slug}`}
                className="relative w-full aspect-[16/10] rounded-[16px] overflow-hidden bg-[#111214] mb-4 block"
              >
                <ProjectCoverImage
                  src={work.coverUrl}
                  alt={work.title}
                  index={idx}
                />

                {/* Top Right Year Pill */}
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10.5px] font-mono text-white/90 shadow-sm z-10">
                  {work.year}
                </div>
              </Link>

              {/* Category */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-mono tracking-[0.14em] uppercase text-accent font-semibold">
                  {work.category}
                </span>
              </div>

              {/* Title */}
              <Link href={`/works/${work.slug}`}>
                <h2 className="text-lg sm:text-xl font-display font-semibold tracking-tight text-foreground leading-snug transition-colors duration-200 group-hover:text-accent mb-2">
                  {work.title}
                </h2>
              </Link>

              {/* Description */}
              <p className="text-xs sm:text-sm text-muted leading-relaxed font-normal mb-5 flex-1 line-clamp-2">
                {work.description?.includes('Invalid url')
                  ? 'Selected client work showcasing responsive design and clean execution.'
                  : work.description}
              </p>

              {/* Tech stack badges */}
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

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border-subtle/50 mt-auto">
                <Link
                  href={`/works/${work.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground group-hover:text-accent transition-colors"
                >
                  <span>Explore Work</span>
                  <ArrowUpRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>

                {work.liveUrl && (
                  <a
                    href={work.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-muted hover:text-accent flex items-center gap-1 transition-colors"
                  >
                    <Globe size={12} />
                    <span>Live Preview</span>
                  </a>
                )}
              </div>

            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-subtle bg-[var(--card)] p-12 text-center">
          <FolderGit2 size={28} className="mx-auto text-accent mb-3" />
          <p className="text-sm text-muted">No projects in this category yet.</p>
        </div>
      )}

    </div>
  );
}
