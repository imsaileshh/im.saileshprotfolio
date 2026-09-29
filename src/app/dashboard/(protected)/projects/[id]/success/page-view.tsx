'use client';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, FileText, ArrowLeft } from 'lucide-react';
import type { loadPage } from './page-data';

export default function ProjectSuccessPage({ project }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center space-y-8 text-center">
      <div className="flex flex-col items-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/10">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Project saved successfully</h1>
        <p className="mt-2 text-lg text-zinc-400">
          "{project.title}" has been saved as a {project.published ? 'published project' : 'draft'}.
        </p>
      </div>

      <div className="w-full max-w-md space-y-6 rounded-xl border border-white/10 bg-[#111113] p-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">What would you like to do next?</h2>
        
        <div className="flex flex-col gap-3">
          {project.projectType === 'Case Study' && (
            <Link 
              href={`/dashboard/projects/${project.id}/case-study`}
              className="group flex items-center justify-between rounded-lg border border-[#4F8CFF]/30 bg-[#4F8CFF]/10 p-4 text-[#4F8CFF] transition-colors hover:bg-[#4F8CFF]/20"
            >
              <div className="flex items-center gap-3">
                <FileText size={20} />
                <span className="font-semibold">Create Case Study</span>
              </div>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          )}

          <Link 
            href={`/projects/${project.slug}`}
            target="_blank"
            className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 text-zinc-300 transition-colors hover:bg-white/10"
          >
            <span className="font-medium">View Project</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>

          <Link 
            href={`/dashboard/projects/${project.id}/edit`}
            className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 text-zinc-300 transition-colors hover:bg-white/10"
          >
            <span className="font-medium">Edit Project</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>

          <Link 
            href="/dashboard/projects"
            className="group mt-4 flex items-center justify-center gap-2 rounded-lg py-2 text-sm text-zinc-500 hover:text-zinc-300"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Projects
          </Link>
        </div>
      </div>
    </main>
  );
}
