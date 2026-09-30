'use client';

import React from 'react';
import Image from 'next/image';
import { Quote, Sparkles, ExternalLink, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { CaseStudyVisualBlock } from './CaseStudyVisualBlock';

import { UserFlowSection } from './sections/UserFlowSection';
import { InformationArchitectureSection } from './sections/InformationArchitectureSection';
import { EmpathyMapSection } from './sections/EmpathyMapSection';
import { PersonaSection } from './sections/PersonaSection';
import { JourneyMapSection } from './sections/JourneyMapSection';
import { CompetitiveAnalysisSection } from './sections/CompetitiveAnalysisSection';
import { DesignDecisionSection } from './sections/DesignDecisionSection';
import { MetricsSection } from './sections/MetricsSection';
import { DesignProcessSection } from './sections/DesignProcessSection';
import { DesignSystemSection } from './sections/DesignSystemSection';

import { ResearchFindingsBlock } from './blocks/ResearchFindingsBlock';
import { ProblemStatementBlock } from './blocks/ProblemStatementBlock';
import { BeforeAfterBlock } from './blocks/BeforeAfterBlock';
import { CategoryTabsBlock } from './blocks/CategoryTabsBlock';

import { MyRoleBlock } from './blocks/MyRoleBlock';
import { DesignThinkingProcess } from './blocks/DesignThinkingProcess';
import { ProjectTimelineBlock } from './blocks/ProjectTimelineBlock';
import { MilestonesBlock } from './blocks/MilestonesBlock';
import {
  DEFAULT_ROLE_RESPONSIBILITIES_DEMO,
  DEFAULT_DESIGN_THINKING_PROCESS_DEMO,
  DEFAULT_PROJECT_TIMELINE_DEMO,
  DEFAULT_MILESTONES_DEMO,
} from '@/lib/data/case-study-demo-data';

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
    | 'embed'
    | 'user_persona'
    | 'empathy_map'
    | 'research_findings'
    | 'pain_points'
    | 'user_goals'
    | 'user_quote'
    | 'competitive_analysis'
    | 'user_flow'
    | 'task_flow'
    | 'information_architecture'
    | 'sitemap'
    | 'journey_map'
    | 'problem_statement'
    | 'design_decision'
    | 'alternative_considered'
    | 'tradeoff'
    | 'solution_outcome'
    | 'before_after'
    | 'design_process'
    | 'timeline'
    | 'milestone'
    | 'role_responsibilities'
    | 'design_thinking_process'
    | 'project_timeline'
    | 'milestones'
    | 'design_system'
    | 'color_tokens'
    | 'semantic_tokens'
    | 'typography_tokens'
    | 'spacing_tokens'
    | 'radius_tokens'
    | 'shadow_tokens'
    | 'component_showcase'
    | 'component_states'
    | 'iconography'
    | 'kpi_cards'
    | 'category_tabs';
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

  // Extensions for UX & Design System Blocks
  userPersonaData?: any;
  empathyMapData?: any;
  researchFindings?: any[];
  competitiveAnalysisData?: any;
  userFlowData?: any;
  iaData?: any;
  journeyMapData?: any;
  problemStatementData?: any;
  designDecisionData?: any;
  designProcessData?: any;
  roleData?: any;
  processData?: any;
  timelineData?: any;
  milestonesData?: any;
  designSystemData?: any;
  colorTokensData?: any;
  typographyTokensData?: any;
  spacingTokensData?: any;
  radiusTokensData?: any;
  shadowTokensData?: any;
  componentShowcaseData?: any;
  metricsData?: any;
  beforeAfterData?: any;
  categoryTabsData?: any;
}

import { resolveImageUrl } from '@/lib/media/resolve-image-url';

export { resolveImageUrl };
export const getImageUrl = resolveImageUrl;

export function CustomBlockRenderer({ block }: { block: ContentBlockItem }) {
  switch (block.type) {
    // ── UX & Product Design Blocks ──
    case 'user_flow':
    case 'task_flow':
      return <UserFlowSection userFlow={block.userFlowData} />;

    case 'empathy_map':
      return <EmpathyMapSection empathyMap={block.empathyMapData} />;

    case 'user_persona':
      return <PersonaSection persona={block.userPersonaData} />;

    case 'research_findings':
    case 'pain_points':
    case 'user_goals':
    case 'user_quote':
      return <ResearchFindingsBlock block={block} />;

    case 'competitive_analysis':
      return <CompetitiveAnalysisSection analysis={block.competitiveAnalysisData} />;

    case 'information_architecture':
    case 'sitemap':
      return <InformationArchitectureSection iaData={block.iaData} />;

    case 'journey_map':
      return <JourneyMapSection journeyMap={block.journeyMapData} />;

    case 'problem_statement':
      return <ProblemStatementBlock block={block} />;

    case 'design_decision':
    case 'alternative_considered':
    case 'tradeoff':
    case 'solution_outcome':
      return <DesignDecisionSection designDecisionData={block.designDecisionData} />;

    case 'design_process':
    case 'timeline':
    case 'milestone':
      return <DesignProcessSection processData={block.designProcessData} />;

    case 'role_responsibilities':
      return <MyRoleBlock data={block.roleData || DEFAULT_ROLE_RESPONSIBILITIES_DEMO} />;

    case 'design_thinking_process':
      return <DesignThinkingProcess data={block.processData || DEFAULT_DESIGN_THINKING_PROCESS_DEMO} />;

    case 'project_timeline':
      return <ProjectTimelineBlock data={block.timelineData || DEFAULT_PROJECT_TIMELINE_DEMO} />;

    case 'milestones':
      return <MilestonesBlock data={block.milestonesData || DEFAULT_MILESTONES_DEMO} />;

    case 'design_system':
    case 'color_tokens':
    case 'semantic_tokens':
    case 'typography_tokens':
    case 'spacing_tokens':
    case 'radius_tokens':
    case 'shadow_tokens':
    case 'component_showcase':
    case 'component_states':
    case 'iconography':
      return <DesignSystemSection designSystemData={block.designSystemData} />;

    case 'kpi_cards':
      return <MetricsSection metricsData={block.metricsData} />;

    case 'before_after':
      return <BeforeAfterBlock block={block} />;

    case 'category_tabs':
      return <CategoryTabsBlock block={block} />;

    // ── Existing Standard Core Content Blocks ──
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
      if (!block.content) return null;
      return (
        <div className="prose prose-invert max-w-none text-muted leading-relaxed my-4 text-[15px] sm:text-base">
          {block.content.split('\n').map((para, i) => (para.trim() ? <p key={i} className="mb-3">{para}</p> : null))}
        </div>
      );
    }

    case 'bullet_list': {
      const items = block.listItems || [];
      if (items.length === 0) return null;
      return (
        <ul className="my-4 space-y-2 text-muted list-disc list-inside text-[15px] sm:text-base">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }

    case 'numbered_list': {
      const items = block.listItems || [];
      if (items.length === 0) return null;
      return (
        <ol className="my-4 space-y-2 text-muted list-decimal list-inside text-[15px] sm:text-base">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    }

    case 'quote': {
      if (!block.quoteText) return null;
      return (
        <blockquote className="my-6 border-l-2 border-accent pl-5 py-2 font-display italic text-lg sm:text-xl text-foreground/90 space-y-2">
          <p>"{block.quoteText}"</p>
          {(block.quoteAuthor || block.quoteRole) && (
            <footer className="text-xs font-mono font-normal not-italic text-muted uppercase tracking-wider">
              — {block.quoteAuthor} {block.quoteRole ? `(${block.quoteRole})` : ''}
            </footer>
          )}
        </blockquote>
      );
    }

    case 'image':
    case 'webpage':
    case 'dashboard': {
      const visual = {
        imageUrl: resolveImageUrl(block.imageUrl || block.content) || '',
        alt: block.imageAlt || '',
        caption: block.imageCaption || '',
        displayType: block.displayType || (block.type as any) || 'image',
        displaySize: block.displaySize || 'large',
        backgroundType: block.backgroundType || 'none',
        backgroundColor: block.backgroundColor || '#0E0F12',
        padding: block.padding,
        radius: block.radius,
        fit: block.fit || 'natural',
      };
      return <CaseStudyVisualBlock visual={visual} />;
    }

    case 'image_text': {
      const imgUrl = resolveImageUrl(block.imageUrl);
      const isRight = block.imagePosition === 'right';
      return (
        <div className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className={`lg:col-span-6 space-y-4 ${isRight ? 'lg:order-1' : 'lg:order-2'}`}>
            {block.headingText && (
              <h3 className="text-xl font-display font-semibold text-foreground">{block.headingText}</h3>
            )}
            <p className="text-sm text-muted leading-relaxed">{block.content}</p>
          </div>
          {imgUrl && (
            <div className={`lg:col-span-6 relative aspect-[16/10] rounded-2xl overflow-hidden border border-border-subtle bg-[var(--panel)] ${isRight ? 'lg:order-2' : 'lg:order-1'}`}>
              <Image src={imgUrl} alt={block.imageAlt || ''} fill className="object-cover" />
            </div>
          )}
        </div>
      );
    }

    case 'image_grid': {
      const urls = (block.imageGridUrls || []).map((u) => resolveImageUrl(u)).filter(Boolean) as string[];
      if (urls.length === 0) return null;
      const cols = block.imageGridColumns || 3;
      return (
        <div className={`my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${cols} gap-4`}>
          {urls.map((url, i) => (
            <div key={i} className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-border-subtle bg-[var(--panel)]">
              <Image src={url} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      );
    }

    case 'svg': {
      const svgUrl = resolveImageUrl(block.imageUrl);
      if (!svgUrl) return null;
      return (
        <div className="my-6 rounded-2xl border border-border-subtle/80 bg-[var(--card)] p-6 flex justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={svgUrl} alt={block.imageAlt || 'SVG Specimen'} className="max-w-full h-auto" />
        </div>
      );
    }

    case 'metric': {
      if (!block.metricValue) return null;
      return (
        <div className="my-6 p-6 rounded-2xl border border-border-subtle bg-[var(--card)] text-center space-y-2 max-w-sm mx-auto shadow-sm">
          <p className="text-4xl sm:text-5xl font-mono font-extrabold text-accent">{block.metricValue}</p>
          <p className="text-sm font-semibold text-foreground">{block.metricLabel}</p>
          {block.metricDescription && <p className="text-xs text-muted">{block.metricDescription}</p>}
        </div>
      );
    }

    case 'metric_group': {
      const mets = block.metrics || [];
      if (mets.length === 0) return null;
      return (
        <div className="my-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {mets.map((m, i) => (
            <div key={i} className="rounded-2xl border border-border-subtle bg-[var(--card)] p-4 sm:p-5 text-center space-y-1 shadow-sm">
              <p className="text-2xl sm:text-3xl font-mono font-bold text-accent">{m.value}</p>
              <p className="text-xs font-semibold text-foreground">{m.label}</p>
              {m.description && <p className="text-[11px] text-muted line-clamp-2">{m.description}</p>}
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
            <div key={i} className="flex flex-col sm:flex-row items-start gap-4 rounded-2xl border border-border-subtle/80 bg-[var(--card)] p-4 sm:p-5 shadow-xs overflow-hidden relative">
              {feat.svg ? (
                <div className="w-16 h-16 shrink-0 rounded-xl flex items-center justify-center bg-[var(--panel)] border border-border-subtle" dangerouslySetInnerHTML={{ __html: feat.svg }} />
              ) : feat.imageUrl ? (
                <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-[var(--panel)] border border-border-subtle">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={feat.imageUrl} alt={feat.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 font-mono text-xs font-bold text-accent">
                  {feat.number || String(i + 1).padStart(2, '0')}
                </span>
              )}
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-foreground">{feat.title}</h4>
                {feat.description && <p className="text-xs sm:text-sm text-muted leading-relaxed">{feat.description}</p>}
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
                <p className="text-sm sm:text-base font-medium text-foreground">{detail.value}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'callout': {
      return (
        <div className="my-6 rounded-2xl border border-accent/30 bg-accent/10 p-5 sm:p-6 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-accent">
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
            <a href={block.calloutLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline pt-1">
              <span>Learn more</span> <ArrowRight size={12} />
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
