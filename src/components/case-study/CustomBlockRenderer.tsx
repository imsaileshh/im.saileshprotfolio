'use client';

import React from 'react';
import Image from 'next/image';
import { Quote, Sparkles, ExternalLink, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { CaseStudyVisualBlock } from './CaseStudyVisualBlock';

export interface ContentBlockItem {
  id: string;
  type:
    | 'heading'
    | 'paragraph'
    | 'rich_text'
    | 'bullet_list'
    | 'numbered_list'
    | 'quote'
    | 'link'
    | 'image'
    | 'webpage'
    | 'dashboard'
    | 'image_text'
    | 'image_grid'
    | 'svg'
    | 'metric'
    | 'metric_group'
    | 'feature_list'
    | 'project_details'
    | 'divider'
    | 'callout'
    | 'embed';
  headingText?: string;
  headingLevel?: 'h2' | 'h3' | 'h4';
  content?: string;
  listItems?: string[];
  quoteText?: string;
  quoteAuthor?: string;
  quoteRole?: string;
  linkLabel?: string;
  linkUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  imagePosition?: 'left' | 'right';
  svgBackground?: 'transparent' | 'dark' | 'card';
  imageGridUrls?: string[];
  imageGridColumns?: 2 | 3 | 4;
  displayType?: 'webpage' | 'dashboard' | 'image';
  displaySize?: 'medium' | 'large' | 'full';
  backgroundType?: 'none' | 'theme' | 'custom';
  backgroundColor?: string;
  padding?: number;
  radius?: number;
  fit?: 'natural' | 'contain' | 'cover';
  metricValue?: string;
  metricLabel?: string;
  metricDescription?: string;
  metrics?: Array<{ value: string; label: string; description?: string }>;
  features?: Array<{ number?: string; title: string; description: string; imageUrl?: string; svg?: string }>;
  projectDetails?: Array<{ label: string; value: string }>;
  calloutTitle?: string;
  calloutDescription?: string;
  calloutLink?: string;
  dividerSpacing?: 'normal' | 'wide';
  embedUrl?: string;
}

import { resolveImageUrl } from '@/lib/media/resolve-image-url';

export { resolveImageUrl };
export const getImageUrl = resolveImageUrl;

export function CustomBlockRenderer({ block }: { block: ContentBlockItem }) {
  switch (block.type) {
    case 'heading': {
      const level = block.headingLevel || 'h2';
      const text = block.headingText || '';
      if (!text) return null;

      if (level === 'h3') {
        return (
          <h3 className="text-xl sm:text-2xl font-display font-semibold text-foreground tracking-tight mt-6 mb-3">
            {text}
          </h3>
        );
      }
      if (level === 'h4') {
        return (
          <h4 className="text-lg sm:text-xl font-display font-medium text-foreground tracking-tight mt-4 mb-2">
            {text}
          </h4>
        );
      }
      return (
        <h2 className="text-2xl sm:text-3xl font-display font-semibold text-foreground tracking-tight mt-8 mb-4">
          {text}
        </h2>
      );
    }

    case 'paragraph':
    case 'rich_text': {
      const text = block.content || '';
      if (!text) return null;
      return (
        <div className="prose dark:prose-invert max-w-none text-muted/90 text-sm sm:text-base leading-relaxed my-3">
          {text.split('\n').map((para, i) =>
            para.trim() ? (
              <p key={i} className="mb-3">
                {para}
              </p>
            ) : null
          )}
        </div>
      );
    }

    case 'bullet_list': {
      const items = block.listItems || (block.content ? block.content.split('\n').filter(Boolean) : []);
      if (items.length === 0) return null;
      return (
        <ul className="space-y-2 my-4 pl-4 list-disc text-muted/90 text-sm sm:text-base">
          {items.map((it, idx) => (
            <li key={idx} className="leading-relaxed">
              {it.replace(/^[-*•]\s*/, '')}
            </li>
          ))}
        </ul>
      );
    }

    case 'numbered_list': {
      const items = block.listItems || (block.content ? block.content.split('\n').filter(Boolean) : []);
      if (items.length === 0) return null;
      return (
        <ol className="space-y-2.5 my-4 pl-4 list-decimal text-muted/90 text-sm sm:text-base font-medium">
          {items.map((it, idx) => (
            <li key={idx} className="leading-relaxed text-muted/90">
              <span className="font-normal">{it.replace(/^\d+[.)]\s*/, '')}</span>
            </li>
          ))}
        </ol>
      );
    }

    case 'quote': {
      if (!block.quoteText && !block.content) return null;
      return (
        <blockquote className="my-6 rounded-2xl border-l-4 border-accent bg-[var(--card)] p-5 sm:p-6 space-y-2 shadow-sm">
          <p className="text-base sm:text-lg italic text-foreground font-display leading-relaxed">
            &ldquo;{block.quoteText || block.content}&rdquo;
          </p>
          {(block.quoteAuthor || block.quoteRole) && (
            <div className="pt-2 text-xs font-mono text-muted flex items-center gap-2">
              {block.quoteAuthor && <span className="font-semibold text-foreground">{block.quoteAuthor}</span>}
              {block.quoteAuthor && block.quoteRole && <span>•</span>}
              {block.quoteRole && <span>{block.quoteRole}</span>}
            </div>
          )}
        </blockquote>
      );
    }

    case 'link': {
      if (!block.linkUrl) return null;
      return (
        <div className="my-3">
          <a
            href={block.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--card)] border border-border-subtle text-xs font-medium text-foreground hover:text-accent hover:border-accent/40 transition-all shadow-xs"
          >
            <span>{block.linkLabel || block.linkUrl}</span>
            <ExternalLink size={13} />
          </a>
        </div>
      );
    }

    case 'webpage':
    case 'dashboard':
    case 'image': {
      return <CaseStudyVisualBlock visual={block} />;
    }

    case 'svg': {
      const svgUrl = getImageUrl(block.imageUrl);
      if (!svgUrl) return null;
      let bgClass = 'bg-transparent';
      if (block.svgBackground === 'dark') bgClass = 'bg-[#0b0c0e] p-6 border border-white/[0.08]';
      if (block.svgBackground === 'card') bgClass = 'bg-[var(--card)] p-4 border border-border-subtle';

      return (
        <figure className="my-6 space-y-2 w-full">
          <div className={`relative overflow-hidden rounded-2xl ${bgClass} flex items-center justify-center shadow-sm`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={svgUrl}
              alt={block.imageAlt || block.imageCaption || 'SVG Vector Graphic'}
              className="max-h-[460px] w-auto max-w-full object-contain"
              loading="lazy"
            />
          </div>
          {block.imageCaption && (
            <figcaption className="text-xs font-mono text-center text-muted pt-1">
              {block.imageCaption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'image_text': {
      const isRight = block.imagePosition === 'right';
      return (
        <div className={`my-6 grid gap-6 md:grid-cols-2 items-center ${isRight ? 'md:grid-flow-dense' : ''}`}>
          <div className={isRight ? 'md:col-start-2' : ''}>
            {resolveImageUrl(block.imageUrl) && (
              <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-black/40 p-2 shadow-sm flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImageUrl(block.imageUrl)!}
                  alt={block.imageAlt || 'Visual'}
                  className="max-h-[380px] w-auto max-w-full object-contain rounded-xl"
                  loading="lazy"
                />
              </div>
            )}
          </div>
          <div className={`space-y-3 ${isRight ? 'md:col-start-1' : ''}`}>
            {block.content && (
              <div className="prose dark:prose-invert max-w-none text-muted/90 text-sm sm:text-base leading-relaxed">
                {block.content.split('\n').map((p, i) => (
                  <p key={i} className="mb-2.5">
                    {p}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'image_grid': {
      const rawUrls = block.imageGridUrls || (block.imageUrl ? [block.imageUrl] : []);
      const urls = rawUrls.map(getImageUrl).filter((u): u is string => Boolean(u));
      if (urls.length === 0) return null;
      const cols = block.imageGridColumns || 2;
      const gridClass =
        cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : cols === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2';

      return (
        <div className={`my-6 grid gap-4 ${gridClass}`}>
          {urls.map((url, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border-subtle/80 bg-[var(--card)] p-2 overflow-hidden flex items-center justify-center shadow-xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Grid asset ${i + 1}`}
                className="max-h-72 w-auto max-w-full object-contain rounded-xl"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      );
    }

    case 'metric': {
      if (!block.metricValue && !block.metricLabel) return null;
      return (
        <div className="my-6 rounded-2xl border border-border-subtle bg-[var(--card)] p-6 text-center space-y-1.5 shadow-sm max-w-md mx-auto">
          <p className="text-3xl sm:text-4xl font-mono font-bold text-accent">
            {block.metricValue}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {block.metricLabel}
          </p>
          {block.metricDescription && (
            <p className="text-xs text-muted max-w-xs mx-auto">
              {block.metricDescription}
            </p>
          )}
        </div>
      );
    }

    case 'metric_group': {
      const items = block.metrics || [];
      if (items.length === 0) return null;
      return (
        <div className="my-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((m, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border-subtle bg-[var(--card)] p-4 sm:p-5 text-center space-y-1 shadow-sm"
            >
              <p className="text-2xl sm:text-3xl font-mono font-bold text-accent">
                {m.value}
              </p>
              <p className="text-xs font-semibold text-foreground">
                {m.label}
              </p>
              {m.description && (
                <p className="text-[11px] text-muted line-clamp-2">
                  {m.description}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    case 'feature_list': {
      const feats = block.features || [];
      if (feats.length === 0 && !block.headingText) return null;
      return (
        <div className="my-6 space-y-3.5">
          {block.headingText && (
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-foreground tracking-tight mb-4">
              {block.headingText}
            </h3>
          )}
          {feats.map((feat, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row items-start gap-4 rounded-2xl border border-border-subtle/80 bg-[var(--card)] p-4 sm:p-5 shadow-xs overflow-hidden relative"
            >
              {feat.svg ? (
                <div
                  className="w-16 h-16 shrink-0 rounded-xl flex items-center justify-center bg-white/5 border border-white/10"
                  dangerouslySetInnerHTML={{ __html: feat.svg }}
                />
              ) : feat.imageUrl ? (
                <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-black/20 border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={feat.imageUrl} alt={feat.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 font-mono text-xs font-bold text-accent">
                  {feat.number || String(i + 1).padStart(2, '0')}
                </span>
              )}
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-foreground">
                  {feat.title}
                </h4>
                {feat.description && (
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    {feat.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'project_details': {
      const details = block.projectDetails || [];
      if (details.length === 0 && !block.headingText) return null;
      return (
        <div className="my-6">
          {block.headingText && (
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-foreground tracking-tight mb-5">
              {block.headingText}
            </h3>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 rounded-2xl border border-border-subtle/80 bg-[var(--card)] p-5 sm:p-6 shadow-xs">
            {details.map((detail, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-medium block">
                  {detail.label}
                </span>
                <p className="text-sm sm:text-base font-medium text-foreground">
                  {detail.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'callout': {
      return (
        <div className="my-6 rounded-2xl border border-[#4F8CFF]/30 bg-[#4F8CFF]/5 p-5 sm:p-6 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-[#4F8CFF]">
            <Info size={16} />
            <h4 className="text-sm sm:text-base font-semibold text-foreground">
              {block.calloutTitle || 'Key Insight'}
            </h4>
          </div>
          {block.calloutDescription && (
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {block.calloutDescription}
            </p>
          )}
          {block.calloutLink && (
            <a
              href={block.calloutLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F8CFF] hover:underline pt-1"
            >
              <span>Learn more</span>
              <ArrowRight size={12} />
            </a>
          )}
        </div>
      );
    }

    case 'divider': {
      const isWide = block.dividerSpacing === 'wide';
      return <hr className={`border-border-subtle/60 ${isWide ? 'my-12' : 'my-6'}`} />;
    }

    case 'embed': {
      if (!block.embedUrl) return null;
      // Sanitize safe iframe embeds (YouTube, Vimeo, Figma)
      const url = block.embedUrl;
      const isSafe =
        url.includes('youtube.com/embed') ||
        url.includes('youtu.be') ||
        url.includes('player.vimeo.com') ||
        url.includes('figma.com/embed');

      if (!isSafe) {
        return (
          <div className="my-4 p-4 rounded-xl border border-border-subtle bg-[var(--card)] text-xs text-muted flex items-center justify-between">
            <span>Embedded Resource: {url}</span>
            <a href={url} target="_blank" rel="noreferrer" className="text-accent underline inline-flex items-center gap-1">
              <span>Open Link</span> <ExternalLink size={12} />
            </a>
          </div>
        );
      }

      return (
        <div className="my-6 relative aspect-video w-full overflow-hidden rounded-2xl border border-border-subtle bg-black shadow-lg">
          <iframe
            src={url}
            title="Embedded interactive preview"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    default:
      return null;
  }
}
