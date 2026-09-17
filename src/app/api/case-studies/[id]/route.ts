import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { requireAdmin } from '@/lib/dashboard/auth';
import { caseStudyMutationSchema } from '@/lib/validation/schemas';
import { slugifyProject } from '@/lib/dashboard/projects';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id: resolvedParams.id },
      include: { sections: { orderBy: { order: 'asc' } } },
    });

    if (!caseStudy) return NextResponse.json({ error: 'Case Study not found' }, { status: 404 });

    return NextResponse.json(caseStudy);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch case study' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;

    const resolvedParams = await params;
    const payload = caseStudyMutationSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: 'Invalid case study payload', details: payload.error.flatten() }, { status: 400 });
    }

    const { projectId, sections, ...data } = payload.data;
    const slug = slugifyProject(data.slug);

    // Use a transaction to ensure we don't leave the case study in a broken state
    // if the update fails after deleting the old sections.
    const [, caseStudy] = await prisma.$transaction([
      prisma.caseStudySection.deleteMany({
        where: { caseStudyId: resolvedParams.id },
      }),
      prisma.caseStudy.update({
        where: { id: resolvedParams.id },
        data: {
          ...data,
          metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
          slug,
          projectId,
          publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
          sections: {
            create: sections.map((s, idx) => ({
              title: s.title,
              slug: slugifyProject(s.title),
              order: idx,
              content: s.content,
              images: s.images,
              metadata: s.metadata ? JSON.parse(JSON.stringify(s.metadata)) : undefined,
            })),
          },
        },
        include: { sections: { orderBy: { order: 'asc' } } },
      })
    ]);

    return NextResponse.json(caseStudy);
  } catch (error) {
    console.error('Failed to update case study:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to update case study: ${errorMessage}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;

    const resolvedParams = await params;
    await prisma.caseStudy.delete({ where: { id: resolvedParams.id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete case study:', error);
    return NextResponse.json({ error: 'Failed to delete case study' }, { status: 500 });
  }
}
