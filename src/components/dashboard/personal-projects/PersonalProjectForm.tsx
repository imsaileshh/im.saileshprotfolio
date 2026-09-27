'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  BookOpen,
  Check,
  Code2,
  Eye,
  Github,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Star,
  X,
  ArrowUpRight,
} from 'lucide-react';
import {
  createPersonalProjectAction,
  updatePersonalProjectAction,
} from '@/app/dashboard/(protected)/personal-projects/actions';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { TechStackPicker } from '@/components/dashboard/TechStackPicker';
import { GalleryInput } from '@/components/dashboard/projects/GalleryInput';
import { CaseStudyBuilder, CaseStudySectionItem, CaseStudyMediaItem } from '@/components/dashboard/projects/CaseStudyBuilder';
import { CustomBlockRenderer, ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { getTechLogo } from '@/lib/stack/tech-logos';
import { getProjectCoverUrl } from '@/lib/projects/cover-image';
import { type Prisma } from '@prisma/client';

type ProjectWithCaseStudy = Prisma.ProjectGetPayload<{
  include: {
    images: true;
    caseStudy: { include: { sections: true } };
  };
}>;

const CATEGORY_OPTIONS = [
  'Case Studies',
  'Web Development',
  'Website',
  'Web App',
  'CLI / DevTool',
  'Mobile App',
  'AI / AI Tool',
  'Open Source',
  'Experiment',
  'Prototype',
  'UI/UX',
  'Other',
];

const PROJECT_STATUSES = [
  'In Progress',
  'Completed',
  'Active',
  'Archived',
];

const MAX_FEATURED_LIMIT = 3;

const inputClass = 'h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF] focus:ring-1 focus:ring-[#4F8CFF]/30';
const selectClass = 'h-10 w-full rounded-xl border border-white/10 bg-[#121316] px-3.5 text-sm text-white outline-none transition focus:border-[#4F8CFF] focus:ring-1 focus:ring-[#4F8CFF]/30';
const textareaClass = 'min-h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF] focus:ring-1 focus:ring-[#4F8CFF]/30';

export function PersonalProjectForm({
  project,
  featuredCount = 0,
}: {
  project?: ProjectWithCaseStudy;
  featuredCount?: number;
}) {
  const isEditing = Boolean(project?.id);
  const actionFn = isEditing ? updatePersonalProjectAction : createPersonalProjectAction;
  const [state, formAction, isPending] = useActionState(actionFn, {});
  const formRef = useRef<HTMLFormElement>(null);
  const pendingActionRef = useRef<string>('save_draft');
  const actionInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // Form states
  const [title, setTitle] = useState(project?.title || '');
  const [slug, setSlug] = useState(project?.slug || '');
  const [showSlug, setShowSlug] = useState(isEditing);
  const [category, setCategory] = useState(project?.category || 'CLI / DevTool');
  const [projectStatus, setProjectStatus] = useState(project?.role || 'Completed');
  const [year, setYear] = useState(project?.year || new Date().getFullYear().toString());
  const [technologies, setTechnologies] = useState<string[]>(
    Array.isArray(project?.technologies)
      ? project.technologies
      : typeof project?.technologies === 'string'
      ? (project?.technologies as string).split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['TypeScript', 'React', 'Node.js']
  );
  const [description, setDescription] = useState(project?.description || '');
  const [coverImageUrl, setCoverImageUrl] = useState(
    getProjectCoverUrl(project, '')
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    project?.galleryImages ||
      project?.images?.filter((img) => !img.isCover).map((img) => img.url) ||
      []
  );
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl || '');
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl || '');
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [published, setPublished] = useState(project?.published ?? true);

  const [useCustomBackground, setUseCustomBackground] = useState(project?.useCustomBackground ?? false);
  const [customBackground, setCustomBackground] = useState(project?.customBackground ?? '#111113');

  // Progressive Project Story toggle
  const hasExistingStory = Boolean(project?.caseStudy);
  const [enableStory, setEnableStory] = useState(hasExistingStory);
  const [storySections, setStorySections] = useState<CaseStudySectionItem[]>(() =>
    (project?.caseStudy?.sections || []).map((sec): CaseStudySectionItem => {
      const meta = (sec.metadata ?? {}) as Record<string, unknown>;
      const fallbackMedia: CaseStudyMediaItem[] = (sec.images || []).map((imgUrl: string, idx: number) => ({
        id: `m-${idx}`,
        url: imgUrl,
        type: imgUrl.endsWith('.svg') ? 'svg' : 'image',
        width: 'full',
        background: 'transparent',
      }));

      return {
        id: sec.id,
        title: sec.title,
        subtitle: (meta.subtitle as string) || '',
        type: (meta.type as string) || 'rich_text',
        layout: ((meta.layout as string) || 'full_width') as CaseStudySectionItem['layout'],
        content: sec.content || '',
        blocks: (meta.blocks as ContentBlockItem[]) || [],
        media: (Array.isArray(meta.media) ? (meta.media as CaseStudyMediaItem[]) : undefined) || fallbackMedia,
        stats: (meta.stats as Array<{ value: string; label: string }>) || [],
        quote: meta.quote as { text: string; author?: string; role?: string } | undefined,
      };
    })
  );

  // UX States
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPublishConfirmModal, setShowPublishConfirmModal] = useState(false);
  const [featuredLimitWarning, setFeaturedLimitWarning] = useState(false);

  const storageDraftKey = `draft_personal_project_${project?.id || 'new'}`;

  // Autosave to LocalStorage (debounced 10s)
  useEffect(() => {
    if (state?.error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [state?.error]);

  useEffect(() => {
    if (!isDirty) return;
    setSaveStatus('unsaved');

    const timer = setTimeout(() => {
      try {
        setSaveStatus('saving');
        const draftPayload = {
          title,
          slug,
          category,
          projectStatus,
          year,
          technologies,
          description,
          coverImageUrl,
          galleryUrls,
          githubUrl,
          liveUrl,
          featured,
          published,
          useCustomBackground,
          customBackground,
          enableStory,
          storySections,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(storageDraftKey, JSON.stringify(draftPayload));
        setTimeout(() => setSaveStatus('saved'), 600);
      } catch (err) {
        console.error('LocalStorage autosave failed', err);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    isDirty,
    title,
    slug,
    category,
    projectStatus,
    year,
    technologies,
    description,
    coverImageUrl,
    galleryUrls,
    githubUrl,
    liveUrl,
    featured,
    published,
    useCustomBackground,
    customBackground,
    enableStory,
    storySections,
    storageDraftKey,
  ]);

  // Clean local draft on unmount if submitted
  const handleTitleChange = (val: string) => {
    setTitle(val);
    setIsDirty(true);
    if (!isEditing || !showSlug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleFeaturedToggle = (val: boolean) => {
    if (val && featuredCount >= MAX_FEATURED_LIMIT && !project?.featured) {
      setFeaturedLimitWarning(true);
      return;
    }
    setFeaturedLimitWarning(false);
    setFeatured(val);
    setIsDirty(true);
  };

  const handlePublishClick = () => {
    setShowPublishConfirmModal(true);
  };

  const executePublish = () => {
    setShowPublishConfirmModal(false);
    pendingActionRef.current = 'publish';
    if (actionInputRef.current) actionInputRef.current.value = 'publish';
    // Use requestSubmit so the form's action handler receives the updated hidden input
    formRef.current?.requestSubmit();
  };

  const handleSaveDraft = () => {
    pendingActionRef.current = 'save_draft';
    if (actionInputRef.current) actionInputRef.current.value = 'save_draft';
    formRef.current?.requestSubmit();
  };

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        onChange={() => setIsDirty(true)}
        className="mx-auto max-w-4xl space-y-8 pb-28"
      >
        {isEditing && <input type="hidden" name="id" value={project?.id} />}
        <input type="hidden" name="projectType" value="Personal Project" />
        {/* This hidden input carries the submit action value; updated imperatively before requestSubmit() */}
        <input type="hidden" name="action" id="personal-project-action-input" defaultValue="save_draft" ref={actionInputRef} />

        {/* Error Alert */}
        {state?.error && (
          <div ref={errorRef} className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2.5 shadow-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {/* ── 01. BASIC PROJECT INFO ── */}
        <section className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#111215] p-6 sm:p-7 shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF]">
              <Code2 size={15} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Project Information</h2>
              <p className="text-xs text-zinc-400">Core details for your independent project or tool.</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Project Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Next-Gen Shader Preview Engine"
                required
                minLength={2}
                className={inputClass}
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-mono">
                  Slug: <span className="text-zinc-200">/personal-projects/{slug || '...'}</span>
                </span>
                {!showSlug ? (
                  <button
                    type="button"
                    onClick={() => setShowSlug(true)}
                    className="text-xs font-mono text-[#4F8CFF] hover:underline"
                  >
                    Edit slug
                  </button>
                ) : null}
              </div>
              {showSlug ? (
                <input
                  type="text"
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsDirty(true);
                  }}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  placeholder="shader-preview-engine"
                  required
                  className={inputClass}
                />
              ) : (
                <input type="hidden" name="slug" value={slug} />
              )}
            </div>

            {/* Category, Status & Year */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Category / Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setIsDirty(true);
                  }}
                  className={selectClass}
                  required
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Project Status
                </label>
                <select
                  name="role"
                  value={projectStatus}
                  onChange={(e) => {
                    setProjectStatus(e.target.value);
                    setIsDirty(true);
                  }}
                  className={selectClass}
                >
                  {PROJECT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Release Year
                </label>
                <input
                  type="text"
                  name="year"
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="2026"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Short Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="A high-performance interactive GLSL shader live editor with WebGL2 runtime and real-time audio reactivity."
                rows={3}
                required
                minLength={5}
                className={textareaClass}
              />
            </div>

            {/* Technologies */}
            <div className="pt-2 border-t border-white/[0.04]">
              <TechStackPicker
                name="technologies"
                initialSelected={technologies}
                onChange={(selected) => {
                  setTechnologies(selected);
                  setIsDirty(true);
                }}
                label="Technologies & Tools (Central Stack Library)"
              />
            </div>
          </div>
        </section>

        {/* ── 02. MEDIA & GRAPHICS ── */}
        <section className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#111215] p-6 sm:p-7 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF]">
                <ImageIcon size={15} />
              </div>
              <h2 className="text-base font-semibold text-white tracking-tight">Media & Visuals</h2>
            </div>
            <span className="text-xs text-zinc-500 font-mono">JPG, PNG, WEBP, SVG</span>
          </div>

          <div className="space-y-6">
            <ImageUploader
              name="coverImageUrl"
              value={coverImageUrl}
              onChange={(url) => {
                setCoverImageUrl(url);
                setIsDirty(true);
              }}
              label="Cover Image"
              helperText="Main visual for project card grids and showcase headers."
            />

            <div className="space-y-2 pt-3 border-t border-white/[0.06]">
              <label className="block text-sm">
                <span className="mb-1.5 flex items-center justify-between font-medium text-zinc-300">
                  <span>Additional Screenshots & Gallery Images</span>
                  <span className="text-xs font-normal text-zinc-500">Optional</span>
                </span>
              </label>
              <GalleryInput
                initialUrls={galleryUrls}
                onChange={(urls) => {
                  setGalleryUrls(urls);
                  setIsDirty(true);
                }}
              />
            </div>
          </div>
        </section>

        {/* ── 03. LINKS ── */}
        <section className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#111215] p-6 sm:p-7 shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF]">
              <LinkIcon size={15} />
            </div>
            <h2 className="text-base font-semibold text-white tracking-tight">External Links</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                GitHub Repository URL <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                name="githubUrl"
                value={githubUrl}
                onChange={(e) => {
                  setGithubUrl(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="https://github.com/username/project"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Live Demo / Project URL <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                name="liveUrl"
                value={liveUrl}
                onChange={(e) => {
                  setLiveUrl(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="https://project.dev"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* ── 04. OPTIONAL PROJECT STORY BUILDER ── */}
        <section className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#111215] p-6 sm:p-7 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                <BookOpen size={15} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">Project Story</h2>
                <p className="text-xs text-zinc-400">Optional technical narrative, architecture diagrams, and custom sections.</p>
              </div>
            </div>

            <label className="relative inline-flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="caseStudyEnabled"
                checked={enableStory}
                onChange={(e) => {
                  setEnableStory(e.target.checked);
                  setIsDirty(true);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 select-none">
                {enableStory ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>

          {enableStory ? (
            <CaseStudyBuilder
              initialSections={storySections}
              onChange={(secs) => {
                setStorySections(secs);
                setIsDirty(true);
              }}
            />
          ) : (
            <p className="text-xs text-zinc-500 py-1">
              Toggle on to add custom story sections with rich text, architecture diagrams, SVG graphics, and performance metrics.
            </p>
          )}
        </section>

        {/* ── 05. STATUS & VISIBILITY ── */}
        <section className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#111215] p-6 sm:p-7 shadow-lg">
          <h2 className="text-base font-semibold text-white tracking-tight border-b border-white/[0.06] pb-3">
            Status & Visibility
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 pt-1">
            <label className="flex items-start gap-3 text-sm text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                name="published"
                checked={published}
                onChange={(e) => {
                  setPublished(e.target.checked);
                  setIsDirty(true);
                }}
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/40 text-[#4F8CFF] focus:ring-0"
              />
              <div>
                <span className="font-medium text-white block">Publish on Site</span>
                <span className="text-xs text-zinc-500 block mt-0.5">
                  Displays this project on the public /personal-projects showcase page.
                </span>
              </div>
            </label>

            <div className="space-y-2">
              <label className="flex items-start gap-3 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={featured}
                  onChange={(e) => handleFeaturedToggle(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/40 text-amber-400 focus:ring-0"
                />
                <div>
                  <span className="font-medium text-white block flex items-center gap-1.5">
                    <Star size={13} className={featured ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'} />
                    Feature Project
                  </span>
                  <span className="text-xs text-zinc-500 block mt-0.5">
                    Highlight this project with priority placement and featured badge (Max {MAX_FEATURED_LIMIT}).
                  </span>
                </div>
              </label>

              {featuredLimitWarning && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-300 flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>
                    Maximum {MAX_FEATURED_LIMIT} personal projects can be featured simultaneously. Please unfeature another project before featuring this one.
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 06. APPEARANCE & THEME OVERRIDE ── */}
        <section className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#111215] p-6 sm:p-7 shadow-lg">
          <h2 className="text-base font-semibold text-white tracking-tight border-b border-white/[0.06] pb-3">
            Appearance & Theme
          </h2>
          
          <div className="pt-2">
            <label className="flex items-start gap-3 text-sm text-zinc-300 cursor-pointer mb-4">
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
                <span className="font-medium text-white block">Override Global Background</span>
                <span className="text-xs text-zinc-500 block mt-0.5">Use a specific background color for this project page.</span>
              </div>
            </label>
            
            {useCustomBackground && (
              <div className="flex items-center gap-4 pl-7">
                <input
                  type="color"
                  name="customBackground"
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
                  placeholder="#000000"
                />
              </div>
            )}
            {!useCustomBackground && (
               <input type="hidden" name="customBackground" value="" />
            )}
          </div>
        </section>

        {/* ── 07. STICKY ACTION BAR ── */}
        <div className="sticky bottom-6 z-40 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0e0f12]/90 p-4 shadow-2xl backdrop-blur-md">
          <Link
            href="/dashboard/personal-projects"
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-3.5">
            {/* Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
              {saveStatus === 'saving' ? (
                <span className="text-[#4F8CFF] flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" /> Saving draft...
                </span>
              ) : saveStatus === 'unsaved' ? (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> Unsaved changes
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Check size={12} /> All changes saved
                </span>
              )}
            </div>

            {/* Save Draft */}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isPending}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-zinc-200 shadow-sm transition-all hover:bg-white/10 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Draft'}
            </button>

            {/* Preview Action */}
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-zinc-200 shadow-sm transition-all hover:bg-white/10 hover:text-white"
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>

            {/* Publish Project Trigger */}
            <button
              type="button"
              onClick={handlePublishClick}
              disabled={isPending}
              className="rounded-xl bg-[#4F8CFF] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#4F8CFF]/25 transition-all hover:bg-[#3B78EB] active:scale-[0.98] disabled:opacity-50"
            >
              {isPending ? 'Publishing...' : isEditing ? 'Update & Publish' : 'Publish Project'}
            </button>
          </div>
        </div>
      </form>

      {/* ── PUBLISH CONFIRMATION MODAL ── */}
      {showPublishConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121316] p-6 space-y-4 shadow-2xl">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Publish this project?
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Once published, &ldquo;{title || 'this project'}&rdquo; will become immediately visible on your public portfolio under <span className="font-mono text-zinc-300">/personal-projects</span>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowPublishConfirmModal(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executePublish}
                className="rounded-xl bg-[#4F8CFF] px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-[#4F8CFF]/25 hover:bg-[#3B78EB] transition-all"
              >
                Publish Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LIVE PROJECT PREVIEW MODAL ── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-[var(--bg,#0a0a0c)] p-6 sm:p-10 shadow-2xl space-y-10 my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header bar */}
            <div className="flex items-center justify-between border-b border-border-subtle/80 pb-4 sticky top-0 bg-[var(--bg,#0a0a0c)]/90 backdrop-blur-md z-20">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold">
                  LIVE PORTFOLIO DRAFT PREVIEW
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Public Layout Header Preview */}
            <header className="space-y-5 text-center max-w-3xl mx-auto pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--card,#111215)] border border-border-subtle text-xs font-mono text-accent">
                <span>{category}</span>
                <span>•</span>
                <span>{year}</span>
                <span>•</span>
                <span>{projectStatus}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold tracking-tight text-foreground leading-[1.1]">
                {title || 'Untitled Project'}
              </h1>

              <p className="text-muted text-base sm:text-lg leading-relaxed font-normal">
                {description || 'Project short summary will appear here.'}
              </p>

              {/* Technologies */}
              {technologies.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {technologies.map((tech) => {
                    const logo = getTechLogo(tech);
                    return (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--card,#111215)] border border-border-subtle text-xs font-mono text-foreground"
                      >
                        {logo && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={logo.url}
                            alt=""
                            width={13}
                            height={13}
                            className="w-3.5 h-3.5 object-contain shrink-0"
                            style={logo.filter ? { filter: logo.filter } : undefined}
                          />
                        )}
                        <span>{tech}</span>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                {liveUrl && (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-[var(--bg)] text-xs font-medium tracking-tight shadow-sm"
                  >
                    <span>Live Preview</span>
                    <ArrowUpRight size={14} />
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--card)] border border-border-subtle text-foreground text-xs font-medium tracking-tight"
                  >
                    <Github size={14} />
                    <span>GitHub Code</span>
                  </a>
                )}
              </div>
            </header>

            {/* Showcase Hero Media */}
            {coverImageUrl && (
              <div className="w-full max-w-[960px] mx-auto rounded-2xl border border-border-subtle bg-[var(--card,#111215)] p-2.5 sm:p-4 shadow-sm">
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black/40 border border-border-subtle/50 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImageUrl}
                    alt={title}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Story sections preview */}
            {enableStory && storySections.length > 0 && (
              <div className="border-t border-border-subtle/80 pt-10 space-y-12 max-w-4xl mx-auto">
                <div className="text-center space-y-1">
                  <span className="text-xs font-mono font-semibold uppercase tracking-widest text-accent">
                    PROJECT STORY
                  </span>
                  <h2 className="text-2xl font-display font-semibold text-foreground">
                    Deep Dive & Specifications
                  </h2>
                </div>

                <div className="space-y-12">
                  {storySections.map((sec, idx) => (
                    <div key={sec.id || idx} className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs text-[#4F8CFF] font-semibold">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-xl font-display font-semibold text-foreground">
                          {sec.title}
                        </h3>
                      </div>
                      {sec.blocks && sec.blocks.length > 0 ? (
                        <div className="space-y-4">
                          {sec.blocks.map((blk) => (
                            <CustomBlockRenderer key={blk.id} block={blk} />
                          ))}
                        </div>
                      ) : (
                        sec.content && (
                          <p className="text-muted leading-relaxed text-sm sm:text-base">
                            {sec.content}
                          </p>
                        )
                      )}
                      {sec.media && sec.media.length > 0 && (
                        <div className="flex flex-wrap gap-4 pt-2">
                          {sec.media.map((med, mIdx) => (
                            <div
                              key={med.id || mIdx}
                              className="rounded-xl border border-border-subtle bg-[#0d0e11] p-3 overflow-hidden flex items-center justify-center w-full"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={med.url}
                                alt={med.caption || `Visual ${mIdx + 1}`}
                                className="max-h-96 object-contain rounded-lg"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Screenshots Preview */}
            {galleryUrls.length > 0 && (
              <div className="border-t border-border-subtle/80 pt-10 space-y-6 max-w-4xl mx-auto">
                <h3 className="text-xl font-display font-semibold text-foreground">
                  Interface Gallery & Artifacts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {galleryUrls.map((url, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border-subtle bg-[#111215] p-2 overflow-hidden flex items-center justify-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Screenshot ${i + 1}`}
                        className="max-h-72 object-contain rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
