'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  AlertCircle, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Copy, 
  ExternalLink, 
  Eye, 
  FileText, 
  Globe, 
  Image as ImageIcon, 
  Layers, 
  Layout, 
  LayoutTemplate, 
  Loader2, 
  Plus, 
  Save, 
  Sparkles, 
  Trash2, 
  UploadCloud, 
  X,
  MoveUp,
  MoveDown,
  EyeOff,
  CopyPlus,
  GitFork,
  Search,
  Users,
  Heart,
  Map,
  Palette,
  Type,
  Maximize2,
  Box,
  TrendingUp,
  Grid,
} from 'lucide-react';
import { updateCaseStudyAction, createCaseStudyAction } from '@/lib/dashboard/client-actions';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { TechStackPicker } from '@/components/dashboard/TechStackPicker';
import { CaseStudyEditorPreview } from './CaseStudyEditorPreview';
import { normalizeSectionMedia } from '@/lib/media/case-study-media';
import { CaseStudyVisualEditor } from '@/components/dashboard/case-studies/CaseStudyVisualEditor';
import {
  CaseStudyVisual,
  CaseStudyVisualDisplayType,
  VISUAL_DEFAULTS,
  normalizeCaseStudyVisual,
} from '@/types/case-study-visual';
import { resolveImageUrl } from '@/lib/media/resolve-image-url';

// Modular Section Editors & Section Library Modal
import { SectionLibraryModal, SectionTemplateItem } from './sections/SectionLibraryModal';
import { UserFlowEditor } from './sections/UserFlowEditor';
import { InformationArchitectureEditor } from './sections/InformationArchitectureEditor';
import { EmpathyMapEditor } from './sections/EmpathyMapEditor';
import { PersonaEditor } from './sections/PersonaEditor';
import { JourneyMapEditor } from './sections/JourneyMapEditor';
import { CompetitiveAnalysisEditor } from './sections/CompetitiveAnalysisEditor';
import { DesignDecisionEditor } from './sections/DesignDecisionEditor';
import { MetricsEditor } from './sections/MetricsEditor';
import { DesignProcessEditor } from './sections/DesignProcessEditor';
import { DesignSystemEditor } from './sections/DesignSystemEditor';
import { GalleryEditor } from './sections/GalleryEditor';
import { StandardSectionEditor } from './sections/StandardSectionEditor';
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
import { CaseStudySectionType } from '@/types/case-study-builder';

const FIXED_SECTIONS_BEFORE = [
  { id: 'overview', title: 'Overview', icon: LayoutTemplate },
  { id: 'project-info', title: 'Project Information', icon: Layers },
  { id: 'prototype', title: 'Prototype', icon: Sparkles },
];

const FIXED_SECTIONS_AFTER = [
  { id: 'seo', title: 'SEO & Metadata', icon: Globe },
  { id: 'publishing', title: 'Publishing', icon: Save },
];

export function AdvancedCaseStudyEditor({
  caseStudy,
  isNew = false,
}: {
  caseStudy?: any;
  isNew?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [savedId, setSavedId] = useState<string | undefined>(caseStudy?.id);
  const [activeSectionId, setActiveSectionId] = useState('overview');
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  const sectionStorageKey = 'case-study-active-section:' + (savedId || 'new');
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(sectionStorageKey);
      if (stored) setActiveSectionId(stored);
    } catch { /* Storage fallback */ }
  }, [sectionStorageKey]);

  const selectSection = (id: string) => {
    setActiveSectionId(id);
    try { sessionStorage.setItem(sectionStorageKey, id); } catch {}
  };

  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [showPdfImporter, setShowPdfImporter] = useState(false);

  // ── Core State ──
  const [title, setTitle] = useState(caseStudy?.title || '');
  const [slug, setSlug] = useState(caseStudy?.slug || '');
  const [description, setDescription] = useState(caseStudy?.description || '');
  const [coverImage, setCoverImage] = useState(caseStudy?.coverImage || '');
  const [client, setClient] = useState(caseStudy?.metadata?.client || '');
  const [role, setRole] = useState(caseStudy?.metadata?.role || 'Lead Product Designer');
  const [year, setYear] = useState(caseStudy?.metadata?.year || new Date().getFullYear().toString());
  const [duration, setDuration] = useState(caseStudy?.metadata?.duration || '3 Months');
  const [team, setTeam] = useState(caseStudy?.metadata?.team || 'Solo Design / Frontend');
  const [category, setCategory] = useState(caseStudy?.metadata?.category || 'Product Design');
  const [figmaUrl, setFigmaUrl] = useState(caseStudy?.metadata?.figmaUrl || '');
  const [liveUrl, setLiveUrl] = useState(caseStudy?.metadata?.liveUrl || '');
  const [githubUrl, setGithubUrl] = useState(caseStudy?.metadata?.githubUrl || '');
  const [technologies, setTechnologies] = useState<string[]>(caseStudy?.metadata?.technologies || caseStudy?.project?.technologies || ['Figma', 'React', 'Tailwind CSS']);
  const [showOnHome, setShowOnHome] = useState<boolean>(caseStudy?.metadata?.showOnHome ?? true);
  const [status, setStatus] = useState(caseStudy?.status || 'DRAFT');
  
  const [useCustomBackground, setUseCustomBackground] = useState<boolean>(caseStudy?.useCustomBackground || false);
  const [customBackground, setCustomBackground] = useState<string>(caseStudy?.customBackground || '#000000');

  // Dynamic Sections Array
  const [sections, setSections] = useState<any[]>(() => {
    if (caseStudy?.sections && caseStudy.sections.length > 0) {
      return caseStudy.sections.map((s: any) => {
        const normalized = normalizeSectionMedia(s);
        return {
          id: s.id || `sec-${Math.random().toString(36).slice(2, 9)}`,
          slug: s.slug || 'section',
          title: s.title || '',
          content: s.content || '',
          images: normalized.images,
          metadata: {
            ...(s.metadata || {}),
            media: normalized.metadata.media,
          },
        };
      });
    }

    // Initial Default Scaffolding
    return [
      { id: 'sec-challenge', slug: 'challenge', title: 'Challenge & Friction', content: 'Describe the core product challenge...', images: [], metadata: { sectionType: 'standard' } },
      { id: 'sec-user-flow', slug: 'user-flow', title: 'User Flow', content: '', images: [], metadata: { sectionType: 'user_flow', userFlow: DEFAULT_USER_FLOW_DEMO } },
      { id: 'sec-design-system', slug: 'design-system', title: 'Design System', content: '', images: [], metadata: { sectionType: 'design_system', designSystem: DEFAULT_DESIGN_SYSTEM_DEMO } },
      { id: 'sec-design-decisions', slug: 'design-decisions', title: 'Design Decisions', content: '', images: [], metadata: { sectionType: 'design_decision', designDecision: DEFAULT_DESIGN_DECISIONS_DEMO } },
      { id: 'sec-results', slug: 'results', title: 'Results & Impact', content: '', images: [], metadata: { sectionType: 'metrics', metrics: DEFAULT_METRICS_DEMO } },
    ];
  });

  const latestInputs = useRef('');
  latestInputs.current = JSON.stringify({ title, slug, description, coverImage, client, role, year, duration, team,
    category, figmaUrl, liveUrl, githubUrl, technologies, showOnHome, useCustomBackground, customBackground, sections });

  // Add Section Template from Modal
  const addSectionFromTemplate = (tmpl: SectionTemplateItem) => {
    setIsDirty(true);
    const newId = `sec-${Date.now().toString(36)}`;
    const baseSlug = tmpl.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    let defaultData: any = {};
    if (tmpl.type === 'user_flow') defaultData = { userFlow: DEFAULT_USER_FLOW_DEMO };
    else if (tmpl.type === 'information_architecture') defaultData = { informationArchitecture: DEFAULT_IA_DEMO };
    else if (tmpl.type === 'empathy_map') defaultData = { empathyMap: DEFAULT_EMPATHY_MAP_DEMO };
    else if (tmpl.type === 'persona') defaultData = { persona: DEFAULT_PERSONA_DEMO };
    else if (tmpl.type === 'journey_map') defaultData = { journeyMap: DEFAULT_JOURNEY_MAP_DEMO };
    else if (tmpl.type === 'competitive_analysis') defaultData = { competitiveAnalysis: DEFAULT_COMPETITIVE_ANALYSIS_DEMO };
    else if (tmpl.type === 'design_decision') defaultData = { designDecision: DEFAULT_DESIGN_DECISIONS_DEMO };
    else if (tmpl.type === 'metrics') defaultData = { metrics: DEFAULT_METRICS_DEMO };
    else if (tmpl.type === 'design_process') defaultData = { designProcess: DEFAULT_DESIGN_PROCESS_DEMO };
    else if (tmpl.type === 'design_system' || tmpl.type === 'color_tokens' || tmpl.type === 'typography' || tmpl.type === 'component_library') {
      defaultData = { designSystem: DEFAULT_DESIGN_SYSTEM_DEMO };
    } else if (tmpl.type === 'gallery') defaultData = { gallery: DEFAULT_GALLERY_DEMO };

    const newSection = {
      id: newId,
      slug: `${baseSlug}-${newId.slice(-4)}`,
      title: tmpl.title,
      content: tmpl.type === 'standard' ? `${tmpl.title} content overview and narrative analysis...` : '',
      images: [],
      metadata: {
        sectionType: tmpl.type,
        ...defaultData,
      },
    };

    setSections((prev) => [...prev, newSection]);
    selectSection(newSection.id);
  };

  const removeSection = (sectionId: string) => {
    setIsDirty(true);
    setSections((prev) => prev.filter((s) => s.id !== sectionId && s.slug !== sectionId));
    if (activeSectionId === sectionId) setActiveSectionId('overview');
  };

  const duplicateSection = (sectionId: string) => {
    setIsDirty(true);
    const targetIdx = sections.findIndex((s) => s.id === sectionId || s.slug === sectionId);
    if (targetIdx < 0) return;
    const target = sections[targetIdx];
    const copyId = `sec-${Date.now().toString(36)}`;
    const copy = {
      ...target,
      id: copyId,
      slug: `${target.slug}-copy`,
      title: `${target.title} (Copy)`,
    };
    const next = [...sections];
    next.splice(targetIdx + 1, 0, copy);
    setSections(next);
    selectSection(copyId);
  };

  const toggleHideSection = (sectionId: string) => {
    setIsDirty(true);
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId || s.slug === sectionId) {
          const hidden = Boolean(s.metadata?.hidden);
          return { ...s, metadata: { ...(s.metadata || {}), hidden: !hidden } };
        }
        return s;
      })
    );
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) return;
    setIsDirty(true);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const next = [...sections];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    setSections(next);
  };

  const updateSectionMetadata = (sectionId: string, metaKey: string, metaVal: any) => {
    setIsDirty(true);
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId || s.slug === sectionId) {
          return {
            ...s,
            metadata: {
              ...(s.metadata || {}),
              [metaKey]: metaVal,
            },
          };
        }
        return s;
      })
    );
  };

  const updateSectionTitle = (sectionId: string, newTitle: string) => {
    setIsDirty(true);
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId || s.slug === sectionId ? { ...s, title: newTitle } : s))
    );
  };

  const updateSectionContent = (slugOrId: string, titleName: string, newContent: string) => {
    setIsDirty(true);
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === slugOrId || s.slug === slugOrId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], content: newContent };
        return next;
      }
      return [...prev, { id: slugOrId, slug: slugOrId, title: titleName, content: newContent, images: [] }];
    });
  };

  const updateSectionMedia = (sectionId: string, newMedia: CaseStudyVisual[]) => {
    setIsDirty(true);
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId || s.slug === sectionId) {
          return {
            ...s,
            images: newMedia.map((m) => resolveImageUrl(m.imageUrl || m.url)).filter(Boolean) as string[],
            metadata: {
              ...(s.metadata || {}),
              media: newMedia,
            },
          };
        }
        return s;
      })
    );
  };

  // Submit / Save Handler
  const handleSave = (publishAction?: 'publish' | 'save_draft') => {
    if (isPending) return;
    const submittedInputs = latestInputs.current;
    setSaveStatus('saving');
    startTransition(async () => {
      const formData = new FormData();
      if (savedId) formData.append('id', savedId);
      formData.append('title', title);
      formData.append('slug', slug);
      formData.append('description', description);
      formData.append('coverImage', coverImage);
      formData.append('client', client);
      formData.append('role', role);
      formData.append('year', year);
      formData.append('duration', duration);
      formData.append('team', team);
      formData.append('category', category);
      formData.append('figmaUrl', figmaUrl);
      formData.append('liveUrl', liveUrl);
      formData.append('githubUrl', githubUrl);
      formData.append('technologies', technologies.join(','));
      formData.append('showOnHome', showOnHome ? 'true' : 'false');
      formData.append('sectionsJson', JSON.stringify(sections.map(normalizeSectionMedia)));
      formData.append('useCustomBackground', String(useCustomBackground));
      if (useCustomBackground) formData.append('customBackground', customBackground);
      if (publishAction) formData.append('action', publishAction);

      try {
        const res = !savedId
          ? await createCaseStudyAction({}, formData)
          : await updateCaseStudyAction({}, formData);

        if (res?.error) {
          setSaveStatus('error');
          alert(res.error);
        } else {
          if (res?.data?.id) {
            setSavedId(res.data.id);
            try { sessionStorage.setItem('case-study-active-section:' + res.data.id, activeSectionId); } catch {}
          }
          const changedDuringSave = latestInputs.current !== submittedInputs;
          setSaveStatus(changedDuringSave ? 'idle' : 'saved');
          setIsDirty(changedDuringSave);
          setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          if (publishAction === 'publish') setStatus('PUBLISHED');
          if (publishAction === 'save_draft') setStatus('DRAFT');
        }
      } catch (error) {
        setSaveStatus('error');
        alert(error instanceof Error ? error.message : 'Unable to save. Please retry.');
      }
    });
  };

  // Warn before unload
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const activeSection = sections.find((s) => s.id === activeSectionId || s.slug === activeSectionId);

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0B0D] text-foreground">
      
      {/* ── Top Header Toolbar ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-[#0E0F12]/95 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/case-studies"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Back to Case Studies"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
              {title || 'Untitled Case Study'}
            </h1>
            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
              <span className={`w-1.5 h-1.5 rounded-full ${status === 'PUBLISHED' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="capitalize">{status.toLowerCase()}</span>
              {lastSaved && (
                <>
                  <span>&bull;</span>
                  <span>Saved at {lastSaved}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPdfImporter(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-colors"
          >
            <UploadCloud size={13} />
            <span>Import PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLivePreview(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-colors"
          >
            <Eye size={13} />
            <span className="hidden sm:inline">Preview</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('save_draft')}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all disabled:opacity-50"
          >
            <Save size={13} />
            <span>{isPending ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('publish')}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent hover:brightness-110 text-xs font-semibold text-black shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
          >
            <Check size={13} />
            <span>Publish Case Study</span>
          </button>
        </div>
      </header>

      {/* ── Main Layout: Sidebar Sections + Content Area ── */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sticky Multi-Section Navigation */}
        <aside className="w-72 border-r border-white/10 bg-[#0E0F12] p-4 hidden lg:flex flex-col justify-between overflow-y-auto shrink-0 sticky top-14 h-[calc(100vh-56px)] select-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">
                CASE STUDY SECTIONS
              </span>
              <span className="text-[10px] font-mono text-accent font-semibold px-2 py-0.5 rounded bg-accent/10">
                {sections.length} Added
              </span>
            </div>

            {/* Fixed Top Items */}
            <div className="space-y-1">
              {FIXED_SECTIONS_BEFORE.map((sec) => {
                const IconComp = sec.icon;
                const isActive = activeSectionId === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => selectSection(sec.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComp size={15} />
                    <span>{sec.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Sections Divider */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">
                STORY SECTIONS
              </span>
              <button
                type="button"
                onClick={() => setIsSectionModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline cursor-pointer"
              >
                <Plus size={12} />
                <span>Add Section</span>
              </button>
            </div>

            {/* Added Sections List */}
            <nav className="flex flex-col gap-1.5 max-h-[42vh] overflow-y-auto no-scrollbar pr-1">
              {sections.length > 0 ? (
                sections.map((sec, idx) => {
                  const isActive = activeSectionId === sec.id || activeSectionId === sec.slug;
                  const isHidden = Boolean(sec.metadata?.hidden);
                  const type: CaseStudySectionType = sec.metadata?.sectionType || 'standard';

                  return (
                    <div
                      key={sec.id || idx}
                      className={`group flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-all border ${
                        isActive
                          ? 'bg-accent/15 text-accent border-accent/40 font-semibold'
                          : isHidden
                          ? 'opacity-50 border-transparent text-zinc-500 hover:text-zinc-300'
                          : 'border-transparent text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => selectSection(sec.id || sec.slug)}
                        className="flex-1 flex items-center gap-2 truncate text-left cursor-pointer"
                      >
                        <span className="font-mono text-[10px] text-zinc-500 shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="truncate">{sec.title || 'Untitled Section'}</span>
                      </button>

                      {/* Micro actions on hover */}
                      <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveSection(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-zinc-500 hover:text-white disabled:opacity-20"
                          title="Move Up"
                        >
                          <MoveUp size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(idx, 'down')}
                          disabled={idx === sections.length - 1}
                          className="p-1 text-zinc-500 hover:text-white disabled:opacity-20"
                          title="Move Down"
                        >
                          <MoveDown size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleHideSection(sec.id || sec.slug)}
                          className="p-1 text-zinc-500 hover:text-amber-400"
                          title={isHidden ? 'Show Section' : 'Hide Section'}
                        >
                          {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSection(sec.id || sec.slug)}
                          className="p-1 text-zinc-500 hover:text-red-400"
                          title="Delete Section"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-xs text-zinc-500 border border-dashed border-white/10 rounded-xl">
                  No custom sections added yet. Click "+ Add Section" above.
                </div>
              )}
            </nav>

            <button
              type="button"
              onClick={() => setIsSectionModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-accent/40 bg-accent/5 text-accent text-xs font-semibold hover:bg-accent/15 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>+ ADD CASE STUDY SECTION</span>
            </button>
          </div>

          {/* Fixed Footer Items */}
          <div className="space-y-1 pt-3 border-t border-white/10">
            {FIXED_SECTIONS_AFTER.map((sec) => {
              const IconComp = sec.icon;
              const isActive = activeSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => selectSection(sec.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    isActive
                      ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconComp size={15} />
                  <span>{sec.title}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Content Editor Space */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-5xl mx-auto space-y-8">
          
          {/* ── 01. OVERVIEW SECTION ── */}
          {activeSectionId === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-white/5 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-accent">SECTION 01</span>
                <h2 className="text-2xl font-bold text-white mt-1">Project Overview & Identity</h2>
                <p className="text-xs text-zinc-400 mt-1">Title, URL slug, elevator summary, and hero presentation visual.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Case Study Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setIsDirty(true);
                      if (!savedId || !slug) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }
                    }}
                    placeholder="e.g. SteeGo — Effortless Urban Parking App"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    URL Slug <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => { setSlug(e.target.value); setIsDirty(true); }}
                    placeholder="steego-parking-app"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-accent font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Elevator Summary / Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); setIsDirty(true); }}
                    placeholder="Briefly explain what this project was and what design challenge it tackled..."
                    className="w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-accent"
                  />
                </div>

                <div className="pt-2">
                  <ImageUploader
                    name="coverImage"
                    value={coverImage}
                    onChange={(url) => { setCoverImage(url); setIsDirty(true); }}
                    label="Hero Cover Visual"
                    helperText="Upload a high-fidelity 16:9 mockup or export."
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── 02. PROJECT INFORMATION ── */}
          {activeSectionId === 'project-info' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-white/5 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-accent">SECTION 02</span>
                <h2 className="text-2xl font-bold text-white mt-1">Project Information & Scope</h2>
                <p className="text-xs text-zinc-400 mt-1">Set role responsibilities, client, timeline, and category.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Client / Organization</label>
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => { setClient(e.target.value); setIsDirty(true); }}
                    placeholder="e.g. SteeGo Mobility"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Your Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => { setRole(e.target.value); setIsDirty(true); }}
                    placeholder="e.g. Lead Product Designer & Frontend Dev"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Year</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => { setYear(e.target.value); setIsDirty(true); }}
                    placeholder="2025"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => { setDuration(e.target.value); setIsDirty(true); }}
                    placeholder="e.g. 6 Weeks"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Team Composition</label>
                  <input
                    type="text"
                    value={team}
                    onChange={(e) => { setTeam(e.target.value); setIsDirty(true); }}
                    placeholder="1 Designer, 2 Engineers, 1 PM"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setIsDirty(true); }}
                    placeholder="Product Design / Mobile App"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="pt-2">
                <TechStackPicker
                  name="technologies"
                  initialSelected={technologies}
                  onChange={(selected) => { setTechnologies(selected); setIsDirty(true); }}
                  label="Technologies & Tools (Central Stack Library)"
                />
              </div>

              {/* Appearance & Theme */}
              <div className="pt-8 mt-8 border-t border-white/5 space-y-4">
                <h3 className="text-base font-bold text-white">Appearance & Theme</h3>
                <p className="text-xs text-zinc-400">Override the ambient header glow background color for this specific case study.</p>
                
                <label className="flex items-start gap-3 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!useCustomBackground}
                    onChange={(e) => {
                      setUseCustomBackground(e.target.checked);
                      setIsDirty(true);
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black text-accent focus:ring-accent"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-white block">Custom Ambient Glow</span>
                    <span className="text-xs text-zinc-500 block mt-0.5">Applies a subtle color glow behind the page title.</span>
                  </div>
                </label>
                
                {useCustomBackground && (
                  <div className="flex items-center gap-4 pl-7">
                    <input
                      type="color"
                      value={customBackground}
                      onChange={(e) => {
                        setCustomBackground(e.target.value);
                        setIsDirty(true);
                      }}
                      className="h-10 w-16 rounded cursor-pointer bg-transparent border border-white/10 p-1"
                    />
                    <input
                      type="text"
                      value={customBackground}
                      onChange={(e) => {
                        setCustomBackground(e.target.value);
                        setIsDirty(true);
                      }}
                      className="h-10 w-32 rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white uppercase font-mono outline-none focus:border-accent"
                      placeholder="#FF5500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 03. PROTOTYPE SECTION ── */}
          {activeSectionId === 'prototype' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-white/5 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-accent">PROTOTYPE</span>
                <h2 className="text-2xl font-bold text-white mt-1">Interactive Prototype Embeds</h2>
                <p className="text-xs text-zinc-400 mt-1">Add Figma prototype or live staging URLs for desktop & mobile preview modals.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Figma Prototype URL</label>
                  <input
                    type="url"
                    value={figmaUrl}
                    onChange={(e) => { setFigmaUrl(e.target.value); setIsDirty(true); }}
                    placeholder="https://www.figma.com/proto/..."
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-accent font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Live Staging / Web Demo URL</label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => { setLiveUrl(e.target.value); setIsDirty(true); }}
                    placeholder="https://demo.app.com"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-accent font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── 04. SEO SECTION ── */}
          {activeSectionId === 'seo' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-white/5 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-accent">SEO</span>
                <h2 className="text-2xl font-bold text-white mt-1">Search & Social Optimization</h2>
                <p className="text-xs text-zinc-400 mt-1">Customize search engine snippets and OpenGraph sharing previews.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Meta Title</label>
                  <input
                    type="text"
                    defaultValue={title ? `${title} — Product Case Study | Portfolio` : ''}
                    placeholder="Page Title"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Meta Description</label>
                  <textarea
                    rows={3}
                    defaultValue={description}
                    placeholder="Short description for Google search snippets..."
                    className="w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── 05. PUBLISHING SECTION ── */}
          {activeSectionId === 'publishing' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-white/5 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-accent">PUBLISHING</span>
                <h2 className="text-2xl font-bold text-white mt-1">Pre-Flight Checklist & Publishing</h2>
                <p className="text-xs text-zinc-400 mt-1">Verify required case study sections before pushing live.</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Quality Checklist</h3>
                
                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <span className={title ? 'text-emerald-400 font-bold' : 'text-zinc-600'}>
                    {title ? '✓' : '○'}
                  </span>
                  <span>Case study title specified</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <span className={coverImage ? 'text-emerald-400 font-bold' : 'text-zinc-600'}>
                    {coverImage ? '✓' : '○'}
                  </span>
                  <span>Hero cover visual uploaded</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <span className={description ? 'text-emerald-400 font-bold' : 'text-zinc-600'}>
                    {description ? '✓' : '○'}
                  </span>
                  <span>Executive summary provided</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <span className={sections.length > 0 ? 'text-emerald-400 font-bold' : 'text-zinc-600'}>
                    {sections.length > 0 ? '✓' : '○'}
                  </span>
                  <span>At least one story section added</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Distribution & Visibility</h3>
                <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnHome}
                    onChange={(e) => { setShowOnHome(e.target.checked); setIsDirty(true); }}
                    className="h-4 w-4 rounded border-white/20 bg-black text-accent focus:ring-accent"
                  />
                  <span>Show on Home Page (Showcases this case study on homepage)</span>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-accent/20 bg-accent/5">
                <div>
                  <h4 className="text-sm font-semibold text-white">Ready to share?</h4>
                  <p className="text-xs text-zinc-400">Publishing makes this case study viewable publicly on your portfolio.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSave('publish')}
                  disabled={isPending}
                  className="px-5 py-2 rounded-lg bg-accent text-black font-bold text-xs shadow-lg shadow-accent/20 transition-all shrink-0 hover:brightness-110"
                >
                  Publish Now
                </button>
              </div>
            </div>
          )}

          {/* ── 06. DYNAMIC MODULAR SECTION WORKSPACE ── */}
          {activeSection && activeSectionId !== 'overview' && activeSectionId !== 'project-info' && activeSectionId !== 'prototype' && activeSectionId !== 'seo' && activeSectionId !== 'publishing' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Section Header Controls */}
              <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="text"
                    value={activeSection.title}
                    onChange={(e) => updateSectionTitle(activeSection.id || activeSection.slug, e.target.value)}
                    className="text-2xl font-bold text-white bg-transparent border-b border-white/10 hover:border-accent focus:border-accent focus:outline-none pb-1 flex-1"
                    placeholder="Section Title"
                  />
                  <span className="px-2.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-[10px] font-mono text-accent uppercase font-semibold shrink-0">
                    {activeSection.metadata?.sectionType || 'standard'}
                  </span>
                </div>

                {/* Section Action Toolbar */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => duplicateSection(activeSection.id || activeSection.slug)}
                    className="p-2 rounded-lg border border-white/10 bg-black/40 text-muted hover:text-foreground hover:bg-white/10 transition-all text-xs flex items-center gap-1"
                    title="Duplicate Section"
                  >
                    <CopyPlus size={14} />
                    <span className="hidden sm:inline">Duplicate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleHideSection(activeSection.id || activeSection.slug)}
                    className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                      activeSection.metadata?.hidden
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                        : 'border-white/10 bg-black/40 text-muted hover:text-foreground'
                    }`}
                    title={activeSection.metadata?.hidden ? 'Section Hidden from Public' : 'Section Visible'}
                  >
                    {activeSection.metadata?.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span className="hidden sm:inline">{activeSection.metadata?.hidden ? 'Hidden' : 'Visible'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => removeSection(activeSection.id || activeSection.slug)}
                    className="p-2 rounded-lg border border-white/10 bg-black/40 text-muted hover:text-red-400 hover:bg-red-500/10 transition-all text-xs flex items-center gap-1"
                    title="Delete Section"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>

              {/* Section Specific Editor Dispatcher */}
              {(() => {
                const secType: CaseStudySectionType = activeSection.metadata?.sectionType || 'standard';

                switch (secType) {
                  case 'user_flow':
                    return (
                      <UserFlowEditor
                        data={activeSection.metadata?.userFlow}
                        onChange={(data) => updateSectionMetadata(activeSection.id || activeSection.slug, 'userFlow', data)}
                      />
                    );

                  case 'information_architecture':
                    return (
                      <InformationArchitectureEditor
                        data={activeSection.metadata?.informationArchitecture}
                        onChange={(data) => updateSectionMetadata(activeSection.id || activeSection.slug, 'informationArchitecture', data)}
                      />
                    );

                  case 'empathy_map':
                    return (
                      <EmpathyMapEditor
                        data={activeSection.metadata?.empathyMap}
                        onChange={(data) => updateSectionMetadata(activeSection.id || activeSection.slug, 'empathyMap', data)}
                      />
                    );

                  case 'persona':
                    return (
                      <PersonaEditor
                        data={activeSection.metadata?.persona}
                        onChange={(data) => updateSectionMetadata(activeSection.id || activeSection.slug, 'persona', data)}
                      />
                    );

                  case 'journey_map':
                    return (
                      <JourneyMapEditor
                        data={activeSection.metadata?.journeyMap}
                        onChange={(data) => updateSectionMetadata(activeSection.id || activeSection.slug, 'journeyMap', data)}
                      />
                    );

                  case 'competitive_analysis':
                    return (
                      <CompetitiveAnalysisEditor
                        data={activeSection.metadata?.competitiveAnalysis}
                        onChange={(data) => updateSectionMetadata(activeSection.id || activeSection.slug, 'competitiveAnalysis', data)}
                      />
                    );

                  case 'design_decision':
                    return (
                      <DesignDecisionEditor
                        data={activeSection.metadata?.designDecision}
                        onChange={(data) => updateSectionMetadata(activeSection.id || activeSection.slug, 'designDecision', data)}
                      />
                    );

                  case 'metrics':
                    return (
                      <MetricsEditor
                        data={activeSection.metadata?.metrics}
                        onChange={(data) => updateSectionMetadata(activeSection.id || activeSection.slug, 'metrics', data)}
                      />
                    );

                  case 'design_process':
                    return (
                      <DesignProcessEditor
                        data={activeSection.metadata?.designProcess}
                        onChange={(data) => updateSectionMetadata(activeSection.id || activeSection.slug, 'designProcess', data)}
                      />
                    );

                  case 'design_system':
                  case 'color_tokens':
                  case 'typography':
                  case 'spacing':
                  case 'radius':
                  case 'shadows':
                  case 'component_library':
                    return (
                      <DesignSystemEditor
                        data={activeSection.metadata?.designSystem}
                        onChange={(data) => updateSectionMetadata(activeSection.id || activeSection.slug, 'designSystem', data)}
                      />
                    );

                  case 'gallery':
                    return (
                      <GalleryEditor
                        data={activeSection.metadata?.gallery}
                        onChange={(data) => updateSectionMetadata(activeSection.id || activeSection.slug, 'gallery', data)}
                      />
                    );

                  default:
                    return (
                      <StandardSectionEditor
                        content={activeSection.content || ''}
                        onChangeContent={(c) => updateSectionContent(activeSection.id || activeSection.slug, activeSection.title, c)}
                        media={
                          (activeSection.metadata?.media && Array.isArray(activeSection.metadata.media) && activeSection.metadata.media.length > 0)
                            ? activeSection.metadata.media
                            : (activeSection.images || []).map((img: string) => normalizeCaseStudyVisual(img))
                        }
                        onChangeMedia={(m) => updateSectionMedia(activeSection.id || activeSection.slug, m)}
                        layout={activeSection.metadata?.layout}
                        onChangeLayout={(l) => updateSectionMetadata(activeSection.id || activeSection.slug, 'layout', l)}
                        subtitle={activeSection.metadata?.subtitle}
                        onChangeSubtitle={(s) => updateSectionMetadata(activeSection.id || activeSection.slug, 'subtitle', s)}
                      />
                    );
                }
              })()}
            </div>
          )}

        </main>
      </div>

      {/* ── Section Library Modal ── */}
      <SectionLibraryModal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        onSelectTemplate={addSectionFromTemplate}
      />

      {/* ── Live Preview Modal ── */}
      {showLivePreview && (
        <CaseStudyEditorPreview
          onClose={() => setShowLivePreview(false)}
          caseStudy={{ id: savedId || 'preview', title, slug, description, coverImage, status,
            metadata: { client, role, year, duration, team, category, figmaUrl, liveUrl, githubUrl, technologies, showOnHome },
            sections: sections.map(normalizeSectionMedia) as any,
          }}
        />
      )}

      {/* ── PDF Importer Modal ── */}
      {showPdfImporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#111113] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-accent" />
                <h3 className="text-base font-semibold text-white">Import PDF Case Study</h3>
              </div>
              <button onClick={() => setShowPdfImporter(false)} className="p-1 rounded text-zinc-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload a presentation or pitch deck PDF to preserve your original visual design and view extracted pages directly inside the case study.
            </p>

            <ImageUploader
              name="sourcePdf"
              label="PDF Document"
              helperText="Upload case study PDF (max 20MB)."
              onChange={(url) => {
                setIsDirty(true);
                updateSectionContent('visual-design', 'Visual Design (PDF Deck)', `PDF case study presentation attached: ${url}`);
                setShowPdfImporter(false);
              }}
            />

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowPdfImporter(false)}
                className="px-4 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-300 hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
