'use client';
import { ProjectForm } from '@/components/dashboard/projects/ProjectForm';
import { updateProjectAction } from '@/lib/dashboard/client-actions';
import type { loadPage } from './page-data';

export default function EditProjectPage({ project, categories }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6 pb-24">
      <ProjectForm project={project} action={updateProjectAction} submitLabel="Save Changes" isNew={false} categories={categories.map(c => c.name)} />
    </main>
  );
}
