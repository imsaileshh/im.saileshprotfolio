'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Github, Globe, Laptop } from 'lucide-react';
import { CustomBlockRenderer, ContentBlockItem } from './CustomBlockRenderer';
import { resolveImageUrl } from '@/lib/media/resolve-image-url';
import { normalizeCaseStudyVisual } from '@/types/case-study-visual';
import { CaseStudyVisualBlock } from './CaseStudyVisualBlock';
import { PrototypePreviewModal } from './PrototypePreviewModal';
import { PdfPagesViewer } from './PdfPagesViewerDynamic';
import { SteeGoCaseStudyContent } from './SteeGoCaseStudyContent';
import { getCaseStudySectionId, getVisibleCaseStudySections } from './CaseStudySidebar';
import { CaseStudySectionRenderer } from './sections/CaseStudySectionRenderer';

interface MediaItem {
  id?: string;
  url: string;
  type?: 'image' | 'svg' | 'video' | 'pdf';
  caption?: string;
  alt?: string;
  width?: 'full' | 'half' | 'third' | 'contained';
  background?: 'transparent' | 'dark' | 'card';
}

export interface CaseStudyMetadata {
  category?: string;
  year?: string;
  role?: string;
  client?: string;
  technologies?: string[];
  liveUrl?: string | null;
  githubUrl?: string | null;
  figmaUrl?: string | null;
  [key: string]: unknown;
}

export interface CaseStudyProjectData {
  id?: string | null;
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  year?: string | null;
  role?: string | null;
  client?: string | null;
  technologies?: string[] | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  figmaUrl?: string | null;
  coverImageUrl?: string | null;
  images?: Array<{ url: string; [key: string]: unknown }> | null;
}

export interface CaseStudySectionMetadata {
  subtitle?: string;
  layout?: string;
  blocks?: ContentBlockItem[];
  media?: MediaItem[];
  stats?: Array<{ value: string; label: string }>;
  [key: string]: unknown;
}

export interface CaseStudySectionData {
  id?: string;
  caseStudyId?: string;
  title: string;
  slug?: string;
  order?: number;
  content?: string | null;
  images?: string[];
  metadata?: unknown;
}

export interface CaseStudyContentData {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  cover?: string | null;
  status?: string;
  sourceType?: string;
  sourcePdf?: string | null;
  metadata?: CaseStudyMetadata | Record<string, unknown> | null;
  sections?: CaseStudySectionData[];
  project?: CaseStudyProjectData | null;
}

export function CaseStudyHeroHeader({ caseStudy }: { caseStudy: CaseStudyContentData }) {
  const [previewState, setPreviewState] = useState<{ isOpen: boolean; url: string; title: string } | null>(null);

  const metadata = (caseStudy.metadata as CaseStudyMetadata) || {};
  const project = caseStudy.project || {};
  const category = metadata.category || project.category || 'Case Studies';
  const year = metadata.year || project.year || '2025';
  const role = metadata.role || project.role || 'Completed';
  const client = (metadata.client || project.client) as string | undefined;
  const technologies: string[] =
    (metadata.technologies && metadata.technologies.length > 0 ? metadata.technologies : null) ||
    (project.technologies && project.technologies.length > 0 ? project.technologies : null) ||
    ['Figma', 'Photoshop'];
  const liveUrl = (metadata.liveUrl || project.liveUrl) as string | undefined;
  const githubUrl = (metadata.githubUrl || project.githubUrl) as string | undefined;
  const figmaUrl = (metadata.figmaUrl || project.figmaUrl) as string | undefined;
  const prototypeUrl = figmaUrl || (liveUrl?.includes('figma.com') || liveUrl?.includes('proto') ? liveUrl : null);

  return (
    <>
      <header className="mb-10 sm:mb-14 text-center max-w-3xl mx-auto flex flex-col items-center">
        {/* Category & Year Tag */}
        <div className="flex items-center justify-center gap-2 font-mono text-xs tracking-wider uppercase text-accent font-semibold mb-3">
          <span>{category}</span>
          <span className="text-muted/40 font-mono text-xs">&bull;</span>
          <span className="text-muted/80">{year}</span>
          {client && (
            <>
              <span className="text-muted/40">&bull;</span>
              <span className="text-muted/80">{client}</span>
            </>
          )}
        </div>

        {/* Clean Editorial Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] font-display font-semibold tracking-tight text-foreground leading-[1.18] text-center mb-3 max-w-2xl mx-auto">
          {caseStudy.title}
        </h1>

        {/* Description / Subheading */}
        {caseStudy.description && (
          <p className="text-xs sm:text-sm md:text-[15px] text-muted leading-relaxed font-normal max-w-xl text-center mx-auto mb-5">
            {caseStudy.description}
          </p>
        )}

        {/* Structured Metadata Grid */}
        <div className="w-full max-w-4xl pt-2 pb-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7 text-left border-y border-border-subtle/50 py-5 sm:py-6">
            {/* Role */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted/80">Role</h4>
              <p className="text-xs sm:text-sm font-medium text-foreground">{role}</p>
            </div>

            {/* Timeline */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted/80">Timeline</h4>
              <p className="text-xs sm:text-sm font-medium text-foreground">{year}</p>
            </div>

            {/* Platform / Client */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted/80">{client ? 'Client' : 'Platform'}</h4>
              <p className="text-xs sm:text-sm font-medium text-foreground">{client || category}</p>
            </div>

            {/* Tools & Tech */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted/80">Tools & Tech</h4>
              <div className="flex flex-wrap gap-x-2.5 gap-y-1">
                {technologies && technologies.length > 0 ? (
                  technologies.slice(0, 4).map((tech) => (
                    <span key={tech} className="text-xs sm:text-sm font-medium text-foreground inline-flex items-center gap-1.5">
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-xs sm:text-sm font-medium text-muted">Various</span>
                )}
                {technologies && technologies.length > 4 && (
                  <span className="text-xs font-medium text-muted/60">+{technologies.length - 4}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Live Project & GitHub & Prototype */}
        {(liveUrl || githubUrl || prototypeUrl) && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {liveUrl && (
              <button
                type="button"
                onClick={() => setPreviewState({ isOpen: true, url: liveUrl, title: `${caseStudy.title} — Live Preview` })}
                className="inline-flex items-center gap-2 bg-foreground text-[var(--bg)] px-5 py-2.5 rounded-xl text-sm font-medium hover:brightness-95 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
              >
                <Globe size={15} />
                <span>Live Project</span>
                <ArrowUpRight size={14} />
              </button>
            )}

            {githubUrl && (
              <a
                href={githubUrl}
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
                onClick={() => setPreviewState({ isOpen: true, url: prototypeUrl, title: `${caseStudy.title} — Figma Prototype` })}
                className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 px-5 py-2.5 rounded-xl text-sm font-medium active:scale-[0.98] transition-all cursor-pointer"
              >
                <Laptop size={15} />
                <span>View Prototype</span>
              </button>
            )}
          </div>
        )}
      </header>

      {previewState && (
        <PrototypePreviewModal
          isOpen={previewState.isOpen}
          prototypeUrl={previewState.url}
          title={previewState.title}
          defaultDevice="desktop"
          onClose={() => setPreviewState(null)}
        />
      )}
    </>
  );
}

export function CaseStudyContent({
  caseStudy,
  sectionsOnly = false,
}: {
  caseStudy: CaseStudyContentData;
  sectionsOnly?: boolean;
}) {
  const cover = resolveImageUrl(
    caseStudy.coverImage ||
    caseStudy.project?.coverImageUrl ||
    caseStudy.project?.images?.[0]?.url ||
    (caseStudy.cover as string | undefined)
  );

  const sections = getVisibleCaseStudySections(caseStudy.sections || []);

  return (
    <div className="case-study-content-root w-full">
      {/* ── 01. Project Hero / Title / Metadata ── */}
      {!sectionsOnly && <CaseStudyHeroHeader caseStudy={caseStudy} />}

      {/* ── 02. Hero Image ── */}
      {!sectionsOnly && cover && (
        <div className="w-full max-w-[1120px] mx-auto mb-14 rounded-2xl border border-border-subtle bg-[var(--card)] p-2 shadow-sm">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black/5 dark:bg-black/50 border border-border-subtle/50">
            <Image
              src={cover}
              alt={caseStudy.title}
              fill
              className="object-contain sm:object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 1152px"
            />
          </div>
        </div>
      )}

      {/* ── 03. Complete Existing Case Study Story & Content ── */}
      {caseStudy.sourceType === 'PDF' && caseStudy.sourcePdf ? (
        <div className={sectionsOnly ? 'relative z-0' : 'mt-12 pt-8 border-t border-border-subtle/60'}>
          <h2 className="text-xl font-display font-semibold text-foreground mb-6">Case Study Document</h2>
          <PdfPagesViewer url={caseStudy.sourcePdf} />
        </div>
      ) : sections.length > 0 ? (
        <div className={sectionsOnly ? 'relative z-0' : 'mt-12 pt-8 border-t border-border-subtle/60 relative z-0'}>
          <article className="min-w-0 flex-1 space-y-20 sm:space-y-28 pb-20 relative z-0 pointer-events-auto">
            {sections.map((section, idx) => {
              const meta = (section.metadata as CaseStudySectionMetadata) || {};
              const subtitle: string = meta?.subtitle || '';

              const safeId = getCaseStudySectionId(section, idx);

              // Clean title: remove leading numbers like "01 " or "1. " if present
              const cleanTitle = (section.title || '').replace(/^\d+[\s\.\-]+/, '').trim() || section.title;

              return (
                <section
                  key={section.id || idx}
                  id={safeId}
                  className="case-study-section scroll-mt-24 max-w-[1120px] mx-auto"
                >
                  {/* Clean Section Shell Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-muted font-semibold tracking-wider">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      {subtitle && (
                        <>
                          <span className="text-muted/60 font-mono text-xs">&mdash;</span>
                          <span className="text-[11px] font-mono uppercase tracking-widest text-muted font-medium">
                            {subtitle}
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-display font-bold tracking-tight text-foreground leading-snug">
                      {cleanTitle}
                    </h2>
                  </div>

                  {/* Render Modular Section Content */}
                  <CaseStudySectionRenderer section={section} />
                </section>
              );
            })}
          </article>
        </div>
      ) : caseStudy.slug === 'steego-case-study' ? (
        <div className={sectionsOnly ? 'relative z-0' : 'mt-12 pt-8 border-t border-border-subtle/60'}>
          <SteeGoCaseStudyContent caseStudy={caseStudy as unknown as Parameters<typeof SteeGoCaseStudyContent>[0]['caseStudy']} />
        </div>
      ) : (
        <div className="prose dark:prose-invert max-w-none text-muted leading-relaxed text-center py-12">
          <p>{caseStudy.description}</p>
        </div>
      )}
    </div>
  );
}
