import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { requireAdmin } from '@/lib/dashboard/auth';
import {
  deleteProjectRecord,
  duplicateProjectRecord,
  updateProjectRecord,
} from '@/lib/dashboard/projects';
import { projectMutationSchema } from '@/lib/validation/schemas';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const project = await prisma.project.findFirst({
      where: { id: resolvedParams.id, published: true, archived: false },
      include: { images: { orderBy: { order: 'asc' } } },
    });

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;

    const resolvedParams = await params;
    const payload = projectMutationSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: 'Invalid project payload', details: payload.error.flatten() }, { status: 400 });
    }

    const project = await updateProjectRecord(resolvedParams.id, payload.data);
    return NextResponse.json(project);
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;

    const resolvedParams = await params;
    const body = await request.json().catch(() => ({}));
    if (body.action !== 'duplicate') {
      return NextResponse.json({ error: 'Unsupported project action' }, { status: 400 });
    }

    const project = await duplicateProjectRecord(resolvedParams.id);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Failed to duplicate project:', error);
    return NextResponse.json({ error: 'Failed to duplicate project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;

    const resolvedParams = await params;
    await deleteProjectRecord(resolvedParams.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
