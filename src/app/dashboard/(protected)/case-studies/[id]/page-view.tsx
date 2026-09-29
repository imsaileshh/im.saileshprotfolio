'use client';
import { AdvancedCaseStudyEditor } from '@/components/dashboard/case-studies/AdvancedCaseStudyEditor';
import type { loadPage } from './page-data';

export default function EditCaseStudyPage({ caseStudy }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <div className="-m-6 md:-m-10">
      <AdvancedCaseStudyEditor caseStudy={caseStudy} isNew={false} />
    </div>
  );
}
