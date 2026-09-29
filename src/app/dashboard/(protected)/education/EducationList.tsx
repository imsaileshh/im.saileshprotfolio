'use client';

import { useState, useEffect } from 'react';
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
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import type { Education } from '@prisma/client';
import { reorderEducationAction, deleteEducationAction } from '@/lib/dashboard/client-actions';
import { ConfirmSubmitButton } from '@/components/dashboard/ConfirmSubmitButton';
import { EducationForm } from './EducationForm';

interface EducationListProps {
  initialEducation: Education[];
}

function formatDate(date: Date | string | null) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function EducationList({ initialEducation }: EducationListProps) {
  const [items, setItems] = useState(initialEducation);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialEducation);
  }, [initialEducation]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && over) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        const updates = newItems.map((item, index) => ({
          id: item.id,
          orderIndex: index
        }));
        
        reorderEducationAction(updates);
        
        return newItems.map((item, index) => ({ ...item, orderIndex: index }));
      });
    }
  };

  return (
    <DndContext id="dnd-education-list" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="rounded-lg border border-white/10 bg-[#111113]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="w-10 px-4 py-3"></th>
                <th className="px-4 py-3">Degree</th>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                {items.map((edu) => (
                  <SortableEducationRow 
                    key={edu.id} 
                    edu={edu} 
                    isEditing={editingId === edu.id}
                    onEdit={() => setEditingId(edu.id)}
                    onCancelEdit={() => setEditingId(null)}
                    onEditSuccess={() => setEditingId(null)}
                  />
                ))}
              </SortableContext>
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">No education added yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DndContext>
  );
}

function SortableEducationRow({ 
  edu, 
  isEditing, 
  onEdit, 
  onCancelEdit,
  onEditSuccess
}: { 
  edu: Education; 
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onEditSuccess: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: edu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: isDragging ? 'relative' as const : undefined,
  };

  if (isEditing) {
    return (
      <tr ref={setNodeRef} style={style} className="bg-white/5">
        <td colSpan={6} className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Edit Education</h3>
            <button onClick={onCancelEdit} className="text-sm text-zinc-400 hover:text-white">Cancel</button>
          </div>
          <EducationForm initialData={edu} onSuccess={onEditSuccess} />
        </td>
      </tr>
    );
  }

  return (
    <tr ref={setNodeRef} style={style} className={`text-zinc-300 ${isDragging ? 'bg-white/10' : 'bg-transparent'}`}>
      <td className="px-4 py-3 text-zinc-500 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </td>
      <td className="px-4 py-3 font-medium text-white">{edu.degree}</td>
      <td className="px-4 py-3">{edu.institution}</td>
      <td className="px-4 py-3">
        {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
      </td>
      <td className="px-4 py-3">{edu.orderIndex}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-3">
          <button onClick={onEdit} className="text-zinc-500 hover:text-[#4F8CFF] transition-colors">
            <Pencil size={16} />
          </button>
          <form action={deleteEducationAction}>
            <input type="hidden" name="id" value={edu.id} />
            <ConfirmSubmitButton message="Delete this education entry?" className="inline-flex text-zinc-500 hover:text-red-400 transition-colors">
              <Trash2 size={16} />
            </ConfirmSubmitButton>
          </form>
        </div>
      </td>
    </tr>
  );
}
