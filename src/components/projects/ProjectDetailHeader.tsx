'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Github, Globe, Laptop } from 'lucide-react';
import Link from 'next/link';
import { PrototypePreviewModal } from '@/components/case-study/PrototypePreviewModal';

interface ProjectDetailHeaderProps {
  project: {
    id: string;
    title: string;
    slug: string;
    description: string;
    projectType?: string;
    category?: string | null;
    year?: string | null;
    technologies: string[];
    liveUrl?: string | null;
    githubUrl?: string | null;
    figmaUrl?: string | null;
    role?: string | null;
    client?: string | null;
  };
  backHref?: string;
  backLabel?: string;
  customGlowColor?: string | null;
}

export function ProjectDetailHeader({
  project,
  backHref = '/works',
  backLabel = 'Back to Works',
  customGlowColor,
}: ProjectDetailHeaderProps) {
  const [previewState, setPreviewState] = useState<{ isOpen: boolean; url: string; title: string } | null>(null);

  const prototypeUrl = project.figmaUrl || (project.liveUrl?.includes('figma.com') || project.liveUrl?.includes('proto') ? project.liveUrl : null);
  const category = project.category || (project.projectType === 'Personal Project' ? 'CLI / DEVTOOL' : 'SELECTED WORK');
  const year = project.year || '2025';

  return (
    <>
      {/* ── 00. Custom Ambient Radial Glow ── */}
      {customGlowColor && (
        <div 
          className="pointer-events-none absolute inset-x-0 top-0 h-[800px] opacity-70 mix-blend-screen dark:mix-blend-lighten animate-pulse" 
          style={{
            background: `radial-gradient(circle 800px at 50% -100px, ${customGlowColor}, transparent 80%)`
          }}
          aria-hidden="true" 
        />
      )}

      {/* ── 01. Sticky Top Navigation Bar ── */}
      <div className="sticky top-0 z-50 w-full border-b border-border-subtle/50 bg-[var(--bg)]/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex-1 flex items-center gap-5">
            <Link 
              href={backHref} 
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-subtle/80 bg-[var(--card)] hover:bg-border-subtle/20 text-xs sm:text-sm font-semibold text-foreground transition-all shadow-sm shrink-0"
            >
              <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="hidden xs:inline">{backLabel.replace('Back to ', 'Back')}</span>
              <span className="xs:hidden">Back</span>
            </Link>
            <div className="h-6 w-px bg-border-subtle/50 hidden sm:block" />
          </div>
          
          <div className="hidden sm:flex flex-1 justify-center px-3 text-center overflow-hidden">
            <span className="block truncate text-sm font-semibold text-muted tracking-wide max-w-[200px] sm:max-w-[360px] md:max-w-[480px]">
              {project.title}
            </span>
          </div>
          
          <div className="flex-1 flex justify-end items-center gap-5">
            <div className="h-6 w-px bg-border-subtle/50 hidden sm:block" />
            <span className="text-sm font-semibold text-muted">{year}</span>
          </div>
        </div>
      </div>

      <header className="mb-10 sm:mb-14 md:mb-16 pt-10 sm:pt-12 md:pt-14">

        {/* ── 03. Editorial Title ── */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] font-display font-semibold tracking-tight text-foreground leading-[1.18] text-center max-w-2xl mx-auto">
          {project.title}
        </h1>

        {/* ── 04. Description ── */}
        {project.description && (
          <p className="text-xs sm:text-sm md:text-[15px] text-muted leading-relaxed font-normal max-w-xl text-center mx-auto mt-3">
            {project.description}
          </p>
        )}

        {/* ── 05. Structured Metadata Grid ── */}
        <div className="w-full max-w-4xl pt-4 pb-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7 text-left border-y border-border-subtle/50 py-5 sm:py-6">
            
            {/* Role */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted/80">Role</h4>
              <p className="text-xs sm:text-sm font-medium text-foreground">{project.role || 'Lead Designer & Developer'}</p>
            </div>

            {/* Timeline */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted/80">Timeline</h4>
              <p className="text-xs sm:text-sm font-medium text-foreground">{project.year || '2024'}</p>
            </div>

            {/* Platform / Client */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted/80">{project.client ? 'Client' : 'Platform'}</h4>
              <p className="text-xs sm:text-sm font-medium text-foreground">{project.client || category}</p>
            </div>

            {/* Tools & Tech */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted/80">Tools & Tech</h4>
              <div className="flex flex-wrap gap-x-2.5 gap-y-1">
                {project.technologies && project.technologies.length > 0 ? (
                  project.technologies.slice(0, 4).map((tech) => (
                    <span key={tech} className="text-xs sm:text-sm font-medium text-foreground inline-flex items-center gap-1.5">
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-xs sm:text-sm font-medium text-muted">Various</span>
                )}
                {project.technologies && project.technologies.length > 4 && (
                  <span className="text-xs font-medium text-muted/60">+{project.technologies.length - 4}</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── 06. Action Buttons: Live Project & GitHub ── */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          {project.liveUrl && (
            <button
              type="button"
              onClick={() => setPreviewState({ isOpen: true, url: project.liveUrl!, title: `${project.title} — Live Preview` })}
              className="inline-flex items-center gap-2 bg-foreground text-[var(--bg)] px-5 py-2.5 rounded-xl text-sm font-medium hover:brightness-95 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
            >
              <Globe size={15} />
              <span>Live Project</span>
              <ArrowUpRight size={14} />
            </button>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[var(--card)] text-foreground border border-border-subtle hover:border-foreground/30 hover:bg-border-subtle/20 px-5 py-2.5 rounded-xl text-sm font-medium active:scale-[0.98] transition-all"
            >
              <Github size={15} />
              <span>GitHub Repository</span>
            </a>
          )}

          {prototypeUrl && (
            <button
              type="button"
              onClick={() => setPreviewState({ isOpen: true, url: prototypeUrl, title: `${project.title} — Figma Prototype` })}
              className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 px-5 py-2.5 rounded-xl text-sm font-medium active:scale-[0.98] transition-all cursor-pointer"
            >
              <Laptop size={15} />
              <span>View Prototype</span>
            </button>
          )}
        </div>
      </header>

      {/* Interactive In-App Browser & Prototype Preview Modal */}
      {previewState && previewState.isOpen && (
        <PrototypePreviewModal
          isOpen={previewState.isOpen}
          onClose={() => setPreviewState(null)}
          title={previewState.title}
          prototypeUrl={previewState.url}
          defaultDevice="desktop"
        />
      )}
    </>
  );
}
