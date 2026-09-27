'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Archive, Copy, Eye, MoreHorizontal, Pencil, Star, Trash2, FolderGit2, BookOpen, ExternalLink } from 'lucide-react';
import { ConfirmSubmitButton } from '@/components/dashboard/ConfirmSubmitButton';
import { getProjectStatus } from '@/lib/dashboard/projects';
import {
  deleteProjectAction,
  duplicateProjectAction,
  quickProjectAction,
  bulkProjectAction,
} from '@/app/dashboard/(protected)/projects/actions';
import { ProjectCover, getProjectCoverUrl } from '@/components/projects/ProjectCover';

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string | null;
  projectType: string;
  technologies: string[];
  tags: string[];
  featured: boolean;
  published: boolean;
  archived: boolean;
  updatedAt: Date;
  thumbnailUrl?: string | null;
  coverImageUrl?: string | null;
  images?: { url: string; isCover: boolean }[];
  caseStudy?: any;
};

function statusTone(status: string) {
  if (status === 'Published') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
  if (status === 'Archived') return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-400';
  return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
}

function coverForProject(project: ProjectRow) {
  return getProjectCoverUrl(project);
}

function ProjectActions({ project }: { project: ProjectRow }) {
  const nextFeaturedAction = project.featured ? 'removeFeatured' : 'markFeatured';

  return (
    <div className="flex items-center gap-1.5 justify-end">
      <Link
        href={`/dashboard/projects/${project.id}/edit`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors"
      >
        <Pencil size={13} />
        <span>Edit</span>
      </Link>

      <Link
        href={`/works/${project.slug}`}
        target="_blank"
        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-colors"
        title="View public page"
      >
        <Eye size={13} />
      </Link>

      <details className="relative">
        <summary
          className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="More project actions"
        >
          <MoreHorizontal size={15} />
        </summary>
        <div className="absolute right-0 z-30 mt-2 w-44 rounded-xl border border-white/10 bg-[#121316] p-1.5 shadow-2xl">
          <form action={duplicateProjectAction}>
            <input type="hidden" name="id" value={project.id} />
            <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors">
              <Copy size={13} /> Duplicate
            </button>
          </form>
          
          <form action={quickProjectAction}>
            <input type="hidden" name="id" value={project.id} />
            <button
              name="action"
              value={nextFeaturedAction}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Star size={13} className={project.featured ? 'text-amber-400 fill-amber-400' : ''} />
              {project.featured ? 'Unfeature' : 'Feature on Home'}
            </button>
          </form>

          <form action={quickProjectAction}>
            <input type="hidden" name="id" value={project.id} />
            <button
              name="action"
              value={project.published ? 'unpublish' : 'publish'}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${project.published ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              {project.published ? 'Unpublish to Draft' : 'Publish'}
            </button>
          </form>

          <div className="my-1 border-t border-white/[0.06]" />

          <form action={deleteProjectAction}>
            <input type="hidden" name="id" value={project.id} />
            <ConfirmSubmitButton
              message="Delete this work permanently?"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={13} /> Delete Work
            </ConfirmSubmitButton>
          </form>
        </div>
      </details>
    </div>
  );
}

export function ProjectRows({ projects }: { projects: ProjectRow[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === projects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(projects.map((p) => p.id)));
    }
  };

  return (
    <div className="flex flex-col">
      {/* Bulk action toolbar if selected */}
      {selectedIds.size > 0 && (
        <form action={bulkProjectAction} className="sticky top-0 z-30 mb-4 flex flex-col gap-3 rounded-xl border border-[#4F8CFF]/30 bg-[#4F8CFF]/10 p-3.5 shadow-xl backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          {Array.from(selectedIds).map((id) => (
            <input key={id} type="hidden" name="ids" value={id} />
          ))}
          <p className="text-xs font-semibold text-[#4F8CFF]">
            {selectedIds.size} work{selectedIds.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button name="action" value="publish" className="rounded-lg bg-[#4F8CFF]/20 px-3 py-1.5 text-xs font-medium text-[#4F8CFF] hover:bg-[#4F8CFF]/30">Publish</button>
            <button name="action" value="unpublish" className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/20">Unpublish</button>
            <ConfirmSubmitButton name="action" value="delete" message={`Delete ${selectedIds.size} selected works?`} className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30">Delete</ConfirmSubmitButton>
          </div>
        </form>
      )}

      {/* Modern Clean Works List (Desktop & Tablet) */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111215]">
        <table className="min-w-full divide-y divide-white/[0.06] text-sm">
          <thead className="bg-white/[0.02] text-left text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="w-12 px-4 py-3.5">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-black text-[#4F8CFF] focus:ring-0"
                  checked={selectedIds.size === projects.length && projects.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-4 py-3.5">Work</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Featured</th>
              <th className="px-4 py-3.5">Updated</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {projects.map((project) => {
              const status = getProjectStatus(project);
              const cover = coverForProject(project);
              const formattedDate = new Date(project.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <tr
                  key={project.id}
                  className={`transition-colors hover:bg-white/[0.02] ${
                    selectedIds.has(project.id) ? 'bg-[#4F8CFF]/5' : ''
                  }`}
                >
                  {/* Select */}
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(project.id)}
                      onChange={() => toggleSelection(project.id)}
                      className="h-4 w-4 rounded border-white/20 bg-black text-[#4F8CFF] focus:ring-0"
                    />
                  </td>

                  {/* Work Name & Thumbnail */}
                  <td className="min-w-[300px] px-4 py-3.5">
                    <div className="flex items-center gap-3.5">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-black/40">
                        <ProjectCover
                          src={cover}
                          alt={project.title}
                          aspectRatio="auto"
                          className="h-full w-full rounded-none"
                          sizes="64px"
                        />
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/projects/${project.id}/edit`}
                            className="font-medium text-white hover:text-[#4F8CFF] transition-colors truncate block"
                          >
                            {project.title}
                          </Link>
                          {project.caseStudy && (
                            <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 shrink-0">
                              <BookOpen size={10} /> Case Study
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-zinc-500 max-w-sm">
                          {project.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3.5">
                    <span className="inline-flex rounded-lg bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 text-xs text-zinc-300 font-mono">
                      {project.category || 'Website'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusTone(status)}`}>
                      {status}
                    </span>
                  </td>

                  {/* Featured */}
                  <td className="px-4 py-3.5">
                    {project.featured ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400">
                        <Star size={12} className="fill-amber-400" />
                        <span>Home</span>
                      </span>
                    ) : (
                      <span className="text-zinc-600 font-mono text-xs">—</span>
                    )}
                  </td>

                  {/* Updated */}
                  <td className="px-4 py-3.5 text-xs text-zinc-500 font-mono">
                    {formattedDate}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right">
                    <ProjectActions project={project} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="grid gap-3 lg:hidden">
        {projects.map((project) => {
          const status = getProjectStatus(project);
          const cover = coverForProject(project);

          return (
            <div
              key={project.id}
              className="rounded-2xl border border-white/[0.08] bg-[#111215] p-4 space-y-3"
            >
              <div className="flex gap-3">
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-black/40">
                  <ProjectCover
                    src={cover}
                    alt={project.title}
                    aspectRatio="auto"
                    className="h-full w-full rounded-none"
                    sizes="80px"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-white truncate text-sm">
                      {project.title}
                    </h3>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0 ${statusTone(status)}`}>
                      {status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                <span className="font-mono text-zinc-400 text-[11px]">
                  {project.category || 'Website'}
                </span>
                <ProjectActions project={project} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
