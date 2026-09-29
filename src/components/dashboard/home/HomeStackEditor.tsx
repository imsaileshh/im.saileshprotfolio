'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { addSkillAction, updateSkillAction, deleteSkillAction, updateSectionAction } from '@/lib/dashboard/client-actions';
import type { StackSectionConfig } from '@/types/homepage-cms';

export interface SkillItem {
  id: string;
  name: string;
  type?: string | null;
  description?: string | null;
  icon?: string | null;
  visible: boolean;
  orderIndex: number;
}

export interface SkillSectionItem {
  id: string;
  title: string;
  description?: string | null;
  visible: boolean;
  orderIndex: number;
  skills: SkillItem[];
}

interface HomeStackEditorProps {
  stackConfig: StackSectionConfig;
  sections: SkillSectionItem[];
  onChange: (updated: StackSectionConfig) => void;
}

const inputClass =
  'h-9 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF]';

export function HomeStackEditor({
  stackConfig,
  sections,
  onChange,
}: HomeStackEditorProps) {
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(
    sections[0]?.id || null
  );
  const [newSkillName, setNewSkillName] = useState<{ [key: string]: string }>({});
  const [isPending, setIsPending] = useState(false);

  const updateField = <K extends keyof StackSectionConfig>(
    field: K,
    value: StackSectionConfig[K]
  ) => {
    onChange({
      ...stackConfig,
      [field]: value,
    });
  };

  const handleToggleSectionVisibility = async (section: SkillSectionItem) => {
    const fd = new FormData();
    fd.append('id', section.id);
    fd.append('title', section.title);
    fd.append('description', section.description || '');
    if (!section.visible) fd.append('visible', 'on');
    fd.append('orderIndex', section.orderIndex.toString());

    setIsPending(true);
    try {
      await updateSectionAction(fd);
    } finally {
      setIsPending(false);
    }
  };

  const handleToggleSkillVisibility = async (skill: SkillItem) => {
    const fd = new FormData();
    fd.append('id', skill.id);
    fd.append('name', skill.name);
    fd.append('type', skill.type || '');
    fd.append('description', skill.description || '');
    fd.append('icon', skill.icon || '');
    if (!skill.visible) fd.append('visible', 'on');
    fd.append('orderIndex', skill.orderIndex.toString());

    setIsPending(true);
    try {
      await updateSkillAction(fd);
    } finally {
      setIsPending(false);
    }
  };

  const handleAddSkill = async (sectionId: string) => {
    const name = newSkillName[sectionId]?.trim();
    if (!name) return;

    const fd = new FormData();
    fd.append('sectionId', sectionId);
    fd.append('name', name);
    fd.append('visible', 'on');

    setIsPending(true);
    try {
      await addSkillAction(fd);
      setNewSkillName((prev) => ({ ...prev, [sectionId]: '' }));
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm('Delete this technology?')) return;
    const fd = new FormData();
    fd.append('id', skillId);

    setIsPending(true);
    try {
      await deleteSkillAction(fd);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section id="stack" className="rounded-xl border border-white/10 bg-[#111113] p-6 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Tools &amp; Technologies Section</h2>
            <p className="text-xs text-zinc-400">
              Manage categorized skills and tech stack displayed on your public homepage.
            </p>
          </div>
        </div>

        {/* Section Visibility Switch */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/stack"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 transition-colors"
          >
            <span>Full Stack Manager</span>
            <ExternalLink size={13} />
          </Link>

          <button
            type="button"
            onClick={() => updateField('visible', !stackConfig.visible)}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors border ${
              stackConfig.visible
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-zinc-800 text-zinc-400 border-white/10 hover:bg-zinc-700'
            }`}
          >
            {stackConfig.visible ? (
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

      {/* Section Header Labels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Section Label
          </span>
          <input
            value={stackConfig.label}
            onChange={(e) => updateField('label', e.target.value)}
            className={inputClass}
            placeholder="STACK"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Section Heading
          </span>
          <input
            value={stackConfig.heading}
            onChange={(e) => updateField('heading', e.target.value)}
            className={inputClass}
            placeholder="Tools & Technologies"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Description
          </span>
          <input
            value={stackConfig.description}
            onChange={(e) => updateField('description', e.target.value)}
            className={inputClass}
            placeholder="Technologies I use to design, build and ship digital products."
          />
        </label>
      </div>

      {/* Categories & Technologies Accordion */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Stack Categories &amp; Skills ({sections.length} categories)
          </span>
          <span className="text-[11px] text-zinc-500">
            Toggle visibility per category or technology
          </span>
        </div>

        <div className="space-y-3">
          {sections.map((section) => {
            const isExpanded = expandedSectionId === section.id;
            const visibleSkillsCount = section.skills.filter((s) => s.visible).length;

            return (
              <div
                key={section.id}
                className="rounded-xl border border-white/10 bg-black/20 overflow-hidden"
              >
                {/* Category Header Row */}
                <div className="flex items-center justify-between p-3.5 bg-white/[0.02]">
                  <button
                    type="button"
                    onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
                    className="flex items-center gap-2.5 text-left min-w-0 flex-1"
                  >
                    {isExpanded ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
                    <div>
                      <span className="text-sm font-semibold text-white uppercase tracking-wider">
                        {section.title}
                      </span>
                      <span className="ml-2.5 text-xs text-zinc-500">
                        ({visibleSkillsCount} of {section.skills.length} visible)
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSectionVisibility(section)}
                      disabled={isPending}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                        section.visible
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-zinc-800 text-zinc-500 border-white/10'
                      }`}
                    >
                      {section.visible ? 'Category Visible' : 'Category Hidden'}
                    </button>
                  </div>
                </div>

                {/* Expanded Skills View */}
                {isExpanded && (
                  <div className="p-4 border-t border-white/5 space-y-3 bg-black/30">
                    {/* Skills Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {section.skills.map((skill) => (
                        <div
                          key={skill.id}
                          className={`flex items-center justify-between gap-2 rounded-lg border p-2 text-xs transition-colors ${
                            skill.visible
                              ? 'border-white/10 bg-white/5 text-white'
                              : 'border-white/5 bg-black/40 text-zinc-600 opacity-60'
                          }`}
                        >
                          <span className="font-medium truncate">{skill.name}</span>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleSkillVisibility(skill)}
                              disabled={isPending}
                              className={`p-1 rounded hover:bg-white/10 transition-colors ${
                                skill.visible ? 'text-emerald-400' : 'text-zinc-600'
                              }`}
                              title={skill.visible ? 'Hide on homepage' : 'Show on homepage'}
                            >
                              {skill.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSkill(skill.id)}
                              disabled={isPending}
                              className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete technology"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Add Skill Input */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <input
                        value={newSkillName[section.id] || ''}
                        onChange={(e) =>
                          setNewSkillName((prev) => ({
                            ...prev,
                            [section.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill(section.id);
                          }
                        }}
                        className={inputClass}
                        placeholder={`Add new technology to ${section.title}...`}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSkill(section.id)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-lg transition-colors shrink-0"
                      >
                        <Plus size={14} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
