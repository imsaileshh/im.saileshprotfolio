'use client';

import { ExtendedSectionMetadata, CaseStudySectionType } from '@/types/case-study-builder';
import { UserFlowSection } from './UserFlowSection';
import { InformationArchitectureSection } from './InformationArchitectureSection';
import { EmpathyMapSection } from './EmpathyMapSection';
import { PersonaSection } from './PersonaSection';
import { JourneyMapSection } from './JourneyMapSection';
import { CompetitiveAnalysisSection } from './CompetitiveAnalysisSection';
import { DesignDecisionSection } from './DesignDecisionSection';
import { MetricsSection } from './MetricsSection';
import { DesignProcessSection } from './DesignProcessSection';
import { DesignSystemSection } from './DesignSystemSection';
import { GallerySection } from './GallerySection';
import { CustomBlockRenderer } from '../CustomBlockRenderer';
import { CaseStudyVisualBlock } from '../CaseStudyVisualBlock';
import { normalizeCaseStudyVisual } from '@/types/case-study-visual';
import { resolveImageUrl } from '@/lib/media/resolve-image-url';
import {
  DEFAULT_USER_FLOW_DEMO,
  DEFAULT_IA_DEMO,
  DEFAULT_EMPATHY_MAP_DEMO,
  DEFAULT_PERSONA_DEMO,
  DEFAULT_JOURNEY_MAP_DEMO,
  DEFAULT_COMPETITIVE_ANALYSIS_DEMO,
  DEFAULT_DESIGN_DECISIONS_DEMO,
  DEFAULT_METRICS_DEMO,
  DEFAULT_DESIGN_PROCESS_DEMO,
  DEFAULT_DESIGN_SYSTEM_DEMO,
  DEFAULT_GALLERY_DEMO,
} from '@/lib/data/case-study-demo-data';

interface CaseStudySectionRendererProps {
  section: {
    id?: string;
    title: string;
    slug?: string;
    content?: string | null;
    images?: string[];
    metadata?: any;
  };
}

export function CaseStudySectionRenderer({ section }: CaseStudySectionRendererProps) {
  const meta: ExtendedSectionMetadata = (section.metadata as ExtendedSectionMetadata) || {};

  // Check if this section contains modular content blocks (Case Study Builder / Block Editor)
  const hasBlocks = Array.isArray(meta.blocks) && meta.blocks.length > 0;

  // Resolve type from metadata or fallback to slug ONLY if the section has no explicit content blocks
  let sectionType: CaseStudySectionType = hasBlocks ? 'standard' : (meta.sectionType || 'standard');
  const slugLower = (section.slug || section.title || '').toLowerCase();

  if (!hasBlocks && sectionType === 'standard') {
    if (slugLower.includes('user-flow') || slugLower.includes('user flow')) sectionType = 'user_flow';
    else if (slugLower.includes('architecture') || slugLower.includes('sitemap')) sectionType = 'information_architecture';
    else if (slugLower.includes('empathy')) sectionType = 'empathy_map';
    else if (slugLower.includes('persona')) sectionType = 'persona';
    else if (slugLower.includes('journey')) sectionType = 'journey_map';
    else if (slugLower.includes('competitive')) sectionType = 'competitive_analysis';
    else if (slugLower.includes('decision')) sectionType = 'design_decision';
    else if (slugLower.includes('metric') || slugLower.includes('results')) sectionType = 'metrics';
    else if (slugLower.includes('process') || slugLower.includes('learnings')) sectionType = 'design_process';
    else if (slugLower.includes('design-system') || slugLower.includes('design system')) sectionType = 'design_system';
    else if (slugLower.includes('color')) sectionType = 'color_tokens';
    else if (slugLower.includes('typography')) sectionType = 'typography';
    else if (slugLower.includes('gallery')) sectionType = 'gallery';
  }

  // Render modular UX blocks (for non-block-based monolithic sections)
  switch (sectionType) {
    case 'user_flow': {
      const userFlow = meta.userFlow ?? (section as any).userFlow ?? (section as any).userFlowData ?? DEFAULT_USER_FLOW_DEMO;
      return <UserFlowSection userFlow={userFlow} />;
    }

    case 'information_architecture': {
      const iaData = meta.informationArchitecture ?? (section as any).iaData ?? (section as any).informationArchitecture ?? DEFAULT_IA_DEMO;
      return <InformationArchitectureSection iaData={iaData} />;
    }

    case 'empathy_map': {
      const empathyMap = meta.empathyMap ?? (section as any).empathyMap ?? DEFAULT_EMPATHY_MAP_DEMO;
      return <EmpathyMapSection empathyMap={empathyMap} />;
    }

    case 'persona': {
      const persona = meta.persona ?? (section as any).persona ?? DEFAULT_PERSONA_DEMO;
      return <PersonaSection persona={persona} />;
    }

    case 'journey_map': {
      const journeyMap = meta.journeyMap ?? (section as any).journeyMap ?? DEFAULT_JOURNEY_MAP_DEMO;
      return <JourneyMapSection journeyMap={journeyMap} />;
    }

    case 'competitive_analysis': {
      const analysis = meta.competitiveAnalysis ?? (section as any).competitiveAnalysis ?? DEFAULT_COMPETITIVE_ANALYSIS_DEMO;
      return <CompetitiveAnalysisSection analysis={analysis} />;
    }

    case 'design_decision': {
      const designDecisionData = meta.designDecision ?? (section as any).designDecision ?? DEFAULT_DESIGN_DECISIONS_DEMO;
      return <DesignDecisionSection designDecisionData={designDecisionData} />;
    }

    case 'metrics': {
      const metricsData = meta.metrics ?? (section as any).metrics ?? DEFAULT_METRICS_DEMO;
      return <MetricsSection metricsData={metricsData} />;
    }

    case 'design_process': {
      const processData = meta.designProcess ?? (section as any).designProcess ?? (section as any).designProcessData ?? (section as any).processData ?? DEFAULT_DESIGN_PROCESS_DEMO;
      return <DesignProcessSection processData={processData} />;
    }

    case 'design_system':
    case 'color_tokens':
    case 'typography':
    case 'spacing':
    case 'radius':
    case 'shadows':
    case 'component_library': {
      const designSystemData = meta.designSystem ?? (section as any).designSystem ?? DEFAULT_DESIGN_SYSTEM_DEMO;
      return <DesignSystemSection designSystemData={designSystemData} />;
    }

    case 'gallery': {
      const galleryData = meta.gallery ?? (section as any).gallery ?? DEFAULT_GALLERY_DEMO;
      return <GallerySection galleryData={galleryData} />;
    }

    default: {
      // Standard prose + visuals + blocks + stats
      const rawMediaList = Array.isArray(meta.media) && meta.media.length > 0
        ? meta.media
        : (section.images || []).map((url: string) => ({
            url: resolveImageUrl(url) || url,
            type: url.endsWith('.svg') ? 'svg' : 'image',
          }));

      let mediaItems = rawMediaList
        .map((item: any, index: number) => {
          const normalized = normalizeCaseStudyVisual(item, index);
          return {
            ...item,
            ...normalized,
            url: normalized.url || normalized.imageUrl,
            imageUrl: normalized.imageUrl || normalized.url,
          };
        })
        .filter((item: any) => Boolean(item.imageUrl));

      if (!mediaItems.length) {
        mediaItems = (section.images || []).map(normalizeCaseStudyVisual).filter((item: any) => Boolean(item.imageUrl));
      }

      const stats: Array<{ value: string; label: string }> = meta.stats || [];
      const blocks = meta.blocks || [];
      const layout = meta.layout || 'full_width';

      let layoutContainerClass = 'space-y-8';
      if (layout === 'two_column') layoutContainerClass = 'grid gap-8 lg:grid-cols-2 items-start';
      else if (layout === 'split_text_media') layoutContainerClass = 'grid gap-8 lg:grid-cols-12 items-center';
      else if (layout === 'text_focus') layoutContainerClass = 'max-w-2xl mx-auto space-y-6';

      return (
        <div className={layoutContainerClass}>
          {/* Prose Content */}
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

          {/* Stats Cards */}
          {stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
              {stats.map((st, sIdx) => (
                <div key={sIdx} className="rounded-2xl border border-border-subtle bg-card p-4 text-center space-y-1 shadow-sm">
                  <p className="text-2xl sm:text-3xl font-bold font-mono text-accent">{st.value}</p>
                  <p className="text-xs text-muted font-medium">{st.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Content Blocks */}
          {blocks.length > 0 && (
            <div className="space-y-6 my-8">
              {blocks.map((blk: any) => (
                <CustomBlockRenderer key={blk.id} block={blk} />
              ))}
            </div>
          )}

          {/* Media Items */}
          {mediaItems.length > 0 && (
            <div className="space-y-6 pt-4 w-full">
              {mediaItems.map((visual: any, mIdx: number) => (
                <CaseStudyVisualBlock key={visual.id || mIdx} visual={visual} />
              ))}
            </div>
          )}
        </div>
      );
    }
  }
}
