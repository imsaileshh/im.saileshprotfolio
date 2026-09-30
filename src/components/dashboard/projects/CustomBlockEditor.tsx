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
import { AddContentBlockMenu } from '@/components/dashboard/case-studies/blocks/AddContentBlockMenu';
import { CaseStudyBlockEditor } from '@/components/dashboard/case-studies/blocks/CaseStudyBlockEditor';

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
                  <div className="pt-2 border-t border-white/[0.06]">
                    <CaseStudyBlockEditor
                      block={block}
                      onChange={(updates) => {
                        const next = [...blocks];
                        next[bIdx] = { ...next[bIdx], ...updates };
                        updateBlocks(next);
                      }}
                    />
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
          <AddContentBlockMenu
            onSelectBlock={(type) => {
              addBlock(type);
              setShowBlockPicker(false);
            }}
            onClose={() => setShowBlockPicker(false)}
          />
        )}
      </div>
    </div>
  );
}
