import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';
import { CaseStudyPageShell } from '@/components/case-study/CaseStudyPageShell';
import { CaseStudyContent } from '@/components/case-study/CaseStudyContent';

export const revalidate = 30;

export default async function PublicCaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  const caseStudy = await prisma.caseStudy.findFirst({
    where: { 
      slug: resolvedParams.slug,
      status: 'PUBLISHED'
    },
    include: {
      sections: {
        orderBy: { order: 'asc' }
      },
      project: {
        include: {
          images: { orderBy: { order: 'asc' } }
        }
      }
    }
  });

  if (!caseStudy) notFound();

  const metadata = (caseStudy.metadata as any) || {};
  const year = metadata.year || caseStudy.project?.year || '2025';
  const backHref = caseStudy.project?.projectType === 'Personal Project'
    ? `/personal-projects/${caseStudy.project.slug}`
    : `/works/${caseStudy.project?.slug || ''}`;
  const backLabel = caseStudy.project?.projectType === 'Personal Project' ? "Back to Project" : "Back to Work";
  const customGlowColor = caseStudy.useCustomBackground
    ? caseStudy.customBackground
    : (caseStudy.project?.useCustomBackground ? caseStudy.project?.customBackground : null);

  return (
    <main className="min-h-screen bg-[var(--bg)] relative">
      <CaseStudyPageShell
        title={caseStudy.title}
        year={year}
        backHref={backHref}
        backLabel={backLabel}
        customGlowColor={customGlowColor}
        sections={caseStudy.sections || []}
      >
        <CaseStudyContent caseStudy={caseStudy as any} />
      </CaseStudyPageShell>
    </main>
  );
}
