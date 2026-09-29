'use client';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ProjectTabs } from '@/components/dashboard/projects/ProjectTabs';
import { getProjectStatus } from '@/lib/dashboard/presentation';
import type { loadPage } from './page-data';

export default function ProjectLayout({ project, children }: Awaited<ReturnType<typeof loadPage>> & { children: React.ReactNode }) {
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <header className="flex flex-col gap-4 pt-2">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/projects" className="inline-flex items-center gap-1 rounded px-2 py-1 -ml-2 text-sm text-zinc-400 hover:bg-white/10 hover:text-white transition-colors">
            <ChevronLeft size={16} /> Projects
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-sm font-medium text-white truncate max-w-[200px]">{project.title}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">{project.title}</h1>
            <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest ${getProjectStatus({ published: project.published, archived: project.archived }) === 'Published' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {getProjectStatus({ published: project.published, archived: project.archived })}
            </span>
          </div>
        </div>

        <ProjectTabs projectId={project.id} />
      </header>

      {children}
    </div>
  );
}
