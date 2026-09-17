import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { requireAdmin } from '@/lib/dashboard/auth';
import { caseStudyMutationSchema } from '@/lib/validation/schemas';
import { slugifyProject } from '@/lib/dashboard/projects';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;

    const payload = caseStudyMutationSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: 'Invalid case study payload', details: payload.error.flatten() }, { status: 400 });
    }

    const { projectId, sections, ...data } = payload.data;
    const slug = slugifyProject(data.slug);

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const caseStudy = await prisma.caseStudy.create({
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
    });

    return NextResponse.json(caseStudy, { status: 201 });
  } catch (error) {
    console.error('Failed to create case study:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to create case study: ${errorMessage}` }, { status: 500 });
  }
}
