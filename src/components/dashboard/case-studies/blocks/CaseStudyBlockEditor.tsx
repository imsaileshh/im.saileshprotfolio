'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { CaseStudyVisualEditor } from '@/components/dashboard/case-studies/CaseStudyVisualEditor';
import { normalizeCaseStudyVisual } from '@/types/case-study-visual';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { GalleryInput } from '@/components/dashboard/projects/GalleryInput';

// Block Editors
import { UserFlowBlockEditor } from './UserFlowBlockEditor';
import { EmpathyMapBlockEditor } from './EmpathyMapBlockEditor';
import { UserPersonaBlockEditor } from './UserPersonaBlockEditor';
import { ResearchFindingsBlockEditor } from './ResearchFindingsBlockEditor';
import { CompetitiveAnalysisBlockEditor } from './CompetitiveAnalysisBlockEditor';
import { InformationArchitectureBlockEditor } from './InformationArchitectureBlockEditor';
import { JourneyMapBlockEditor } from './JourneyMapBlockEditor';
import { ProblemStatementBlockEditor } from './ProblemStatementBlockEditor';
import { DesignDecisionBlockEditor } from './DesignDecisionBlockEditor';
import { DesignProcessBlockEditor } from './DesignProcessBlockEditor';
import { DesignSystemBlockEditor } from './DesignSystemBlockEditor';
import { ColorTokenBlockEditor } from './ColorTokenBlockEditor';
import { TypographyTokenBlockEditor } from './TypographyTokenBlockEditor';
import { SpacingTokenBlockEditor } from './SpacingTokenBlockEditor';
import { RadiusTokenBlockEditor } from './RadiusTokenBlockEditor';
import { ShadowTokenBlockEditor } from './ShadowTokenBlockEditor';
import { ComponentShowcaseBlockEditor } from './ComponentShowcaseBlockEditor';
import { ComponentStatesBlockEditor } from './ComponentStatesBlockEditor';
import { BeforeAfterBlockEditor } from './BeforeAfterBlockEditor';
import { CategoryTabsBlockEditor } from './CategoryTabsBlockEditor';

import { MyRoleBlockEditor } from './MyRoleBlockEditor';
import { DesignThinkingProcessEditor } from './DesignThinkingProcessEditor';
import { ProjectTimelineBlockEditor } from './ProjectTimelineBlockEditor';
import { MilestonesBlockEditor } from './MilestonesBlockEditor';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface CaseStudyBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function CaseStudyBlockEditor({ block, onChange }: CaseStudyBlockEditorProps) {
  switch (block.type) {
    // Native / Legacy Content Blocks
    case 'paragraph':
    case 'rich_text':
      return (
        <textarea
          value={block.content || ''}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Write your paragraph content..."
          rows={4}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#4F8CFF] transition-colors resize-y"
        />
      );

    case 'heading':
      return (
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">Heading Text *</label>
            <input
              type="text"
              value={block.headingText || ''}
              onChange={(e) => onChange({ headingText: e.target.value })}
              placeholder="e.g. Research Insights & Validation"
              className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white outline-none focus:border-[#4F8CFF]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">Level</label>
            <select
              value={block.headingLevel || 'h2'}
              onChange={(e) => onChange({ headingLevel: e.target.value as 'h2' | 'h3' | 'h4' })}
              className="h-8 w-full rounded-lg border border-white/10 bg-[#121316] px-2 text-xs text-white outline-none"
            >
              <option value="h2">H2 (Large)</option>
              <option value="h3">H3 (Medium)</option>
              <option value="h4">H4 (Small)</option>
            </select>
          </div>
        </div>
      );

    case 'bullet_list':
    case 'numbered_list':
      return (
        <div className="space-y-2">
          <label className="block text-[11px] font-mono text-zinc-400 mb-1">List Items (One per line)</label>
          <textarea
            value={block.content || block.listItems?.join('\n') || ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange({
                content: val,
                listItems: val.split('\n').filter(Boolean),
              });
            }}
            rows={3}
            placeholder="Item 1&#10;Item 2&#10;Item 3"
            className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-2 text-xs text-white outline-none focus:border-[#4F8CFF]"
          />
        </div>
      );

    case 'quote':
      return (
        <div className="space-y-2.5">
          <textarea
            value={block.quoteText || block.content || ''}
            onChange={(e) => onChange({ quoteText: e.target.value, content: e.target.value })}
            rows={2}
            placeholder="Quote text..."
            className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#4F8CFF]"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="text"
              value={block.quoteAuthor || ''}
              onChange={(e) => onChange({ quoteAuthor: e.target.value })}
              placeholder="Author (e.g. Lead Designer)"
              className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white outline-none"
            />
            <input
              type="text"
              value={block.quoteRole || ''}
              onChange={(e) => onChange({ quoteRole: e.target.value })}
              placeholder="Role / Context"
              className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white outline-none"
            />
          </div>
        </div>
      );

    case 'image':
    case 'webpage':
    case 'dashboard':
      return (
        <CaseStudyVisualEditor
          value={block}
          title={
            block.type === 'webpage'
              ? 'Webpage / Long Screenshot'
              : block.type === 'dashboard'
              ? 'Dashboard / UI Screen'
              : 'Standard Image / Visual'
          }
          onChange={(updatedVisual) => {
            const norm = normalizeCaseStudyVisual(updatedVisual);
            const { url, ...visualProps } = norm;
            onChange({
              ...updatedVisual,
              ...visualProps,
              type: norm.displayType || block.type,
              imageUrl: norm.imageUrl || url,
              imageAlt: norm.alt,
              imageCaption: norm.caption,
            });
          }}
        />
      );

    case 'svg':
      return (
        <div className="space-y-2">
          <ImageUploader
            name={`block_svg_${block.id}`}
            value={block.imageUrl || ''}
            onChange={(url) => onChange({ imageUrl: url })}
            label="Upload SVG Vector Graphic"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="text"
              value={block.imageCaption || ''}
              onChange={(e) => onChange({ imageCaption: e.target.value })}
              placeholder="Caption (optional)"
              className="h-7 w-full rounded-lg border border-white/10 bg-black/50 px-2 text-[11px] text-zinc-300 outline-none"
            />
            <input
              type="text"
              value={block.imageAlt || ''}
              onChange={(e) => onChange({ imageAlt: e.target.value })}
              placeholder="Alt text"
              className="h-7 w-full rounded-lg border border-white/10 bg-black/50 px-2 text-[11px] text-zinc-300 outline-none"
            />
          </div>
        </div>
      );

    case 'image_text':
      return (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <ImageUploader
                name={`block_imgtxt_${block.id}`}
                value={block.imageUrl || ''}
                onChange={(url) => onChange({ imageUrl: url })}
                label="Upload Visual"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Image Position</label>
              <select
                value={block.imagePosition || 'left'}
                onChange={(e) => onChange({ imagePosition: e.target.value as 'left' | 'right' })}
                className="h-8 w-full rounded-lg border border-white/10 bg-[#121316] px-2 text-xs text-white outline-none"
              >
                <option value="left">Image on Left</option>
                <option value="right">Image on Right</option>
              </select>
            </div>
          </div>
          <textarea
            value={block.content || ''}
            onChange={(e) => onChange({ content: e.target.value })}
            rows={3}
            placeholder="Text description beside image..."
            className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-2 text-xs text-white outline-none focus:border-[#4F8CFF]"
          />
        </div>
      );

    case 'image_grid':
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-mono text-zinc-400">Grid Columns</label>
            <select
              value={block.imageGridColumns || 2}
              onChange={(e) => onChange({ imageGridColumns: Number(e.target.value) as 2 | 3 | 4 })}
              className="h-7 rounded-lg border border-white/10 bg-[#121316] px-2 text-xs text-white outline-none"
            >
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
              <option value={4}>4 Columns</option>
            </select>
          </div>
          <GalleryInput
            initialUrls={block.imageGridUrls || []}
            onChange={(urls) => onChange({ imageGridUrls: urls })}
          />
        </div>
      );

    case 'metric':
    case 'metric_group':
      return (
        <div className="space-y-2">
          {(block.metrics || [
            { value: block.metricValue || '42%', label: block.metricLabel || 'Task completion' },
          ]).map((m, mIdx) => (
            <div key={mIdx} className="grid gap-2 sm:grid-cols-2">
              <input
                type="text"
                value={m.value}
                onChange={(e) => {
                  const nextM = [...(block.metrics || [{ value: '', label: '' }])];
                  nextM[mIdx] = { ...nextM[mIdx], value: e.target.value };
                  onChange({ metrics: nextM, metricValue: mIdx === 0 ? e.target.value : block.metricValue });
                }}
                placeholder="Value (e.g. +42%)"
                className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-emerald-400 font-bold"
              />
              <input
                type="text"
                value={m.label}
                onChange={(e) => {
                  const nextM = [...(block.metrics || [{ value: '', label: '' }])];
                  nextM[mIdx] = { ...nextM[mIdx], label: e.target.value };
                  onChange({ metrics: nextM, metricLabel: mIdx === 0 ? e.target.value : block.metricLabel });
                }}
                placeholder="Label"
                className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const nextM = [...(block.metrics || []), { value: '', label: '' }];
              onChange({ metrics: nextM });
            }}
            className="text-[11px] text-[#4F8CFF] hover:underline"
          >
            + Add Metric
          </button>
        </div>
      );

    case 'feature_list':
      return (
        <div className="space-y-2.5">
          {(block.features || []).map((feat, fIdx) => (
            <div key={fIdx} className="p-2.5 rounded-lg border border-white/[0.06] bg-black/30 space-y-1.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={feat.number || String(fIdx + 1).padStart(2, '0')}
                  onChange={(e) => {
                    const nextF = [...(block.features || [])];
                    nextF[fIdx] = { ...nextF[fIdx], number: e.target.value };
                    onChange({ features: nextF });
                  }}
                  className="h-7 w-12 rounded border border-white/10 bg-black/50 px-1.5 text-center text-xs font-mono text-[#4F8CFF]"
                />
                <input
                  type="text"
                  value={feat.title}
                  onChange={(e) => {
                    const nextF = [...(block.features || [])];
                    nextF[fIdx] = { ...nextF[fIdx], title: e.target.value };
                    onChange({ features: nextF });
                  }}
                  placeholder="Feature title"
                  className="h-7 flex-1 rounded border border-white/10 bg-black/50 px-2 text-xs text-white"
                />
              </div>
              <textarea
                value={feat.description}
                onChange={(e) => {
                  const nextF = [...(block.features || [])];
                  nextF[fIdx] = { ...nextF[fIdx], description: e.target.value };
                  onChange({ features: nextF });
                }}
                rows={2}
                placeholder="Feature description..."
                className="w-full rounded border border-white/10 bg-black/50 px-2 py-1 text-xs text-zinc-300"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const nextF = [
                ...(block.features || []),
                { number: String((block.features?.length || 0) + 1).padStart(2, '0'), title: '', description: '' },
              ];
              onChange({ features: nextF });
            }}
            className="text-[11px] text-[#4F8CFF] hover:underline"
          >
            + Add Feature Item
          </button>
        </div>
      );

    case 'callout':
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={block.calloutTitle || ''}
            onChange={(e) => onChange({ calloutTitle: e.target.value })}
            placeholder="Callout Title"
            className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white"
          />
          <textarea
            value={block.calloutDescription || ''}
            onChange={(e) => onChange({ calloutDescription: e.target.value })}
            rows={2}
            placeholder="Callout text..."
            className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs text-white"
          />
        </div>
      );

    case 'embed':
      return (
        <div>
          <label className="block text-[11px] font-mono text-zinc-400 mb-1">Embed URL (YouTube, Vimeo, Figma)</label>
          <input
            type="url"
            value={block.embedUrl || ''}
            onChange={(e) => onChange({ embedUrl: e.target.value })}
            placeholder="https://..."
            className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white"
          />
        </div>
      );

    case 'divider':
      return <div className="text-xs text-zinc-500 italic">Visual Divider Line</div>;

    // Extended UX/UI & Product Design Block Editors
    case 'user_flow':
      return <UserFlowBlockEditor block={block} onChange={onChange} />;
    case 'empathy_map':
      return <EmpathyMapBlockEditor block={block} onChange={onChange} />;
    case 'user_persona':
      return <UserPersonaBlockEditor block={block} onChange={onChange} />;
    case 'research_findings':
      return <ResearchFindingsBlockEditor block={block} onChange={onChange} />;
    case 'competitive_analysis':
      return <CompetitiveAnalysisBlockEditor block={block} onChange={onChange} />;
    case 'information_architecture':
      return <InformationArchitectureBlockEditor block={block} onChange={onChange} />;
    case 'journey_map':
      return <JourneyMapBlockEditor block={block} onChange={onChange} />;
    case 'problem_statement':
      return <ProblemStatementBlockEditor block={block} onChange={onChange} />;
    case 'design_decision':
      return <DesignDecisionBlockEditor block={block} onChange={onChange} />;
    case 'design_process':
      return <DesignProcessBlockEditor block={block} onChange={onChange} />;
    case 'design_system':
      return <DesignSystemBlockEditor block={block} onChange={onChange} />;
    case 'color_tokens':
      return <ColorTokenBlockEditor block={block} onChange={onChange} />;
    case 'typography_tokens':
      return <TypographyTokenBlockEditor block={block} onChange={onChange} />;
    case 'spacing_tokens':
      return <SpacingTokenBlockEditor block={block} onChange={onChange} />;
    case 'radius_tokens':
      return <RadiusTokenBlockEditor block={block} onChange={onChange} />;
    case 'shadow_tokens':
      return <ShadowTokenBlockEditor block={block} onChange={onChange} />;
    case 'component_showcase':
      return <ComponentShowcaseBlockEditor block={block} onChange={onChange} />;
    case 'component_states':
      return <ComponentStatesBlockEditor block={block} onChange={onChange} />;
    case 'before_after':
      return <BeforeAfterBlockEditor block={block} onChange={onChange} />;
    case 'category_tabs':
      return <CategoryTabsBlockEditor block={block} onChange={onChange} />;
    case 'role_responsibilities':
      return <MyRoleBlockEditor block={block} onChange={onChange} />;
    case 'design_thinking_process':
      return <DesignThinkingProcessEditor block={block} onChange={onChange} />;
    case 'project_timeline':
      return <ProjectTimelineBlockEditor block={block} onChange={onChange} />;
    case 'milestones':
      return <MilestonesBlockEditor block={block} onChange={onChange} />;

    default:
      return (
        <div className="text-xs text-zinc-500 italic">
          Default editor for block type: {block.type}
        </div>
      );
  }
}
