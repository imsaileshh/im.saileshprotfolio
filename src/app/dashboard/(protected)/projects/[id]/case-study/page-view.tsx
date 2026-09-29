'use client';
import { CaseStudyEditor } from './CaseStudyEditor';
import type { loadPage } from './page-data';

export default function CaseStudyPage({ project }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6">
      <CaseStudyEditor project={project} initialCaseStudy={project.caseStudy} />
    </main>
  );
}
