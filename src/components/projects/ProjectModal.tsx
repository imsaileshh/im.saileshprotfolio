'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Globe, X } from 'lucide-react';
import { useModalScrollProgress } from '@/components/ui/ScrollProgressContext';

const ease = [0.22, 1, 0.36, 1] as const;

export function ProjectModal({
  project,
  onClose,
}: {
  project: any;
  onClose: () => void;
}) {
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // Track project modal scroll while open
  useModalScrollProgress(Boolean(project), modalScrollRef);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 overflow-hidden">
      
      {/* ── Modal Backdrop ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Compact Modal Card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.3, ease }}
        className="relative w-full max-w-[860px] max-h-[85vh] bg-[var(--card)] border border-border-subtle/80 rounded-[20px] sm:rounded-[24px] shadow-[0_24px_70px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col z-10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-30 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md border border-white/10 text-white/90 hover:text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X size={16} />
        </button>

        {/* Scrollable Container (only if screen height is extremely small) */}
        <div ref={modalScrollRef} className="flex flex-col w-full overflow-y-auto no-scrollbar">
          
          {/* ── 01. Compact Project Image (16:7 Proportion) ── */}
          <div className="relative w-full aspect-[16/7] min-h-[170px] sm:min-h-[220px] md:min-h-[260px] bg-[#111214] shrink-0 overflow-hidden">
            <Image
              src={project.coverUrl || '/images/projects/project1.svg'}
              alt={project.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 860px"
            />
            {/* Subtle Gradient Transition to Card Surface */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent opacity-60 pointer-events-none" />
          </div>

          {/* ── 02. Content Area ── */}
          <div className="flex flex-col p-5 sm:p-7 md:p-8 pt-4 sm:pt-5">
            
            {/* Category / Year Eyebrow */}
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="text-[11px] sm:text-[11.5px] font-mono tracking-[0.16em] uppercase text-muted font-medium">
                {project.category || 'PROJECT'}
              </span>
              <span className="text-muted/40 font-mono text-[11px]">&bull;</span>
              <span className="text-[11px] sm:text-[11.5px] font-mono tracking-widest text-muted/70">
                {project.year || '2026'}
              </span>
            </div>

            {/* Project Title */}
            <h2 className="text-2xl sm:text-3xl md:text-[36px] lg:text-[38px] font-display font-semibold tracking-tight text-foreground leading-[1.16] mb-3">
              {project.title}
            </h2>

            {/* Short Description */}
            <p className="text-[14px] sm:text-[15px] md:text-[15.5px] text-muted leading-relaxed font-normal mb-6 max-w-2xl">
              {project.shortDescription ||
                project.description ||
                'A comprehensive digital experience balancing aesthetic precision with performant engineering.'}
            </p>

            {/* ── 03. Actions ── */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={`/projects/${project.slug}`}
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 bg-foreground text-[var(--bg)] px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[14px] font-medium tracking-tight hover:brightness-95 active:scale-[0.98] transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span>View Case Study</span>
                <ArrowUpRight size={15} />
              </Link>

              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-transparent text-foreground border border-border-subtle hover:border-foreground/30 hover:bg-border-subtle/20 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[14px] font-medium tracking-tight active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Globe size={15} className="opacity-70" />
                  <span>Live Project</span>
                </a>
              )}
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
