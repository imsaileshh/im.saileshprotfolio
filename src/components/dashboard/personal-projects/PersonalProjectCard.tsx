'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  ExternalLink, 
  Eye, 
  Github, 
  Globe, 
  MoreVertical, 
  Star, 
  Trash2 
} from 'lucide-react';
import { 
  deletePersonalProjectAction, 
  togglePersonalProjectFeaturedAction, 
  togglePersonalProjectPublishedAction 
} from '@/app/dashboard/(protected)/personal-projects/actions';
import { PersonalProjectDetailsModal } from './PersonalProjectDetailsModal';
import { ProjectCover, getProjectCoverUrl } from '@/components/projects/ProjectCover';

export function PersonalProjectCard({ project }: { project: any }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleTogglePublished = () => {
    startTransition(async () => {
      await togglePersonalProjectPublishedAction(project.id, project.published);
    });
  };

  const handleToggleFeatured = () => {
    startTransition(async () => {
      await togglePersonalProjectFeaturedAction(project.id, project.featured);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deletePersonalProjectAction(project.id);
      setShowConfirmDelete(false);
    });
  };

  const coverUrl = getProjectCoverUrl(project);

  return (
    <div className={`group relative flex flex-col rounded-xl border bg-[#111113] p-4 transition-all duration-200 ${
      project.published ? 'border-white/10 hover:border-white/20' : 'border-white/5 opacity-80'
    } ${isPending ? 'pointer-events-none opacity-50' : ''}`}>
      
      {/* ── Top Thumbnail Container (Clickable) ── */}
      <div 
        onClick={() => setIsDetailsOpen(true)}
        className="relative mb-3.5 w-full cursor-pointer"
      >
        <ProjectCover
          src={coverUrl}
          alt={project.title}
          aspectRatio="16/10"
          className="rounded-lg bg-black/40"
          imageClassName="transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* Top Badges */}
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
          <button
            onClick={handleTogglePublished}
            title={project.published ? 'Click to set Draft' : 'Click to Publish'}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-medium backdrop-blur-md transition-colors ${
              project.published
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
            }`}
          >
            {project.published ? (
              <>
                <CheckCircle2 size={11} />
                <span>Published</span>
              </>
            ) : (
              <>
                <Clock size={11} />
                <span>Draft</span>
              </>
            )}
          </button>

          {project.featured && (
            <span className="flex items-center gap-0.5 rounded-md bg-amber-400/20 border border-amber-400/30 px-1.5 py-0.5 text-[10px] font-mono text-amber-200 backdrop-blur-md">
              <Star size={10} className="fill-amber-300 text-amber-300" />
              <span>Featured</span>
            </span>
          )}
        </div>

        {/* Top-Right Year */}
        <div className="absolute right-2.5 top-2.5 rounded-md bg-black/50 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-300 backdrop-blur-md">
          {project.year || '2025'}
        </div>
      </div>

      {/* ── Category & Title ── */}
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 truncate">
          {project.category || 'Personal Project'}
        </span>

        {/* Star Button */}
        <button
          onClick={handleToggleFeatured}
          title={project.featured ? 'Remove from Featured' : 'Mark as Featured'}
          className={`p-1 rounded hover:bg-white/10 transition-colors ${
            project.featured ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'
          }`}
        >
          <Star size={14} className={project.featured ? 'fill-amber-400' : ''} />
        </button>
      </div>

      <h3 
        onClick={() => setIsDetailsOpen(true)}
        className="text-base font-semibold text-white tracking-tight leading-snug line-clamp-1 mb-1.5 group-hover:text-[#4F8CFF] transition-colors cursor-pointer"
      >
        {project.title}
      </h3>

      <p 
        onClick={() => setIsDetailsOpen(true)}
        className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4 flex-1 cursor-pointer"
      >
        {project.description}
      </p>

      {/* ── Tech Pills ── */}
      {project.technologies && project.technologies.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 3).map((tech: string) => (
            <span
              key={tech}
              className="rounded bg-white/5 border border-white/5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className="text-[10px] font-mono text-zinc-500 self-center">
              +{project.technologies.length - 3}
            </span>
          )}
        </div>
      )}

      {/* ── Action Footer ── */}
      <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-1.5">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              title="GitHub Repository"
              className="p-1.5 rounded-lg text-zinc-500 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Github size={14} />
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              title="Live URL"
              className="p-1.5 rounded-lg text-zinc-500 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Globe size={14} />
            </a>
          )}
          <Link
            href={`/personal-projects`}
            target="_blank"
            title="View on Public Site"
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-white/5 hover:text-[#4F8CFF] transition-colors"
          >
            <Eye size={14} />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/personal-projects/${project.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors"
          >
            <Edit3 size={13} />
            <span>Edit</span>
          </Link>

          <button
            onClick={() => setShowConfirmDelete(true)}
            title="Delete project"
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="absolute inset-0 z-20 flex flex-col justify-center rounded-xl bg-[#111113]/95 p-4 backdrop-blur-sm">
          <p className="text-center text-xs font-semibold text-white mb-1">Delete this personal project?</p>
          <p className="text-center text-[11px] text-zinc-400 mb-3">This action cannot be undone.</p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="rounded-lg border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600 shadow-sm"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Personal Project Details Modal */}
      <PersonalProjectDetailsModal
        project={project}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

    </div>
  );
}
