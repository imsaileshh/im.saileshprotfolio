'use client';

import React, { useState, useTransition } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import {
  toggleWorksCategoryBarAction,
  addWorksCategoryAction,
  renameWorksCategoryAction,
  deleteWorksCategoryAction,
} from '@/app/dashboard/(protected)/settings/works-category-actions';

interface WorksCategoriesManagerProps {
  initialCategories: string[];
  initialShowBar: boolean;
}

export function WorksCategoriesManager({
  initialCategories,
  initialShowBar,
}: WorksCategoriesManagerProps) {
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [showBar, setShowBar] = useState<boolean>(initialShowBar);
  const [newCatName, setNewCatName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Clear flash messages after a few seconds
  const flashSuccess = (msg: string) => {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 3500);
  };

  const flashError = (msg: string) => {
    setError(msg);
    setSuccess(null);
    setTimeout(() => setError(null), 4000);
  };

  // Toggle Bar Show / Hide
  const handleToggleBar = () => {
    const nextState = !showBar;
    setShowBar(nextState);
    startTransition(async () => {
      try {
        await toggleWorksCategoryBarAction(nextState);
        flashSuccess(nextState ? 'Category bar is now visible on Works page.' : 'Category bar is now hidden on Works page.');
      } catch (e: unknown) {
        setShowBar(!nextState);
        flashError(e instanceof Error ? e.message : 'Failed to update category bar setting.');
      }
    });
  };

  // Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCatName.trim();
    if (!clean) return;

    if (categories.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      flashError(`Category "${clean}" already exists.`);
      return;
    }

    startTransition(async () => {
      try {
        const res = await addWorksCategoryAction(clean);
        setCategories(res.categories);
        setNewCatName('');
        flashSuccess(`Added category "${clean}".`);
      } catch (e: unknown) {
        flashError(e instanceof Error ? e.message : 'Failed to add category.');
      }
    });
  };

  // Start Edit
  const handleStartEdit = (idx: number, name: string) => {
    setEditingIndex(idx);
    setEditingValue(name);
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  // Save Edit (Rename)
  const handleSaveEdit = (oldName: string) => {
    const clean = editingValue.trim();
    if (!clean || clean.toLowerCase() === oldName.toLowerCase()) {
      handleCancelEdit();
      return;
    }

    if (categories.some((c, idx) => idx !== editingIndex && c.toLowerCase() === clean.toLowerCase())) {
      flashError(`Category "${clean}" already exists.`);
      return;
    }

    startTransition(async () => {
      try {
        const res = await renameWorksCategoryAction(oldName, clean);
        setCategories(res.categories);
        setEditingIndex(null);
        setEditingValue('');
        flashSuccess(`Renamed "${oldName}" to "${clean}". All projects updated!`);
      } catch (e: unknown) {
        flashError(e instanceof Error ? e.message : 'Failed to rename category.');
      }
    });
  };

  // Delete Category
  const handleDeleteCategory = (name: string) => {
    if (name.toLowerCase() === 'all') {
      flashError('The "All" option cannot be deleted.');
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${name}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await deleteWorksCategoryAction(name);
        setCategories(res.categories);
        flashSuccess(`Deleted category "${name}".`);
      } catch (e: unknown) {
        flashError(e instanceof Error ? e.message : 'Failed to delete category.');
      }
    });
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111113] p-6 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent">
              <Layers size={18} />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Works Page Categories & Filter Bar</h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Control the category pill bar on <code className="text-zinc-300 font-mono text-xs">/works</code>, add new categories, or rename them across all projects.
          </p>
        </div>

        {/* Visibility Toggle Button */}
        <button
          type="button"
          onClick={handleToggleBar}
          disabled={isPending}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer shrink-0 ${
            showBar
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-zinc-800/80 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/80'
          }`}
        >
          {isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : showBar ? (
            <Eye size={15} />
          ) : (
            <EyeOff size={15} />
          )}
          <span>{showBar ? 'Category Bar: Visible' : 'Category Bar: Hidden'}</span>
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs sm:text-sm">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs sm:text-sm">
          <Check size={15} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add New Category Form */}
      <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="relative flex-1">
          <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="New category name (e.g. SaaS, Mobile Apps, Branding)..."
            disabled={isPending}
            className="w-full h-10 pl-10 pr-3 rounded-xl border border-white/10 bg-black/40 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#4F8CFF] transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isPending || !newCatName.trim()}
          className="inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-xl bg-[#4F8CFF] hover:bg-[#3B78EB] disabled:opacity-50 disabled:pointer-events-none text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer shrink-0"
        >
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={16} />}
          <span>Add Category</span>
        </button>
      </form>

      {/* Categories List */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
          Current Categories ({categories.length})
        </label>
        
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, idx) => {
            const isAll = cat.toLowerCase() === 'all';
            const isEditing = editingIndex === idx;

            return (
              <div
                key={cat}
                className="flex items-center justify-between gap-2 p-3 rounded-xl border border-white/10 bg-black/20 hover:border-white/20 transition-all group"
              >
                {isEditing ? (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveEdit(cat);
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      autoFocus
                      disabled={isPending}
                      className="h-8 w-full px-2.5 rounded-lg border border-[#4F8CFF] bg-black text-xs sm:text-sm text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(cat)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                      title="Save"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isPending}
                      className="p-1.5 rounded-lg bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`inline-block w-2 h-2 rounded-full ${isAll ? 'bg-accent' : 'bg-zinc-500'}`} />
                      <span className="text-xs sm:text-sm font-medium text-white truncate">
                        {cat}
                      </span>
                      {isAll && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-400">
                          Default
                        </span>
                      )}
                    </div>

                    {!isAll && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(idx, cat)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="Rename Category"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Preview Bar */}
      <div className="pt-2 border-t border-white/5 space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
          Works Page Bar Preview {showBar ? '' : '(Currently Hidden on Frontend)'}
        </span>
        <div className={`p-4 rounded-xl border border-white/5 bg-black/40 flex flex-wrap items-center justify-center gap-2 transition-opacity ${showBar ? 'opacity-100' : 'opacity-40 line-through'}`}>
          {categories.map((c, i) => (
            <span
              key={c}
              className={`px-3 py-1 rounded-full text-xs font-mono ${
                i === 0
                  ? 'bg-white text-black font-semibold'
                  : 'border border-white/10 text-zinc-400 bg-white/5'
              }`}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
