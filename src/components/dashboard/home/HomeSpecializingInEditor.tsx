'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  RotateCcw,
  Sliders,
  Check,
} from 'lucide-react';
import type {
  SpecializingInSectionConfig,
  SpecializingInSkillItem,
} from '@/types/homepage-cms';
import {
  DEFAULT_SPECIALIZING_IN_CONFIG,
  DEFAULT_SPECIALIZING_IN_SKILLS,
} from '@/types/homepage-cms';
import { SpecializingInSection } from '@/components/home/SpecializingInSection';

interface HomeSpecializingInEditorProps {
  config?: SpecializingInSectionConfig | null;
  onChange: (updated: SpecializingInSectionConfig) => void;
}

const FONT_FAMILIES = [
  { label: 'Helvetica Neue (Fallback Stack)', value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: 'Inter', value: 'var(--font-sans), sans-serif' },
  { label: 'Outfit (Display)', value: 'var(--font-display), sans-serif' },
  { label: 'System Monospace', value: 'ui-monospace, monospace' },
  { label: 'System Serif', value: 'ui-serif, Georgia, serif' },
];

const FONT_WEIGHTS = [
  { label: '400 · Normal', value: '400' },
  { label: '500 · Medium', value: '500' },
  { label: '600 · Semi-Bold', value: '600' },
  { label: '700 · Bold', value: '700' },
  { label: '800 · Extra-Bold', value: '800' },
];

const FONT_SIZES = ['12px', '13px', '14px', '15px', '16px', '18px'];

const LETTER_SPACINGS = [
  { label: '-0.03em (Tight)', value: '-0.03em' },
  { label: '-0.02em', value: '-0.02em' },
  { label: '-0.01em', value: '-0.01em' },
  { label: 'Normal (0)', value: 'normal' },
  { label: '+0.02em', value: '0.02em' },
  { label: '+0.04em', value: '0.04em' },
  { label: '+0.08em (Wide)', value: '0.08em' },
  { label: '+0.15em (Tracking)', value: '0.15em' },
];

const COLOR_PRESETS = [
  { label: 'Muted Gray (Default)', value: '#9A9CA2' },
  { label: 'Dim Gray', value: '#71717A' },
  { label: 'Light Silver', value: '#D4D4D8' },
  { label: 'Pure White', value: '#FFFFFF' },
  { label: 'Teal Accent', value: '#2DD4BF' },
];

function SortableSkillRow({
  skill,
  onUpdate,
  onDelete,
}: {
  skill: SpecializingInSkillItem;
  onUpdate: (updated: SpecializingInSkillItem) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: skill.id,
  });

  const [expanded, setExpanded] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 25 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border transition-all ${
        isDragging
          ? 'border-[#4F8CFF] bg-[#1a1b20] shadow-xl'
          : skill.visible
          ? 'border-white/10 bg-black/40 hover:border-white/20'
          : 'border-white/5 bg-black/20 opacity-60'
      }`}
    >
      {/* ── Main Compact Row ── */}
      <div className="flex items-center justify-between gap-3 p-3">
        {/* Left: Drag handle, name input */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-zinc-500 hover:text-white rounded hover:bg-white/5 transition-colors shrink-0"
            title="Drag to reorder"
          >
            <GripVertical size={16} />
          </button>

          <input
            type="text"
            value={skill.name}
            onChange={(e) => onUpdate({ ...skill, name: e.target.value })}
            placeholder="Skill Name"
            className="h-8 flex-1 min-w-[120px] rounded-md border border-white/10 bg-black/50 px-2.5 text-xs font-medium text-white placeholder:text-zinc-600 focus:border-[#4F8CFF] outline-none"
          />
        </div>

        {/* Center: Live typography preview of the skill */}
        <div className="hidden sm:flex items-center px-3 py-1 rounded bg-black/60 border border-white/5 max-w-[180px] overflow-hidden">
          <span
            style={{
              fontFamily: skill.fontFamily || '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: skill.fontSize || '14px',
              fontWeight: skill.fontWeight || '500',
              letterSpacing: skill.letterSpacing || 'normal',
              color: skill.color || '#9A9CA2',
            }}
            className="truncate select-none text-xs"
          >
            {skill.name || 'Wordmark'}
          </span>
        </div>

        {/* Right: Controls (Customize toggle, Visibility toggle, Delete) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={`inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-xs font-medium border transition-colors ${
              expanded
                ? 'bg-[#4F8CFF]/15 text-[#4F8CFF] border-[#4F8CFF]/30'
                : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
            }`}
            title="Adjust typography (font, size, weight, spacing, color)"
          >
            <Sliders size={13} />
            <span className="hidden md:inline">Typography</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdate({ ...skill, visible: !skill.visible })}
            className={`h-8 w-8 inline-flex items-center justify-center rounded-md border transition-colors ${
              skill.visible
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-zinc-800 text-zinc-500 border-white/10 hover:bg-zinc-700'
            }`}
            title={skill.visible ? 'Skill is visible' : 'Skill is hidden'}
          >
            {skill.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-red-500/15 bg-red-500/5 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-colors"
            title="Delete skill"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ── Expanded Typography Controls Drawer ── */}
      {expanded && (
        <div className="border-t border-white/5 bg-black/60 p-3.5 space-y-3 rounded-b-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Font Family */}
            <label className="block text-[11px] col-span-2 md:col-span-1">
              <span className="text-zinc-400 mb-1 block font-medium">Font Family</span>
              <select
                value={skill.fontFamily || '"Helvetica Neue", Helvetica, Arial, sans-serif'}
                onChange={(e) => onUpdate({ ...skill, fontFamily: e.target.value })}
                className="h-8 w-full rounded border border-white/10 bg-black px-2 text-xs text-white outline-none focus:border-[#4F8CFF]"
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Font Size */}
            <label className="block text-[11px]">
              <span className="text-zinc-400 mb-1 block font-medium">Font Size</span>
              <select
                value={skill.fontSize || '14px'}
                onChange={(e) => onUpdate({ ...skill, fontSize: e.target.value })}
                className="h-8 w-full rounded border border-white/10 bg-black px-2 text-xs text-white outline-none focus:border-[#4F8CFF]"
              >
                {FONT_SIZES.map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
            </label>

            {/* Font Weight */}
            <label className="block text-[11px]">
              <span className="text-zinc-400 mb-1 block font-medium">Font Weight</span>
              <select
                value={skill.fontWeight || '500'}
                onChange={(e) => onUpdate({ ...skill, fontWeight: e.target.value })}
                className="h-8 w-full rounded border border-white/10 bg-black px-2 text-xs text-white outline-none focus:border-[#4F8CFF]"
              >
                {FONT_WEIGHTS.map((fw) => (
                  <option key={fw.value} value={fw.value}>
                    {fw.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Letter Spacing */}
            <label className="block text-[11px]">
              <span className="text-zinc-400 mb-1 block font-medium">Letter Spacing</span>
              <select
                value={skill.letterSpacing || 'normal'}
                onChange={(e) => onUpdate({ ...skill, letterSpacing: e.target.value })}
                className="h-8 w-full rounded border border-white/10 bg-black px-2 text-xs text-white outline-none focus:border-[#4F8CFF]"
              >
                {LETTER_SPACINGS.map((ls) => (
                  <option key={ls.value} value={ls.value}>
                    {ls.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Color & Presets */}
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-white/5">
            <span className="text-[11px] font-medium text-zinc-400">Color:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = (skill.color || '#9A9CA2').toLowerCase() === preset.value.toLowerCase();
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onUpdate({ ...skill, color: preset.value })}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                      isSelected
                        ? 'border-white/40 bg-white/15 text-white'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/40"
                      style={{ backgroundColor: preset.value }}
                    />
                    <span>{preset.label.split(' ')[0]}</span>
                    {isSelected && <Check size={11} className="text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[11px] text-zinc-500">Hex:</span>
              <input
                type="text"
                value={skill.color || '#9A9CA2'}
                onChange={(e) => onUpdate({ ...skill, color: e.target.value })}
                className="h-6 w-20 rounded border border-white/10 bg-black px-1.5 text-[11px] font-mono text-zinc-300 outline-none focus:border-[#4F8CFF]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function HomeSpecializingInEditor({
  config,
  onChange,
}: HomeSpecializingInEditorProps) {
  const current = config || DEFAULT_SPECIALIZING_IN_CONFIG;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const updateSectionField = <K extends keyof SpecializingInSectionConfig>(
    field: K,
    value: SpecializingInSectionConfig[K]
  ) => {
    onChange({
      ...current,
      [field]: value,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = current.skills.findIndex((s) => s.id === active.id);
    const newIndex = current.skills.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(current.skills, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        order: idx,
      }));
      updateSectionField('skills', reordered);
    }
  };

  const handleAddSkill = () => {
    const newSkill: SpecializingInSkillItem = {
      id: `skill-${Date.now()}`,
      name: 'New Skill',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      letterSpacing: 'normal',
      color: '#9A9CA2',
      order: current.skills.length,
      visible: true,
    };
    updateSectionField('skills', [...current.skills, newSkill]);
  };

  const handleUpdateSkill = (index: number, updated: SpecializingInSkillItem) => {
    const newSkills = [...current.skills];
    newSkills[index] = updated;
    updateSectionField('skills', newSkills);
  };

  const handleDeleteSkill = (index: number) => {
    const newSkills = current.skills.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      order: idx,
    }));
    updateSectionField('skills', newSkills);
  };

  const handleResetToDefaults = () => {
    onChange({
      visible: true,
      title: DEFAULT_SPECIALIZING_IN_CONFIG.title,
      skills: DEFAULT_SPECIALIZING_IN_SKILLS.map((s) => ({ ...s })),
    });
  };

  const activeSkillsForPreview = current.skills
    .filter((s) => s.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <section id="specializing-in" className="rounded-xl border border-white/10 bg-[#111113] p-6 space-y-6">
      {/* ── Section Title & Enable / Disable Toggle ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Specializing In Section</h2>
            <p className="text-xs text-zinc-400">
              Manage typography-based skill wordmarks displayed right under the hero description.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            title="Reset to original 8 default skills and styling"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => updateSectionField('visible', !current.visible)}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors border ${
              current.visible
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-zinc-800 text-zinc-400 border-white/10 hover:bg-zinc-700'
            }`}
          >
            {current.visible ? (
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
      </div>

      {!current.visible && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300">
          Specializing In section is currently disabled and will not appear on the public homepage.
        </div>
      )}

      {/* ── Live In-Editor Preview Box ── */}
      <div className="rounded-lg border border-white/10 bg-black/40 p-5 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
          <span>Live Section Preview (Icon + Text + Varied Typography)</span>
          <span>{activeSkillsForPreview.length} skills active</span>
        </div>
        <div className="border border-white/5 rounded-lg bg-[#111214] p-4">
          <SpecializingInSection config={current} />
        </div>
      </div>

      {/* ── Section Title Setting ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Section Label / Title
          </span>
          <input
            type="text"
            value={current.title}
            onChange={(e) => updateSectionField('title', e.target.value)}
            className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF]"
            placeholder="SPECIALIZING IN"
          />
        </label>
      </div>

      {/* ── Skills Collection Editor with Dnd ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Skills Collection</h3>
            <p className="text-xs text-zinc-400">
              Drag to reorder. Expand &quot;Typography&quot; to customize individual font family, size, weight, letter spacing, and color.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddSkill}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#4F8CFF] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3B78EB] transition-colors shadow-sm"
          >
            <Plus size={14} />
            <span>Add Skill</span>
          </button>
        </div>

        {/* Sortable List */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={current.skills.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {current.skills.map((skill, index) => (
                <SortableSkillRow
                  key={skill.id}
                  skill={skill}
                  onUpdate={(updated) => handleUpdateSkill(index, updated)}
                  onDelete={() => handleDeleteSkill(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </section>
  );
}
