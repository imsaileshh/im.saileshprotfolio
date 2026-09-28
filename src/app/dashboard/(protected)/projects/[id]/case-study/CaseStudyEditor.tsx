'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ChevronUp, ChevronDown, Image as ImageIcon, FileText, Settings, Copy, Save, Type, List, CheckSquare, AlignLeft, Info, Globe, Layout } from 'lucide-react';
import type { CaseStudy, CaseStudySection, Project } from '@prisma/client';
import Image from 'next/image';
import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { revalidateCaseStudyPaths } from './actions';
import {
  CaseStudyVisual,
  CaseStudyVisualDisplayType,
  VISUAL_DEFAULTS,
} from '@/types/case-study-visual';
import { CaseStudyVisualEditor } from '@/components/dashboard/case-studies/CaseStudyVisualEditor';

type MediaSize = 'full' | 'half' | 'original';
type MediaType = 'image' | 'pdf' | 'svg';

type MediaItem = Partial<CaseStudyVisual> & {
  url: string;
  imageUrl?: string;
  type?: MediaType;
  size?: MediaSize;
};

type SectionData = {
  id?: string;
  title: string;
  content: string;
  metadata: {
    subtitle?: string;
    layout?: string;
    media: MediaItem[];
    blocks: ContentBlockItem[];
  };
};

type CaseStudyData = {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  status: 'DRAFT' | 'PUBLISHED';
  sourceType: 'MANUAL';
  sections: SectionData[];
};

export function CaseStudyEditor({
  project,
  initialCaseStudy,
}: {
  project: Project;
  initialCaseStudy: (CaseStudy & { sections: CaseStudySection[] }) | null;
}) {
  const router = useRouter();

  // Initialize data
  const [data, setData] = useState<CaseStudyData>(() => {
    if (initialCaseStudy) {
      return {
        title: initialCaseStudy.title,
        slug: initialCaseStudy.slug,
        description: initialCaseStudy.description || '',
        coverImage: initialCaseStudy.coverImage || '',
        status: initialCaseStudy.status,
        sourceType: 'MANUAL',
        sections: initialCaseStudy.sections.map(s => ({
          id: s.id,
          title: s.title,
          content: s.content || '',
          metadata: {
            media: (s.metadata as any)?.media || [],
            blocks: (s.metadata as any)?.blocks || (s.content ? [{ id: crypto.randomUUID(), type: 'paragraph', content: s.content }] : [])
          }
        }))
      };
    }
    return {
      title: `${project.title} Case Study`,
      slug: `${project.slug}-case-study`,
      description: project.description,
      coverImage: project.coverImageUrl || '',
      status: 'DRAFT',
      sourceType: 'MANUAL',
      sections: []
    };
  });

  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<string, boolean>>({});

  const toggleBlockCollapse = (blockId: string) => {
    setCollapsedBlocks(prev => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  const PRESET_SECTIONS = [
    { label: 'Executive Overview', title: 'Executive Overview', blocks: [{ type: 'paragraph' }] },
    { label: 'Key Features', title: 'Key Features', blocks: [{ type: 'feature_list', headingText: 'Key Features', features: [{ title: '', description: '' }] }] },
    { label: 'Challenge', title: 'The Challenge', blocks: [{ type: 'heading', headingLevel: 'h3', headingText: 'The Challenge' }, { type: 'paragraph' }] },
    { label: 'Research', title: 'User Research', blocks: [{ type: 'paragraph' }] },
    { label: 'Solution', title: 'The Solution', blocks: [{ type: 'paragraph' }, { type: 'image' }] },
    { label: 'User Persona', title: 'User Personas', blocks: [{ type: 'paragraph' }, { type: 'image_grid' }] },
    { label: 'User Flow', title: 'User Flow', blocks: [{ type: 'paragraph' }, { type: 'image' }] },
    { label: 'Wireframes', title: 'Wireframes', blocks: [{ type: 'paragraph' }, { type: 'image_grid' }] },
    { label: 'Design System', title: 'Design System', blocks: [{ type: 'paragraph' }] },
    { label: 'Final UI', title: 'Final UI Screens', blocks: [{ type: 'image_grid' }] },
    { label: 'Results', title: 'Results & Impact', blocks: [{ type: 'metric_group' }, { type: 'paragraph' }] },
    { label: 'Learnings', title: 'Learnings', blocks: [{ type: 'bullet_list' }] },
  ] as const;

  // --- Section Management ---
  const addPresetSection = (title: string, presetBlocks: readonly any[]) => {
    const blocks: ContentBlockItem[] = presetBlocks.map(b => ({
      id: crypto.randomUUID(),
      ...b
    }));
    setData(prev => ({
      ...prev,
      sections: [...prev.sections, { 
        title, 
        content: '', 
        metadata: { subtitle: '', layout: 'full_width', media: [], blocks } 
      }]
    }));
    setActiveSectionIndex(data.sections.length);
    setIsAddSectionOpen(false);
  };

  const addSection = () => {
    setData(prev => ({
      ...prev,
      sections: [...prev.sections, { 
        title: 'New Section', 
        content: '', 
        metadata: { subtitle: '', layout: 'full_width', media: [], blocks: [] } 
      }]
    }));
    setActiveSectionIndex(data.sections.length);
  };

  const removeSection = (index: number) => {
    if (!confirm('Delete this section?')) return;
    const newSections = data.sections.filter((_, i) => i !== index);
    setData({ ...data, sections: newSections });
    if (activeSectionIndex === index) {
      setActiveSectionIndex(null);
    } else if (activeSectionIndex !== null && activeSectionIndex > index) {
      setActiveSectionIndex(activeSectionIndex - 1);
    }
  };

  const duplicateSection = (index: number) => {
    const sectionToCopy = data.sections[index];
    const newSection = { ...sectionToCopy, id: undefined, title: `${sectionToCopy.title} (Copy)` };
    const newSections = [...data.sections];
    newSections.splice(index + 1, 0, newSection);
    setData({ ...data, sections: newSections });
    setActiveSectionIndex(index + 1);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === data.sections.length - 1) return;
    
    const newSections = [...data.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;
    
    setData({ ...data, sections: newSections });
    
    if (activeSectionIndex === index) {
      setActiveSectionIndex(targetIndex);
    } else if (activeSectionIndex === targetIndex) {
      setActiveSectionIndex(index);
    }
  };

  const updateActiveSection = (updates: Partial<SectionData>) => {
    if (activeSectionIndex === null) return;
    const newSections = [...data.sections];
    newSections[activeSectionIndex] = { ...newSections[activeSectionIndex], ...updates };
    setData({ ...data, sections: newSections });
  };

  // --- Block Management ---
  const addBlock = (type: ContentBlockItem['type']) => {
    if (activeSectionIndex === null) return;
    const newBlock: ContentBlockItem = {
      id: crypto.randomUUID(),
      type,
    };
    if (type === 'paragraph') newBlock.content = '';
    if (type === 'heading') { newBlock.headingText = ''; newBlock.headingLevel = 'h3'; }
    if (type === 'feature_list') newBlock.features = [];
    if (type === 'project_details') newBlock.projectDetails = [];
    if (type === 'bullet_list' || type === 'numbered_list') newBlock.listItems = [''];
    if (type === 'image_grid') newBlock.imageGridUrls = [];
    if (type === 'metric_group') newBlock.metrics = [];
    if (type === 'quote') newBlock.quoteText = '';
    if (type === 'embed') newBlock.embedUrl = '';
    if (type === 'svg') newBlock.imageUrl = '';
    if (type === 'webpage' || type === 'dashboard' || type === 'image') {
      newBlock.displayType = type;
      newBlock.displaySize = type === 'webpage' ? 'full' : 'large';
      newBlock.backgroundType = type === 'dashboard' ? 'custom' : 'none';
      newBlock.backgroundColor = type === 'dashboard' ? '#FFD36A' : undefined;
      newBlock.padding = type === 'dashboard' ? 48 : 0;
      newBlock.radius = type === 'dashboard' ? 20 : type === 'image' ? 16 : 0;
      newBlock.fit = type === 'dashboard' ? 'contain' : 'natural';
    }
    
    const activeSection = data.sections[activeSectionIndex];
    updateActiveSection({
      metadata: { ...activeSection.metadata, blocks: [...activeSection.metadata.blocks, newBlock] }
    });
  };

  const updateBlock = (blockIndex: number, updates: Partial<ContentBlockItem>) => {
    if (activeSectionIndex === null) return;
    const activeSection = data.sections[activeSectionIndex];
    const newBlocks = [...activeSection.metadata.blocks];
    newBlocks[blockIndex] = { ...newBlocks[blockIndex], ...updates };
    updateActiveSection({ metadata: { ...activeSection.metadata, blocks: newBlocks } });
  };

  const removeBlock = (blockIndex: number) => {
    if (activeSectionIndex === null) return;
    const activeSection = data.sections[activeSectionIndex];
    const newBlocks = activeSection.metadata.blocks.filter((_, i) => i !== blockIndex);
    updateActiveSection({ metadata: { ...activeSection.metadata, blocks: newBlocks } });
  };

  const moveBlock = (blockIndex: number, direction: 'up' | 'down') => {
    if (activeSectionIndex === null) return;
    const activeSection = data.sections[activeSectionIndex];
    const newBlocks = [...activeSection.metadata.blocks];
    if (direction === 'up' && blockIndex === 0) return;
    if (direction === 'down' && blockIndex === newBlocks.length - 1) return;
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    const temp = newBlocks[blockIndex];
    newBlocks[blockIndex] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    updateActiveSection({ metadata: { ...activeSection.metadata, blocks: newBlocks } });
  };

  const duplicateBlock = (blockIndex: number) => {
    if (activeSectionIndex === null) return;
    const activeSection = data.sections[activeSectionIndex];
    const blockToCopy = activeSection.metadata.blocks[blockIndex];
    const newBlock = { ...blockToCopy, id: crypto.randomUUID() };
    const newBlocks = [...activeSection.metadata.blocks];
    newBlocks.splice(blockIndex + 1, 0, newBlock);
    updateActiveSection({ metadata: { ...activeSection.metadata, blocks: newBlocks } });
  };

  // --- Media Management ---
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeSectionIndex === null) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Upload failed');

      const activeSection = data.sections[activeSectionIndex];
      const newMedia: MediaItem = {
        url: result.url,
        type: result.type,
        size: 'original'
      };

      updateActiveSection({
        metadata: {
          ...activeSection.metadata,
          media: [...activeSection.metadata.media, newMedia]
        }
      });
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const updateMedia = (mediaIndex: number, updates: Partial<MediaItem>) => {
    if (activeSectionIndex === null) return;
    const activeSection = data.sections[activeSectionIndex];
    const newMedia = [...activeSection.metadata.media];
    newMedia[mediaIndex] = { ...newMedia[mediaIndex], ...updates };
    
    updateActiveSection({
      metadata: { ...activeSection.metadata, media: newMedia }
    });
  };

  const removeMedia = (mediaIndex: number) => {
    if (activeSectionIndex === null) return;
    const activeSection = data.sections[activeSectionIndex];
    const newMedia = activeSection.metadata.media.filter((_, i) => i !== mediaIndex);
    updateActiveSection({ metadata: { ...activeSection.metadata, media: newMedia } });
  };

  const moveMedia = (mediaIndex: number, direction: 'up' | 'down') => {
    if (activeSectionIndex === null) return;
    const activeSection = data.sections[activeSectionIndex];
    const newMedia = [...activeSection.metadata.media];
    
    if (direction === 'up' && mediaIndex === 0) return;
    if (direction === 'down' && mediaIndex === newMedia.length - 1) return;
    
    const targetIndex = direction === 'up' ? mediaIndex - 1 : mediaIndex + 1;
    const temp = newMedia[mediaIndex];
    newMedia[mediaIndex] = newMedia[targetIndex];
    newMedia[targetIndex] = temp;
    
    updateActiveSection({ metadata: { ...activeSection.metadata, media: newMedia } });
  };

  // --- Save ---
  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);
    try {
      const payload = {
        projectId: project.id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        coverImage: data.coverImage,
        status,
        sourceType: 'MANUAL',
        metadata: {},
        sections: data.sections.map((s) => ({
          id: s.id,
          title: s.title,
          content: s.content,
          images: s.metadata.media.map((m) => m.url).filter(Boolean),
          metadata: {
            subtitle: s.metadata.subtitle,
            layout: s.metadata.layout,
            media: s.metadata.media,
            blocks: s.metadata.blocks
          }
        }))
      };

      const url = initialCaseStudy ? `/api/case-studies/${initialCaseStudy.id}` : '/api/case-studies';
      const method = initialCaseStudy ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      // Revalidate public portfolio page + dashboard cache
      await revalidateCaseStudyPaths(project.id);
      router.refresh();
      setSaveSuccess(status === 'PUBLISHED' ? 'Published!' : 'Saved as draft');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Save failed');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-8rem)] gap-8 bg-[#0a0a0a] text-zinc-300 rounded-xl overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-full lg:w-64 shrink-0 border-r border-white/5 bg-[#111113] p-6 flex flex-col h-full">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">CMS Menu</h3>
        
        <div className="space-y-1 mb-8">
          <button
            onClick={() => setActiveSectionIndex(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeSectionIndex === null ? 'bg-[#4F8CFF]/10 text-[#4F8CFF]' : 'hover:bg-white/5'
            }`}
          >
            <Settings size={16} /> CASE STUDY
          </button>
        </div>

        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Sections</h3>
        <div className="flex-1 overflow-y-auto space-y-1 mb-4 pr-2">
          {data.sections.map((section, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSectionIndex(idx)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                activeSectionIndex === idx ? 'bg-white/10 text-white font-semibold' : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              <span className={`font-mono text-xs ${activeSectionIndex === idx ? 'text-[#4F8CFF]' : 'text-zinc-600'}`}>
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="truncate">{section.title || 'Untitled'}</span>
            </button>
          ))}
        </div>

        <div className="relative mt-auto">
          <button
            onClick={() => setIsAddSectionOpen(!isAddSectionOpen)}
            className="w-full py-2.5 rounded-lg border border-white/10 text-zinc-300 text-sm font-semibold hover:bg-white/5 flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={16} /> Add Section
          </button>
          
          {isAddSectionOpen && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-[#111113] border border-white/10 rounded-xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto">
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 px-2 pt-2">Custom</div>
              <button
                onClick={() => addPresetSection('New Section', [])}
                className="w-full text-left px-3 py-2 rounded-md text-sm text-white hover:bg-white/10 flex items-center gap-2"
              >
                <Plus size={14} /> Blank Section
              </button>
              
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-4 mb-2 px-2">Presets</div>
              {PRESET_SECTIONS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => addPresetSection(preset.title, preset.blocks)}
                  className="w-full text-left px-3 py-2 rounded-md text-sm text-zinc-300 hover:text-white hover:bg-white/10"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-white">
              {activeSectionIndex === null ? 'General Settings' : `Editing: ${data.sections[activeSectionIndex].title || 'Untitled Section'}`}
            </h2>
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-400">✓ {saveSuccess}</span>
            )}
            {saveError && (
              <span className="text-xs font-semibold text-red-400">✗ {saveError}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave('DRAFT')}
              disabled={isSaving}
              className="px-4 py-2 rounded-md bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave('PUBLISHED')}
              disabled={isSaving}
              className="px-4 py-2 rounded-md bg-[#4F8CFF] text-white text-sm font-semibold hover:bg-[#3B78EB] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} /> {isSaving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {activeSectionIndex === null ? (
          // --- General Settings View ---
          <div className="max-w-2xl space-y-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-2">Case Study Title</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="w-full bg-[#111113] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4F8CFF] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-2">URL Slug</label>
              <input
                type="text"
                value={data.slug}
                onChange={(e) => setData({ ...data, slug: e.target.value })}
                className="w-full bg-[#111113] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4F8CFF] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-2">Short Description</label>
              <textarea
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                rows={4}
                className="w-full bg-[#111113] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4F8CFF] transition-colors resize-y"
              />
            </div>
          </div>
        ) : (
          // --- Section Editor View ---
          <div className="max-w-3xl space-y-8">
            {/* Section Controls */}
            <div className="flex items-center justify-end gap-2 mb-4">
              <button onClick={() => moveSection(activeSectionIndex, 'up')} disabled={activeSectionIndex === 0} className="p-2 bg-white/5 rounded-md hover:bg-white/10 disabled:opacity-30" title="Move Up">
                <ChevronUp size={16} />
              </button>
              <button onClick={() => moveSection(activeSectionIndex, 'down')} disabled={activeSectionIndex === data.sections.length - 1} className="p-2 bg-white/5 rounded-md hover:bg-white/10 disabled:opacity-30" title="Move Down">
                <ChevronDown size={16} />
              </button>
              <button onClick={() => duplicateSection(activeSectionIndex)} className="p-2 bg-white/5 rounded-md hover:bg-white/10 text-zinc-300" title="Duplicate Section">
                <Copy size={16} />
              </button>
              <button onClick={() => removeSection(activeSectionIndex)} className="p-2 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 ml-2" title="Delete Section">
                <Trash2 size={16} />
              </button>
            </div>

            {/* Text Content */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-2">SECTION TITLE</label>
                <input
                  type="text"
                  value={data.sections[activeSectionIndex].title}
                  onChange={(e) => updateActiveSection({ title: e.target.value })}
                  placeholder="e.g. Overview"
                  className="w-full bg-[#111113] border border-white/10 rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-[#4F8CFF] transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">SUBTITLE (Optional)</label>
                  <input
                    type="text"
                    value={data.sections[activeSectionIndex].metadata.subtitle || ''}
                    onChange={(e) => updateActiveSection({ metadata: { ...data.sections[activeSectionIndex].metadata, subtitle: e.target.value } })}
                    placeholder="e.g. Core Features"
                    className="w-full bg-[#111113] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4F8CFF] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">LAYOUT MODE</label>
                  <select
                    value={data.sections[activeSectionIndex].metadata.layout || 'full_width'}
                    onChange={(e) => updateActiveSection({ metadata: { ...data.sections[activeSectionIndex].metadata, layout: e.target.value } })}
                    className="w-full bg-[#111113] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4F8CFF] transition-colors"
                  >
                    <option value="full_width">Full Width</option>
                    <option value="two_column">Two Column</option>
                    <option value="split_text_media">Split (Text Left, Media Right)</option>
                    <option value="split_media_text">Split (Media Left, Text Right)</option>
                    <option value="text_focus">Text Focus (Narrow)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-400 mb-2">NARRATIVE / STORY CONTENT (Optional)</label>
                <textarea
                  value={data.sections[activeSectionIndex].content}
                  onChange={(e) => updateActiveSection({ content: e.target.value })}
                  placeholder="Write the section narrative content here..."
                  rows={6}
                  className="w-full bg-[#111113] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4F8CFF] transition-colors resize-y leading-relaxed"
                />
              </div>
              {/* Content Blocks */}
              <div className="pt-6 border-t border-white/5 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 relative">
                  <label className="block text-sm font-semibold text-zinc-400">CONTENT BLOCKS</label>
                  
                  {/* Add Block Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsAddContentOpen(!isAddContentOpen)}
                      className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-zinc-300 text-sm font-semibold hover:bg-white/10 flex items-center gap-2 transition-colors"
                    >
                      <Plus size={16} /> Add Content
                    </button>

                    {isAddContentOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsAddContentOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-[#111113] border border-white/10 rounded-xl shadow-2xl z-20 py-2 overflow-hidden flex flex-col max-h-[300px] overflow-y-auto">
                          <button onClick={() => { addBlock('paragraph'); setIsAddContentOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><Type size={14} className="text-[#4F8CFF]"/> Text / Paragraph</button>
                          <button onClick={() => { addBlock('heading'); setIsAddContentOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><Type size={14} className="text-[#4F8CFF]"/> Heading</button>
                          <button onClick={() => { addBlock('feature_list'); setIsAddContentOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><CheckSquare size={14} className="text-[#4F8CFF]"/> Key Features</button>
                          <button onClick={() => { addBlock('bullet_list'); setIsAddContentOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><List size={14} className="text-[#4F8CFF]"/> Bullet Points</button>
                          <button onClick={() => { addBlock('numbered_list'); setIsAddContentOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><List size={14} className="text-[#4F8CFF]"/> Numbered Points</button>
                          <button onClick={() => { addBlock('quote'); setIsAddContentOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><Type size={14} className="text-[#4F8CFF]"/> Quote / Insight</button>
                          <button onClick={() => { addBlock('metric_group'); setIsAddContentOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><Info size={14} className="text-[#4F8CFF]"/> Stats / Metrics</button>
                          <button onClick={() => { addBlock('webpage'); setIsAddContentOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><Globe size={14} className="text-[#4F8CFF]"/> Webpage Screenshot</button>
                          <button onClick={() => { addBlock('dashboard'); setIsAddContentOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><Layout size={14} className="text-purple-400"/> Dashboard / UI Screen</button>
                          <button onClick={() => { addBlock('image'); setIsAddContentOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><ImageIcon size={14} className="text-emerald-400"/> Standard Image</button>
                          <button onClick={() => { addBlock('image_grid'); setIsAddContentOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><ImageIcon size={14} className="text-[#4F8CFF]"/> Image Gallery</button>
                          <button onClick={() => { addBlock('embed'); setIsAddContentOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><FileText size={14} className="text-[#4F8CFF]"/> Video / Prototype</button>
                          <button onClick={() => { addBlock('project_details'); setIsAddContentOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><List size={14} className="text-[#4F8CFF]"/> Custom Content</button>
                          <button onClick={() => { addBlock('svg'); setIsAddContentOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"><ImageIcon size={14} className="text-[#4F8CFF]"/> SVG Vector</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {data.sections[activeSectionIndex].metadata.blocks.length === 0 ? (
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-zinc-500">
                    <AlignLeft size={48} className="mb-4 opacity-50" />
                    <p>No content blocks added yet. Click above to start building your story.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {data.sections[activeSectionIndex].metadata.blocks.map((block, bIdx) => (
                      <div key={block.id} className="bg-[#111113] border border-white/10 rounded-xl p-5 space-y-4">
                        {/* Block Header / Controls */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            {block.type.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => toggleBlockCollapse(block.id)} className="p-1.5 bg-white/5 rounded hover:bg-white/10 text-zinc-300 mr-2" title="Toggle Collapse">
                              {collapsedBlocks[block.id] ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                            </button>
                            <button onClick={() => moveBlock(bIdx, 'up')} disabled={bIdx === 0} className="p-1.5 bg-white/5 rounded hover:bg-white/10 disabled:opacity-30" title="Move Up"><ChevronUp size={14} /></button>
                            <button onClick={() => moveBlock(bIdx, 'down')} disabled={bIdx === data.sections[activeSectionIndex!].metadata.blocks.length - 1} className="p-1.5 bg-white/5 rounded hover:bg-white/10 disabled:opacity-30" title="Move Down"><ChevronDown size={14} /></button>
                            <button onClick={() => duplicateBlock(bIdx)} className="p-1.5 bg-white/5 rounded hover:bg-white/10 ml-1" title="Duplicate"><Copy size={14} /></button>
                            <button onClick={() => removeBlock(bIdx)} className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 ml-1" title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </div>

                        {/* Block Editor Forms */}
                        {!collapsedBlocks[block.id] && (
                          <>
                            {block.type === 'paragraph' && (
                          <textarea
                            value={block.content || ''}
                            onChange={(e) => updateBlock(bIdx, { content: e.target.value })}
                            placeholder="Write your paragraph..."
                            rows={4}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4F8CFF] transition-colors resize-y"
                          />
                        )}

                        {block.type === 'heading' && (
                          <div className="flex gap-4">
                            <select
                              value={block.headingLevel || 'h3'}
                              onChange={(e) => updateBlock(bIdx, { headingLevel: e.target.value as any })}
                              className="bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4F8CFF]"
                            >
                              <option value="h2">H2 (Large)</option>
                              <option value="h3">H3 (Medium)</option>
                              <option value="h4">H4 (Small)</option>
                            </select>
                            <input
                              type="text"
                              value={block.headingText || ''}
                              onChange={(e) => updateBlock(bIdx, { headingText: e.target.value })}
                              placeholder="Heading text"
                              className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4F8CFF]"
                            />
                          </div>
                        )}

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
                              updateBlock(bIdx, {
                                ...updatedVisual,
                                type: updatedVisual.displayType || block.type,
                                imageUrl: updatedVisual.imageUrl,
                                imageAlt: updatedVisual.alt,
                                imageCaption: updatedVisual.caption,
                              });
                            }}
                          />
                        )}

                        {block.type === 'feature_list' && (
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={block.headingText || ''}
                              onChange={(e) => updateBlock(bIdx, { headingText: e.target.value })}
                              placeholder="Block Heading (e.g., Key Features)"
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none focus:border-[#4F8CFF]"
                            />
                            
                            <div className="space-y-3">
                              {(block.features || []).map((feat, fIdx) => (
                                <div key={fIdx} className="bg-black/30 p-4 rounded-lg border border-white/5 flex gap-4">
                                  <div className="flex flex-col gap-1 mt-1">
                                    <button onClick={() => {
                                      const newF = [...(block.features || [])];
                                      if (fIdx > 0) { const t = newF[fIdx]; newF[fIdx] = newF[fIdx-1]; newF[fIdx-1] = t; updateBlock(bIdx, { features: newF }); }
                                    }} disabled={fIdx === 0} className="text-zinc-500 hover:text-white disabled:opacity-30"><ChevronUp size={14} /></button>
                                    <button onClick={() => {
                                      const newF = [...(block.features || [])];
                                      if (fIdx < newF.length - 1) { const t = newF[fIdx]; newF[fIdx] = newF[fIdx+1]; newF[fIdx+1] = t; updateBlock(bIdx, { features: newF }); }
                                    }} disabled={fIdx === (block.features || []).length - 1} className="text-zinc-500 hover:text-white disabled:opacity-30"><ChevronDown size={14} /></button>
                                  </div>
                                  <div className="flex-1 space-y-3">
                                    <input
                                      type="text"
                                      value={feat.title}
                                      onChange={(e) => {
                                        const newF = [...(block.features || [])];
                                        newF[fIdx] = { ...newF[fIdx], title: e.target.value };
                                        updateBlock(bIdx, { features: newF });
                                      }}
                                      placeholder="Feature Title"
                                      className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-white focus:outline-none focus:border-[#4F8CFF] font-semibold text-sm"
                                    />
                                    <textarea
                                      value={feat.description}
                                      onChange={(e) => {
                                        const newF = [...(block.features || [])];
                                        newF[fIdx] = { ...newF[fIdx], description: e.target.value };
                                        updateBlock(bIdx, { features: newF });
                                      }}
                                      placeholder="Feature Description"
                                      rows={2}
                                      className="w-full bg-transparent border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#4F8CFF] text-sm resize-y"
                                    />
                                    <div className="flex gap-3">
                                      {feat.imageUrl ? (
                                        <div className="relative w-16 h-16 shrink-0 rounded overflow-hidden border border-white/10 group bg-black/50">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img src={feat.imageUrl} alt="" className="w-full h-full object-cover" />
                                          <button onClick={() => {
                                            const newF = [...(block.features || [])];
                                            newF[fIdx] = { ...newF[fIdx], imageUrl: undefined };
                                            updateBlock(bIdx, { features: newF });
                                          }} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity">
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      ) : (
                                        <label className="cursor-pointer flex items-center justify-center w-16 h-16 shrink-0 border-2 border-dashed border-white/20 rounded hover:bg-white/5 transition-colors" title="Upload Feature Image">
                                          <ImageIcon size={16} className="text-zinc-500" />
                                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setIsUploading(true);
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                              const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                              const result = await res.json();
                                              if (res.ok) {
                                                const newF = [...(block.features || [])];
                                                newF[fIdx] = { ...newF[fIdx], imageUrl: result.url };
                                                updateBlock(bIdx, { features: newF });
                                              }
                                            } catch (err) {} finally { setIsUploading(false); }
                                          }} />
                                        </label>
                                      )}
                                      <textarea
                                        value={feat.svg || ''}
                                        onChange={(e) => {
                                          const newF = [...(block.features || [])];
                                          newF[fIdx] = { ...newF[fIdx], svg: e.target.value };
                                          updateBlock(bIdx, { features: newF });
                                        }}
                                        placeholder="Or paste SVG code here..."
                                        className="flex-1 h-16 bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#4F8CFF] text-xs font-mono resize-none placeholder:text-zinc-600"
                                      />
                                    </div>
                                  </div>
                                  <button onClick={() => {
                                    const newF = (block.features || []).filter((_, i) => i !== fIdx);
                                    updateBlock(bIdx, { features: newF });
                                  }} className="text-red-400 hover:text-red-300 self-start p-1"><Trash2 size={16} /></button>
                                </div>
                              ))}
                            </div>
                            <button onClick={() => {
                              const newF = [...(block.features || []), { title: '', description: '' }];
                              updateBlock(bIdx, { features: newF });
                            }} className="text-[#4F8CFF] text-sm font-semibold hover:underline flex items-center gap-1">
                              <Plus size={14} /> Add Feature
                            </button>
                          </div>
                        )}

                        {block.type === 'project_details' && (
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={block.headingText || ''}
                              onChange={(e) => updateBlock(bIdx, { headingText: e.target.value })}
                              placeholder="Block Heading (e.g., Project Specifications)"
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none focus:border-[#4F8CFF]"
                            />
                            
                            <div className="grid gap-3 sm:grid-cols-2">
                              {(block.projectDetails || []).map((detail, dIdx) => (
                                <div key={dIdx} className="bg-black/30 p-3 rounded-lg border border-white/5 flex gap-3 items-start">
                                  <div className="flex-1 space-y-2">
                                    <input
                                      type="text"
                                      value={detail.label}
                                      onChange={(e) => {
                                        const newD = [...(block.projectDetails || [])];
                                        newD[dIdx] = { ...newD[dIdx], label: e.target.value };
                                        updateBlock(bIdx, { projectDetails: newD });
                                      }}
                                      placeholder="Label (e.g., Role)"
                                      className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-white focus:outline-none focus:border-[#4F8CFF] text-xs uppercase tracking-wider text-zinc-400"
                                    />
                                    <input
                                      type="text"
                                      value={detail.value}
                                      onChange={(e) => {
                                        const newD = [...(block.projectDetails || [])];
                                        newD[dIdx] = { ...newD[dIdx], value: e.target.value };
                                        updateBlock(bIdx, { projectDetails: newD });
                                      }}
                                      placeholder="Value (e.g., Lead Developer)"
                                      className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-white focus:outline-none focus:border-[#4F8CFF] text-sm font-semibold"
                                    />
                                  </div>
                                  <button onClick={() => {
                                    const newD = (block.projectDetails || []).filter((_, i) => i !== dIdx);
                                    updateBlock(bIdx, { projectDetails: newD });
                                  }} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16} /></button>
                                </div>
                              ))}
                            </div>
                            <button onClick={() => {
                              const newD = [...(block.projectDetails || []), { label: '', value: '' }];
                              updateBlock(bIdx, { projectDetails: newD });
                            }} className="text-[#4F8CFF] text-sm font-semibold hover:underline flex items-center gap-1">
                              <Plus size={14} /> Add Detail
                            </button>
                          </div>
                        )}

                        {(block.type === 'bullet_list' || block.type === 'numbered_list') && (
                          <div className="space-y-3">
                            {(block.listItems || []).map((item, iIdx) => (
                              <div key={iIdx} className="flex gap-2">
                                <span className="mt-2 text-zinc-500">{block.type === 'bullet_list' ? '•' : `${iIdx + 1}.`}</span>
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const newL = [...(block.listItems || [])];
                                    newL[iIdx] = e.target.value;
                                    updateBlock(bIdx, { listItems: newL });
                                  }}
                                  className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4F8CFF]"
                                />
                                <button onClick={() => {
                                  const newL = (block.listItems || []).filter((_, i) => i !== iIdx);
                                  updateBlock(bIdx, { listItems: newL });
                                }} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={16} /></button>
                              </div>
                            ))}
                            <button onClick={() => {
                              const newL = [...(block.listItems || []), ''];
                              updateBlock(bIdx, { listItems: newL });
                            }} className="text-[#4F8CFF] text-sm font-semibold hover:underline flex items-center gap-1">
                              <Plus size={14} /> Add Item
                            </button>
                          </div>
                        )}

                        {block.type === 'image_grid' && (
                          <div className="space-y-4">
                            <div className="flex gap-4 items-center">
                              <label className="text-sm text-zinc-400">Columns:</label>
                              <select
                                value={block.imageGridColumns || 2}
                                onChange={(e) => updateBlock(bIdx, { imageGridColumns: parseInt(e.target.value) as any })}
                                className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#4F8CFF] text-sm"
                              >
                                <option value={2}>2 Columns</option>
                                <option value={3}>3 Columns</option>
                                <option value={4}>4 Columns</option>
                              </select>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {(block.imageGridUrls || []).map((url, uIdx) => (
                                <div key={uIdx} className="relative aspect-square rounded-lg border border-white/10 overflow-hidden bg-black/50 group">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                  <button onClick={() => {
                                    const newU = (block.imageGridUrls || []).filter((_, i) => i !== uIdx);
                                    updateBlock(bIdx, { imageGridUrls: newU });
                                  }} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity">
                                    <Trash2 size={20} />
                                  </button>
                                </div>
                              ))}
                              
                              <label className="cursor-pointer flex flex-col items-center justify-center aspect-square border-2 border-dashed border-white/20 rounded-lg hover:bg-white/5 transition-colors">
                                <ImageIcon size={24} className="mb-1 text-zinc-500" />
                                <span className="text-xs text-[#4F8CFF]">Add Image</span>
                                <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                                  const files = Array.from(e.target.files || []);
                                  if (!files.length) return;
                                  setIsUploading(true);
                                  const newUrls: string[] = [];
                                  for (const file of files) {
                                    const formData = new FormData(); formData.append('file', file);
                                    try {
                                      const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                      const result = await res.json();
                                      if (res.ok) newUrls.push(result.url);
                                    } catch (err) {}
                                  }
                                  setIsUploading(false);
                                  if (newUrls.length) {
                                    updateBlock(bIdx, { imageGridUrls: [...(block.imageGridUrls || []), ...newUrls] });
                                  }
                                }} />
                              </label>
                            </div>
                          </div>
                        )}

                        {block.type === 'embed' && (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={block.embedUrl || ''}
                              onChange={(e) => updateBlock(bIdx, { embedUrl: e.target.value })}
                              placeholder="YouTube, Vimeo, Figma, or MP4 URL..."
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4F8CFF]"
                            />
                            {block.embedUrl && <p className="text-xs text-zinc-500">Preview will be rendered in the public view.</p>}
                          </div>
                        )}

                        {block.type === 'quote' && (
                          <div className="space-y-3">
                            <textarea
                              value={block.quoteText || ''}
                              onChange={(e) => updateBlock(bIdx, { quoteText: e.target.value })}
                              placeholder="Quote text..."
                              rows={3}
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4F8CFF] resize-y text-lg italic"
                            />
                            <div className="flex gap-3">
                              <input
                                type="text"
                                value={block.quoteAuthor || ''}
                                onChange={(e) => updateBlock(bIdx, { quoteAuthor: e.target.value })}
                                placeholder="Author Name"
                                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4F8CFF] text-sm"
                              />
                              <input
                                type="text"
                                value={block.quoteRole || ''}
                                onChange={(e) => updateBlock(bIdx, { quoteRole: e.target.value })}
                                placeholder="Role / Company"
                                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4F8CFF] text-sm"
                              />
                            </div>
                          </div>
                        )}

                        {block.type === 'metric_group' && (
                          <div className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                              {(block.metrics || []).map((m, mIdx) => (
                                <div key={mIdx} className="bg-black/30 p-3 rounded-lg border border-white/5 flex gap-3 items-start flex-col">
                                  <input
                                    type="text"
                                    value={m.value}
                                    onChange={(e) => {
                                      const newM = [...(block.metrics || [])];
                                      newM[mIdx] = { ...newM[mIdx], value: e.target.value };
                                      updateBlock(bIdx, { metrics: newM });
                                    }}
                                    placeholder="Value (e.g., 500M+)"
                                    className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-white focus:outline-none focus:border-[#4F8CFF] text-xl font-bold font-mono"
                                  />
                                  <input
                                    type="text"
                                    value={m.label}
                                    onChange={(e) => {
                                      const newM = [...(block.metrics || [])];
                                      newM[mIdx] = { ...newM[mIdx], label: e.target.value };
                                      updateBlock(bIdx, { metrics: newM });
                                    }}
                                    placeholder="Label"
                                    className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-white focus:outline-none focus:border-[#4F8CFF] text-sm font-semibold"
                                  />
                                  <input
                                    type="text"
                                    value={m.description || ''}
                                    onChange={(e) => {
                                      const newM = [...(block.metrics || [])];
                                      newM[mIdx] = { ...newM[mIdx], description: e.target.value };
                                      updateBlock(bIdx, { metrics: newM });
                                    }}
                                    placeholder="Description (Optional)"
                                    className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-white focus:outline-none focus:border-[#4F8CFF] text-xs"
                                  />
                                  <button onClick={() => {
                                    const newM = (block.metrics || []).filter((_, i) => i !== mIdx);
                                    updateBlock(bIdx, { metrics: newM });
                                  }} className="text-red-400 hover:text-red-300 p-1 self-end"><Trash2 size={16} /></button>
                                </div>
                              ))}
                            </div>
                            <button onClick={() => {
                              const newM = [...(block.metrics || []), { value: '', label: '', description: '' }];
                              updateBlock(bIdx, { metrics: newM });
                            }} className="text-[#4F8CFF] text-sm font-semibold hover:underline flex items-center gap-1">
                              <Plus size={14} /> Add Stat
                            </button>
                          </div>
                        )}

                        {block.type === 'svg' && (
                          <div className="space-y-4">
                            {block.imageUrl ? (
                              <div className="relative rounded-lg border border-white/10 overflow-hidden bg-black/50 p-2 flex justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={block.imageUrl} alt="SVG Preview" className="max-h-64 object-contain" />
                                <button onClick={() => updateBlock(bIdx, { imageUrl: '' })} className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-md hover:bg-red-500">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ) : (
                              <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-8 hover:bg-white/5 transition-colors">
                                <ImageIcon size={32} className="mb-2 text-zinc-500" />
                                <span className="text-sm font-semibold text-[#4F8CFF]">Click to upload SVG</span>
                                <input type="file" accept=".svg" className="hidden" onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setIsUploading(true);
                                  const formData = new FormData();
                                  formData.append('file', file);
                                  try {
                                    const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                    const result = await res.json();
                                    if (res.ok) updateBlock(bIdx, { imageUrl: result.url });
                                  } catch (err) {} finally { setIsUploading(false); }
                                }} />
                              </label>
                            )}
                            
                            <div className="flex gap-4 items-center">
                              <label className="text-sm text-zinc-400">Background:</label>
                              <select
                                value={block.svgBackground || 'transparent'}
                                onChange={(e) => updateBlock(bIdx, { svgBackground: e.target.value as any })}
                                className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#4F8CFF] text-sm"
                              >
                                <option value="transparent">Transparent</option>
                                <option value="dark">Dark Box</option>
                                <option value="card">Card Background</option>
                              </select>
                            </div>

                            <input
                              type="text"
                              value={block.imageCaption || ''}
                              onChange={(e) => updateBlock(bIdx, { imageCaption: e.target.value })}
                              placeholder="Optional SVG caption..."
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4F8CFF] text-sm"
                            />
                          </div>
                        )}

                        {/* End of block types */}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Media Content */}
            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div>
                  <label className="block text-sm font-semibold text-zinc-300">
                    SECTION VISUALS & PRESENTATION
                  </label>
                  <p className="text-xs text-zinc-500">
                    Upload webpage screenshots, UI dashboards, and images with Behance presentation controls.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSectionIndex === null) return;
                      const activeSection = data.sections[activeSectionIndex];
                      const newMedia: MediaItem = {
                        id: `med-${Date.now()}`,
                        url: '',
                        imageUrl: '',
                        type: 'image',
                        displayType: 'webpage',
                        displaySize: 'full',
                        backgroundType: 'none',
                        padding: 0,
                        radius: 0,
                        fit: 'natural',
                      };
                      updateActiveSection({
                        metadata: {
                          ...activeSection.metadata,
                          media: [...activeSection.metadata.media, newMedia],
                        },
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Globe size={13} className="text-[#4F8CFF]" />
                    <span>+ Webpage</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSectionIndex === null) return;
                      const activeSection = data.sections[activeSectionIndex];
                      const newMedia: MediaItem = {
                        id: `med-${Date.now()}`,
                        url: '',
                        imageUrl: '',
                        type: 'image',
                        displayType: 'dashboard',
                        displaySize: 'large',
                        backgroundType: 'custom',
                        backgroundColor: '#FFD36A',
                        padding: 48,
                        radius: 20,
                        fit: 'contain',
                      };
                      updateActiveSection({
                        metadata: {
                          ...activeSection.metadata,
                          media: [...activeSection.metadata.media, newMedia],
                        },
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Layout size={13} className="text-purple-400" />
                    <span>+ Dashboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSectionIndex === null) return;
                      const activeSection = data.sections[activeSectionIndex];
                      const newMedia: MediaItem = {
                        id: `med-${Date.now()}`,
                        url: '',
                        imageUrl: '',
                        type: 'image',
                        displayType: 'image',
                        displaySize: 'large',
                        backgroundType: 'none',
                        padding: 0,
                        radius: 16,
                        fit: 'natural',
                      };
                      updateActiveSection({
                        metadata: {
                          ...activeSection.metadata,
                          media: [...activeSection.metadata.media, newMedia],
                        },
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <ImageIcon size={13} className="text-emerald-400" />
                    <span>+ Image</span>
                  </button>
                </div>
              </div>

              {data.sections[activeSectionIndex].metadata.media.length === 0 ? (
                <div className="border-2 border-dashed border-white/10 rounded-xl p-10 flex flex-col items-center justify-center text-zinc-500 space-y-2">
                  <ImageIcon size={36} className="opacity-40" />
                  <p className="text-xs">No presentation visuals added to this section yet.</p>
                  <p className="text-[11px] text-zinc-600">Click &ldquo;+ Webpage&rdquo;, &ldquo;+ Dashboard&rdquo;, or &ldquo;+ Image&rdquo; above.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {data.sections[activeSectionIndex].metadata.media.map((media, mIdx) => (
                    <div key={mIdx} className="relative rounded-2xl border border-white/10 bg-[#0d0e11] overflow-hidden">
                      <div className="flex items-center justify-end gap-1.5 p-3 border-b border-white/5 bg-black/40">
                        <button
                          type="button"
                          onClick={() => moveMedia(mIdx, 'up')}
                          disabled={mIdx === 0}
                          className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-zinc-400 hover:text-white"
                          title="Move Up"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMedia(mIdx, 'down')}
                          disabled={mIdx === data.sections[activeSectionIndex!].metadata.media.length - 1}
                          className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-zinc-400 hover:text-white"
                          title="Move Down"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMedia(mIdx)}
                          className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 ml-2"
                          title="Delete Visual"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="p-4">
                        <CaseStudyVisualEditor
                          value={media}
                          title={`Visual #${mIdx + 1} (${media.displayType || 'image'})`}
                          onChange={(updatedVisual) => {
                            updateMedia(mIdx, {
                              ...updatedVisual,
                              url: updatedVisual.imageUrl,
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
