'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, FolderGit2, Github, Globe } from 'lucide-react';
import { PrototypePreviewModal } from '@/components/case-study/PrototypePreviewModal';
import { ProjectCover } from '@/components/projects/ProjectCover';

export interface PersonalProjectItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  year: string;
  description: string;
  technologies: string[];
  coverUrl: string;
  liveUrl?: string | null;
  githubUrl?: string | null;
}

const DEFAULT_CATEGORIES = [
  'All',
  'Case Studies',
  'Web Development',
  'Tools',
  'Experiments',
  'UI/UX',
];

interface PersonalProjectsShowcaseProps {
  projects: PersonalProjectItem[];
  categories?: string[];
  showCategoryBar?: boolean;
}

export function PersonalProjectsShowcase({
  projects,
  categories: propCategories,
  showCategoryBar = true,
}: PersonalProjectsShowcaseProps) {
  const [previewItem, setPreviewItem] = useState<{ title: string; url: string } | null>(null);

  // Normalize categories list with 'All' first
  const displayCategories = useMemo(() => {
    const list = propCategories && propCategories.length > 0 ? propCategories : DEFAULT_CATEGORIES;
    const normalized = Array.from(new Set(list.map((c) => c.trim()).filter(Boolean)));
    const withoutAll = normalized.filter((c) => c.toLowerCase() !== 'all');
    return ['All', ...withoutAll];
  }, [propCategories]);

  // Default active category to 'All'
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Filter projects dynamically based on categories
  const filteredProjects = useMemo(() => {
    if (activeCategory.toLowerCase() === 'all') {
      return projects;
    }

    const filtered = projects.filter((project) => {
      const cat = (project.category || '').toLowerCase();
      const title = (project.title || '').toLowerCase();
      const tech = (project.technologies || []).map((t) => t.toLowerCase());
      const activeLower = activeCategory.toLowerCase();

      // Direct exact or substring match with project category
      if (cat === activeLower || cat.includes(activeLower) || activeLower.includes(cat)) {
        return true;
      }

      // Semantic matching for standard categories
      if (activeLower === 'case studies' || activeLower === 'case study') {
        return (
          cat.includes('case') ||
          cat.includes('study') ||
          cat.includes('redesign') ||
          title.includes('case')
        );
      }
      if (activeLower === 'web development' || activeLower === 'web') {
        return (
          cat.includes('web') ||
          cat.includes('frontend') ||
          cat.includes('fullstack') ||
          cat.includes('personal project') ||
          cat.includes('site') ||
          cat.includes('app') ||
          tech.some((t) => t.includes('react') || t.includes('next') || t.includes('typescript') || t.includes('node'))
        );
      }
      if (activeLower === 'tools' || activeLower === 'tool') {
        return (
          cat.includes('tool') ||
          cat.includes('cli') ||
          cat.includes('util') ||
          cat.includes('devtool') ||
          title.includes('cli') ||
          title.includes('tool') ||
          tech.some((t) => t.includes('rust') || t.includes('go') || t.includes('cli'))
        );
      }
      if (activeLower === 'experiments' || activeLower === 'experiment') {
        return (
          cat.includes('experiment') ||
          cat.includes('open source') ||
          cat.includes('proto') ||
          cat.includes('lab') ||
          title.includes('engine') ||
          title.includes('gen')
        );
      }
      if (activeLower === 'ui/ux' || activeLower === 'ui' || activeLower === 'ux') {
        return (
          cat.includes('ui') ||
          cat.includes('ux') ||
          cat.includes('design') ||
          cat.includes('motion') ||
          tech.some((t) => t.includes('framer') || t.includes('tailwind') || t.includes('motion') || t.includes('figma'))
        );
      }

      return false;
    });

    return filtered;
  }, [projects, activeCategory]);

  return (
    <div className="space-y-10">
      
      {/* ── Page Header: Personal Projects + Short Description ── */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-display font-semibold tracking-tight text-foreground leading-[1.1]">
          Personal Projects
        </h1>
        <p className="text-muted text-sm sm:text-base leading-relaxed font-normal">
          Independent experiments, side projects, developer utilities, and personal builds.
        </p>

        {/* ── Category Filters (All, Case Studies, Web Development, Tools, etc.) ── */}
        {showCategoryBar && displayCategories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {displayCategories.map((category) => {
              const isActive = activeCategory.toLowerCase() === category.toLowerCase();

              return (
                <button
                  key={category}
                  type="button"
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

      {/* ── Grid of Personal Projects ── */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredProjects.map((project, idx) => (
            <motion.article
              key={project.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: (idx % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex flex-col rounded-2xl border border-border-subtle/80 bg-[var(--card)] p-4 sm:p-5 transition-all duration-300 hover:border-accent/40 hover:shadow-lg"
            >
              {/* Media Thumbnail Container */}
              <Link
                href={`/personal-projects/${project.slug}`}
                className="relative w-full mb-4 block group/cover"
              >
                <ProjectCover
                  src={project.coverUrl}
                  alt={project.title}
                  aspectRatio="16/9"
                  className="rounded-xl border border-border-subtle/40"
                  imageClassName="ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  fallbackSrc={`/images/projects/project${(idx % 4) + 1}.svg`}
                />
              </Link>

              {/* Meta info */}
              <div className="flex items-center justify-between gap-2 text-xs font-mono text-muted mb-2">
                <span className="text-accent uppercase tracking-wider font-semibold">
                  {project.category}
                </span>
                <span>{project.year}</span>
              </div>

              {/* Title */}
              <h2 className="text-lg font-display font-semibold text-foreground tracking-tight group-hover:text-accent transition-colors mb-2">
                <Link href={`/personal-projects/${project.slug}`}>
                  {project.title}
                </Link>
              </h2>

              {/* Description */}
              <p className="text-xs sm:text-sm text-muted/90 leading-relaxed line-clamp-2 mb-4 flex-1">
                {project.description}
              </p>

              {/* Tech stack badges */}
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

              {/* Links and action */}
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
                      onClick={() => setPreviewItem({ title: project.title, url: project.liveUrl! })}
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
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-subtle bg-black/10 p-12 text-center space-y-2 max-w-md mx-auto">
          <FolderGit2 size={28} className="mx-auto text-muted opacity-60" />
          <h3 className="text-base font-semibold text-foreground">
            {activeCategory.toLowerCase() === 'all'
              ? 'No personal projects found'
              : `No projects found in "${activeCategory}"`}
          </h3>
          <p className="text-xs text-muted">
            {activeCategory.toLowerCase() === 'all'
              ? 'Projects created in the dashboard under Personal Projects will appear here automatically.'
              : 'Try selecting "All" or a different category to view projects.'}
          </p>
          {activeCategory.toLowerCase() !== 'all' && (
            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle text-xs font-mono text-foreground hover:bg-white/5 transition-colors cursor-pointer"
            >
              Show All Projects
            </button>
          )}
        </div>
      )}

      {/* Interactive Popup Browser Preview Modal */}
      {previewItem && (
        <PrototypePreviewModal
          isOpen={Boolean(previewItem)}
          onClose={() => setPreviewItem(null)}
          title={previewItem.title}
          prototypeUrl={previewItem.url}
        />
      )}

    </div>
  );
}
