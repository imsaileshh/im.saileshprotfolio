'use client';

import { useActionState, useEffect } from 'react';
import { saveEducationAction } from '@/lib/dashboard/client-actions';
import type { ActionState } from './actions';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { Education } from '@prisma/client';

export function EducationForm({ 
  initialData, 
  onSuccess 
}: { 
  initialData?: Education | null,
  onSuccess?: () => void
}) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    saveEducationAction,
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
          <span className="mb-1.5 block text-sm text-zinc-400">Institution</span>
          <input required name="institution" defaultValue={initialData?.institution} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" placeholder="e.g. University of Technology" />
        </label>
        <label className="flex-1 min-w-[200px]">
          <span className="mb-1.5 block text-sm text-zinc-400">Degree</span>
          <input required name="degree" defaultValue={initialData?.degree} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" placeholder="e.g. B.S. Computer Science" />
        </label>
        <label className="w-40">
          <span className="mb-1.5 block text-sm text-zinc-400">Start Date</span>
          <input required type="date" name="startDate" defaultValue={initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : ''} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" />
        </label>
        <label className="w-40">
          <span className="mb-1.5 block text-sm text-zinc-400">End Date</span>
          <input type="date" name="endDate" defaultValue={initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : ''} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" />
        </label>
        <label className="w-24">
          <span className="mb-1.5 block text-sm text-zinc-400">Order</span>
          <input type="number" name="orderIndex" defaultValue={initialData?.orderIndex ?? 0} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" />
        </label>
      </div>
      <label>
        <span className="mb-1.5 block text-sm text-zinc-400">Description (Optional)</span>
        <textarea name="description" defaultValue={initialData?.description || ''} className="min-h-24 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-[#4F8CFF]" placeholder="Graduated with honors..." />
      </label>
      <div className="flex justify-end mt-2">
        <button disabled={isPending} className="flex items-center gap-2 h-10 rounded-lg bg-[#4F8CFF] px-6 text-sm font-semibold text-white hover:bg-[#3B78EB] transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {initialData ? 'Save Changes' : 'Add Education'}
        </button>
      </div>
    </form>
  );
}
