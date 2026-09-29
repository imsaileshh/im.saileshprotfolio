'use client';
import Link from 'next/link';
import { Archive, CheckCheck, Mail, Reply, Search, Trash2 } from 'lucide-react';
import { ConfirmSubmitButton } from '@/components/dashboard/ConfirmSubmitButton';
import { bulkMessageAction } from '@/lib/dashboard/client-actions';
import { contactStatuses } from '@/lib/dashboard/presentation';
import type { loadPage } from './page-data';
const priorityLabels = ['Low', 'Normal', 'High', 'Urgent'];
function statusTone(status: string) {
  if (status === 'New') return 'border-sky-400/30 bg-sky-400/10 text-sky-200';
  if (status === 'Replied') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200';
  if (status === 'Archived') return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300';
  return 'border-amber-400/30 bg-amber-400/10 text-amber-200';
}
export default function DashboardMessagesPage({ parsed, data }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contact Messages</h1>
          <p className="text-sm text-zinc-400">Real inquiries submitted through the public contact API.</p>
        </div>
        <form className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              name="search"
              defaultValue={parsed.search}
              placeholder="Search name, email, subject"
              className="h-10 w-72 rounded-lg border border-white/10 bg-black/30 pl-9 pr-3 text-sm text-white outline-none focus:border-[#4F8CFF]"
            />
          </div>
          <select name="status" defaultValue={parsed.status ?? ''} className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white">
            <option value="">All status</option>
            {contactStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select name="priority" defaultValue={parsed.priority ?? ''} className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white">
            <option value="">All priority</option>
            {priorityLabels.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
          <select name="sort" defaultValue={parsed.sort} className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <button className="h-10 rounded-lg bg-[#4F8CFF] px-4 text-sm font-semibold text-white">Filter</button>
        </form>
      </header>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          ['Total', data.counts.total],
          ['New', data.counts.New],
          ['Read', data.counts.Read],
          ['Replied', data.counts.Replied],
          ['Archived', data.counts.Archived],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-white/10 bg-[#111113] p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </section>

      <form action={bulkMessageAction} className="rounded-lg border border-white/10 bg-[#111113]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
          <p className="text-sm font-medium text-white">Bulk select messages</p>
          <div className="flex flex-wrap gap-2">
            <button name="action" value="read" className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-xs text-zinc-200 hover:bg-white/10"><CheckCheck size={14} /> Mark read</button>
            <button name="action" value="replied" className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-xs text-zinc-200 hover:bg-white/10"><Reply size={14} /> Mark replied</button>
            <button name="action" value="archive" className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-xs text-zinc-200 hover:bg-white/10"><Archive size={14} /> Archive</button>
            <button name="action" value="restore" className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-xs text-zinc-200 hover:bg-white/10">Restore</button>
            <ConfirmSubmitButton name="action" value="delete" message="Delete selected messages?" className="inline-flex items-center gap-2 rounded border border-red-500/30 px-3 py-2 text-xs text-red-200 hover:bg-red-500/10"><Trash2 size={14} /> Delete</ConfirmSubmitButton>
          </div>
        </div>

        {data.messages.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Select</th>
                  <th className="px-4 py-3">Sender</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.messages.map((message) => (
                  <tr key={message.id} className="text-zinc-300">
                    <td className="px-4 py-3"><input name="ids" value={message.id} type="checkbox" className="h-4 w-4 rounded border-white/20 bg-black" /></td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{message.name}</p>
                      <p className="text-xs text-zinc-500">{message.email}</p>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3">{message.subject ?? 'No subject'}</td>
                    <td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-xs ${statusTone(message.status)}`}>{message.status}</span></td>
                    <td className="px-4 py-3">{message.priority}</td>
                    <td className="px-4 py-3">{message.createdAt.toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/dashboard/messages/${message.id}`} className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/10"><Mail size={14} /> Open</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-4 text-center">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <Mail className="h-8 w-8 text-[#4F8CFF]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">No messages yet</h2>
              <p className="mt-1 text-sm text-zinc-500">When people contact you through your portfolio, their messages will appear here.</p>
            </div>
          </div>
        )}
      </form>

      <footer className="flex items-center justify-between text-sm text-zinc-500">
        <span>Page {data.pagination.page} of {data.pagination.pageCount}</span>
        <div className="flex gap-2">
          <Link className="rounded border border-white/10 px-3 py-2 hover:bg-white/10" href={`/dashboard/messages?page=${Math.max(1, data.pagination.page - 1)}`}>Previous</Link>
          <Link className="rounded border border-white/10 px-3 py-2 hover:bg-white/10" href={`/dashboard/messages?page=${Math.min(data.pagination.pageCount, data.pagination.page + 1)}`}>Next</Link>
        </div>
      </footer>
    </main>
  );
}
