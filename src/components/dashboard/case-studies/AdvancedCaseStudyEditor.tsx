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
  X 
} from 'lucide-react';
import { updateCaseStudyAction, createCaseStudyAction } from '@/lib/dashboard/client-actions';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { TechStackPicker } from '@/components/dashboard/TechStackPicker';
import { PrototypePreviewModal } from '@/components/case-study/PrototypePreviewModal';
import { CaseStudyVisualEditor } from '@/components/dashboard/case-studies/CaseStudyVisualEditor';
import {
  CaseStudyVisual,
  CaseStudyVisualDisplayType,
  VISUAL_DEFAULTS,
  normalizeCaseStudyVisual,
} from '@/types/case-study-visual';

const SECTIONS_CONFIG = [
  { id: 'overview', title: 'Overview', icon: LayoutTemplate, placeholder: 'Project summary, elevator pitch, and high-level premise...' },
  { id: 'project-info', title: 'Project Information', icon: Layers, placeholder: 'Role, client, timeline, and collaborators...' },
  { id: 'challenge', title: 'Challenge', icon: AlertCircle, placeholder: 'The core problem, friction points, and constraints to solve...' },
  { id: 'research', title: 'Research & Insights', icon: FileText, placeholder: 'User research, data analysis, persona definitions...' },
  { id: 'goals', title: 'Goals & Objectives', icon: CheckCircle2, placeholder: 'Target outcomes, KPIs, and design success criteria...' },
  { id: 'user-flow', title: 'User Flow', icon: Layout, placeholder: 'Core user journeys, step-by-step navigational mapping...' },
  { id: 'wireframes', title: 'Wireframes', icon: Layout, placeholder: 'Low-fidelity layout explorations and information architecture...' },
  { id: 'design-system', title: 'Design System', icon: Layers, placeholder: 'Typography specimen, color palette tokens, and UI components...' },
  { id: 'visual-design', title: 'Visual Design', icon: ImageIcon, placeholder: 'High-fidelity screens, micro-interactions, aesthetic direction...' },
  { id: 'prototype', title: 'Prototype', icon: Sparkles, placeholder: 'Figma interactive prototype embed or web demo link...' },
  { id: 'final-screens', title: 'Final Screens', icon: ImageIcon, placeholder: 'Final production interface showcases and feature breakdowns...' },
  { id: 'results', title: 'Results & Impact', icon: CheckCircle2, placeholder: 'Metrics, conversion increases, user testimonials...' },
  { id: 'reflection', title: 'Reflection', icon: FileText, placeholder: 'Key takeaways, technical lessons, and future improvements...' },
  { id: 'seo', title: 'SEO & Metadata', icon: Globe, placeholder: 'Search engine preview, social sharing metadata...' },
  { id: 'publishing', title: 'Publishing', icon: Save, placeholder: 'Pre-flight checks and visibility controls...' },
];

export function AdvancedCaseStudyEditor({
  caseStudy,
  isNew = false,
}: {
  caseStudy?: any;
  isNew?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [activeSectionId, setActiveSectionId] = useState('overview');
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
      return caseStudy.sections.map((s: any) => ({
        id: s.id || Math.random().toString(),
        slug: s.slug || 'section',
        title: s.title || '',
        content: s.content || '',
        images: s.images || [],
        metadata: s.metadata || {},
      }));
    }
    // Default initial scaffolding
    return SECTIONS_CONFIG.slice(0, 5).map((cfg) => ({
      id: cfg.id,
      slug: cfg.id,
      title: cfg.title,
      content: '',
      images: [],
      metadata: {},
    }));
  });

  // Calculate Section Completion State
  const getSectionStatus = (secId: string): 'complete' | 'in-progress' | 'empty' => {
    if (secId === 'overview') {
      if (title && coverImage && description) return 'complete';
      if (title || coverImage) return 'in-progress';
      return 'empty';
    }
    if (secId === 'project-info') {
      if (client && role && year) return 'complete';
      if (client || role) return 'in-progress';
      return 'empty';
    }
    if (secId === 'prototype') {
      return figmaUrl || liveUrl ? 'complete' : 'empty';
    }
    if (secId === 'seo') {
      return title && description ? 'complete' : 'empty';
    }
    if (secId === 'publishing') {
      return status === 'PUBLISHED' ? 'complete' : 'in-progress';
    }
    const match = sections.find((s) => s.slug === secId || s.title.toLowerCase().includes(secId.replace('-', ' ')));
    if (match) {
      if (match.content && match.content.length > 50) return 'complete';
      if (match.content || (match.images && match.images.length > 0)) return 'in-progress';
    }
    return 'empty';
  };

  // Section CRUD inside editor
  const updateSectionContent = (slugName: string, titleName: string, newContent: string) => {
    setIsDirty(true);
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.slug === slugName);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], content: newContent };
        return next;
      }
      return [...prev, { id: slugName, slug: slugName, title: titleName, content: newContent, images: [] }];
    });
  };

  const updateSectionVisual = (slugName: string, titleName: string, visualIdx: number, updated: CaseStudyVisual) => {
    setIsDirty(true);
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.slug === slugName);
      if (idx < 0) return prev;
      const sec = prev[idx];
      const currentMedia: CaseStudyVisual[] = (
        sec.metadata?.media && Array.isArray(sec.metadata.media) && sec.metadata.media.length > 0
          ? sec.metadata.media
          : (sec.images || []).map((img: string) => normalizeCaseStudyVisual(img))
      ).map(normalizeCaseStudyVisual);

      currentMedia[visualIdx] = updated;
      const newImages = currentMedia.map((m) => m.imageUrl).filter(Boolean);
      const next = [...prev];
      next[idx] = {
        ...sec,
        images: newImages,
        metadata: {
          ...(sec.metadata || {}),
          media: currentMedia,
        },
      };
      return next;
    });
  };

  const addSectionVisual = (slugName: string, titleName: string, type: CaseStudyVisualDisplayType) => {
    setIsDirty(true);
    const defaults = VISUAL_DEFAULTS[type];
    const newVisual: CaseStudyVisual = {
      id: `v-${Math.random().toString(36).slice(2, 9)}`,
      imageUrl: '',
      alt: '',
      displayType: type,
      displaySize: defaults.displaySize,
      backgroundType: defaults.backgroundType,
      backgroundColor: defaults.backgroundColor,
      padding: defaults.padding,
      radius: defaults.radius,
      fit: defaults.fit,
    };

    setSections((prev) => {
      const idx = prev.findIndex((s) => s.slug === slugName);
      if (idx >= 0) {
        const sec = prev[idx];
        const currentMedia: CaseStudyVisual[] = (
          sec.metadata?.media && Array.isArray(sec.metadata.media) && sec.metadata.media.length > 0
            ? sec.metadata.media
            : (sec.images || []).map((img: string) => normalizeCaseStudyVisual(img))
        ).map(normalizeCaseStudyVisual);
        const updatedMedia = [...currentMedia, newVisual];
        const next = [...prev];
        next[idx] = {
          ...sec,
          images: updatedMedia.map((m) => m.imageUrl).filter(Boolean),
          metadata: {
            ...(sec.metadata || {}),
            media: updatedMedia,
          },
        };
        return next;
      }
      return [
        ...prev,
        {
          id: slugName,
          slug: slugName,
          title: titleName,
          content: '',
          images: [],
          metadata: { media: [newVisual] },
        },
      ];
    });
  };

  const removeSectionVisual = (slugName: string, visualIdx: number) => {
    setIsDirty(true);
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.slug === slugName);
      if (idx < 0) return prev;
      const sec = prev[idx];
      const currentMedia: CaseStudyVisual[] = (
        sec.metadata?.media && Array.isArray(sec.metadata.media) && sec.metadata.media.length > 0
          ? sec.metadata.media
          : (sec.images || []).map((img: string) => normalizeCaseStudyVisual(img))
      ).map(normalizeCaseStudyVisual);
      currentMedia.splice(visualIdx, 1);
      const next = [...prev];
      next[idx] = {
        ...sec,
        images: currentMedia.map((m) => m.imageUrl).filter(Boolean),
        metadata: {
          ...(sec.metadata || {}),
          media: currentMedia,
        },
      };
      return next;
    });
  };

  // Submit / Save Handler
  const handleSave = (publishAction?: 'publish' | 'save_draft') => {
    setSaveStatus('saving');
    startTransition(async () => {
      const formData = new FormData();
      if (!isNew && caseStudy?.id) formData.append('id', caseStudy.id);
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
      formData.append('sectionsJson', JSON.stringify(sections));
      formData.append('useCustomBackground', String(useCustomBackground));
      if (useCustomBackground) formData.append('customBackground', customBackground);
      if (publishAction) formData.append('action', publishAction);

      const res = isNew 
        ? await createCaseStudyAction({}, formData)
        : await updateCaseStudyAction({}, formData);

      if (res?.error) {
        setSaveStatus('error');
        alert(res.error);
      } else {
        setSaveStatus('saved');
        setIsDirty(false);
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        if (publishAction === 'publish') setStatus('PUBLISHED');
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

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* ── Top Header Toolbar ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-[#0e0e10]/95 border-b border-white/10 backdrop-blur-md">
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
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#4F8CFF] hover:bg-[#3B78EB] text-xs font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all disabled:opacity-50"
          >
            <Check size={13} />
            <span>Publish Case Study</span>
          </button>
        </div>
      </header>

      {/* ── Main Layout: Sidebar Sections + Content Area ── */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sticky Multi-Section Navigation */}
        <aside className="w-64 border-r border-white/10 bg-[#111113] p-4 hidden lg:flex flex-col gap-1 overflow-y-auto shrink-0 sticky top-14 h-[calc(100vh-56px)]">
          <div className="px-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">
              CASE STUDY SECTIONS
            </span>
          </div>

          <nav className="flex flex-col gap-1 flex-1">
            {SECTIONS_CONFIG.map((sec, idx) => {
              const secStatus = getSectionStatus(sec.id);
              const isActive = activeSectionId === sec.id;

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold shadow-sm'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-[10px] font-mono text-zinc-600 w-4">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate">{sec.title}</span>
                  </div>

                  {/* Status Indicator Pill */}
                  <span className="shrink-0 ml-1">
                    {secStatus === 'complete' ? (
                      <span className="text-emerald-400 font-mono text-xs">✓</span>
                    ) : secStatus === 'in-progress' ? (
                      <span className="text-amber-400 text-xs">●</span>
                    ) : (
                      <span className="text-zinc-600 text-xs">○</span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Active Section Editor Workspace */}
        <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto max-w-4xl mx-auto space-y-8">

          {/* ── 01. OVERVIEW ── */}
          {activeSectionId === 'overview' && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#4F8CFF]">SECTION 01</span>
                <h2 className="text-2xl font-bold text-white mt-1">Overview & Narrative</h2>
                <p className="text-xs text-zinc-400 mt-1">Core summary, case study title, slug, and hero cover visual.</p>
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
                      if (isNew || !slug) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }
                    }}
                    placeholder="e.g. SteeGo — Effortless Urban Parking App"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]"
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
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF] font-mono text-xs"
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
                    className="w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-[#4F8CFF]"
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
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#4F8CFF]">SECTION 02</span>
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
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Your Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => { setRole(e.target.value); setIsDirty(true); }}
                    placeholder="e.g. Lead Product Designer & Frontend Dev"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Year</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => { setYear(e.target.value); setIsDirty(true); }}
                    placeholder="2025"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => { setDuration(e.target.value); setIsDirty(true); }}
                    placeholder="e.g. 6 Weeks"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Team Composition</label>
                  <input
                    type="text"
                    value={team}
                    onChange={(e) => { setTeam(e.target.value); setIsDirty(true); }}
                    placeholder="1 Designer, 2 Engineers, 1 PM"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setIsDirty(true); }}
                    placeholder="Product Design / Mobile App"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]"
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

              {/* Appearance & Theme (Under Project Info) */}
              <div className="pt-8 mt-8 border-t border-white/5 space-y-4">
                <h3 className="text-base font-bold text-white">Appearance & Theme</h3>
                <p className="text-xs text-zinc-400">Override the ambient header glow background color for this specific case study.</p>
                
                <label className="flex items-start gap-3 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="useCustomBackground"
                    id="useCustomBackground"
                    checked={!!useCustomBackground}
                    value="true"
                    onChange={(e) => {
                      setUseCustomBackground(e.target.checked);
                      setIsDirty(true);
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black text-[#4F8CFF] checked:bg-[#4F8CFF] focus:ring-[#4F8CFF]"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-white block">Custom Animated Ambient Glow</span>
                    <span className="text-xs text-zinc-500 block mt-0.5">Applies a glowing color behind the page title.</span>
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
                      className="h-10 w-32 rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white uppercase font-mono outline-none focus:border-[#4F8CFF]"
                      placeholder="#FF5500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 03 to 13. DYNAMIC CONTENT SECTION WORKSPACE ── */}
          {activeSectionId !== 'overview' && activeSectionId !== 'project-info' && activeSectionId !== 'prototype' && activeSectionId !== 'seo' && activeSectionId !== 'publishing' && (
            <div className="space-y-6">
              {(() => {
                const config = SECTIONS_CONFIG.find((c) => c.id === activeSectionId);
                const sectionData = sections.find((s) => s.slug === activeSectionId) || { content: '', images: [] };

                return (
                  <div className="space-y-5">
                    <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-widest text-[#4F8CFF]">
                          {config?.title}
                        </span>
                        <h2 className="text-2xl font-bold text-white mt-1">{config?.title}</h2>
                      </div>
                    </div>

                    {/* Rich Content Textarea */}
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">Section Narrative & Analysis</label>
                      <textarea
                        rows={6}
                        value={sectionData.content}
                        onChange={(e) => updateSectionContent(activeSectionId, config?.title || activeSectionId, e.target.value)}
                        placeholder={config?.placeholder}
                        className="w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-[#4F8CFF] leading-relaxed"
                      />
                    </div>

                    {/* Section Visuals / Media */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                            Visual Presentations & Screenshots
                          </label>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Showcase full webpages, dashboard UI frames, or standard visuals with presentation frames and live preview.
                          </p>
                        </div>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                          {((sectionData.metadata?.media && Array.isArray(sectionData.metadata.media)) ? sectionData.metadata.media.length : (sectionData.images?.length || 0))} visuals
                        </span>
                      </div>

                      {/* Visual List */}
                      {(() => {
                        const visualList: CaseStudyVisual[] = (
                          sectionData.metadata?.media && Array.isArray(sectionData.metadata.media) && sectionData.metadata.media.length > 0
                            ? sectionData.metadata.media
                            : (sectionData.images || []).map((img: string) => normalizeCaseStudyVisual(img))
                        ).map(normalizeCaseStudyVisual);

                        return (
                          <div className="space-y-4">
                            {visualList.map((vis, vIdx) => (
                              <CaseStudyVisualEditor
                                key={vis.id || `v-${vIdx}`}
                                visual={vis}
                                onChange={(updated) => updateSectionVisual(activeSectionId, config?.title || activeSectionId, vIdx, updated)}
                                onDelete={() => removeSectionVisual(activeSectionId, vIdx)}
                              />
                            ))}

                            {/* Action Buttons to Add Visuals */}
                            <div className="flex flex-wrap items-center gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => addSectionVisual(activeSectionId, config?.title || activeSectionId, 'webpage')}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors"
                              >
                                <Globe size={13} />
                                + Webpage Screenshot
                              </button>
                              <button
                                type="button"
                                onClick={() => addSectionVisual(activeSectionId, config?.title || activeSectionId, 'dashboard')}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors"
                              >
                                <Layout size={13} />
                                + Dashboard UI Screen
                              </button>
                              <button
                                type="button"
                                onClick={() => addSectionVisual(activeSectionId, config?.title || activeSectionId, 'image')}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-zinc-800 border border-white/10 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                              >
                                <ImageIcon size={13} />
                                + Standard Image
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── 10. PROTOTYPE SECTION ── */}
          {activeSectionId === 'prototype' && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#4F8CFF]">SECTION 10</span>
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
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Live Staging / Web Demo URL</label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => { setLiveUrl(e.target.value); setIsDirty(true); }}
                    placeholder="https://demo.app.com"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF] font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── 14. SEO SECTION ── */}
          {activeSectionId === 'seo' && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#4F8CFF]">SECTION 14</span>
                <h2 className="text-2xl font-bold text-white mt-1">Search & Social Optimization</h2>
                <p className="text-xs text-zinc-400 mt-1">Customize search engine snippets and OpenGraph sharing previews.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Meta Title</label>
                  <input
                    type="text"
                    defaultValue={title ? `${title} — Product Case Study | Sailesh P` : ''}
                    placeholder="Page Title"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Meta Description</label>
                  <textarea
                    rows={3}
                    defaultValue={description}
                    placeholder="Short description for Google search snippets..."
                    className="w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-[#4F8CFF]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── 15. PUBLISHING SECTION ── */}
          {activeSectionId === 'publishing' && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#4F8CFF]">SECTION 15</span>
                <h2 className="text-2xl font-bold text-white mt-1">Pre-Flight Checklist & Publishing</h2>
                <p className="text-xs text-zinc-400 mt-1">Verify required case study sections before pushing live.</p>
              </div>

              {/* Checklist */}
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
                  <span className={sections.some((s) => s.content) ? 'text-emerald-400 font-bold' : 'text-zinc-600'}>
                    {sections.some((s) => s.content) ? '✓' : '○'}
                  </span>
                  <span>At least one narrative section completed</span>
                </div>
              </div>

              {/* Display Options */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Distribution & Visibility</h3>
                <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnHome}
                    onChange={(e) => { setShowOnHome(e.target.checked); setIsDirty(true); }}
                    className="h-4 w-4 rounded border-white/20 bg-black text-[#4F8CFF] focus:ring-[#4F8CFF]"
                  />
                  <span>Show on Home Page (Showcases this case study in the Home page Works / Case Studies area)</span>
                </label>
              </div>

              {/* Direct Publish CTA */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#4F8CFF]/20 bg-[#4F8CFF]/5">
                <div>
                  <h4 className="text-sm font-semibold text-white">Ready to share?</h4>
                  <p className="text-xs text-zinc-400">Publishing makes this case study viewable publicly on your portfolio.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSave('publish')}
                  disabled={isPending}
                  className="px-5 py-2 rounded-lg bg-[#4F8CFF] hover:bg-[#3B78EB] text-xs font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all shrink-0"
                >
                  Publish Now
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Live Preview Modal ── */}
      {showLivePreview && (
        <PrototypePreviewModal
          isOpen={showLivePreview}
          onClose={() => setShowLivePreview(false)}
          title={`Live Preview: ${title || 'Case Study'}`}
          prototypeUrl={`/projects/${slug || 'preview'}`}
          defaultDevice="desktop"
        />
      )}

      {/* ── PDF Importer Modal ── */}
      {showPdfImporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#111113] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#4F8CFF]" />
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
