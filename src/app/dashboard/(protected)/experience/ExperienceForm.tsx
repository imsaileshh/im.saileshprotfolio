'use client';

import { useState, useActionState, useEffect } from 'react';
import { saveExperienceAction } from '@/lib/dashboard/client-actions';
import type { ActionState } from './actions';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { Experience } from '@prisma/client';

export function ExperienceForm({ 
  initialData, 
  onSuccess 
}: { 
  initialData?: Experience | null,
  onSuccess?: () => void
}) {
  const [isCurrent, setIsCurrent] = useState(initialData?.current ?? false);
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    saveExperienceAction,
    { success: false }
  );

  useEffect(() => {
    if (state.success && onSuccess) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={action} className="flex flex-col gap-4">
      {initialData && <input type="hidden" name="id" value={initialData.id} />}

      {state.success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-500 border border-emerald-500/20">
          <CheckCircle2 size={16} />
          {state.message || 'Saved successfully!'}
        </div>
      )}
      {state.error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
          <AlertCircle size={16} />
          {state.error}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex-1 min-w-[200px]">
          <span className="mb-1.5 block text-sm text-zinc-400">Company</span>
          <input required name="company" defaultValue={initialData?.company} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" placeholder="e.g. Acme Corp" />
        </label>
        
        <label className="flex-1 min-w-[200px]">
          <span className="mb-1.5 block text-sm text-zinc-400">Position / Role</span>
          <input required name="role" defaultValue={initialData?.role} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" placeholder="e.g. Senior Developer" />
        </label>

        <label className="flex-1 min-w-[150px]">
          <span className="mb-1.5 block text-sm text-zinc-400">Employment Type</span>
          <select name="employmentType" defaultValue={initialData?.employmentType || ''} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF] appearance-none cursor-pointer">
            <option value="">Select type...</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
            <option value="Internship">Internship</option>
          </select>
        </label>

        <label className="flex-1 min-w-[150px]">
          <span className="mb-1.5 block text-sm text-zinc-400">Location</span>
          <input name="location" defaultValue={initialData?.location || ''} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" placeholder="e.g. Remote" />
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <label className="w-40">
          <span className="mb-1.5 block text-sm text-zinc-400">Start Date</span>
          <input required type="date" name="startDate" defaultValue={initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : ''} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" />
        </label>

        <label className="w-40">
          <span className="mb-1.5 block text-sm text-zinc-400">End Date</span>
          <input type="date" name="endDate" disabled={isCurrent} defaultValue={initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : ''} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF] disabled:opacity-50 disabled:cursor-not-allowed" />
        </label>

        <label className="flex items-center gap-2 text-sm text-zinc-300 pb-2 h-10 px-2 cursor-pointer">
          <input type="checkbox" name="current" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-black cursor-pointer" />
          Current Position
        </label>

        <label className="flex-1 min-w-[200px]">
          <span className="mb-1.5 block text-sm text-zinc-400">Skills / Technologies (comma separated)</span>
          <input name="technologies" defaultValue={initialData?.technologies?.join(', ')} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" placeholder="React, TypeScript, Figma" />
        </label>

        <label className="w-24 ml-auto">
          <span className="mb-1.5 block text-sm text-zinc-400">Order</span>
          <input type="number" name="orderIndex" defaultValue={initialData?.orderIndex ?? 0} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" />
        </label>
      </div>

      <label>
        <span className="mb-1.5 block text-sm text-zinc-400">Description (One point per line)</span>
        <textarea name="description" defaultValue={initialData?.description?.join('\n')} className="min-h-24 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-[#4F8CFF]" placeholder="Built the main dashboard...&#10;Improved performance by 50%..." />
      </label>

      <div className="flex justify-end mt-2">
        <button disabled={isPending} className="flex items-center gap-2 h-10 rounded-lg bg-[#4F8CFF] px-6 text-sm font-semibold text-white hover:bg-[#3B78EB] transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {initialData ? 'Save Changes' : 'Add Experience'}
        </button>
      </div>
    </form>
  );
}
