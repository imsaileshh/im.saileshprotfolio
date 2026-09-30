'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  FileCode,
  Type,
  Layout,
  Quote,
  BarChart2,
  Video,
  Upload,
  X,
  Sparkles,
  Sliders,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  BookOpen,
  Grid,
  Check,
  HelpCircle,
  Layers,
  Globe,
} from 'lucide-react';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { CustomBlockEditor } from './CustomBlockEditor';
import {
  CaseStudyVisual,
  CaseStudyVisualDisplayType,
  VISUAL_DEFAULTS,
  normalizeCaseStudyVisual,
} from '@/types/case-study-visual';
import { CaseStudyVisualEditor } from '@/components/dashboard/case-studies/CaseStudyVisualEditor';

export interface CaseStudyMediaItem extends Partial<CaseStudyVisual> {
  id: string;
  url: string;
  type?: 'image' | 'svg' | 'video' | 'webpage' | 'dashboard';
  caption?: string;
  alt?: string;
  width?: 'full' | 'half' | 'third' | 'contained';
  aspectRatio?: 'natural' | '16:9' | '16:10' | '4:3' | '1:1';
  background?: 'transparent' | 'dark' | 'card';
}

export interface CaseStudySectionItem {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  layout:
    | 'full_width'
    | 'two_column'
    | 'media_left'
    | 'media_right'
    | 'text_focus'
    | 'media_focus'
    | 'split_text_media'
    | 'split_media_text'
    | 'image_grid';
  content?: string;
  blocks?: ContentBlockItem[];
  media: CaseStudyMediaItem[];
  quote?: { text: string; author?: string; role?: string };
  stats?: Array<{ value: string; label: string }>;
  hidden?: boolean;
  settings?: {
    padding?: 'normal' | 'compact' | 'spacious';
    border?: boolean;
    lightbox?: boolean;
    maxWidth?: string;
  };
}

const TEMPLATES: Record<string, CaseStudySectionItem[]> = {
  basic: [
    { id: 'sec-1', title: '01 Executive Overview', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-1', type: 'paragraph', content: '' }], media: [] },
    { id: 'sec-2', title: '02 Challenge', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-2', type: 'problem_statement' }], media: [] },
    { id: 'sec-3', title: '03 Solution', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-3', type: 'paragraph' }, { id: 'b-4', type: 'image' }], media: [] },
    { id: 'sec-4', title: '04 Results & Impact', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-5', type: 'metric_group' }], media: [] },
  ],
  ui_ux: [
    { id: 'sec-1', title: '01 Overview', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-1', type: 'paragraph' }], media: [] },
    { id: 'sec-2', title: '02 Challenge', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-2', type: 'problem_statement' }], media: [] },
    { id: 'sec-3', title: '03 Research', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-3', type: 'research_findings' }, { id: 'b-4', type: 'user_persona' }], media: [] },
    { id: 'sec-4', title: '04 User Flow', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-5', type: 'user_flow' }], media: [] },
    { id: 'sec-5', title: '05 Wireframes', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-6', type: 'image_grid' }], media: [] },
    { id: 'sec-6', title: '06 Design System', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-7', type: 'design_system' }], media: [] },
    { id: 'sec-7', title: '07 Final UI', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-8', type: 'webpage' }, { id: 'b-9', type: 'dashboard' }], media: [] },
    { id: 'sec-8', title: '08 Results', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-10', type: 'metric_group' }], media: [] },
  ],
  full_product: [
    { id: 'sec-1', title: '01 Executive Overview', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-1', type: 'paragraph' }], media: [] },
    { id: 'sec-2', title: '02 Problem / Challenge', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-2', type: 'problem_statement' }], media: [] },
    { id: 'sec-3', title: '03 Research & Insights', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-3', type: 'research_findings' }], media: [] },
    { id: 'sec-4', title: '04 Empathy Mapping', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-4', type: 'empathy_map' }], media: [] },
    { id: 'sec-5', title: '05 User Flow', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-5', type: 'user_flow' }], media: [] },
    { id: 'sec-6', title: '06 Information Architecture', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-6', type: 'information_architecture' }], media: [] },
    { id: 'sec-7', title: '07 Design Decisions', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-7', type: 'design_decision' }], media: [] },
    { id: 'sec-8', title: '08 Wireframes', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-8', type: 'image_grid' }], media: [] },
    { id: 'sec-9', title: '09 Design System', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-9', type: 'design_system' }], media: [] },
    { id: 'sec-10', title: '10 High-Fidelity UI', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-10', type: 'dashboard' }, { id: 'b-11', type: 'webpage' }], media: [] },
    { id: 'sec-11', title: '11 Results / Metrics', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-12', type: 'metric_group' }], media: [] },
    { id: 'sec-12', title: '12 Reflection', type: 'custom', layout: 'full_width', content: '', blocks: [{ id: 'b-13', type: 'quote' }, { id: 'b-14', type: 'bullet_list' }], media: [] },
  ],
  custom: [],
};

export function CaseStudyBuilder({
  initialSections = [],
  onChange,
  onPreviewSection,
}: {
  initialSections?: CaseStudySectionItem[];
  onChange?: (sections: CaseStudySectionItem[]) => void;
  onPreviewSection?: (sectionId?: string) => void;
}) {
  const [sections, setSections] = useState<CaseStudySectionItem[]>(() => {
    if (initialSections && initialSections.length > 0) {
      return initialSections;
    }
    return [];
  });

  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(
    sections[0]?.id || null
  );
  const [showAddMenu, setShowAddMenu] = useState(false);

  const updateSections = (newSections: CaseStudySectionItem[]) => {
    setSections(newSections);
    onChange?.(newSections);
  };

  const applyTemplate = (templateKey: string) => {
    const template = TEMPLATES[templateKey];
    if (template) {
      const cloned = JSON.parse(JSON.stringify(template));
      updateSections(cloned);
      setExpandedSectionId(cloned[0]?.id || null);
    }
  };

  const addSection = (
    type: string,
    title: string,
    layout: CaseStudySectionItem['layout'] = 'full_width'
  ) => {
    const newSection: CaseStudySectionItem = {
      id: `sec-${Date.now()}`,
      title,
      subtitle: type === 'custom' ? 'Optional custom content' : '',
      type,
      layout,
      content: '',
      blocks:
        type === 'custom'
          ? [
              {
                id: `blk-${Date.now()}-1`,
                type: 'heading',
                headingLevel: 'h2',
                headingText: 'Key Takeaways',
              },
              {
                id: `blk-${Date.now()}-2`,
                type: 'paragraph',
                content: 'Add your custom content blocks, research screenshots, or metrics here.',
              },
            ]
          : [],
      media: [],
    };
    const next = [...sections, newSection];
    updateSections(next);
    setExpandedSectionId(newSection.id);
    setShowAddMenu(false);
  };

  const duplicateSection = (index: number) => {
    const target = sections[index];
    if (!target) return;
    const duplicated: CaseStudySectionItem = {
      ...JSON.parse(JSON.stringify(target)),
      id: `sec-${Date.now()}`,
      title: `${target.title} (Copy)`,
      blocks: (target.blocks || []).map((b, bi) => ({
        ...b,
        id: `blk-${Date.now()}-${bi}`,
      })),
      media: (target.media || []).map((m, mi) => ({
        ...m,
        id: `med-${Date.now()}-${mi}`,
      })),
    };
    const next = [...sections];
    next.splice(index + 1, 0, duplicated);
    updateSections(next);
    setExpandedSectionId(duplicated.id);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const next = [...sections];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    updateSections(next);
  };

  const deleteSection = (index: number) => {
    const next = sections.filter((_, i) => i !== index);
    updateSections(next);
    if (expandedSectionId === sections[index]?.id) {
      setExpandedSectionId(next[0]?.id || null);
    }
  };

  const toggleSectionVisibility = (index: number) => {
    const next = [...sections];
    next[index] = { ...next[index], hidden: !next[index].hidden };
    updateSections(next);
  };

  const updateSectionField = (index: number, field: keyof CaseStudySectionItem, val: any) => {
    const next = [...sections];
    next[index] = { ...next[index], [field]: val };
    updateSections(next);
  };

  const addMediaToSection = (
    index: number,
    displayType: CaseStudyVisualDisplayType = 'image'
  ) => {
    const next = [...sections];
    const media = next[index].media || [];
    const defaults = VISUAL_DEFAULTS[displayType];
    const newVisual: CaseStudyMediaItem = {
      id: `media-${Date.now()}`,
      url: '',
      imageUrl: '',
      type: 'image',
      displayType,
      displaySize: defaults.displaySize,
      backgroundType: defaults.backgroundType,
      backgroundColor: defaults.backgroundColor,
      padding: defaults.padding,
      radius: defaults.radius,
      fit: defaults.fit,
      caption: '',
      alt: '',
      width: 'full',
    };
    next[index].media = [...media, newVisual];
    updateSections(next);
  };

  const updateMediaItem = (
    sectionIndex: number,
    mediaIndex: number,
    field: keyof CaseStudyMediaItem,
    val: any
  ) => {
    const next = [...sections];
    const media = [...(next[sectionIndex].media || [])];
    media[mediaIndex] = { ...media[mediaIndex], [field]: val };
    next[sectionIndex].media = media;
    updateSections(next);
  };

  const removeMediaItem = (sectionIndex: number, mediaIndex: number) => {
    const next = [...sections];
    next[sectionIndex].media = next[sectionIndex].media.filter((_, idx) => idx !== mediaIndex);
    updateSections(next);
  };

  return (
    <div className="space-y-6">
      {/* Hidden input storing serialized sections for server form submission */}
      <input
        type="hidden"
        name="caseStudySectionsData"
        value={JSON.stringify(sections)}
      />

      {/* ── Choose a Starting Point (Templates) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-black/40 p-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#4F8CFF]" />
            <span className="text-xs font-semibold text-white">Choose a starting point:</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Select a starter blueprint or begin with an empty canvas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => applyTemplate('basic')}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            Basic (4 Sections)
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('ui_ux')}
            className="rounded-xl border border-[#4F8CFF]/30 bg-[#4F8CFF]/10 px-3 py-1.5 text-xs font-medium text-[#4F8CFF] hover:bg-[#4F8CFF]/20 transition-colors"
          >
            UI/UX Case Study (8 Sections)
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('full_product')}
            className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-400 hover:bg-purple-500/20 transition-colors"
          >
            Full Product Case Study (12 Sections)
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('custom')}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            Start Empty
          </button>
        </div>
      </div>

      {/* ── Section List ── */}
      {sections.length > 0 ? (
        <div className="space-y-3.5">
          {sections.map((section, sIdx) => {
            const isExpanded = expandedSectionId === section.id;
            const blockCount = section.blocks?.length || 0;
            const mediaCount = section.media?.length || 0;

            return (
              <div
                key={section.id}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? 'border-[#4F8CFF]/40 bg-[#111215] shadow-xl'
                    : 'border-white/[0.08] bg-black/20 hover:border-white/20'
                }`}
              >
                {/* Section Header Bar */}
                <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4">
                  <button
                    type="button"
                    onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
                    className="flex flex-1 items-center gap-3 text-left overflow-hidden"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] font-mono text-[11px] text-[#4F8CFF]">
                      {String(sIdx + 1).padStart(2, '0')}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${section.hidden ? 'text-zinc-500 line-through' : 'text-white'}`}>
                          {section.title || 'Untitled Section'}
                        </span>
                        {section.hidden && (
                          <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[10px] font-mono text-amber-400 font-medium">
                            HIDDEN
                          </span>
                        )}
                        {section.type === 'custom' && (
                          <span className="rounded bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 text-[10px] font-mono text-purple-400 font-medium">
                            CUSTOM
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500 truncate block">
                        {section.subtitle ? `${section.subtitle} · ` : ''}
                        {section.type === 'custom'
                          ? `${blockCount} block${blockCount !== 1 ? 's' : ''} · ${mediaCount} image${mediaCount !== 1 ? 's' : ''}`
                          : section.subtitle || 'Standard Section'}
                      </span>
                    </div>
                  </button>

                  {/* Quick actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleSectionVisibility(sIdx)}
                      className={`p-1 transition-colors ${section.hidden ? 'text-amber-400 hover:text-amber-300' : 'text-zinc-400 hover:text-white'}`}
                      title={section.hidden ? 'Hidden section (click to make visible)' : 'Visible section (click to hide)'}
                    >
                      {section.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(sIdx, 'up')}
                      disabled={sIdx === 0}
                      className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move up"
                    >
                      <MoveUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(sIdx, 'down')}
                      disabled={sIdx === sections.length - 1}
                      className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move down"
                    >
                      <MoveDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateSection(sIdx)}
                      className="p-1 text-zinc-400 hover:text-white transition-colors"
                      title="Duplicate section"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSection(sIdx)}
                      className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                      title="Delete section"
                    >
                      <Trash2 size={14} />
                    </button>
                    {onPreviewSection && (
                      <button
                        type="button"
                        onClick={() => onPreviewSection(section.id)}
                        className="p-1 text-zinc-400 hover:text-[#4F8CFF] transition-colors"
                        title="Preview section"
                      >
                        <BookOpen size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
                      className="p-1 text-zinc-400 hover:text-white transition-colors ml-1"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Section Editor */}
                {isExpanded && (
                  <div className="space-y-5 border-t border-white/[0.06] p-4 sm:p-5">
                    {/* Title & Subtitle */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          Section Title *
                        </label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateSectionField(sIdx, 'title', e.target.value)}
                          placeholder="e.g. Design Process"
                          className="h-9 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#4F8CFF]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          Subtitle (Optional)
                        </label>
                        <input
                          type="text"
                          value={section.subtitle || ''}
                          onChange={(e) => updateSectionField(sIdx, 'subtitle', e.target.value)}
                          placeholder="e.g. Iterations & Wireframing"
                          className="h-9 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#4F8CFF]"
                        />
                      </div>
                    </div>

                    {/* Layout */}
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Layout Mode
                      </label>
                      <select
                        value={section.layout}
                        onChange={(e) => updateSectionField(sIdx, 'layout', e.target.value)}
                        className="h-9 w-full rounded-xl border border-white/10 bg-[#121316] px-3 text-xs text-white outline-none focus:border-[#4F8CFF]"
                      >
                        <option value="full_width">Full Width</option>
                        <option value="text_focus">Text Focus</option>
                        <option value="media_focus">Media Focus</option>
                        <option value="two_column">Two Columns (Text / Media)</option>
                        <option value="split_text_media">Split — Text / Media</option>
                        <option value="split_media_text">Split — Media / Text</option>
                        <option value="image_grid">Image Grid</option>
                      </select>
                    </div>

                    {/* Standard Narrative / Text Content */}
                    <div className="pt-2">
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Narrative / Story Content
                      </label>
                      <textarea
                        value={section.content || ''}
                        onChange={(e) => updateSectionField(sIdx, 'content', e.target.value)}
                        placeholder="Explain the background, challenge, technical approach, or milestones..."
                        rows={4}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white outline-none focus:border-[#4F8CFF]"
                      />
                    </div>

                    {/* DEDICATED CUSTOM SECTION CONTENT BLOCKS */}
                    <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold">
                          Content Blocks
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {blockCount} block{blockCount !== 1 ? 's' : ''} configured
                        </span>
                      </div>
                      <CustomBlockEditor
                        blocks={section.blocks || []}
                        onChange={(blocks) => updateSectionField(sIdx, 'blocks', blocks)}
                      />
                    </div>

                    {/* Stats metrics if type is stats or has metrics */}
                    {(section.type === 'stats' || section.type === 'metrics' || (section.stats && section.stats.length > 0)) && (
                      <div className="space-y-3 rounded-xl border border-white/[0.06] bg-black/30 p-3.5">
                        <span className="text-xs font-medium text-zinc-300 block">Metrics & Stats</span>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {(section.stats || [
                            { value: '+40%', label: 'Metric 1' },
                            { value: '<1s', label: 'Metric 2' },
                          ]).map((st, idx) => (
                            <div key={idx} className="space-y-1.5">
                              <input
                                type="text"
                                value={st.value}
                                onChange={(e) => {
                                  const nextStats = [...(section.stats || [])];
                                  nextStats[idx] = { ...nextStats[idx], value: e.target.value };
                                  updateSectionField(sIdx, 'stats', nextStats);
                                }}
                                placeholder="+50%"
                                className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-emerald-400 font-bold"
                              />
                              <input
                                type="text"
                                value={st.label}
                                onChange={(e) => {
                                  const nextStats = [...(section.stats || [])];
                                  nextStats[idx] = { ...nextStats[idx], label: e.target.value };
                                  updateSectionField(sIdx, 'stats', nextStats);
                                }}
                                placeholder="Metric label"
                                className="h-7 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-[11px] text-zinc-300"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quote & Testimonial Editor */}
                    {(section.type === 'quote' || Boolean(section.quote)) && (
                      <div className="space-y-3 rounded-xl border border-white/[0.06] bg-black/30 p-3.5">
                        <span className="text-xs font-medium text-zinc-300 block">Quote & Testimonial</span>
                        <div className="space-y-2">
                          <textarea
                            value={section.quote?.text || ''}
                            onChange={(e) => {
                              updateSectionField(sIdx, 'quote', {
                                ...section.quote,
                                text: e.target.value,
                              });
                            }}
                            placeholder="“Write the quote or testimonial text here...”"
                            rows={3}
                            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-white outline-none focus:border-[#4F8CFF]"
                          />
                          <div className="grid gap-2 sm:grid-cols-2">
                            <input
                              type="text"
                              value={section.quote?.author || ''}
                              onChange={(e) => {
                                updateSectionField(sIdx, 'quote', {
                                  ...section.quote,
                                  author: e.target.value,
                                });
                              }}
                              placeholder="Author name (e.g. Lead Designer)"
                              className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-zinc-200 outline-none focus:border-[#4F8CFF]"
                            />
                            <input
                              type="text"
                              value={section.quote?.role || ''}
                              onChange={(e) => {
                                updateSectionField(sIdx, 'quote', {
                                  ...section.quote,
                                  role: e.target.value,
                                });
                              }}
                              placeholder="Role / Title (e.g. Design Lead)"
                              className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-zinc-200 outline-none focus:border-[#4F8CFF]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Section Visuals & Presentation Media ── */}
                    <div className="space-y-4 pt-2 border-t border-white/[0.06]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-medium text-zinc-200 block">
                            Section Visuals & Presentation Media
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            Behance-style full webpages, UI dashboards, and visuals
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => addMediaToSection(sIdx, 'webpage')}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <Globe size={12} className="text-[#4F8CFF]" />
                            <span>+ Webpage</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => addMediaToSection(sIdx, 'dashboard')}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <Layout size={12} className="text-purple-400" />
                            <span>+ Dashboard</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => addMediaToSection(sIdx, 'image')}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <ImageIcon size={12} className="text-emerald-400" />
                            <span>+ Standard Image</span>
                          </button>
                        </div>
                      </div>

                      {section.media && section.media.length > 0 ? (
                        <div className="space-y-4">
                          {section.media.map((med, mIdx) => (
                            <div
                              key={med.id || mIdx}
                              className="relative group rounded-2xl border border-white/10 bg-[#0d0e11] overflow-hidden"
                            >
                              <div className="absolute top-3 right-3 z-30">
                                <button
                                  type="button"
                                  onClick={() => removeMediaItem(sIdx, mIdx)}
                                  className="p-1.5 rounded-lg bg-black/60 text-zinc-400 hover:text-red-400 hover:bg-black/80 transition-colors"
                                  title="Remove this visual"
                                >
                                  <X size={14} />
                                </button>
                              </div>

                              <CaseStudyVisualEditor
                                value={med}
                                title={`Visual #${mIdx + 1} (${med.displayType || 'image'})`}
                                onChange={(updatedVisual) => {
                                  const next = [...sections];
                                  const media = [...(next[sIdx].media || [])];
                                  const norm = normalizeCaseStudyVisual(updatedVisual);
                                  media[mIdx] = {
                                    ...media[mIdx],
                                    ...norm,
                                    url: norm.url || norm.imageUrl,
                                    imageUrl: norm.imageUrl || norm.url,
                                  };
                                  next[sIdx].media = media;
                                  updateSections(next);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center space-y-1">
                          <p className="text-xs text-zinc-500">
                            No visuals added yet. Choose &ldquo;+ Webpage&rdquo;, &ldquo;+ Dashboard&rdquo;, or &ldquo;+ Standard Image&rdquo; above.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center space-y-2">
          <BookOpen size={24} className="mx-auto text-zinc-500" />
          <p className="text-xs font-medium text-white">No story sections created yet</p>
          <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
            Choose a starter template above or click &ldquo;+ Add Section&rdquo; to build custom content.
          </p>
        </div>
      )}

      {/* ── Advanced Section Picker Popover / Trigger ── */}
      <div className="relative pt-2">
        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="inline-flex items-center gap-2 rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-sm"
        >
          <Plus size={15} />
          <span>+ Add Section</span>
        </button>

        {/* ── Categorized Advanced Section Picker ── */}
        {showAddMenu && (
          <div className="absolute left-0 top-14 z-40 w-84 sm:w-96 rounded-2xl border border-white/10 bg-[#121316] p-4 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Add Section
              </span>
              <button
                type="button"
                onClick={() => setShowAddMenu(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            {/* 1. CONTENT */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                CONTENT
              </span>
              <button
                type="button"
                onClick={() => addSection('rich_text', 'Rich Text')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
              >
                <Type size={14} className="text-[#4F8CFF]" />
                <span>Rich Text</span>
              </button>
              <button
                type="button"
                onClick={() => addSection('image', 'Featured Image')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
              >
                <ImageIcon size={14} className="text-[#4F8CFF]" />
                <span>Image</span>
              </button>
              <button
                type="button"
                onClick={() => addSection('text_media', 'Image + Text', 'two_column')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
              >
                <Layout size={14} className="text-[#4F8CFF]" />
                <span>Image + Text</span>
              </button>
              <button
                type="button"
                onClick={() => addSection('gallery', 'Gallery')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
              >
                <Grid size={14} className="text-[#4F8CFF]" />
                <span>Gallery</span>
              </button>
            </div>

            {/* 2. CASE STUDY */}
            <div className="space-y-1 border-t border-white/[0.06] pt-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                CASE STUDY
              </span>
              <button
                type="button"
                onClick={() => addSection('problem', 'The Problem', 'two_column')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
              >
                <HelpCircle size={14} className="text-amber-400" />
                <span>Problem</span>
              </button>
              <button
                type="button"
                onClick={() => addSection('research', 'Research & Discovery', 'two_column')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
              >
                <BookOpen size={14} className="text-[#4F8CFF]" />
                <span>Research</span>
              </button>
              <button
                type="button"
                onClick={() => addSection('process', 'Process & Approach', 'full_width')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
              >
                <Sliders size={14} className="text-purple-400" />
                <span>Process</span>
              </button>
              <button
                type="button"
                onClick={() => addSection('solution', 'The Solution', 'two_column')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
              >
                <Check size={14} className="text-emerald-400" />
                <span>Solution</span>
              </button>
              <button
                type="button"
                onClick={() => addSection('results', 'Results & Impact', 'full_width')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
              >
                <BarChart2 size={14} className="text-emerald-400" />
                <span>Results</span>
              </button>
            </div>

            {/* 3. MEDIA */}
            <div className="space-y-1 border-t border-white/[0.06] pt-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                MEDIA
              </span>
              <button
                type="button"
                onClick={() => addSection('full_image', 'Full-width Image')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
              >
                <ImageIcon size={14} className="text-[#4F8CFF]" />
                <span>Full-width Image</span>
              </button>
              <button
                type="button"
                onClick={() => addSection('image_grid', 'Image Grid')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
              >
                <Grid size={14} className="text-[#4F8CFF]" />
                <span>Image Grid</span>
              </button>
              <button
                type="button"
                onClick={() => addSection('svg', 'SVG Vector Graphics')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
              >
                <FileCode size={14} className="text-amber-400" />
                <span>SVG Vector</span>
              </button>
              <button
                type="button"
                onClick={() => addSection('video', 'Video / Embed')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
              >
                <Video size={14} className="text-red-400" />
                <span>Video</span>
              </button>
            </div>

            {/* 4. SPECIAL */}
            <div className="space-y-1 border-t border-white/[0.06] pt-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                SPECIAL
              </span>
              <button
                type="button"
                onClick={() => addSection('quote', 'Quote / Testimonial')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
              >
                <Quote size={14} className="text-[#4F8CFF]" />
                <span>Quote</span>
              </button>
              <button
                type="button"
                onClick={() => addSection('metrics', 'Metrics & Performance')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
              >
                <BarChart2 size={14} className="text-emerald-400" />
                <span>Metrics</span>
              </button>
              <button
                type="button"
                onClick={() => addSection('custom', 'Custom Section')}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors font-medium text-purple-400"
              >
                <Sliders size={14} className="text-purple-400" />
                <span>Custom Section</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
