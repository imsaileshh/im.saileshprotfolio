import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Laptop } from 'lucide-react';
import { prisma } from '@/lib/database/prisma';
import { CaseStudyContent } from '@/components/case-study/CaseStudyContent';
import { PdfPagesViewer } from '@/components/case-study/PdfPagesViewerDynamic';
import { SteeGoCaseStudyContent } from '@/components/case-study/SteeGoCaseStudyContent';
import { ProjectDetailHeader } from '@/components/projects/ProjectDetailHeader';
import { LocalBackgroundOverride } from '@/components/theme/LocalBackgroundOverride';

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

  const cover = caseStudy.coverImage || caseStudy.project?.coverImageUrl || caseStudy.project?.images?.[0]?.url;
  const metadata = (caseStudy.metadata as any) || {};

  return (
    <>
    <main className="min-h-screen bg-[var(--bg)] relative">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8 lg:py-12 relative z-10">
        
        {/* ── 01. Case Study Header & Metadata ── */}
        <ProjectDetailHeader
          project={{
            id: caseStudy.id,
            title: caseStudy.title,
            slug: caseStudy.slug,
            description: caseStudy.description || caseStudy.project?.description || '',
            projectType: 'Case Study',
            category: metadata.category || caseStudy.project?.category || 'Product Design',
            year: metadata.year || caseStudy.project?.year || '2025',
            technologies: metadata.technologies || caseStudy.project?.technologies || ['Figma', 'React', 'Tailwind CSS'],
            liveUrl: metadata.liveUrl || caseStudy.project?.liveUrl,
            githubUrl: metadata.githubUrl || caseStudy.project?.githubUrl,
            figmaUrl: metadata.figmaUrl || null,
            role: metadata.role || caseStudy.project?.role || 'Lead Product Designer',
          }}
          backHref={caseStudy.project?.projectType === 'Personal Project' ? `/personal-projects/${caseStudy.project.slug}` : `/works/${caseStudy.project?.slug || ''}`}
          backLabel={caseStudy.project?.projectType === 'Personal Project' ? "Back to Project" : "Back to Work"}
          customGlowColor={caseStudy.useCustomBackground ? caseStudy.customBackground : (caseStudy.project?.useCustomBackground ? caseStudy.project?.customBackground : null)}
        />

        {/* ── 02. Cover Image ── */}
        {cover && (
          <div className="w-full max-w-[960px] mx-auto mb-14 rounded-2xl border border-border-subtle/80 bg-[var(--card)] p-1.5 shadow-sm">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black/5 dark:bg-black/50 border border-border-subtle/40">
              <Image
                src={cover}
                alt={caseStudy.title}
                fill
                className="object-contain sm:object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 1152px"
              />
            </div>
          </div>
        )}

        {/* ── 03. Complete Case Study Story & Content ── */}
        {caseStudy.sourceType === 'PDF' && caseStudy.sourcePdf ? (
          <div className="mt-12 pt-8 border-t border-border-subtle/60">
            <h2 className="text-xl font-display font-semibold text-foreground mb-6">Case Study Document</h2>
            <PdfPagesViewer url={caseStudy.sourcePdf} />
          </div>
        ) : caseStudy.slug === 'fndfgh-case-study' || caseStudy.slug === 'steego-case-study' ? (
          <div className="mt-12 pt-8 border-t border-border-subtle/60">
            <SteeGoCaseStudyContent caseStudy={caseStudy} />
          </div>
        ) : caseStudy.sections && caseStudy.sections.length > 0 ? (
          <div className="mt-12 pt-8 border-t border-border-subtle/60 relative z-0">
            <CaseStudyContent caseStudy={caseStudy} />
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-muted leading-relaxed">
            <p>{caseStudy.description}</p>
          </div>
        )}

      </div>
    </main>
    </>
  );
}
