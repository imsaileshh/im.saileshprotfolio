import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { requireAdmin } from '@/lib/dashboard/auth';
import { verifySession } from '@/lib/auth/session';
import {
  analyticsQuerySchema,
  dashboardDateRangeSchema,
  messageListQuerySchema,
  messageMutationSchema,
  messagePrioritySchema,
  messageStatusSchema,
  resumeCompareSchema,
  resumeCreateSchema,
  resumeExportSchema,
  resumeUpdateSchema,
  resumeUploadSchema,
  resumeVersionSchema,
  atsAnalyzeSchema,
  visitorListQuerySchema,
} from '@/lib/validation/schemas';
import {
  getDashboardAnalytics,
  getDashboardMessages,
  getDashboardVisitors,
  getConversionAnalytics,
  getDeviceAnalytics,
  getJourneys,
  getLiveVisitors,
  getPageAnalytics,
  getReferrerAnalytics,
  getScrollDepthAnalytics,
  getVisitorAnalytics,
  getVisitorDetail,
} from '@/lib/dashboard/data';
import { getDashboardOverview, resolveDashboardDateRange, type DashboardRangeKey } from '@/lib/dashboard/overview';
import { createResumeFromText, addResumeVersion, compareResumeVersions, restoreResumeVersion, analyzeAndStoreResume } from '@/lib/resume/store';
import { parseResumeSections, structuredDataFromSections, persistResumeUpload } from '@/lib/resume/processing';

function notFound(msg = 'Not found') {
  return NextResponse.json({ error: msg }, { status: 404 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await params;
  const [resource, id, action] = path;
  const url = new URL(request.url);

  if (!resource || resource === 'overview') {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
    const session = await verifySession(token);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const parsedRange = dashboardDateRangeSchema.safeParse({
      range: url.searchParams.get('range') ?? undefined,
      from: url.searchParams.get('from') ?? undefined,
      to: url.searchParams.get('to') ?? undefined,
    });
    if (!parsedRange.success) {
      return NextResponse.json({ error: 'Invalid dashboard date range', details: parsedRange.error.flatten() }, { status: 400 });
    }
    const dateRange = resolveDashboardDateRange(
      parsedRange.data.range as DashboardRangeKey, parsedRange.data.from, parsedRange.data.to,
    );
    try {
      return NextResponse.json(await getDashboardOverview(dateRange));
    } catch (error) {
      console.error('Dashboard API Error:', error);
      return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
  }

  if (resource === 'analytics') {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;
    const query = analyticsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!query.success) {
      return NextResponse.json({ error: 'Invalid analytics query', details: query.error.flatten() }, { status: 400 });
    }
    const { range, from, to } = query.data;
    if (!id) return NextResponse.json(await getDashboardAnalytics(range, from, to));
    if (id === 'conversions') return NextResponse.json(await getConversionAnalytics(range, from, to));
    if (id === 'devices') return NextResponse.json(await getDeviceAnalytics(range, from, to));
    if (id === 'pages') return NextResponse.json(await getPageAnalytics(query.data));
    if (id === 'referrers') return NextResponse.json(await getReferrerAnalytics(range, from, to));
    if (id === 'scroll-depth') return NextResponse.json(await getScrollDepthAnalytics(range, from, to));
    if (id === 'visitors') return NextResponse.json(await getVisitorAnalytics(range, from, to));
    return notFound();
  }

  if (resource === 'journeys') {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;
    const query = analyticsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!query.success) return NextResponse.json({ error: 'Invalid journey query' }, { status: 400 });
    return NextResponse.json(await getJourneys({
      range: query.data.range, from: query.data.from, to: query.data.to,
      device: url.searchParams.get('device') ?? undefined,
      eventType: url.searchParams.get('eventType') ?? undefined,
      converted: url.searchParams.has('converted') ? url.searchParams.get('converted') === 'true' : undefined,
    }));
  }

  if (resource === 'live') {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;
    return NextResponse.json(await getLiveVisitors());
  }

  if (resource === 'messages') {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;
    if (id) {
      const message = await prisma.contactMessage.findUnique({ where: { id } });
      if (!message) return NextResponse.json({ error: 'Message Not Found' }, { status: 404 });
      return NextResponse.json(message);
    }
    const query = messageListQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!query.success) {
      return NextResponse.json({ error: 'Invalid message query', details: query.error.flatten() }, { status: 400 });
    }
    return NextResponse.json(await getDashboardMessages(query.data));
  }

  if (resource === 'visitors') {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;
    if (id) {
      try {
        return NextResponse.json(await getVisitorDetail(id));
      } catch {
        return NextResponse.json({ error: 'Visitor Not Found' }, { status: 404 });
      }
    }
    const query = visitorListQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!query.success) {
      return NextResponse.json({ error: 'Invalid visitor query', details: query.error.flatten() }, { status: 400 });
    }
    return NextResponse.json(await getDashboardVisitors(query.data));
  }

  if (resource === 'resume') {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;

    if (!id) {
      const resumes = await prisma.resume.findMany({
        where: { status: { not: 'Deleted' } },
        orderBy: { updatedAt: 'desc' },
        include: {
          versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
          analyses: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });
      return NextResponse.json({ resumes });
    }

    if (action === 'ats') {
      const analyses = await prisma.resumeAnalysis.findMany({
        where: { resumeId: id },
        orderBy: { createdAt: 'desc' },
        include: {
          keywordAnalysis: { orderBy: [{ importance: 'asc' }, { keyword: 'asc' }] },
          suggestions: { orderBy: { createdAt: 'asc' } },
          jobDescription: true, version: true,
        },
      });
      return NextResponse.json({ analyses });
    }

    if (action === 'versions') {
      const versions = await prisma.resumeVersion.findMany({
        where: { resumeId: id }, orderBy: { versionNumber: 'desc' },
      });
      return NextResponse.json({ versions });
    }

    if (action === 'compare') {
      const payload = resumeCompareSchema.safeParse({
        versionAId: url.searchParams.get('versionAId'),
        versionBId: url.searchParams.get('versionBId'),
      });
      if (!payload.success) {
        return NextResponse.json({ error: 'Invalid comparison request', details: payload.error.flatten() }, { status: 400 });
      }
      const comparison = await compareResumeVersions(id, payload.data.versionAId, payload.data.versionBId);
      if (!comparison) return NextResponse.json({ error: 'Resume versions not found' }, { status: 404 });
      return NextResponse.json({ comparison });
    }

    if (action === 'export') {
      const format = url.searchParams.get('format') === 'json' ? 'json' : 'txt';
      const versionId = url.searchParams.get('versionId') ?? undefined;
      return exportResume(id, versionId, format);
    }

    if (!action) {
      const resume = await prisma.resume.findUnique({
        where: { id },
        include: {
          versions: { orderBy: { versionNumber: 'desc' } },
          sections: { orderBy: { orderIndex: 'asc' } },
          skills: { orderBy: { name: 'asc' } },
          analyses: {
            orderBy: { createdAt: 'desc' },
            include: { keywordAnalysis: true, suggestions: true, jobDescription: true },
          },
        },
      });
      if (!resume || resume.status === 'Deleted') {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }
      return NextResponse.json(resume);
    }

    return notFound();
  }

  return notFound();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await params;
  const [resource, id, action, subAction] = path;

  if (resource === 'resume') {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;

    if (!id) {
      const payload = resumeCreateSchema.safeParse(await request.json());
      if (!payload.success) {
        return NextResponse.json({ error: 'Invalid resume content', details: payload.error.flatten() }, { status: 400 });
      }
      const created = await createResumeFromText({
        name: payload.data.name, fileName: payload.data.fileName, contentText: payload.data.contentText,
      });
      return NextResponse.json(created, { status: 201 });
    }

    if (action === 'versions') {
      const payload = resumeVersionSchema.safeParse(await request.json());
      if (!payload.success) {
        return NextResponse.json({ error: 'Invalid resume version', details: payload.error.flatten() }, { status: 400 });
      }
      const resume = await prisma.resume.findUnique({ where: { id } });
      if (!resume || resume.status === 'Deleted') return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      const version = await addResumeVersion({
        resumeId: id, name: payload.data.name ?? resume.name ?? 'Edited resume',
        changeSummary: payload.data.changeSummary ?? 'Edited resume content',
        contentText: payload.data.contentText,
      });
      return NextResponse.json({ version }, { status: 201 });
    }

    if (action === 'upload') {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!(file instanceof File)) return NextResponse.json({ error: 'Resume file is required' }, { status: 400 });
      const uploadMeta = resumeUploadSchema.safeParse({
        name: formData.get('name') ? String(formData.get('name')) : undefined,
        fileName: file.name, fileType: file.type, fileSize: file.size,
      });
      if (!uploadMeta.success) {
        return NextResponse.json({ error: 'Invalid resume upload', details: uploadMeta.error.flatten() }, { status: 400 });
      }
      const resume = await prisma.resume.findUnique({ where: { id } });
      if (!resume || resume.status === 'Deleted') return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      const saved = await persistResumeUpload(file, id);
      const version = await addResumeVersion({
        resumeId: id, name: uploadMeta.data.name ?? resume.name ?? saved.fileName,
        fileName: saved.fileName, fileType: saved.fileType, filePath: saved.filePath,
        contentText: saved.text, changeSummary: 'Uploaded resume file',
      });
      return NextResponse.json({ version }, { status: 201 });
    }

    if (action === 'parse') {
      const resume = await prisma.resume.findUnique({ where: { id } });
      if (!resume || resume.status === 'Deleted') return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      const text = resume.parsedText ?? resume.originalText ?? '';
      if (!text.trim()) return NextResponse.json({ error: 'No resume text available to parse' }, { status: 422 });
      const sections = parseResumeSections(text);
      const structuredData = structuredDataFromSections(sections);
      await prisma.$transaction(async (tx) => {
        await tx.resumeSection.deleteMany({ where: { resumeId: id } });
        await tx.resumeSkill.deleteMany({ where: { resumeId: id } });
        await tx.resumeSection.createMany({
          data: sections.map((section) => ({
            resumeId: id, sectionType: section.sectionType, title: section.title,
            content: section.content, orderIndex: section.orderIndex,
          })),
        });
        if (structuredData.skills.length) {
          await tx.resumeSkill.createMany({
            data: structuredData.skills.map((skill) => ({
              resumeId: id, name: skill, category: 'Extracted', source: 'resume_text',
            })),
            skipDuplicates: true,
          });
        }
      });
      return NextResponse.json({ sections, structuredData });
    }

    if (action === 'export') {
      const payload = resumeExportSchema.safeParse(await request.json());
      if (!payload.success) {
        return NextResponse.json({ error: 'Invalid resume export request', details: payload.error.flatten() }, { status: 400 });
      }
      return exportResume(id, payload.data.versionId, payload.data.format);
    }

    if (action === 'restore') {
      const body = await request.json();
      const versionId = typeof body.versionId === 'string' ? body.versionId : '';
      if (!versionId) return NextResponse.json({ error: 'versionId is required' }, { status: 400 });
      const resume = await restoreResumeVersion(id, versionId);
      if (!resume) return NextResponse.json({ error: 'Resume version not found' }, { status: 404 });
      return NextResponse.json({ resume });
    }

    if (action === 'job-match') {
      const payload = atsAnalyzeSchema.safeParse(await request.json());
      if (!payload.success) {
        return NextResponse.json({ error: 'Invalid job match request', details: payload.error.flatten() }, { status: 400 });
      }
      const analysis = await analyzeAndStoreResume({
        resumeId: id, versionId: payload.data.versionId, jobDescription: payload.data.jobDescription,
      });
      if (!analysis) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      return NextResponse.json({ analysis }, { status: 201 });
    }

    if (action === 'ats' && subAction === 'analyze') {
      const payload = atsAnalyzeSchema.safeParse(await request.json());
      if (!payload.success) {
        return NextResponse.json({ error: 'Invalid ATS analysis request', details: payload.error.flatten() }, { status: 400 });
      }
      const analysis = await analyzeAndStoreResume({
        resumeId: id, versionId: payload.data.versionId, jobDescription: payload.data.jobDescription,
      });
      if (!analysis) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      return NextResponse.json({ analysis }, { status: 201 });
    }
  }

  return notFound();
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await params;
  const [resource, id] = path;

  if (resource === 'messages') {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;

    if (id) {
      const body = await request.json();
      const status = body.status === undefined ? undefined : messageStatusSchema.parse(body.status);
      const priority = body.priority === undefined ? undefined : messagePrioritySchema.parse(body.priority);
      const message = await prisma.contactMessage.update({
        where: { id },
        data: {
          ...(status ? { status, isRead: status !== 'New', isArchived: status === 'Archived' } : {}),
          ...(priority ? { priority } : {}),
        },
      });
      return NextResponse.json(message);
    }

    const payload = messageMutationSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: 'Invalid message update', details: payload.error.flatten() }, { status: 400 });
    }
    const data = {
      ...(payload.data.status ? { status: payload.data.status, isRead: payload.data.status !== 'New', isArchived: payload.data.status === 'Archived' } : {}),
      ...(payload.data.priority ? { priority: payload.data.priority } : {}),
    };
    const updated = await prisma.contactMessage.updateMany({ where: { id: { in: payload.data.ids } }, data });
    return NextResponse.json({ success: true, updated: updated.count });
  }

  if (resource === 'resume' && id) {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;
    const payload = resumeUpdateSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: 'Invalid resume update', details: payload.error.flatten() }, { status: 400 });
    }
    const resume = await prisma.resume.update({ where: { id }, data: payload.data });
    return NextResponse.json(resume);
  }

  return notFound();
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await params;
  const [resource, id] = path;
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  if (resource === 'messages') {
    if (id) {
      await prisma.contactMessage.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }
    const payload = messageMutationSchema.pick({ ids: true }).safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: 'Invalid message delete', details: payload.error.flatten() }, { status: 400 });
    }
    const deleted = await prisma.contactMessage.deleteMany({ where: { id: { in: payload.data.ids } } });
    return NextResponse.json({ success: true, deleted: deleted.count });
  }

  if (resource === 'resume' && id) {
    await prisma.resume.update({ where: { id }, data: { status: 'Deleted', isActive: false } });
    return NextResponse.json({ success: true });
  }

  return notFound();
}

async function exportResume(id: string, versionId: string | undefined, format: 'txt' | 'json') {
  const resume = await prisma.resume.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: 'desc' } } },
  });
  if (!resume || resume.status === 'Deleted') {
    return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
  }
  const version = versionId
    ? resume.versions.find((item) => item.id === versionId)
    : resume.versions.find((item) => item.id === resume.activeVersionId) ?? resume.versions[0];
  if (!version) return NextResponse.json({ error: 'Resume version not found' }, { status: 404 });
  if (format === 'json') return NextResponse.json({ resume, version });
  return new NextResponse(version.contentText, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${(version.fileName ?? resume.fileName ?? 'resume').replace(/\.[^.]+$/, '')}.txt"`,
    },
  });
}