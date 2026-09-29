'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  MoveUp,
  MoveDown,
  Type,
  Layout,
  Quote,
  BarChart2,
  Image as ImageIcon,
  FileCode,
  List,
  ListOrdered,
  Info,
  Minus,
  Video,
  Layers,
  X,
  Sparkles,
  Globe,
} from 'lucide-react';
import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { GalleryInput } from './GalleryInput';
import { CaseStudyVisualEditor } from '@/components/dashboard/case-studies/CaseStudyVisualEditor';
import { normalizeCaseStudyVisual } from '@/types/case-study-visual';

export function CustomBlockEditor({
  blocks = [],
  onChange,
}: {
  blocks?: ContentBlockItem[];
  onChange?: (blocks: ContentBlockItem[]) => void;
}) {
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(
    blocks[0]?.id || null
  );

  const updateBlocks = (newBlocks: ContentBlockItem[]) => {
    onChange?.(newBlocks);
  };

  const addBlock = (type: ContentBlockItem['type']) => {
    const newBlock: ContentBlockItem = {
      id: `blk-${Date.now()}`,
      type,
      headingLevel: 'h2',
      headingText: type === 'heading' ? 'Research Findings' : '',
      content:
        type === 'paragraph' || type === 'rich_text'
          ? 'Write your detailed notes, findings, or explanations here...'
          : '',
      listItems: type === 'bullet_list' || type === 'numbered_list' ? ['First key point', 'Second key observation'] : [],
      quoteText: type === 'quote' ? 'Users understood the new navigation significantly faster.' : '',
      quoteAuthor: type === 'quote' ? 'User Testing Participant' : '',
      quoteRole: type === 'quote' ? 'E-Commerce Shopper' : '',
      metricValue: type === 'metric' ? '42%' : '',
      metricLabel: type === 'metric' ? 'Faster task completion' : '',
      metrics:
        type === 'metric_group'
          ? [
              { value: '42%', label: 'Task Completion' },
              { value: '3.2x', label: 'Engagement Lift' },
              { value: '-28%', label: 'Drop-off Reduction' },
            ]
          : [],
      features:
        type === 'feature_list'
          ? [
              { number: '01', title: 'Simplified Navigation', description: 'Streamlined information architecture.' },
              { number: '02', title: 'Product Discovery', description: 'Faster multi-faceted filters.' },
            ]
          : [],
      calloutTitle: type === 'callout' ? 'Key Insight' : '',
      calloutDescription: type === 'callout' ? 'Users understood the revised workflow within 30 seconds.' : '',
      imagePosition: 'left',
      svgBackground: 'transparent',
      dividerSpacing: 'normal',
      displayType: type === 'webpage' || type === 'dashboard' || type === 'image' ? type : 'image',
      displaySize: type === 'webpage' ? 'full' : 'large',
      backgroundType: type === 'dashboard' ? 'custom' : 'none',
      backgroundColor: type === 'dashboard' ? '#FFD36A' : undefined,
      padding: type === 'dashboard' ? 48 : 0,
      radius: type === 'dashboard' ? 20 : type === 'image' ? 16 : 0,
      fit: type === 'dashboard' ? 'contain' : 'natural',
    };

    const next = [...blocks, newBlock];
    updateBlocks(next);
    setExpandedBlockId(newBlock.id);
    setShowBlockPicker(false);
  };

  const duplicateBlock = (index: number) => {
    const target = blocks[index];
    if (!target) return;
    const duplicated: ContentBlockItem = {
      ...JSON.parse(JSON.stringify(target)),
      id: `blk-${Date.now()}`,
    };
    const next = [...blocks];
    next.splice(index + 1, 0, duplicated);
    updateBlocks(next);
    setExpandedBlockId(duplicated.id);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const next = [...blocks];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    updateBlocks(next);
  };

  const deleteBlock = (index: number) => {
    const next = blocks.filter((_, i) => i !== index);
    updateBlocks(next);
  };

  const updateBlockField = <K extends keyof ContentBlockItem>(
    index: number,
    field: K,
    val: ContentBlockItem[K]
  ) => {
    const next = [...blocks];
    next[index] = { ...next[index], [field]: val };
    updateBlocks(next);
  };

  return (
    <div className="space-y-4">
      {/* ── Block List ── */}
      {blocks.length > 0 ? (
        <div className="space-y-3">
          {blocks.map((block, bIdx) => {
            const isExpanded = expandedBlockId === block.id;

            return (
              <div
                key={block.id || bIdx}
                className="rounded-xl border border-white/[0.08] bg-black/40 p-3 space-y-3 transition-all hover:border-white/20"
              >
                {/* Block Header Row */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                    className="flex flex-1 items-center gap-2.5 text-left overflow-hidden"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/[0.06] font-mono text-[10px] text-accent font-bold">
                      {String(bIdx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                      {block.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-zinc-400 truncate">
                      {block.headingText ||
                        block.quoteText ||
                        block.calloutTitle ||
                        block.metricLabel ||
                        block.content?.slice(0, 30) ||
                        ''}
                    </span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveBlock(bIdx, 'up')}
                      disabled={bIdx === 0}
                      className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move up"
                    >
                      <MoveUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(bIdx, 'down')}
                      disabled={bIdx === blocks.length - 1}
                      className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move down"
                    >
                      <MoveDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateBlock(bIdx)}
                      className="p-1 text-zinc-400 hover:text-white transition-colors"
                      title="Duplicate block"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBlock(bIdx)}
                      className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                      title="Delete block"
                    >
                      <Trash2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                      className="p-1 text-zinc-400 hover:text-white transition-colors ml-1"
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Block Editor Fields */}
                {isExpanded && (
                  <div className="space-y-3.5 pt-2 border-t border-white/[0.06]">
                    {/* HEADING BLOCK */}
                    {block.type === 'heading' && (
                      <div className="grid gap-3 sm:grid-cols-4">
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                            Heading Text *
                          </label>
                          <input
                            type="text"
                            value={block.headingText || ''}
                            onChange={(e) => updateBlockField(bIdx, 'headingText', e.target.value)}
                            placeholder="e.g. Research Insights & Validation"
                            className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white outline-none focus:border-[#4F8CFF]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                            Level
                          </label>
                          <select
                            value={block.headingLevel || 'h2'}
                            onChange={(e) => updateBlockField(bIdx, 'headingLevel', e.target.value as 'h2' | 'h3' | 'h4')}
                            className="h-8 w-full rounded-lg border border-white/10 bg-[#121316] px-2 text-xs text-white outline-none"
                          >
                            <option value="h2">H2 (Large)</option>
                            <option value="h3">H3 (Medium)</option>
                            <option value="h4">H4 (Small)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* PARAGRAPH / RICH TEXT */}
                    {(block.type === 'paragraph' || block.type === 'rich_text') && (
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                          Paragraph Content *
                        </label>
                        <textarea
                          value={block.content || ''}
                          onChange={(e) => updateBlockField(bIdx, 'content', e.target.value)}
                          rows={3}
                          placeholder="Write narrative copy..."
                          className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-2 text-xs text-white outline-none focus:border-[#4F8CFF]"
                        />
                      </div>
                    )}

                    {/* BULLET OR NUMBERED LIST */}
                    {(block.type === 'bullet_list' || block.type === 'numbered_list') && (
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                          List Items (One per line)
                        </label>
                        <textarea
                          value={block.content || block.listItems?.join('\n') || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateBlockField(bIdx, 'content', val);
                            updateBlockField(bIdx, 'listItems', val.split('\n').filter(Boolean));
                          }}
                          rows={3}
                          placeholder="Item 1&#10;Item 2&#10;Item 3"
                          className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-2 text-xs text-white outline-none focus:border-[#4F8CFF]"
                        />
                      </div>
                    )}

                    {/* QUOTE BLOCK */}
                    {block.type === 'quote' && (
                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                            Quote Text *
                          </label>
                          <textarea
                            value={block.quoteText || block.content || ''}
                            onChange={(e) => {
                              updateBlockField(bIdx, 'quoteText', e.target.value);
                              updateBlockField(bIdx, 'content', e.target.value);
                            }}
                            rows={2}
                            placeholder="The redesigned navigation cut task completion time in half..."
                            className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#4F8CFF]"
                          />
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            type="text"
                            value={block.quoteAuthor || ''}
                            onChange={(e) => updateBlockField(bIdx, 'quoteAuthor', e.target.value)}
                            placeholder="Author (e.g. Lead Designer)"
                            className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white outline-none"
                          />
                          <input
                            type="text"
                            value={block.quoteRole || ''}
                            onChange={(e) => updateBlockField(bIdx, 'quoteRole', e.target.value)}
                            placeholder="Role / Context (e.g. Usability Study)"
                            className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* VISUAL BLOCK: WEBPAGE, DASHBOARD, IMAGE */}
                    {(block.type === 'image' || block.type === 'webpage' || block.type === 'dashboard') && (
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
                          const next = [...blocks];
                          const norm = normalizeCaseStudyVisual(updatedVisual);
                          const { url, ...visualProps } = norm;
                          next[bIdx] = {
                            ...next[bIdx],
                            ...visualProps,
                            type: norm.displayType || next[bIdx].type,
                            imageUrl: norm.imageUrl || url,
                            imageAlt: norm.alt,
                            imageCaption: norm.caption,
                          };
                          updateBlocks(next);
                        }}
                      />
                    )}

                    {/* SVG VECTOR BLOCK */}
                    {block.type === 'svg' && (
                      <div className="space-y-2">
                        <ImageUploader
                          name={`block_img_${bIdx}`}
                          value={block.imageUrl}
                          onChange={(url) => updateBlockField(bIdx, 'imageUrl', url)}
                          label="Upload SVG Vector Graphic"
                          helperText="Upload .svg vector or paste direct URL"
                        />
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            type="text"
                            value={block.imageCaption || ''}
                            onChange={(e) => updateBlockField(bIdx, 'imageCaption', e.target.value)}
                            placeholder="Caption (optional)"
                            className="h-7 w-full rounded-lg border border-white/10 bg-black/50 px-2 text-[11px] text-zinc-300 outline-none"
                          />
                          <input
                            type="text"
                            value={block.imageAlt || ''}
                            onChange={(e) => updateBlockField(bIdx, 'imageAlt', e.target.value)}
                            placeholder="Alt text for accessibility"
                            className="h-7 w-full rounded-lg border border-white/10 bg-black/50 px-2 text-[11px] text-zinc-300 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* IMAGE + TEXT */}
                    {block.type === 'image_text' && (
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="sm:col-span-2">
                            <ImageUploader
                              name={`block_imgtxt_${bIdx}`}
                              value={block.imageUrl}
                              onChange={(url) => updateBlockField(bIdx, 'imageUrl', url)}
                              label="Upload Visual"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                              Image Position
                            </label>
                            <select
                              value={block.imagePosition || 'left'}
                              onChange={(e) => updateBlockField(bIdx, 'imagePosition', e.target.value as 'left' | 'right')}
                              className="h-8 w-full rounded-lg border border-white/10 bg-[#121316] px-2 text-xs text-white outline-none"
                            >
                              <option value="left">Image on Left</option>
                              <option value="right">Image on Right</option>
                            </select>
                          </div>
                        </div>
                        <textarea
                          value={block.content || ''}
                          onChange={(e) => updateBlockField(bIdx, 'content', e.target.value)}
                          rows={3}
                          placeholder="Accompanying text description beside the image..."
                          className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-2 text-xs text-white outline-none focus:border-[#4F8CFF]"
                        />
                      </div>
                    )}

                    {/* IMAGE GRID */}
                    {block.type === 'image_grid' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-mono text-zinc-400">
                            Grid Columns
                          </label>
                          <select
                            value={block.imageGridColumns || 2}
                            onChange={(e) => updateBlockField(bIdx, 'imageGridColumns', Number(e.target.value) as 2 | 3 | 4)}
                            className="h-7 rounded-lg border border-white/10 bg-[#121316] px-2 text-xs text-white outline-none"
                          >
                            <option value={2}>2 Columns</option>
                            <option value={3}>3 Columns</option>
                            <option value={4}>4 Columns</option>
                          </select>
                        </div>
                        <GalleryInput
                          initialUrls={block.imageGridUrls || []}
                          onChange={(urls) => updateBlockField(bIdx, 'imageGridUrls', urls)}
                        />
                      </div>
                    )}

                    {/* METRIC / METRIC GROUP */}
                    {(block.type === 'metric' || block.type === 'metric_group') && (
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
                                updateBlockField(bIdx, 'metrics', nextM);
                                if (mIdx === 0) updateBlockField(bIdx, 'metricValue', e.target.value);
                              }}
                              placeholder="Value (e.g. 42%, 3.2x, <100ms)"
                              className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-accent font-bold"
                            />
                            <input
                              type="text"
                              value={m.label}
                              onChange={(e) => {
                                const nextM = [...(block.metrics || [{ value: '', label: '' }])];
                                nextM[mIdx] = { ...nextM[mIdx], label: e.target.value };
                                updateBlockField(bIdx, 'metrics', nextM);
                                if (mIdx === 0) updateBlockField(bIdx, 'metricLabel', e.target.value);
                              }}
                              placeholder="Label (e.g. Faster checkout flow)"
                              className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* FEATURE LIST */}
                    {block.type === 'feature_list' && (
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
                                  updateBlockField(bIdx, 'features', nextF);
                                }}
                                className="h-7 w-12 rounded border border-white/10 bg-black/50 px-1.5 text-center text-xs font-mono text-accent"
                              />
                              <input
                                type="text"
                                value={feat.title}
                                onChange={(e) => {
                                  const nextF = [...(block.features || [])];
                                  nextF[fIdx] = { ...nextF[fIdx], title: e.target.value };
                                  updateBlockField(bIdx, 'features', nextF);
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
                                updateBlockField(bIdx, 'features', nextF);
                              }}
                              rows={2}
                              placeholder="Feature details..."
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
                            updateBlockField(bIdx, 'features', nextF);
                          }}
                          className="text-[11px] text-[#4F8CFF] hover:underline"
                        >
                          + Add Item
                        </button>
                      </div>
                    )}

                    {/* CALLOUT BLOCK */}
                    {block.type === 'callout' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={block.calloutTitle || ''}
                          onChange={(e) => updateBlockField(bIdx, 'calloutTitle', e.target.value)}
                          placeholder="Callout Title (e.g. Key Insight)"
                          className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white"
                        />
                        <textarea
                          value={block.calloutDescription || ''}
                          onChange={(e) => updateBlockField(bIdx, 'calloutDescription', e.target.value)}
                          rows={2}
                          placeholder="Callout narrative..."
                          className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    )}

                    {/* EMBED BLOCK */}
                    {block.type === 'embed' && (
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                          Safe Embed URL (YouTube, Vimeo, Figma)
                        </label>
                        <input
                          type="url"
                          value={block.embedUrl || ''}
                          onChange={(e) => updateBlockField(bIdx, 'embedUrl', e.target.value)}
                          placeholder="https://www.youtube.com/embed/..."
                          className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center space-y-1">
          <p className="text-xs text-zinc-400">No content blocks added yet.</p>
          <p className="text-[11px] text-zinc-500">
            Click below to add headings, paragraphs, images, metrics, or quotes.
          </p>
        </div>
      )}

      {/* ── Add Content Block Trigger & Dropdown Menu ── */}
      <div className="relative pt-1">
        <button
          type="button"
          onClick={() => setShowBlockPicker(!showBlockPicker)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#4F8CFF]/30 bg-[#4F8CFF]/10 px-3.5 py-2 text-xs font-semibold text-[#4F8CFF] hover:bg-[#4F8CFF]/20 transition-all shadow-xs"
        >
          <Plus size={14} />
          <span>Add Content</span>
        </button>

        {showBlockPicker && (
          <div className="absolute left-0 top-12 z-40 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#121316] p-4 shadow-2xl space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Add Content Block
              </span>
              <button
                type="button"
                onClick={() => setShowBlockPicker(false)}
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
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => addBlock('heading')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <Type size={13} className="text-[#4F8CFF]" />
                  <span>Heading</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('paragraph')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <Type size={13} className="text-[#4F8CFF]" />
                  <span>Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('rich_text')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <Type size={13} className="text-[#4F8CFF]" />
                  <span>Custom Content</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('bullet_list')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <List size={13} className="text-[#4F8CFF]" />
                  <span>Bullet Points</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('numbered_list')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <ListOrdered size={13} className="text-[#4F8CFF]" />
                  <span>Numbered Points</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('quote')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <Quote size={13} className="text-[#4F8CFF]" />
                  <span>Quote / Insight</span>
                </button>
              </div>
            </div>

            {/* 2. MEDIA */}
            <div className="space-y-1 border-t border-white/[0.06] pt-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                MEDIA & SCREENSHOTS
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => addBlock('webpage')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <Globe size={13} className="text-[#4F8CFF]" />
                  <span>Webpage Screenshot</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('dashboard')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <Layout size={13} className="text-purple-400" />
                  <span>Dashboard / UI</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('image')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <ImageIcon size={13} className="text-emerald-400" />
                  <span>Standard Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('image_grid')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <Layers size={13} className="text-[#4F8CFF]" />
                  <span>Image Gallery</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('image_text')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <Layout size={13} className="text-[#4F8CFF]" />
                  <span>Image + Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('svg')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <FileCode size={13} className="text-amber-400" />
                  <span>SVG</span>
                </button>
              </div>
            </div>

            {/* 3. DATA */}
            <div className="space-y-1 border-t border-white/[0.06] pt-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                DATA
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => addBlock('metric')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <BarChart2 size={13} className="text-emerald-400" />
                  <span>Metric</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('metric_group')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <BarChart2 size={13} className="text-emerald-400" />
                  <span>Stats / Metrics</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('feature_list')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <Sparkles size={13} className="text-purple-400" />
                  <span>Key Features</span>
                </button>
              </div>
            </div>

            {/* 4. SPECIAL */}
            <div className="space-y-1 border-t border-white/[0.06] pt-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                SPECIAL
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => addBlock('callout')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <Info size={13} className="text-[#4F8CFF]" />
                  <span>Callout</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('divider')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <Minus size={13} className="text-zinc-400" />
                  <span>Divider</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('embed')}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white text-left transition-colors"
                >
                  <Video size={13} className="text-red-400" />
                  <span>Video / Prototype</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
