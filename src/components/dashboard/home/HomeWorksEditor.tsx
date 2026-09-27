'use client';

import Image from 'next/image';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Briefcase, Eye, EyeOff, GripVertical, CheckSquare, Square } from 'lucide-react';
import type { WorksSectionConfig } from '@/types/homepage-cms';
import { ProjectCover, getProjectCoverUrl } from '@/components/projects/ProjectCover';

export interface WorkProjectItem {
  id: string;
  title: string;
  slug: string;
  category?: string | null;
  year?: string | null;
  coverImageUrl?: string | null;
  images?: { url: string; isCover?: boolean }[];
  published?: boolean;
}

interface HomeWorksEditorProps {
  worksConfig: WorksSectionConfig;
  workProjects: WorkProjectItem[];
  onChange: (updated: WorksSectionConfig) => void;
}

const inputClass =
  'h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF]';
const textareaClass =
  'min-h-20 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF]';

function SortableWorkCard({
  project,
  isSelected,
  onToggleSelect,
}: {
  project: WorkProjectItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 20 : 'auto',
  };

  const coverUrl = getProjectCoverUrl(project, '/images/projects/project1.svg');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between gap-4 rounded-xl border p-3.5 transition-all ${
        isSelected
          ? 'border-white/15 bg-black/40 shadow-sm'
          : 'border-white/5 bg-black/20 opacity-60'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 text-zinc-500 hover:text-white rounded-md hover:bg-white/5 transition-colors"
          title="Drag to reorder"
        >
          <GripVertical size={18} />
        </button>

        {/* Selection Checkbox */}
        <button
          type="button"
          onClick={() => onToggleSelect(project.id)}
          className={`flex items-center justify-center w-6 h-6 rounded-md border transition-colors ${
            isSelected
              ? 'bg-[#4F8CFF] border-[#4F8CFF] text-white'
              : 'border-white/20 bg-black/40 text-transparent hover:border-white/40'
          }`}
          title={isSelected ? 'Remove from homepage' : 'Show on homepage'}
        >
          {isSelected ? <CheckSquare size={16} /> : <Square size={16} className="text-zinc-600" />}
        </button>

        {/* Thumbnail Image */}
        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[#111214] border border-white/10">
          <ProjectCover
            src={coverUrl}
            alt={project.title}
            aspectRatio="auto"
            className="h-full w-full rounded-none"
            sizes="64px"
            fallbackSrc="/images/projects/project1.svg"
          />
        </div>

        {/* Title, Category & Year */}
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">{project.title}</h4>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>{project.category || 'Case Study'}</span>
            <span>•</span>
            <span className="font-mono text-zinc-500">{project.year || '2026'}</span>
          </div>
        </div>
      </div>

      {/* Status Pill */}
      <span
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
          isSelected
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-zinc-800 text-zinc-500 border border-white/5'
        }`}
      >
        {isSelected ? 'On Homepage' : 'Hidden'}
      </span>
    </div>
  );
}

export function HomeWorksEditor({
  worksConfig,
  workProjects,
  onChange,
}: HomeWorksEditorProps) {
  const updateField = <K extends keyof WorksSectionConfig>(
    field: K,
    value: WorksSectionConfig[K]
  ) => {
    onChange({
      ...worksConfig,
      [field]: value,
    });
  };

  // Build sorted list of all Work projects:
  // Projects selected in selectedProjectIds appear first in their saved order;
  // unselected projects follow at the end.
  const selectedIds = worksConfig.selectedProjectIds || [];
  
  const sortedProjects = [...workProjects].sort((a, b) => {
    const idxA = selectedIds.indexOf(a.id);
    const idxB = selectedIds.indexOf(b.id);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedProjects.findIndex((p) => p.id === active.id);
    const newIndex = sortedProjects.findIndex((p) => p.id === over.id);
    const newSorted = arrayMove(sortedProjects, oldIndex, newIndex);

    // Filter only those that are currently selected to preserve order
    const updatedSelectedIds = newSorted
      .filter((p) => selectedIds.includes(p.id))
      .map((p) => p.id);

    updateField('selectedProjectIds', updatedSelectedIds);
  };

  const handleToggleSelect = (id: string) => {
    let updated: string[];
    if (selectedIds.includes(id)) {
      updated = selectedIds.filter((item) => item !== id);
    } else {
      updated = [...selectedIds, id];
    }
    updateField('selectedProjectIds', updated);
  };

  return (
    <section id="works" className="rounded-xl border border-white/10 bg-[#111113] p-6 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20">
            <Briefcase size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Works Section</h2>
            <p className="text-xs text-zinc-400">
              Curate and order the commercial work cards displayed on your homepage.
            </p>
          </div>
        </div>

        {/* Section Visibility Switch */}
        <button
          type="button"
          onClick={() => updateField('visible', !worksConfig.visible)}
          className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors border ${
            worksConfig.visible
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-zinc-800 text-zinc-400 border-white/10 hover:bg-zinc-700'
          }`}
        >
          {worksConfig.visible ? (
            <>
              <Eye size={14} />
              <span>Section Visible</span>
            </>
          ) : (
            <>
              <EyeOff size={14} />
              <span>Section Hidden</span>
            </>
          )}
        </button>
      </div>

      {/* Section Header Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Section Label / Tag
          </span>
          <input
            value={worksConfig.label}
            onChange={(e) => updateField('label', e.target.value)}
            className={inputClass}
            placeholder="WORKS"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Section Heading
          </span>
          <input
            value={worksConfig.heading}
            onChange={(e) => updateField('heading', e.target.value)}
            className={inputClass}
            placeholder="Works"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Description
          </span>
          <textarea
            value={worksConfig.description}
            onChange={(e) => updateField('description', e.target.value)}
            className={textareaClass}
            placeholder="A curated collection of work that tells a story."
          />
        </label>
      </div>

      {/* Project Curation List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Homepage Work Cards ({selectedIds.length} visible)
          </span>
          <span className="text-[11px] text-zinc-500">
            Drag ☰ to reorder • Check to toggle homepage display
          </span>
        </div>

        {workProjects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
            No Work records found. Create new Works under Content &gt; Works.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedProjects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2.5">
                {sortedProjects.map((project) => (
                  <SortableWorkCard
                    key={project.id}
                    project={project}
                    isSelected={selectedIds.includes(project.id)}
                    onToggleSelect={handleToggleSelect}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </section>
  );
}
