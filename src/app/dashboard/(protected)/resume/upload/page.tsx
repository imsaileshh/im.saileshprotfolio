'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Upload } from 'lucide-react';
import { createTextResumeAction, uploadResumeAction } from '@/lib/dashboard/client-actions';

export default function ResumeUploadPage() {
  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <Link href="/dashboard/resume" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
            <ArrowLeft size={16} /> Resume CMS
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Add Resume</h1>
          <p className="mt-1 text-sm text-zinc-400">Upload PDF/DOCX for extraction or paste a text version directly.</p>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-2">
        <form action={uploadResumeAction} className="space-y-4 rounded-lg border border-white/10 bg-[#111113] p-5">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-[#4F8CFF]" />
            <h2 className="text-lg font-semibold text-white">Upload file</h2>
          </div>
          <label className="block text-sm">
            <span className="mb-2 block text-zinc-400">Display name</span>
            <input name="name" className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" placeholder="Frontend resume" />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-zinc-400">PDF or DOCX</span>
            <input name="file" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required className="block w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-300 file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white" />
          </label>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#4F8CFF] px-4 text-sm font-semibold text-white hover:bg-[#3d78e5]">
            <Upload size={16} /> Upload and parse
          </button>
        </form>

        <form action={createTextResumeAction} className="space-y-4 rounded-lg border border-white/10 bg-[#111113] p-5">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-emerald-300" />
            <h2 className="text-lg font-semibold text-white">Paste text</h2>
          </div>
          <label className="block text-sm">
            <span className="mb-2 block text-zinc-400">Display name</span>
            <input name="name" className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" placeholder="ATS focused frontend resume" />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-zinc-400">Resume text</span>
            <textarea name="contentText" required rows={16} className="w-full resize-y rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm leading-6 text-white outline-none focus:border-[#4F8CFF]" placeholder="Paste the full resume text with headings such as Summary, Skills, Experience, Projects, and Education." />
          </label>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-semibold text-white hover:bg-white/10">
            <FileText size={16} /> Create text resume
          </button>
        </form>
      </section>
    </main>
  );
}
