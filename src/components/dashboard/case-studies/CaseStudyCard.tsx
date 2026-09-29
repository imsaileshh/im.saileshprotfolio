'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  Copy, 
  Edit3, 
  ExternalLink, 
  Eye, 
  FileText, 
  Layers, 
  Sparkles, 
  Trash2 
} from 'lucide-react';
import { deleteCaseStudyAction, duplicateCaseStudyAction, toggleCaseStudyPublishedAction } from '@/lib/dashboard/client-actions';
import { PrototypePreviewModal } from '@/components/case-study/PrototypePreviewModal';

export function CaseStudyCard({ caseStudy }: { caseStudy: any }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleTogglePublished = () => {
    startTransition(async () => {
      await toggleCaseStudyPublishedAction(caseStudy.id, caseStudy.status);
    });
  };

  const handleDuplicate = () => {
    startTransition(async () => {
      await duplicateCaseStudyAction(caseStudy.id);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteCaseStudyAction(caseStudy.id);
      setShowConfirmDelete(false);
    });
  };

  const coverUrl = caseStudy.coverImage || caseStudy.project?.coverImageUrl || `/images/projects/project1.svg`;
  const isPublished = caseStudy.status === 'PUBLISHED';
  const sectionCount = caseStudy.sections?.length || 0;

  return (
    <div className={`group relative flex flex-col rounded-xl border bg-[#111113] p-4 transition-all duration-200 ${
      isPublished ? 'border-white/10 hover:border-white/20' : 'border-white/5 opacity-85'
    } ${isPending ? 'pointer-events-none opacity-50' : ''}`}>
      
      {/* Cover Image */}
      <div className="relative mb-3.5 aspect-[16/9] w-full overflow-hidden rounded-lg bg-black/40">
        <Image
          src={coverUrl}
          alt={caseStudy.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* Top Badges */}
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
          <button
            onClick={handleTogglePublished}
            title={isPublished ? 'Set as Draft' : 'Publish Case Study'}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-medium backdrop-blur-md transition-colors ${
              isPublished
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
            }`}
          >
            {isPublished ? (
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
        </div>

        {/* Section Count Badge */}
        <div className="absolute right-2.5 top-2.5 rounded-md bg-black/50 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-300 backdrop-blur-md flex items-center gap-1">
          <Layers size={10} className="text-[#4F8CFF]" />
          <span>{sectionCount} Sections</span>
        </div>
      </div>

      {/* Category & Client */}
      <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
        <span className="truncate">{caseStudy.metadata?.client || caseStudy.project?.client || 'CLIENT CASE STUDY'}</span>
        <span>{caseStudy.metadata?.year || caseStudy.project?.year || '2025'}</span>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-white tracking-tight leading-snug line-clamp-1 mb-1.5 group-hover:text-[#4F8CFF] transition-colors">
        {caseStudy.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4 flex-1">
        {caseStudy.description || caseStudy.project?.description || 'Comprehensive UX/UI design process and product solution.'}
      </p>

      {/* Action Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowPreview(true)}
            title="Live Preview"
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-white/5 hover:text-[#4F8CFF] transition-colors"
          >
            <Eye size={14} />
          </button>

          <button
            onClick={handleDuplicate}
            title="Duplicate Case Study"
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Copy size={14} />
          </button>

          <Link
            href={`/projects/${caseStudy.slug}`}
            target="_blank"
            title="View on Public Portfolio"
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ExternalLink size={14} />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/case-studies/${caseStudy.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors"
          >
            <Edit3 size={13} />
            <span>Edit</span>
          </Link>

          <button
            onClick={() => setShowConfirmDelete(true)}
            title="Delete case study"
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="absolute inset-0 z-20 flex flex-col justify-center rounded-xl bg-[#111113]/95 p-4 backdrop-blur-sm">
          <p className="text-center text-xs font-semibold text-white mb-1">Delete this case study?</p>
          <p className="text-center text-[11px] text-zinc-400 mb-3">Linked project will remain safe.</p>
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

      {/* Prototype Preview Modal */}
      <PrototypePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={caseStudy.title}
        prototypeUrl={`/projects/${caseStudy.slug}`}
        defaultDevice="desktop"
      />

    </div>
  );
}
