'use client';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { ConfirmSubmitButton } from '@/components/dashboard/ConfirmSubmitButton';
import { deleteMessageAction, updateMessagePriorityAction, updateMessageStatusAction } from '@/lib/dashboard/client-actions';
import { contactStatuses } from '@/lib/dashboard/presentation';
import type { loadPage } from './page-data';
const priorityLabels = ['Low', 'Normal', 'High', 'Urgent'];
export default function DashboardMessageDetailPage({ id, message, previous, next }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link href="/dashboard/messages" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
            <ArrowLeft size={16} /> Back to messages
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">{message.subject ?? 'No subject'}</h1>
          <p className="mt-1 text-sm text-zinc-400">Opened messages marked as Read automatically.</p>
        </div>
        <nav className="flex gap-2 text-sm">
          {previous ? <Link href={`/dashboard/messages/${previous.id}`} className="rounded border border-white/10 px-3 py-2 text-zinc-200 hover:bg-white/10">Previous</Link> : <span className="rounded border border-white/10 px-3 py-2 text-zinc-600">Previous</span>}
          {next ? <Link href={`/dashboard/messages/${next.id}`} className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-zinc-200 hover:bg-white/10">Next <ArrowRight size={14} /></Link> : <span className="rounded border border-white/10 px-3 py-2 text-zinc-600">Next</span>}
        </nav>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <article className="rounded-lg border border-white/10 bg-[#111113] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Sender name</p>
              <p className="mt-1 text-white">{message.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Sender email</p>
              <a className="mt-1 block text-[#4F8CFF]" href={`mailto:${message.email}`}>{message.email}</a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Created date</p>
              <p className="mt-1 text-white">{message.createdAt.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Updated date</p>
              <p className="mt-1 text-white">{message.updatedAt.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Full message</p>
            <p className="mt-3 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-200">
              {message.message}
            </p>
          </div>
        </article>

        <aside className="space-y-4">
          <form action={updateMessageStatusAction} className="rounded-lg border border-white/10 bg-[#111113] p-5">
            <input type="hidden" name="id" value={message.id} />
            <label className="text-sm font-medium text-white" htmlFor="status">Current status</label>
            <select id="status" name="status" defaultValue={message.status} className="mt-3 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white">
              {contactStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <button className="mt-3 w-full rounded-lg bg-[#4F8CFF] px-4 py-2 text-sm font-semibold text-white">Change status</button>
          </form>

          <form action={updateMessagePriorityAction} className="rounded-lg border border-white/10 bg-[#111113] p-5">
            <input type="hidden" name="id" value={message.id} />
            <label className="text-sm font-medium text-white" htmlFor="priority">Priority</label>
            <select id="priority" name="priority" defaultValue={message.priority} className="mt-3 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white">
              {priorityLabels.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
            <button className="mt-3 w-full rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Change priority</button>
          </form>

          <form action={deleteMessageAction} className="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
            <input type="hidden" name="id" value={message.id} />
            <p className="text-sm text-red-100">Delete removes this message from the database.</p>
            <ConfirmSubmitButton message="Delete this message?" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white">
              <Trash2 size={15} /> Delete
            </ConfirmSubmitButton>
          </form>
        </aside>
      </section>
    </main>
  );
}
