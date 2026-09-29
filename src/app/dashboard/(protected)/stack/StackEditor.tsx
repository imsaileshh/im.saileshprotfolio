'use client';

import { useState } from 'react';
import { addSectionAction, updateSectionAction, deleteSectionAction, addSkillAction, updateSkillAction, deleteSkillAction } from '@/lib/dashboard/client-actions';
import { ConfirmSubmitButton } from '@/components/dashboard/ConfirmSubmitButton';
import { Trash2, Plus, Edit2, EyeOff, Search, X } from 'lucide-react';
import { getTechLogo, TECH_LOGO_SLUGS } from '@/lib/stack/tech-logos';

const inputClass =
  'h-9 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF] placeholder-zinc-600';

// ─── MiniLogo ────────────────────────────────────────────────────────────────
// 20 × 20 logo preview used inside skill edit rows in the dashboard.

function MiniLogo({ slug }: { slug?: string | null }) {
  const [failed, setFailed] = useState(false);
  const entry = getTechLogo(slug);

  if (!entry || failed) {
    return (
      <div
        className="w-5 h-5 shrink-0 rounded bg-white/5 border border-white/10"
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      src={entry.url}
      alt=""
      width={20}
      height={20}
      aria-hidden="true"
      className="w-5 h-5 object-contain shrink-0"
      style={entry.filter ? { filter: entry.filter } : undefined}
      onError={() => setFailed(true)}
    />
  );
}

// ─── SkillRow ─────────────────────────────────────────────────────────────────
// Reusable form row for editing a single skill.
// Used in both the normal category view and the search-results view.

function SkillRow({ skill }: { skill: any }) {
  return (
    <form
      action={updateSkillAction}
      className="flex flex-wrap md:flex-nowrap items-center gap-2.5 rounded-lg border border-white/5 bg-black/20 p-3"
    >
      <input type="hidden" name="id" value={skill.id} />

      {/* Live logo preview — updates when the icon slug field is saved */}
      <MiniLogo slug={skill.icon} />

      <input
        name="name"
        defaultValue={skill.name}
        className={`${inputClass} w-32 shrink-0`}
        placeholder="Name"
      />
      <input
        name="type"
        defaultValue={skill.type || ''}
        className={`${inputClass} w-28 shrink-0`}
        placeholder="Type"
      />
      <input
        name="description"
        defaultValue={skill.description || ''}
        className={`${inputClass} flex-1 min-w-[120px]`}
        placeholder="Description"
      />
      {/* Logo slug field — autocomplete from TECH_LOGO_SLUGS datalist */}
      <input
        name="icon"
        defaultValue={skill.icon || ''}
        className={`${inputClass} w-28 shrink-0`}
        placeholder="Logo slug"
        list="tech-logo-slugs"
        autoComplete="off"
      />
      <input
        type="number"
        name="orderIndex"
        defaultValue={skill.orderIndex}
        className={`${inputClass} w-14 shrink-0`}
        placeholder="Ord"
        title="Order index"
      />
      <label className="flex items-center mx-1 cursor-pointer shrink-0" title="Visible">
        <input
          type="checkbox"
          name="visible"
          defaultChecked={skill.visible}
          className="h-4 w-4 rounded border-white/10 bg-black/30 accent-[#4F8CFF]"
        />
      </label>
      <button
        type="submit"
        className="text-[#4F8CFF] hover:text-[#3B78EB] p-1 shrink-0 transition-colors"
        title="Save changes"
      >
        <Edit2 size={15} />
      </button>
      <button
        formAction={deleteSkillAction}
        className="text-red-400/70 hover:text-red-400 p-1 shrink-0 transition-colors"
        title="Delete skill"
      >
        <Trash2 size={15} />
      </button>
    </form>
  );
}

// ─── StackEditor ──────────────────────────────────────────────────────────────

export function StackEditor({ sections }: { sections: any[] }) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    sections[0]?.id || null,
  );
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const isSearching = query.length > 0;

  // Search across all sections and skills
  const searchResults = isSearching
    ? sections
        .map(sec => ({
          section: sec,
          skills: (sec.skills as any[]).filter(
            sk =>
              sk.name.toLowerCase().includes(query) ||
              (sk.description ?? '').toLowerCase().includes(query) ||
              (sk.type ?? '').toLowerCase().includes(query) ||
              (sk.icon ?? '').toLowerCase().includes(query),
          ),
        }))
        .filter(r => r.skills.length > 0)
    : [];

  return (
    <div className="space-y-6">
      {/*
       * Datalist for logo slug autocomplete.
       * Linked via list="tech-logo-slugs" on all icon inputs.
       */}
      <datalist id="tech-logo-slugs">
        {TECH_LOGO_SLUGS.map(slug => (
          <option key={slug} value={slug} />
        ))}
      </datalist>

      {/* ── Search Bar ─────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search skills across all categories…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border border-white/10 bg-[#111113] pl-9 pr-9 text-sm text-white outline-none focus:border-[#4F8CFF] placeholder-zinc-600"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Search Results View ───────────────────────────────────────────── */}
      {isSearching ? (
        <div className="space-y-4">
          {searchResults.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-[#111113] p-10 text-center">
              <p className="text-sm text-zinc-500">
                No skills found for &ldquo;{search}&rdquo;
              </p>
            </div>
          ) : (
            searchResults.map(({ section, skills }) => (
              <div
                key={section.id}
                className="rounded-lg border border-white/10 bg-[#111113] overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    {section.title}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-600">
                    {skills.length} result{skills.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  {skills.map((skill: any) => (
                    <SkillRow key={skill.id} skill={skill} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* ── Normal UI (no active search) ──────────────────────────────────── */
        <div className="space-y-6">
          {/* Add New Category ─────────────────────────────────────────────── */}
          <section className="rounded-lg border border-white/10 bg-[#111113] p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Add Category
            </h2>
            <form action={addSectionAction} className="flex flex-wrap items-end gap-4">
              <label className="w-[200px]">
                <span className="mb-1.5 block text-sm text-zinc-400">Name</span>
                <input
                  required
                  name="title"
                  className={inputClass}
                  placeholder="e.g. AI & Automation"
                />
              </label>
              <label className="flex-1 min-w-[200px]">
                <span className="mb-1.5 block text-sm text-zinc-400">Description (optional)</span>
                <input
                  name="description"
                  className={inputClass}
                  placeholder="Short description…"
                />
              </label>
              <label className="w-20">
                <span className="mb-1.5 block text-sm text-zinc-400">Order</span>
                <input
                  type="number"
                  name="orderIndex"
                  defaultValue={sections.length}
                  className={inputClass}
                />
              </label>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  name="visible"
                  defaultChecked
                  className="h-4 w-4 rounded border-white/10 bg-black/30 accent-[#4F8CFF]"
                />
                <span className="text-sm text-zinc-400">Visible</span>
              </label>
              <button className="h-9 rounded-md bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20 transition-colors">
                + Add Category
              </button>
            </form>
          </section>

          {/* Category Tabs ────────────────────────────────────────────────── */}
          {sections.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-lg border border-white/10 bg-[#111113] p-2">
              {sections.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold tracking-wider transition-colors flex items-center gap-2 ${
                    activeSectionId === sec.id
                      ? 'bg-white/10 text-white'
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {!sec.visible && <EyeOff size={12} className="opacity-50" />}
                  {sec.title}
                  <span className="font-mono text-[10px] opacity-40">
                    {sec.skills.length}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Active Category Content ──────────────────────────────────────── */}
          {sections.map(sec => {
            if (sec.id !== activeSectionId) return null;
            return (
              <div
                key={sec.id}
                className="rounded-lg border border-white/10 bg-[#111113] overflow-hidden animate-in fade-in"
              >
                {/* Category Edit Header */}
                <div className="border-b border-white/10 bg-white/[0.02] p-6">
                  {/* Delete form — placed outside the update form to avoid nesting */}
                  <form
                    id={`delete-section-${sec.id}`}
                    action={deleteSectionAction}
                    className="hidden"
                  >
                    <input type="hidden" name="id" value={sec.id} />
                  </form>

                  <form
                    action={updateSectionAction}
                    className="flex flex-wrap items-end gap-4"
                  >
                    <input type="hidden" name="id" value={sec.id} />
                    <label className="w-[200px]">
                      <span className="mb-1 block text-xs text-zinc-500 uppercase tracking-wider">
                        Category Name
                      </span>
                      <input
                        name="title"
                        defaultValue={sec.title}
                        className={inputClass}
                      />
                    </label>
                    <label className="flex-1 min-w-[200px]">
                      <span className="mb-1 block text-xs text-zinc-500 uppercase tracking-wider">
                        Description
                      </span>
                      <input
                        name="description"
                        defaultValue={sec.description || ''}
                        className={inputClass}
                      />
                    </label>
                    <label className="w-16">
                      <span className="mb-1 block text-xs text-zinc-500 uppercase tracking-wider">
                        Order
                      </span>
                      <input
                        type="number"
                        name="orderIndex"
                        defaultValue={sec.orderIndex}
                        className={inputClass}
                      />
                    </label>
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        name="visible"
                        defaultChecked={sec.visible}
                        className="h-4 w-4 rounded border-white/10 bg-black/30 accent-[#4F8CFF]"
                      />
                      <span className="text-sm text-zinc-400">Visible</span>
                    </label>
                    <button
                      type="submit"
                      className="h-9 text-sm font-medium text-[#4F8CFF] hover:text-[#3B78EB] transition-colors"
                    >
                      Save
                    </button>
                    <div className="ml-auto mb-1">
                      {/* Links to the hidden delete form above via the form= attribute */}
                      <ConfirmSubmitButton
                        message="Delete this entire category and all its skills?"
                        form={`delete-section-${sec.id}`}
                        className="text-sm text-red-500 hover:text-red-400"
                      >
                        Delete Category
                      </ConfirmSubmitButton>
                    </div>
                  </form>
                </div>

                {/* Skills List */}
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-white mb-4">
                    Skills{' '}
                    <span className="font-mono text-xs text-zinc-600">
                      ({sec.skills.length})
                    </span>
                  </h3>

                  {sec.skills.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-white/10 rounded-lg mb-4">
                      <p className="text-sm text-zinc-500">
                        No skills yet. Add one below.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-6">
                      {(sec.skills as any[]).map(skill => (
                        <SkillRow key={skill.id} skill={skill} />
                      ))}
                    </div>
                  )}

                  {/* Add Skill ──────────────────────────────────────────── */}
                  <div className="border-t border-white/5 pt-5">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
                      Add Skill
                    </p>
                    <form
                      action={addSkillAction}
                      className="flex flex-wrap md:flex-nowrap items-center gap-2.5"
                    >
                      <input type="hidden" name="sectionId" value={sec.id} />
                      <input
                        required
                        name="name"
                        className={`${inputClass} w-32 shrink-0`}
                        placeholder="Name *"
                      />
                      <input
                        name="type"
                        className={`${inputClass} w-28 shrink-0`}
                        placeholder="Type"
                      />
                      <input
                        name="description"
                        className={`${inputClass} flex-1 min-w-[120px]`}
                        placeholder="Description"
                      />
                      {/* Logo slug — autocomplete from datalist */}
                      <input
                        name="icon"
                        className={`${inputClass} w-28 shrink-0`}
                        placeholder="Logo slug"
                        list="tech-logo-slugs"
                        autoComplete="off"
                      />
                      <input
                        type="number"
                        name="orderIndex"
                        defaultValue={sec.skills.length}
                        className={`${inputClass} w-14 shrink-0`}
                        title="Order index"
                      />
                      <label
                        className="flex items-center mx-1 cursor-pointer shrink-0"
                        title="Visible"
                      >
                        <input
                          type="checkbox"
                          name="visible"
                          defaultChecked
                          className="h-4 w-4 rounded border-white/10 bg-black/30 accent-[#4F8CFF]"
                        />
                      </label>
                      <button
                        type="submit"
                        className="flex h-9 shrink-0 items-center justify-center rounded-md bg-[#4F8CFF] px-4 text-sm font-medium text-white hover:bg-[#3B78EB] transition-colors"
                      >
                        <Plus size={15} className="mr-1" />
                        Add
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty state — no categories at all */}
          {sections.length === 0 && (
            <div className="rounded-lg border border-dashed border-white/10 bg-[#111113] p-12 text-center">
              <p className="text-sm text-zinc-400">
                No categories yet. Create one above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
