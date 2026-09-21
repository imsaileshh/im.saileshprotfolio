import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export const revalidate = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const caseStudy = await prisma.caseStudy.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImage: true,
        metadata: true,
        sourceType: true,
        sourcePdf: true,
        sections: {
          select: {
            id: true,
            title: true,
            slug: true,
            order: true,
            content: true,
            images: true,
            metadata: true,
          },
          orderBy: { order: 'asc' },
        },
        project: {
          select: {
            title: true,
            category: true,
            year: true,
            role: true,
            client: true,
            technologies: true,
            liveUrl: true,
            githubUrl: true,
            projectType: true,
            coverImageUrl: true,
            images: {
              where: { isCover: true },
              select: { url: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!caseStudy) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }

    const coverUrl =
      caseStudy.coverImage ||
      caseStudy.project?.images?.[0]?.url ||
      caseStudy.project?.coverImageUrl ||
      null;

    const meta = (caseStudy.metadata as Record<string, unknown>) || {};
    const role = (meta.role as string) || caseStudy.project?.role || 'Completed';
    const category = caseStudy.project?.category || (meta.category as string) || 'Case Studies';
    const year = caseStudy.project?.year || (meta.year as string) || '2025';
    const client = caseStudy.project?.client || (meta.client as string) || null;
    const technologies =
      (Array.isArray(meta.technologies) && meta.technologies.length > 0
        ? (meta.technologies as string[])
        : caseStudy.project?.technologies) || ['Figma', 'Photoshop'];
    const liveUrl = (meta.liveUrl as string) || caseStudy.project?.liveUrl || null;
    const githubUrl = (meta.githubUrl as string) || caseStudy.project?.githubUrl || null;

    return NextResponse.json({
      id: caseStudy.id,
      title: caseStudy.title,
      slug: caseStudy.slug,
      description: caseStudy.description || null,
      coverUrl,
      coverImage: coverUrl,
      category,
      year,
      role,
      client,
      technologies,
      liveUrl,
      githubUrl,
      sourceType: caseStudy.sourceType,
      sourcePdf: caseStudy.sourcePdf,
      metadata: {
        category,
        year,
        role,
        client,
        technologies,
        liveUrl,
        githubUrl,
        ...meta,
      },
      project: caseStudy.project
        ? {
            ...caseStudy.project,
            role,
            technologies,
            coverImageUrl: coverUrl,
          }
        : null,
      sections: caseStudy.sections,
      stats: Array.isArray(meta?.stats) ? meta.stats : [],
    });
  } catch (error) {
    console.error('[case-study preview]', error);
    return NextResponse.json({ error: 'Failed to load preview' }, { status: 500 });
  }
}
