'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Github, Globe, Laptop } from 'lucide-react';
import { CustomBlockRenderer, ContentBlockItem } from './CustomBlockRenderer';
import { PrototypePreviewModal } from './PrototypePreviewModal';
import { PdfPagesViewer } from './PdfPagesViewerDynamic';
import { SteeGoCaseStudyContent } from './SteeGoCaseStudyContent';
import { getCaseStudySectionId } from './CaseStudySidebar';

interface MediaItem {
  url: string;
  type?: 'image' | 'svg' | 'video' | 'pdf';
  caption?: string;
  alt?: string;
  width?: 'full' | 'half' | 'third' | 'contained';
  background?: 'transparent' | 'dark' | 'card';
}

export interface CaseStudyContentData {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  status?: string;
  sourceType?: string;
  sourcePdf?: string | null;
  metadata?: any;
  sections?: any[];
  project?: any;
}

export function CaseStudyHeroHeader({ caseStudy }: { caseStudy: CaseStudyContentData }) {
  const [previewState, setPreviewState] = useState<{ isOpen: boolean; url: string; title: string } | null>(null);

  const metadata = (caseStudy.metadata as any) || {};
  const project = (caseStudy as any).project || {};
  const category = metadata.category || project.category || 'Case Studies';
  const year = metadata.year || project.year || '2025';
  const role = metadata.role || project.role || 'Completed';
  const client = metadata.client || project.client;
  const technologies: string[] =
    (metadata.technologies && metadata.technologies.length > 0 ? metadata.technologies : null) ||
    (project.technologies && project.technologies.length > 0 ? project.technologies : null) ||
    ['Figma', 'Photoshop'];
  const liveUrl = metadata.liveUrl || project.liveUrl;
  const githubUrl = metadata.githubUrl || project.githubUrl;
  const figmaUrl = metadata.figmaUrl || project.figmaUrl;
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

        {/* Large Editorial Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-foreground leading-[1.08] text-center mb-4">
          {caseStudy.title}
        </h1>

        {/* Description */}
        {caseStudy.description && (
          <p className="text-base sm:text-lg md:text-xl text-muted leading-relaxed font-normal max-w-2xl text-center mx-auto mb-6">
            {caseStudy.description}
          </p>
        )}

        {/* Structured Metadata Grid */}
        <div className="w-full max-w-4xl pt-4 pb-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-left border-y border-border-subtle/50 py-8">
            {/* Role */}
            <div className="space-y-2">
              <h4 className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted/80">Role</h4>
              <p className="text-sm sm:text-base font-medium text-foreground">{role}</p>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <h4 className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted/80">Timeline</h4>
              <p className="text-sm sm:text-base font-medium text-foreground">{year}</p>
            </div>

            {/* Platform / Client */}
            <div className="space-y-2">
              <h4 className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted/80">{client ? 'Client' : 'Platform'}</h4>
              <p className="text-sm sm:text-base font-medium text-foreground">{client || category}</p>
            </div>

            {/* Tools & Tech */}
            <div className="space-y-2">
              <h4 className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted/80">Tools & Tech</h4>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {technologies && technologies.length > 0 ? (
                  technologies.slice(0, 4).map((tech) => (
                    <span key={tech} className="text-sm sm:text-base font-medium text-foreground inline-flex items-center gap-1.5">
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-sm sm:text-base font-medium text-muted">Various</span>
                )}
                {technologies && technologies.length > 4 && (
                  <span className="text-sm font-medium text-muted/60">+{technologies.length - 4}</span>
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
  const cover = caseStudy.coverImage || (caseStudy as any).project?.coverImageUrl || (caseStudy as any).project?.images?.[0]?.url || (caseStudy as any).cover;

  const sections = (caseStudy.sections || []).filter((section) => {
    const meta = (section.metadata as any) || {};
    const hasBlocks = Array.isArray(meta?.blocks) && meta.blocks.length > 0;
    const hasMedia = (section.images && section.images.length > 0) || (Array.isArray(meta?.media) && meta.media.length > 0);
    const hasContent = Boolean(section.content?.trim());
    const hasStats = Array.isArray(meta?.stats) && meta.stats.length > 0;
    return hasBlocks || hasMedia || hasContent || hasStats || Boolean(section.title?.trim());
  });

  return (
    <div className="case-study-content-root w-full">
      {/* ── 01. Project Hero / Title / Metadata ── */}
      {!sectionsOnly && <CaseStudyHeroHeader caseStudy={caseStudy} />}

      {/* ── 02. Hero Image ── */}
      {!sectionsOnly && cover && (
        <div className="w-full max-w-[960px] mx-auto mb-14 rounded-2xl border border-border-subtle/80 bg-[var(--card)] p-1.5 shadow-sm">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black/5 dark:bg-black/50 border border-border-subtle/40">
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
      ) : caseStudy.slug === 'fndfgh-case-study' || caseStudy.slug === 'steego-case-study' ? (
        <div className={sectionsOnly ? 'relative z-0' : 'mt-12 pt-8 border-t border-border-subtle/60'}>
          <SteeGoCaseStudyContent caseStudy={caseStudy as any} />
        </div>
      ) : sections.length > 0 ? (
        <div className={sectionsOnly ? 'relative z-0' : 'mt-12 pt-8 border-t border-border-subtle/60 relative z-0'}>
          <article className="min-w-0 flex-1 space-y-20 sm:space-y-24 pb-20 relative z-0 pointer-events-auto">
            {sections.map((section: any, idx) => {
              const meta = (section.metadata as any) || {};
              const mediaItems: MediaItem[] =
                meta?.media ||
                (section.images || []).map((url: string) => ({
                  url,
                  type: url.endsWith('.svg') ? 'svg' : 'image',
                }));
              const stats: Array<{ value: string; label: string }> = meta?.stats || [];
              const subtitle: string = meta?.subtitle || '';
              const layout: string = meta?.layout || 'full_width';
              const blocks: ContentBlockItem[] = meta?.blocks || [];

              let layoutContainerClass = 'space-y-8';
              if (layout === 'two_column') {
                layoutContainerClass = 'grid gap-8 lg:grid-cols-2 items-start';
              } else if (layout === 'split_text_media') {
                layoutContainerClass = 'grid gap-8 lg:grid-cols-12 items-center';
              } else if (layout === 'split_media_text') {
                layoutContainerClass = 'grid gap-8 lg:grid-cols-12 items-center lg:grid-flow-dense';
              } else if (layout === 'text_focus') {
                layoutContainerClass = 'max-w-2xl mx-auto space-y-6';
              }

              const safeId = getCaseStudySectionId(section, idx);

              return (
                <section
                  key={section.id || idx}
                  id={safeId}
                  className="case-study-section scroll-mt-24"
                >
                  {/* Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-accent font-semibold">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      {subtitle && (
                        <span className="text-xs font-mono uppercase tracking-widest text-muted">
                          {subtitle}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-semibold tracking-tight text-foreground">
                      {section.title}
                    </h2>
                  </div>

                  <div className={layoutContainerClass}>
                    {/* Content text */}
                    {section.content && (
                      <div className="prose prose-invert max-w-none text-muted leading-relaxed text-[15px] sm:text-base">
                        {section.content.split('\n').map((paragraph: string, pIdx: number) =>
                          paragraph.trim() ? (
                            <p key={pIdx} className="mb-4">
                              {paragraph}
                            </p>
                          ) : null
                        )}
                      </div>
                    )}

                    {/* Stats cards */}
                    {stats && stats.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
                        {stats.map((st, sIdx) => (
                          <div
                            key={sIdx}
                            className="rounded-2xl border border-border-subtle bg-card p-4 text-center space-y-1 shadow-sm"
                          >
                            <p className="text-2xl sm:text-3xl font-bold font-mono text-accent">
                              {st.value}
                            </p>
                            <p className="text-xs text-muted font-medium">
                              {st.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Content blocks */}
                    {blocks.length > 0 && (
                      <div className="space-y-6 my-8">
                        {blocks.map((blk) => (
                          <CustomBlockRenderer key={blk.id} block={blk} />
                        ))}
                      </div>
                    )}

                    {/* Section Media */}
                    {mediaItems.length > 0 && (
                      <div className="flex flex-wrap gap-6 pt-2">
                        {mediaItems.map((media, mIdx) => {
                          let widthClass = 'w-full';
                          if (media.width === 'half') widthClass = 'w-full sm:w-[calc(50%-0.75rem)]';
                          if (media.width === 'third') widthClass = 'w-full sm:w-[calc(33.33%-1rem)]';

                          let bgClass = 'bg-transparent';
                          if (media.background === 'dark') bgClass = 'bg-[#0b0c0e] p-6 border border-white/[0.08]';
                          if (media.background === 'card') bgClass = 'bg-[var(--card)] p-4 border border-border-subtle';

                          return (
                            <figure key={mIdx} className={`${widthClass} space-y-2`}>
                              <div
                                className={`relative overflow-hidden rounded-2xl ${bgClass} flex items-center justify-center`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={media.url}
                                  alt={media.alt || media.caption || `Visual ${mIdx + 1}`}
                                  className="max-w-full h-auto object-contain rounded-xl"
                                  loading="lazy"
                                />
                              </div>
                              {media.caption && (
                                <figcaption className="text-xs font-mono text-zinc-500 text-center pt-1">
                                  {media.caption}
                                </figcaption>
                              )}
                            </figure>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </article>
        </div>
      ) : (
        <div className="prose prose-invert max-w-none text-muted leading-relaxed text-center py-12">
          <p>{caseStudy.description}</p>
        </div>
      )}
    </div>
  );
}
