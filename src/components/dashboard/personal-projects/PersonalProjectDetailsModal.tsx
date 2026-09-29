'use client';

import { useTransition, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  ExternalLink, 
  Eye, 
  Github, 
  Globe, 
  Star, 
  Trash2, 
  X 
} from 'lucide-react';
import { deletePersonalProjectAction, togglePersonalProjectFeaturedAction, togglePersonalProjectPublishedAction } from '@/lib/dashboard/client-actions';
import { ProjectCover, getProjectCoverUrl } from '@/components/projects/ProjectCover';
import { useModalScrollProgress } from '@/components/ui/ScrollProgressContext';

interface PersonalProjectDetailsModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
}

export function PersonalProjectDetailsModal({
  project,
  isOpen,
  onClose,
}: PersonalProjectDetailsModalProps) {
  const [isPending, startTransition] = useTransition();
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // Track personal project details modal scroll while open
  useModalScrollProgress(isOpen && Boolean(project), modalScrollRef);

  if (!isOpen || !project) return null;

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
    if (confirm('Are you sure you want to delete this personal project?')) {
      startTransition(async () => {
        await deletePersonalProjectAction(project.id);
        onClose();
      });
    }
  };

  const coverUrl = getProjectCoverUrl(project);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-2xl bg-[#111113] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>

          <div ref={modalScrollRef} className="overflow-y-auto no-scrollbar">
            {/* Cover Image */}
            <div className="relative w-full overflow-hidden">
              <ProjectCover
                src={coverUrl}
                alt={project.title}
                aspectRatio="16/9"
                sizes="(max-width: 768px) 100vw, 672px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111113] to-transparent opacity-80 pointer-events-none" />
              
              {/* Badges on image */}
              <div className="absolute bottom-3 left-4 flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                  project.published 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {project.published ? 'Published' : 'Draft'}
                </span>
                {project.featured && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-400/20 text-amber-200 border border-amber-400/30 flex items-center gap-1">
                    <Star size={11} className="fill-amber-300 text-amber-300" />
                    Featured
                  </span>
                )}
              </div>
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#4F8CFF]">
                    {project.category || 'PERSONAL PROJECT'}
                  </span>
                  <span className="text-zinc-600 font-mono text-xs">&bull;</span>
                  <span className="text-xs font-mono text-zinc-400">
                    {project.year || '2025'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {project.title}
                </h2>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Description
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Tech Stack */}
              {project.technologies && project.technologies.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech: string) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-zinc-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* External Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 text-sm text-zinc-300 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Github size={16} />
                      <span>GitHub Repository</span>
                    </div>
                    <ExternalLink size={14} className="text-zinc-500" />
                  </a>
                )}

                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 text-sm text-zinc-300 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Globe size={16} />
                      <span>Live Preview</span>
                    </div>
                    <ExternalLink size={14} className="text-zinc-500" />
                  </a>
                )}
              </div>

              {/* ── Status Controls & CRUD Actions ── */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTogglePublished}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      project.published
                        ? 'border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20'
                        : 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20'
                    }`}
                  >
                    {project.published ? <Clock size={13} /> : <CheckCircle2 size={13} />}
                    <span>{project.published ? 'Set as Draft' : 'Publish Project'}</span>
                  </button>

                  <button
                    onClick={handleToggleFeatured}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      project.featured
                        ? 'border-amber-400/40 text-amber-300 bg-amber-400/10'
                        : 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Star size={13} className={project.featured ? 'fill-amber-300' : ''} />
                    <span>{project.featured ? 'Featured ON' : 'Feature'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/personal-projects/${project.id}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white/10 border border-white/10 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
