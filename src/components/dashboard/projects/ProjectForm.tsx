'use client';

import { useState, ReactNode, useEffect, useActionState, useRef } from 'react';
import Link from 'next/link';
import { AlertCircle, BookOpen, Layers, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { getProjectStatus } from '@/lib/dashboard/presentation';
import { ActionState } from '@/app/dashboard/(protected)/projects/actions';
import { GalleryInput } from './GalleryInput';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { TechStackPicker } from '@/components/dashboard/TechStackPicker';
import { CaseStudyBuilder, CaseStudySectionItem } from './CaseStudyBuilder';
import { getProjectCoverUrl } from '@/lib/projects/cover-image';
import { normalizeCaseStudyVisual } from '@/types/case-study-visual';

const DEFAULT_CATEGORIES = [
  'Case Studies',
  'Web Development',
  'UI/UX',
  'Product Design',
  'Shopify',
  'E-commerce',
  'Branding',
  'Mobile',
  'SaaS',
  'Development',
  'Other',
];

export type ProjectFormCaseStudySection = {
  id?: string;
  title?: string;
  slug?: string;
  order?: number;
  content?: string | null;
  images?: string[];
  metadata?: {
    subtitle?: string;
    type?: string;
    layout?: CaseStudySectionItem['layout'];
    blocks?: CaseStudySectionItem['blocks'];
    media?: CaseStudySectionItem['media'];
    stats?: CaseStudySectionItem['stats'];
    quote?: CaseStudySectionItem['quote'];
    hidden?: boolean;
    [key: string]: unknown;
  } | null;
};

export type ProjectFormCaseStudy = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string | null;
  coverImage?: string | null;
  sourceType?: string;
  sourcePdf?: string | null;
  status?: string;
  sections?: ProjectFormCaseStudySection[];
  metadata?: Record<string, unknown> | null;
  useCustomBackground?: boolean;
  customBackground?: string | null;
};

type ProjectFormProject = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  projectType?: string;
  category?: string | null;
  technologies?: string[];
  featured?: boolean;
  published?: boolean;
  archived?: boolean;
  year?: string | null;
  client?: string | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  figmaUrl?: string | null;
  previewMode?: string | null;
  previewImageUrl?: string | null;
  coverImageUrl?: string | null;
  galleryImages?: string[];
  useCustomBackground?: boolean;
  customBackground?: string | null;
  caseStudy?: ProjectFormCaseStudy | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
};

function value(project: ProjectFormProject | undefined, key: keyof ProjectFormProject) {
  const item = project?.[key];
  if (typeof item === 'string') return item;
  return '';
}

function Field({
  label,
  children,
  optional = false,
  helper,
}: {
  label: string;
  name?: string;
  children: ReactNode;
  optional?: boolean;
  helper?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 flex items-center justify-between font-medium text-zinc-300">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-zinc-500">Optional</span>}
      </span>
      {children}
      {helper && <p className="mt-1 text-xs text-zinc-500">{helper}</p>}
    </label>
  );
}

const inputClass = 'h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF] focus:ring-1 focus:ring-[#4F8CFF]/30';
const selectClass = 'h-10 w-full rounded-xl border border-white/10 bg-[#121316] px-3.5 text-sm text-white outline-none transition focus:border-[#4F8CFF] focus:ring-1 focus:ring-[#4F8CFF]/30';
const textareaClass = 'min-h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF] focus:ring-1 focus:ring-[#4F8CFF]/30';

export function ProjectForm({
  project,
  action,
  submitLabel,
  isNew = false,
  categories = [],
}: {
  project?: ProjectFormProject;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel?: string;
  isNew?: boolean;
  categories?: string[];
}) {
  const status = project?.published === undefined || project?.archived === undefined
    ? 'Draft'
    : getProjectStatus({ published: project.published, archived: project.archived });

  const [state, formAction, isPending] = useActionState(action, { success: false });
  const errorRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to validation errors — they appear at the top but buttons are sticky at the bottom
  useEffect(() => {
    if (state?.error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [state?.error]);

  const [showSlug, setShowSlug] = useState(!isNew);
  const [projectDirty, setProjectDirty] = useState(false);
  const [caseStudyDirty, setCaseStudyDirty] = useState(false);
  const isDirty = projectDirty || caseStudyDirty;
  const [title, setTitle] = useState(value(project, 'title'));
  const [slug, setSlug] = useState(value(project, 'slug'));
  const [coverImageUrl, setCoverImageUrl] = useState(getProjectCoverUrl(project, ''));
  
  const [useCustomBackground, setUseCustomBackground] = useState(project?.useCustomBackground ?? false);
  const [customBackground, setCustomBackground] = useState(project?.customBackground ?? '#111113');
  
  // Progressive Case Study toggle
  const hasExistingCaseStudy = Boolean(project?.caseStudy);
  const [enableCaseStudy, setEnableCaseStudy] = useState(hasExistingCaseStudy);

  // Initial sections from database
  const initialBuilderSections: CaseStudySectionItem[] = (project?.caseStudy?.sections || []).map((sec, idx) => ({
    id: sec.id || `sec-${idx}`,
    title: sec.title || '',
    subtitle: sec.metadata?.subtitle || '',
    type: sec.metadata?.type || 'rich_text',
    layout: (sec.metadata?.layout as CaseStudySectionItem['layout']) || 'full_width',
    content: sec.content || '',
    blocks: sec.metadata?.blocks || [],
    media: (sec.metadata?.media || (sec.images || []).map((imgUrl: string, mediaIdx: number) => ({
      id: `m-${mediaIdx}`,
      url: imgUrl,
      imageUrl: imgUrl,
      type: imgUrl.endsWith('.svg') ? 'svg' : 'image',
      displayType: 'image',
      displaySize: 'large',
      backgroundType: 'none',
      padding: 0,
      radius: 16,
      fit: 'natural',
    }))).map(normalizeCaseStudyVisual),
    stats: sec.metadata?.stats || [],
    quote: sec.metadata?.quote || undefined,
    hidden: Boolean(sec.metadata?.hidden),
  }));

  useEffect(() => {
    if (isNew && !showSlug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }, [title, isNew, showSlug]);

  useEffect(() => {
    if (!isDirty || isPending) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isPending]);

  // Reset caseStudyDirty after a successful save
  useEffect(() => {
    if (state?.success) {
      setCaseStudyDirty(false);
      setProjectDirty(false);
    }
  }, [state?.success]);

  const categoryOptions = Array.from(new Set([...DEFAULT_CATEGORIES, ...categories])).filter(Boolean);

  return (
    <form action={formAction} onChange={() => setProjectDirty(true)} className="mx-auto max-w-4xl space-y-8 pb-28">
      {project?.id && <input type="hidden" name="id" value={project.id} />}
      <input type="hidden" name="projectType" value="Client Work" />

      {/* Error Alert */}
      {state?.error && (
        <div ref={errorRef} className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2.5 shadow-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* ── 01. BASIC INFO ── */}
      <section className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#111215] p-6 sm:p-7 shadow-lg">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF]">
            <Layers size={15} />
          </div>
          <h2 className="text-base font-semibold text-white tracking-tight">Work Information</h2>
        </div>
        
        <div className="space-y-5">
          {/* Work Title */}
          <Field label="Work Title *" name="title">
            <input
              className={inputClass}
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Organic Brand & E-Commerce Platform"
              required
              minLength={2}
            />
          </Field>
          
          {/* Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono">
                Slug: <span className="text-zinc-200">/works/{slug || '...'}</span>
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
              <Field label="URL Slug *" name="slug">
                <input
                  className={inputClass}
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  placeholder="organic-brand-ecommerce"
                  required
                />
              </Field>
            ) : (
              <input type="hidden" name="slug" value={slug} />
            )}
          </div>

          {/* Short Description */}
          <Field label="Short Description *" name="description">
            <textarea
              className={textareaClass}
              name="description"
              defaultValue={value(project, 'description')}
              placeholder="Modern headless e-commerce store with 3D customizer, design system, and fast checkout."
              required
              minLength={5}
              rows={3}
            />
          </Field>

          {/* Category, Client, Year */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Category *" name="category">
              <select
                name="category"
                defaultValue={value(project, 'category') || 'Web Development'}
                className={selectClass}
                required
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Client / Organization" name="client" optional>
              <input
                className={inputClass}
                name="client"
                defaultValue={value(project, 'client')}
                placeholder="e.g. Acme Corp"
              />
            </Field>

            <Field label="Year" name="year">
              <input
                className={inputClass}
                name="year"
                defaultValue={value(project, 'year') || new Date().getFullYear().toString()}
                placeholder="2026"
              />
            </Field>
          </div>

          {/* Tech Stack */}
          <div className="pt-2 border-t border-white/[0.04]">
            <TechStackPicker
              name="technologies"
              initialSelected={project?.technologies || []}
              label="Tech Stack & Tools"
            />
          </div>
        </div>
      </section>

      {/* ── 02. MEDIA & UPLOADS ── */}
      <section className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#111215] p-6 sm:p-7 shadow-lg">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF]">
              <ImageIcon size={15} />
            </div>
            <h2 className="text-base font-semibold text-white tracking-tight">Media</h2>
          </div>
          <span className="text-xs text-zinc-500 font-mono">16:10 or 16:9 ratio</span>
        </div>
        
        <div className="space-y-6">
          <ImageUploader
            name="coverImageUrl"
            value={coverImageUrl}
            onChange={(url) => setCoverImageUrl(url)}
            label="Cover Image"
            helperText="Main visual for portfolio grid cards and the project header."
          />
          
          <div className="space-y-2 pt-3 border-t border-white/[0.06]">
            <label className="block text-sm">
              <span className="mb-1.5 flex items-center justify-between font-medium text-zinc-300">
                <span>Additional Gallery Screenshots</span>
                <span className="text-xs font-normal text-zinc-500">Optional</span>
              </span>
            </label>
            <GalleryInput initialUrls={project?.galleryImages || []} />
          </div>
        </div>
      </section>

      {/* ── 03. LINKS & PROTOTYPE ── */}
      <section className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#111215] p-6 sm:p-7 shadow-lg">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF]">
            <LinkIcon size={15} />
          </div>
          <h2 className="text-base font-semibold text-white tracking-tight">Project Links</h2>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Live Website" name="liveUrl" optional>
            <input
              className={inputClass}
              name="liveUrl"
              defaultValue={value(project, 'liveUrl')}
              type="url"
              placeholder="https://..."
            />
          </Field>
          <Field label="Prototype / Figma" name="figmaUrl" optional>
            <input
              className={inputClass}
              name="figmaUrl"
              defaultValue={value(project, 'figmaUrl')}
              type="url"
              placeholder="https://figma.com/proto/..."
            />
          </Field>
          <Field label="GitHub / Repository" name="githubUrl" optional>
            <input
              className={inputClass}
              name="githubUrl"
              defaultValue={value(project, 'githubUrl')}
              type="url"
              placeholder="https://github.com/..."
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-3 border-t border-white/[0.04]">
          <Field label="Live Preview Mode" name="previewMode">
            <select
              className={inputClass}
              name="previewMode"
              defaultValue={value(project, 'previewMode') || 'external'}
            >
              <option value="external">External Only (Fallback screenshot preview)</option>
              <option value="iframe">Embedded Preview (Interactive in-app iframe)</option>
            </select>
          </Field>
          <Field label="Custom Preview Screenshot URL" name="previewImageUrl" optional>
            <input
              className={inputClass}
              name="previewImageUrl"
              defaultValue={value(project, 'previewImageUrl')}
              type="text"
              placeholder="https://... or /uploads/... (falls back to cover)"
            />
          </Field>
        </div>
      </section>

      {/* ── 04. OPTIONAL ADVANCED CASE STUDY BUILDER ── */}
      <section className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#111215] p-6 sm:p-7 shadow-lg">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
              <BookOpen size={15} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Case Study Builder</h2>
              <p className="text-xs text-zinc-400">Optional custom section-by-section breakdown attached to this Work.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="caseStudyEnabled"
              checked={enableCaseStudy}
              onChange={(e) => setEnableCaseStudy(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 select-none">
              {enableCaseStudy ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        {/* Visual Section Builder */}
        {enableCaseStudy ? (
          <CaseStudyBuilder
            initialSections={initialBuilderSections}
            onChange={() => setCaseStudyDirty(true)}
          />
        ) : (
          <p className="text-xs text-zinc-500 py-1">
            Toggle on to add custom editorial sections with rich text, vector SVGs, image galleries, and metrics.
          </p>
        )}
      </section>

      {/* ── 05. PUBLISHING & VISIBILITY ── */}
      <section className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#111215] p-6 sm:p-7 shadow-lg">
        <h2 className="text-base font-semibold text-white tracking-tight border-b border-white/[0.06] pb-3">
          Visibility & Home Feature
        </h2>
        
        <label className="flex items-start gap-3 text-sm text-zinc-300 cursor-pointer pt-1">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={project?.featured}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black text-[#4F8CFF] focus:ring-[#4F8CFF]"
          />
          <div>
            <span className="font-medium text-white block">Featured Work</span>
            <span className="text-xs text-zinc-500 block mt-0.5">Showcases this work with priority in the Home page Works collection.</span>
          </div>
        </label>
      </section>

      {/* ── 06. OPTIONAL SEO ACCORDION ── */}
      <details className="group rounded-2xl border border-white/[0.08] bg-[#111215] shadow-lg">
        <summary className="flex cursor-pointer items-center justify-between p-6 text-sm font-semibold text-zinc-400 hover:text-white outline-none">
          <span>SEO & Social Share (Optional)</span>
          <span className="text-zinc-500 transition-transform group-open:rotate-180">▼</span>
        </summary>
        <div className="space-y-4 border-t border-white/[0.06] p-6 pt-4">
          <p className="text-xs text-zinc-500">Defaults to the Work title and description if left blank.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SEO Title" name="seoTitle" optional>
              <input className={inputClass} name="seoTitle" defaultValue={value(project, 'seoTitle')} />
            </Field>
            <Field label="Social/OG Image URL" name="ogImage" optional>
              <input className={inputClass} name="ogImage" defaultValue={value(project, 'ogImage')} type="url" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="SEO Description" name="seoDescription" optional>
                <textarea className={textareaClass} name="seoDescription" defaultValue={value(project, 'seoDescription')} rows={2} />
              </Field>
            </div>
          </div>
        </div>
      </details>

      {/* ── 07. APPEARANCE & THEME OVERRIDE ── */}
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
                setProjectDirty(true);
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
                onChange={(e) => { setCustomBackground(e.target.value); setProjectDirty(true); }}
                className="h-10 w-16 rounded cursor-pointer bg-transparent border border-white/10 p-1"
              />
              <input
                type="text"
                value={customBackground}
                onChange={(e) => setCustomBackground(e.target.value)}
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

      {/* ── 08. STICKY ACTION BAR ── */}
      <div className="sticky bottom-6 z-40 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0e0f12]/90 p-4 shadow-2xl backdrop-blur-md">
        <Link 
          href="/dashboard/projects"
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
        >
          Cancel
        </Link>

        <div className="flex items-center gap-3">
          {isDirty && !isPending && (
            <span className="text-xs font-medium text-amber-400/90 flex items-center gap-1.5 mr-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Unsaved changes
            </span>
          )}

          <button 
            type="submit" 
            name="action"
            value="save_draft"
            disabled={isPending}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-zinc-200 shadow-sm transition-all hover:bg-white/10 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Draft'}
          </button>
          
          <button 
            type="submit" 
            name="action"
            value="publish" 
            disabled={isPending || (!isNew && !isDirty)}
            className="rounded-xl bg-[#4F8CFF] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#4F8CFF]/25 transition-all hover:bg-[#3B78EB] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Publishing...' : (submitLabel || (isNew ? 'Publish Work' : (status === 'Published' ? 'Update & Publish' : 'Publish Work')))}
          </button>
        </div>
      </div>
    </form>
  );
}
