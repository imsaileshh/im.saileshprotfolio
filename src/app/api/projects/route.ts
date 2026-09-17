import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { requireAdmin } from '@/lib/dashboard/auth';
import { createProjectRecord, getDashboardProjects } from '@/lib/dashboard/projects';
import { projectListQuerySchema, projectMutationSchema } from '@/lib/validation/schemas';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const dashboardQuery = url.searchParams.get('dashboard') === 'true';

    if (dashboardQuery) {
      const auth = await requireAdmin(request);
      if (!auth.authorized) return auth.response;

      const query = projectListQuerySchema.safeParse(Object.fromEntries(url.searchParams));
      if (!query.success) {
        return NextResponse.json({ error: 'Invalid project query', details: query.error.flatten() }, { status: 400 });
      }

      return NextResponse.json(await getDashboardProjects(query.data));
    }

    const projects = await prisma.project.findMany({
      where: { published: true, archived: false },
      include: { images: { orderBy: { order: 'asc' } } },
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;

    const payload = projectMutationSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: 'Invalid project payload', details: payload.error.flatten() }, { status: 400 });
    }

    const project = await createProjectRecord(payload.data);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
