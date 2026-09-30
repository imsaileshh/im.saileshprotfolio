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

  // Resolve type from metadata or fallback to slug
  let sectionType: CaseStudySectionType = meta.sectionType || 'standard';
  const slugLower = (section.slug || section.title || '').toLowerCase();

  if (sectionType === 'standard') {
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

  // Render modular UX blocks
  switch (sectionType) {
    case 'user_flow':
      return <UserFlowSection userFlow={meta.userFlow || DEFAULT_USER_FLOW_DEMO} />;

    case 'information_architecture':
      return <InformationArchitectureSection iaData={meta.informationArchitecture || DEFAULT_IA_DEMO} />;

    case 'empathy_map':
      return <EmpathyMapSection empathyMap={meta.empathyMap || DEFAULT_EMPATHY_MAP_DEMO} />;

    case 'persona':
      return <PersonaSection persona={meta.persona || DEFAULT_PERSONA_DEMO} />;

    case 'journey_map':
      return <JourneyMapSection journeyMap={meta.journeyMap || DEFAULT_JOURNEY_MAP_DEMO} />;

    case 'competitive_analysis':
      return <CompetitiveAnalysisSection analysis={meta.competitiveAnalysis || DEFAULT_COMPETITIVE_ANALYSIS_DEMO} />;

    case 'design_decision':
      return <DesignDecisionSection designDecisionData={meta.designDecision || DEFAULT_DESIGN_DECISIONS_DEMO} />;

    case 'metrics':
      return <MetricsSection metricsData={meta.metrics || DEFAULT_METRICS_DEMO} />;

    case 'design_process':
      return <DesignProcessSection processData={meta.designProcess || DEFAULT_DESIGN_PROCESS_DEMO} />;

    case 'design_system':
    case 'color_tokens':
    case 'typography':
    case 'spacing':
    case 'radius':
    case 'shadows':
    case 'component_library':
      return <DesignSystemSection designSystemData={meta.designSystem || DEFAULT_DESIGN_SYSTEM_DEMO} />;

    case 'gallery':
      return <GallerySection galleryData={meta.gallery || DEFAULT_GALLERY_DEMO} />;

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
