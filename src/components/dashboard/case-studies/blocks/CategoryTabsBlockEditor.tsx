'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  MoveLeft,
  MoveRight,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  ListPlus,
} from 'lucide-react';
import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { CategoryTabItem, CategoryTabsBlockData } from '@/types/case-study-builder';
import { CaseStudyBlockEditor } from './CaseStudyBlockEditor';
import { AddContentBlockMenu } from './AddContentBlockMenu';

interface CategoryTabsBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

const DEFAULT_CATEGORIES: CategoryTabItem[] = [
  {
    id: 'cat-1',
    number: '01',
    label: 'Checkout Architecture',
    eyebrow: 'CHECKOUT & TRANSACTION ARCHITECTURE',
    title: 'Unified Multi-Seller Cart vs Sequential Single-Merchant Checkouts',
    metric: {
      value: '+24%',
      label: 'Checkout Completion',
    },
    blocks: [
      {
        id: 'blk-nested-1',
        type: 'problem_statement',
        problemStatementData: {
          problemTitle: 'Friction in Multi-Merchant Checkout Flow',
          coreProblem: 'Users abandoned carts when forced to undergo multiple sequential checkout flows for items from different sellers.',
          context: 'E-commerce marketplace architecture update',
          howMightWe: 'How might we consolidate transactions into a single unified payment flow without breaking seller inventory APIs?',
        },
      },
      {
        id: 'blk-nested-2',
        type: 'paragraph',
        content: 'Engineered a real-time state synchronizer that aggregates cart items, computes combined taxes/shipping, and dispatches parallel payment intents.',
      },
    ],
  },
  {
    id: 'cat-2',
    number: '02',
    label: 'Discovery & Quality',
    eyebrow: 'CATALOG & SEARCH DISCOVERY',
    title: 'Sub-100ms Faceted Search with Intelligent Quality Scoring',
    metric: {
      value: '<90ms',
      label: 'Query Latency',
    },
    blocks: [
      {
        id: 'blk-nested-3',
        type: 'bullet_list',
        listItems: [
          'Pre-indexed elastic facets for 12,000+ active product variants',
          'Automated image resolution verification before ranking items',
          'Zero-layout-shift skeleton loaders during dynamic filtering',
        ],
      },
    ],
  },
];

export function CategoryTabsBlockEditor({ block, onChange }: CategoryTabsBlockEditorProps) {
  const data: CategoryTabsBlockData = block.categoryTabsData || {
    title: block.headingText || 'Product Architecture & Decisions',
    description: block.content || 'Clickable rectangular topic categories with detailed nested content.',
    categories: (block as any).categories || DEFAULT_CATEGORIES,
  };

  const categories = data.categories && data.categories.length > 0 ? data.categories : DEFAULT_CATEGORIES;
  const [selectedTabId, setSelectedTabId] = useState<string>(categories[0]?.id || 'cat-1');
  const [isAddNestedOpen, setIsAddNestedOpen] = useState(false);
  const [collapsedNestedBlocks, setCollapsedNestedBlocks] = useState<Record<string, boolean>>({});

  const activeCategoryIndex = categories.findIndex((c: CategoryTabItem) => c.id === selectedTabId);
  const activeCategory = categories[activeCategoryIndex] || categories[0];

  const updateData = (updates: Partial<CategoryTabsBlockData>) => {
    const updatedData: CategoryTabsBlockData = {
      ...data,
      categories,
      ...updates,
    };
    onChange({
      categoryTabsData: updatedData,
      headingText: updatedData.title,
      content: updatedData.description,
      categories: updatedData.categories,
    } as any);
  };

  const updateCategories = (newCategories: CategoryTabItem[]) => {
    updateData({ categories: newCategories });
  };

  const updateActiveCategory = (updates: Partial<CategoryTabItem>) => {
    if (!activeCategory) return;
    const nextCategories = [...categories];
    nextCategories[activeCategoryIndex] = {
      ...nextCategories[activeCategoryIndex],
      ...updates,
    };
    updateCategories(nextCategories);
  };

  const addCategory = () => {
    const newTabNum = String(categories.length + 1).padStart(2, '0');
    const newCategory: CategoryTabItem = {
      id: `cat-${Date.now()}`,
      number: newTabNum,
      label: `Category ${newTabNum}`,
      eyebrow: `CATEGORY ${newTabNum} EYEBROW`,
      title: `Category ${newTabNum} Title`,
      metric: { value: '', label: '' },
      blocks: [
        {
          id: `blk-${Date.now()}-1`,
          type: 'paragraph',
          content: 'Add nested narrative text, problem statements, or visual blocks for this category.',
        },
      ],
    };
    const nextCategories = [...categories, newCategory];
    updateCategories(nextCategories);
    setSelectedTabId(newCategory.id);
  };

  const duplicateCategory = (index: number) => {
    const target = categories[index];
    if (!target) return;
    const cloned: CategoryTabItem = {
      ...JSON.parse(JSON.stringify(target)),
      id: `cat-${Date.now()}`,
      label: `${target.label} (Copy)`,
      number: String(categories.length + 1).padStart(2, '0'),
    };
    const nextCategories = [...categories];
    nextCategories.splice(index + 1, 0, cloned);
    updateCategories(nextCategories);
    setSelectedTabId(cloned.id);
  };

  const moveCategory = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const nextCategories = [...categories];
    const [moved] = nextCategories.splice(index, 1);
    nextCategories.splice(targetIndex, 0, moved);
    updateCategories(nextCategories);
  };

  const deleteCategory = (index: number) => {
    if (categories.length <= 1) return;
    const targetId = categories[index].id;
    const nextCategories = categories.filter((_: CategoryTabItem, i: number) => i !== index);
    updateCategories(nextCategories);
    if (selectedTabId === targetId) {
      setSelectedTabId(nextCategories[0]?.id || '');
    }
  };

  const toggleCategoryVisibility = (index: number) => {
    const nextCategories = [...categories];
    nextCategories[index] = {
      ...nextCategories[index],
      hidden: !nextCategories[index].hidden,
    };
    updateCategories(nextCategories);
  };

  // --- Nested Blocks inside Active Category ---
  const addNestedBlock = (type: ContentBlockItem['type']) => {
    if (!activeCategory) return;
    const newBlock: ContentBlockItem = {
      id: `nested-${Date.now()}`,
      type,
    };
    if (type === 'paragraph') newBlock.content = '';
    if (type === 'heading') { newBlock.headingText = ''; newBlock.headingLevel = 'h3'; }
    if (type === 'bullet_list' || type === 'numbered_list') newBlock.listItems = [''];
    if (type === 'metric_group') newBlock.metrics = [];
    if (type === 'problem_statement') newBlock.problemStatementData = { problemTitle: '', coreProblem: '' };

    const nextBlocks = [...(activeCategory.blocks || []), newBlock];
    updateActiveCategory({ blocks: nextBlocks });
    setIsAddNestedOpen(false);
  };

  const updateNestedBlock = (blockIndex: number, updates: Partial<ContentBlockItem>) => {
    if (!activeCategory) return;
    const nextBlocks = [...(activeCategory.blocks || [])];
    nextBlocks[blockIndex] = { ...nextBlocks[blockIndex], ...updates };
    updateActiveCategory({ blocks: nextBlocks });
  };

  const removeNestedBlock = (blockIndex: number) => {
    if (!activeCategory) return;
    const nextBlocks = (activeCategory.blocks || []).filter((_: ContentBlockItem, i: number) => i !== blockIndex);
    updateActiveCategory({ blocks: nextBlocks });
  };

  const moveNestedBlock = (blockIndex: number, direction: 'up' | 'down') => {
    if (!activeCategory) return;
    const nextBlocks = [...(activeCategory.blocks || [])];
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (targetIndex < 0 || targetIndex >= nextBlocks.length) return;
    const temp = nextBlocks[blockIndex];
    nextBlocks[blockIndex] = nextBlocks[targetIndex];
    nextBlocks[targetIndex] = temp;
    updateActiveCategory({ blocks: nextBlocks });
  };

  const toggleNestedCollapse = (blockId: string) => {
    setCollapsedNestedBlocks((prev) => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-[#0e0f12] p-5 text-xs text-white">
      {/* Block Header Info */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF]">
          <Layers size={15} />
        </div>
        <div>
          <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
            CATEGORY TABS BUILDER
          </h3>
          <p className="text-[11px] text-zinc-400">
            Organize topics into rectangular clickable tab cards with rich nested content
          </p>
        </div>
      </div>

      {/* Block Title & Description Inputs */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] font-mono text-zinc-400 mb-1">Block Title (Optional)</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="e.g. Key Design Decisions & Architecture"
            className="h-8 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 text-xs text-white outline-none focus:border-[#4F8CFF]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono text-zinc-400 mb-1">Block Subtitle / Description (Optional)</label>
          <input
            type="text"
            value={data.description || ''}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="e.g. Click through categories to inspect trade-offs and solutions"
            className="h-8 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 text-xs text-white outline-none focus:border-[#4F8CFF]"
          />
        </div>
      </div>

      {/* ── CATEGORY TAB CARDS SELECTOR BAR ── */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#4F8CFF] font-semibold">
            Category Cards ({categories.length})
          </span>
          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center gap-1 rounded-lg border border-[#4F8CFF]/30 bg-[#4F8CFF]/10 px-2.5 py-1 text-[11px] font-medium text-[#4F8CFF] hover:bg-[#4F8CFF]/20 transition-colors"
          >
            <Plus size={13} />
            <span>+ Add Category</span>
          </button>
        </div>

        {/* Horizontal Rectangular Tab Cards */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat: CategoryTabItem, idx: number) => {
            const isSelected = cat.id === selectedTabId;
            return (
              <div
                key={cat.id || idx}
                className={`relative group flex shrink-0 items-center gap-2.5 rounded-xl border p-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#4F8CFF] bg-[#4F8CFF]/15 text-white shadow-md'
                    : 'border-white/10 bg-black/40 text-zinc-400 hover:border-white/20 hover:text-white'
                }`}
                onClick={() => setSelectedTabId(cat.id)}
              >
                <span className={`font-mono text-[11px] font-bold ${isSelected ? 'text-[#4F8CFF]' : 'text-zinc-500'}`}>
                  {cat.number || String(idx + 1).padStart(2, '0')}
                </span>
                <span className="text-xs font-semibold truncate max-w-[140px]">
                  {cat.label || 'Untitled Category'}
                </span>

                {cat.hidden && (
                  <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 text-[9px] font-mono text-amber-400">
                    HIDDEN
                  </span>
                )}

                {/* Quick actions for tab */}
                <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity ml-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategoryVisibility(idx);
                    }}
                    className="p-1 hover:text-white"
                    title={cat.hidden ? 'Show category' : 'Hide category'}
                  >
                    {cat.hidden ? <EyeOff size={11} className="text-amber-400" /> : <Eye size={11} />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveCategory(idx, 'left');
                    }}
                    disabled={idx === 0}
                    className="p-1 hover:text-white disabled:opacity-20"
                    title="Move left"
                  >
                    <MoveLeft size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveCategory(idx, 'right');
                    }}
                    disabled={idx === categories.length - 1}
                    className="p-1 hover:text-white disabled:opacity-20"
                    title="Move right"
                  >
                    <MoveRight size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateCategory(idx);
                    }}
                    className="p-1 hover:text-white"
                    title="Duplicate category"
                  >
                    <Copy size={11} />
                  </button>
                  {categories.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCategory(idx);
                      }}
                      className="p-1 text-zinc-500 hover:text-red-400"
                      title="Delete category"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SELECTED CATEGORY DETAILS EDITOR ── */}
      {activeCategory && (
        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-4 pt-3">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <span className="font-mono text-[#4F8CFF] font-bold">{activeCategory.number || '01'}</span>
              <span>Editing Category: {activeCategory.label}</span>
            </span>
            {activeCategory.hidden && (
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                HIDDEN FROM PUBLIC PAGE
              </span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Number</label>
              <input
                type="text"
                value={activeCategory.number || ''}
                onChange={(e) => updateActiveCategory({ number: e.target.value })}
                placeholder="01"
                className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white outline-none font-mono"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Tab Card Label *</label>
              <input
                type="text"
                value={activeCategory.label || ''}
                onChange={(e) => updateActiveCategory({ label: e.target.value })}
                placeholder="e.g. Checkout Architecture"
                className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white outline-none focus:border-[#4F8CFF]"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Eyebrow Tag (Optional)</label>
              <input
                type="text"
                value={activeCategory.eyebrow || ''}
                onChange={(e) => updateActiveCategory({ eyebrow: e.target.value })}
                placeholder="e.g. CHECKOUT & TRANSACTION ARCHITECTURE"
                className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Main Heading Title (Optional)</label>
              <input
                type="text"
                value={activeCategory.title || ''}
                onChange={(e) => updateActiveCategory({ title: e.target.value })}
                placeholder="e.g. Unified Multi-Seller Cart vs Sequential Checkouts"
                className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Outcome Metric Value (Optional)</label>
              <input
                type="text"
                value={activeCategory.metric?.value || ''}
                onChange={(e) =>
                  updateActiveCategory({
                    metric: { ...activeCategory.metric, value: e.target.value },
                  })
                }
                placeholder="e.g. +24%"
                className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-emerald-400 font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Outcome Metric Label (Optional)</label>
              <input
                type="text"
                value={activeCategory.metric?.label || ''}
                onChange={(e) =>
                  updateActiveCategory({
                    metric: { ...activeCategory.metric, label: e.target.value },
                  })
                }
                placeholder="e.g. Checkout Completion"
                className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-zinc-200 outline-none"
              />
            </div>
          </div>

          {/* ── NESTED CONTENT BLOCKS EDITOR ── */}
          <div className="space-y-3 pt-3 border-t border-white/[0.08]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-purple-400 font-semibold">
                Nested Content Blocks ({activeCategory.blocks?.length || 0})
              </span>
              <button
                type="button"
                onClick={() => setIsAddNestedOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-medium text-purple-400 hover:bg-purple-500/20 transition-colors"
              >
                <Plus size={13} />
                <span>+ Add Nested Block</span>
              </button>
            </div>

            {/* Nested Blocks List */}
            {activeCategory.blocks && activeCategory.blocks.length > 0 ? (
              <div className="space-y-3">
                {activeCategory.blocks.map((nBlock: ContentBlockItem, bIdx: number) => {
                  const isCollapsed = collapsedNestedBlocks[nBlock.id];
                  return (
                    <div key={nBlock.id || bIdx} className="rounded-xl border border-white/10 bg-[#0d0e11] p-3 space-y-2">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                          {nBlock.type.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleNestedCollapse(nBlock.id)}
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            {isCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => moveNestedBlock(bIdx, 'up')}
                            disabled={bIdx === 0}
                            className="p-1 text-zinc-400 hover:text-white disabled:opacity-20"
                          >
                            <ChevronUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveNestedBlock(bIdx, 'down')}
                            disabled={bIdx === activeCategory.blocks.length - 1}
                            className="p-1 text-zinc-400 hover:text-white disabled:opacity-20"
                          >
                            <ChevronDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeNestedBlock(bIdx)}
                            className="p-1 text-zinc-400 hover:text-red-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {!isCollapsed && (
                        <div className="pt-1">
                          <CaseStudyBlockEditor
                            block={nBlock}
                            onChange={(updates) => updateNestedBlock(bIdx, updates)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center text-[11px] text-zinc-500">
                No nested content blocks inside this category yet. Click &ldquo;+ Add Nested Block&rdquo; above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for Adding Nested Content Blocks (Excluding Category Tabs to prevent infinite recursion) */}
      {isAddNestedOpen && (
        <AddContentBlockMenu
          onSelectBlock={(type) => addNestedBlock(type)}
          onClose={() => setIsAddNestedOpen(false)}
        />
      )}
    </div>
  );
}
