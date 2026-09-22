'use client';

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
import { 
  GripVertical, 
  ArrowDownUp, 
  LayoutTemplate, 
  Briefcase, 
  Code2, 
  User, 
  Layers,
  LucideIcon
} from 'lucide-react';
import { DEFAULT_SECTION_ITEMS } from '@/types/homepage-cms';

interface HomeSectionOrderEditorProps {
  sectionOrder: string[];
  onChange: (updatedOrder: string[]) => void;
}

const SECTION_ICONS: Record<string, LucideIcon> = {
  hero: LayoutTemplate,
  works: Briefcase,
  'personal-projects': Code2,
  about: User,
  stack: Layers,
};

function SortableSectionRow({
  id,
  index,
}: {
  id: string;
  index: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 20 : 'auto',
  };

  const itemMeta = DEFAULT_SECTION_ITEMS.find((s) => s.id === id) || {
    id,
    name: id.toUpperCase(),
    description: 'Custom homepage section',
  };

  const IconComponent = SECTION_ICONS[id] || LayoutTemplate;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/40 p-4 transition-all hover:border-white/20"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 text-zinc-500 hover:text-white rounded-md hover:bg-white/5 transition-colors"
          title="Drag to reorder section"
        >
          <GripVertical size={18} />
        </button>

        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 font-mono text-xs font-semibold text-zinc-400 border border-white/5">
          0{index + 1}
        </span>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20 shrink-0">
          <IconComponent size={18} />
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">{itemMeta.name}</h4>
          <p className="text-xs text-zinc-400 truncate">{itemMeta.description}</p>
        </div>
      </div>

      <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider shrink-0 hidden sm:inline">
        Position #{index + 1}
      </span>
    </div>
  );
}

export function HomeSectionOrderEditor({
  sectionOrder,
  onChange,
}: HomeSectionOrderEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sectionOrder.indexOf(active.id as string);
    const newIndex = sectionOrder.indexOf(over.id as string);
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(sectionOrder, oldIndex, newIndex);
      onChange(reordered);
    }
  };

  return (
    <section id="section-order" className="rounded-xl border border-white/10 bg-[#111113] p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20">
          <ArrowDownUp size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Homepage Section Order</h2>
          <p className="text-xs text-zinc-400">
            Drag sections to determine the vertical flow rendered on the public homepage.
          </p>
        </div>
      </div>

      {/* Reorder List */}
      <div className="space-y-2.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
            <div className="space-y-2.5">
              {sectionOrder.map((sectionId, index) => (
                <SortableSectionRow key={sectionId} id={sectionId} index={index} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </section>
  );
}
