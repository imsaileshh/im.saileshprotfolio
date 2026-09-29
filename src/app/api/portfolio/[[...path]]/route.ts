import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { requireAdmin } from '@/lib/dashboard/auth';
import { verifySession } from '@/lib/auth/session';
import {
  caseStudyMutationSchema,
  projectListQuerySchema,
  projectMutationSchema,
} from '@/lib/validation/schemas';
import {
  createProjectRecord,
  deleteProjectRecord,
  duplicateProjectRecord,
  getDashboardProjects,
  slugifyProject,
  updateProjectRecord,
} from '@/lib/dashboard/projects';
import { analyzeCaseStudyPdf } from '@/lib/ai/gemini';
import { uploadPersistentFile } from '@/lib/storage/storage';
import { revalidatePath } from 'next/cache';

// Routes handled by this catch-all (URLs preserved for backward compat):
//   GET  /api/portfolio/projects                  -> public projects list
//   POST /api/portfolio/projects                  -> create project (admin)
//   GET  /api/portfolio/projects/:id              -> single project
//   PATCH /api/portfolio/projects/:id             -> update project (admin)
//   POST /api/portfolio/projects/:id              -> duplicate project (admin)
//   DELETE /api/portfolio/projects/:id            -> delete project (admin)
//   POST /api/portfolio/case-studies              -> create case study (admin)
//   GET  /api/portfolio/case-studies/:id          -> get case study
//   PATCH /api/portfolio/case-studies/:id         -> update case study (admin)
//   DELETE /api/portfolio/case-studies/:id        -> delete case study (admin)
//   POST /api/portfolio/case-studies/upload       -> upload PDF (admin)
//   GET  /api/portfolio/case-studies/preview/:slug -> public preview
//   GET  /api/portfolio/education                 -> list education
//   POST /api/portfolio/education                 -> create education (admin)
//   GET  /api/portfolio/experience                -> list experience
//   POST /api/portfolio/experience                -> create experience (admin)
//   GET  /api/portfolio/skills                    -> list skills
//   POST /api/portfolio/skills                    -> create skill (admin)

function notFound(msg = 'Not found') {
  return NextResponse.json({ error: msg }, { status: 404 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await params;
  const [resource, idOrAction, ...rest] = path;

  if (resource === 'projects') {
    if (!idOrAction) {
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
    try {
      const project = await prisma.project.findFirst({
        where: { id: idOrAction, published: true, archived: false },
        include: { images: { orderBy: { order: 'asc' } } },
      });
      if (!project) return notFound('Project not found');
      return NextResponse.json(project);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
    }
  }

  if (resource === 'case-studies') {
    if (idOrAction === 'preview' && rest[0]) {
      const slug = rest[0];
      try {
        const caseStudy = await prisma.caseStudy.findFirst({
          where: { slug, status: 'PUBLISHED' },
          select: {
            id: true, title: true, slug: true, description: true, coverImage: true,
            metadata: true, sourceType: true, sourcePdf: true,
            sections: {
              select: { id: true, title: true, slug: true, order: true, content: true, images: true, metadata: true },
              orderBy: { order: 'asc' },
            },
            project: {
              select: {
                title: true, category: true, year: true, role: true, client: true,
                technologies: true, liveUrl: true, githubUrl: true, projectType: true,
                coverImageUrl: true,
                images: { where: { isCover: true }, select: { url: true }, take: 1 },
              },
            },
          },
        });
        if (!caseStudy) return notFound('Case study not found');

        const coverUrl = caseStudy.coverImage || caseStudy.project?.images?.[0]?.url || caseStudy.project?.coverImageUrl || null;
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
          id: caseStudy.id, title: caseStudy.title, slug: caseStudy.slug,
          description: caseStudy.description || null, coverUrl, coverImage: coverUrl,
          category, year, role, client, technologies, liveUrl, githubUrl,
          sourceType: caseStudy.sourceType, sourcePdf: caseStudy.sourcePdf,
          metadata: { category, year, role, client, technologies, liveUrl, githubUrl, ...meta },
          project: caseStudy.project ? { ...caseStudy.project, role, technologies, coverImageUrl: coverUrl } : null,
          sections: caseStudy.sections,
          stats: Array.isArray(meta?.stats) ? meta.stats : [],
        });
      } catch (error) {
        console.error('[case-study preview]', error);
        return NextResponse.json({ error: 'Failed to load preview' }, { status: 500 });
      }
    }

    if (idOrAction) {
      try {
        const caseStudy = await prisma.caseStudy.findUnique({
          where: { id: idOrAction },
          include: { sections: { orderBy: { order: 'asc' } } },
        });
        if (!caseStudy) return notFound('Case Study not found');
        return NextResponse.json(caseStudy);
      } catch {
        return NextResponse.json({ error: 'Failed to fetch case study' }, { status: 500 });
      }
    }
  }

  if (resource === 'education') {
    try {
      return NextResponse.json(await prisma.education.findMany({ orderBy: { startDate: 'desc' } }));
    } catch {
      return NextResponse.json({ error: 'Failed to fetch education' }, { status: 500 });
    }
  }

  if (resource === 'experience') {
    try {
      return NextResponse.json(await prisma.experience.findMany({ orderBy: { orderIndex: 'asc' } }));
    } catch {
      return NextResponse.json({ error: 'Failed to fetch experience' }, { status: 500 });
    }
  }

  if (resource === 'skills') {
    try {
      return NextResponse.json(
        await prisma.skill.findMany({ orderBy: { orderIndex: 'asc' }, include: { section: true } }),
      );
    } catch {
      return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
    }
  }

  return notFound();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await params;
  const [resource, idOrAction] = path;

  if (resource === 'projects') {
    if (!idOrAction) {
      const auth = await requireAdmin(request);
      if (!auth.authorized) return auth.response;
      const payload = projectMutationSchema.safeParse(await request.json());
      if (!payload.success) {
        return NextResponse.json({ error: 'Invalid project payload', details: payload.error.flatten() }, { status: 400 });
      }
      try {
        return NextResponse.json(await createProjectRecord(payload.data), { status: 201 });
      } catch (error) {
        console.error('Failed to create project:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
      }
    }
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;
    const body = await request.json().catch(() => ({}));
    if (body.action !== 'duplicate') {
      return NextResponse.json({ error: 'Unsupported project action' }, { status: 400 });
    }
    try {
      return NextResponse.json(await duplicateProjectRecord(idOrAction), { status: 201 });
    } catch (error) {
      console.error('Failed to duplicate project:', error);
      return NextResponse.json({ error: 'Failed to duplicate project' }, { status: 500 });
    }
  }

  if (resource === 'case-studies') {
    if (idOrAction === 'upload') {
      const auth = await requireAdmin(request);
      if (!auth.authorized) return auth.response;
      try {
        const formData = await request.formData();
        const file = formData.get('pdf') as File | null;
        if (!file) return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
        }
        if (file.size > 20 * 1024 * 1024) {
          return NextResponse.json({ error: 'PDF file is too large. Maximum size is 20MB.' }, { status: 400 });
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploaded = await uploadPersistentFile({ buffer, fileName: file.name, contentType: 'application/pdf', folder: 'case-studies' });
        const pdfUrl = uploaded.url;
        let parsedTitle = file.name.replace('.pdf', '');
        let geminiResponse: any = null;
        let errorMessage = "Couldn't automatically understand this PDF structure.";
        try {
          geminiResponse = await analyzeCaseStudyPdf(buffer);
          if (geminiResponse?.title) parsedTitle = geminiResponse.title;
        } catch (parseError: any) {
          console.warn('Gemini PDF parsing failed:', parseError?.message);
          errorMessage = parseError?.message || errorMessage;
        }
        if (!geminiResponse || !geminiResponse.sections) {
          return NextResponse.json({ success: false, error: errorMessage, data: { pdfUrl, title: parsedTitle } });
        }
        return NextResponse.json({
          success: true,
          data: {
            pdfUrl, title: parsedTitle, subtitle: geminiResponse.subtitle,
            description: geminiResponse.description, theme: geminiResponse.theme,
            typography: geminiResponse.typography, hero: geminiResponse.hero,
            navigation: geminiResponse.navigation, sections: geminiResponse.sections,
          },
        });
      } catch (error) {
        console.error('PDF conversion failed:', error);
        return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
      }
    }

    if (!idOrAction) {
      const auth = await requireAdmin(request);
      if (!auth.authorized) return auth.response;
      const payload = caseStudyMutationSchema.safeParse(await request.json());
      if (!payload.success) {
        return NextResponse.json({ error: 'Invalid case study payload', details: payload.error.flatten() }, { status: 400 });
      }
      try {
        const { projectId, sections, ...data } = payload.data;
        const slug = slugifyProject(data.slug);
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return notFound('Project not found');
        const caseStudy = await prisma.caseStudy.create({
          data: {
            ...data,
            metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
            slug, projectId,
            publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
            sections: {
              create: sections.map((s, idx) => ({
                title: s.title, slug: slugifyProject(s.title), order: idx,
                content: s.content, images: s.images,
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
  }

  if (resource === 'education') {
    const session = await verifySession();
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
      const data = await request.json();
      const education = await prisma.education.create({
        data: {
          institution: data.institution, degree: data.degree, field: data.field,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          score: data.score,
        },
      });
      return NextResponse.json(education, { status: 201 });
    } catch {
      return NextResponse.json({ error: 'Failed to create education' }, { status: 500 });
    }
  }

  if (resource === 'experience') {
    const session = await verifySession();
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
      const data = await request.json();
      const experience = await prisma.experience.create({
        data: {
          role: data.role, company: data.company, location: data.location,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          current: data.current || false, description: data.description || [],
          orderIndex: data.orderIndex || 0,
        },
      });
      return NextResponse.json(experience, { status: 201 });
    } catch {
      return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 });
    }
  }

  if (resource === 'skills') {
    const session = await verifySession();
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
      const data = await request.json();
      const skill = await prisma.skill.create({
        data: {
          name: data.name, sectionId: data.sectionId, type: data.type,
          icon: data.icon, description: data.description, orderIndex: data.orderIndex || 0,
        },
      });
      return NextResponse.json(skill, { status: 201 });
    } catch {
      return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 });
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
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  if (resource === 'projects' && id) {
    const payload = projectMutationSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: 'Invalid project payload', details: payload.error.flatten() }, { status: 400 });
    }
    try {
      return NextResponse.json(await updateProjectRecord(id, payload.data));
    } catch (error) {
      console.error('Failed to update project:', error);
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
  }

  if (resource === 'case-studies' && id) {
    const payload = caseStudyMutationSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: 'Invalid case study payload', details: payload.error.flatten() }, { status: 400 });
    }
    try {
      const { projectId, sections, ...data } = payload.data;
      const slug = slugifyProject(data.slug);
      const [, caseStudy] = await prisma.$transaction([
        prisma.caseStudySection.deleteMany({ where: { caseStudyId: id } }),
        prisma.caseStudy.update({
          where: { id },
          data: {
            ...data,
            metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
            slug, projectId,
            publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
            sections: {
              create: sections.map((s, idx) => ({
                title: s.title, slug: slugifyProject(s.title), order: idx,
                content: s.content, images: s.images,
                metadata: s.metadata ? JSON.parse(JSON.stringify(s.metadata)) : undefined,
              })),
            },
          },
          include: { sections: { orderBy: { order: 'asc' } } },
        }),
      ]);
      try {
        const project = await prisma.project.findUnique({
          where: { id: caseStudy.projectId }, select: { slug: true, id: true },
        });
        revalidatePath('/works');
        revalidatePath('/');
        revalidatePath('/dashboard/projects');
        if (project?.slug) revalidatePath(`/works/${project.slug}`);
        if (project?.id) {
          revalidatePath(`/dashboard/projects/${project.id}/case-study`);
          revalidatePath(`/dashboard/projects/${project.id}/edit`);
        }
      } catch (revalErr) {
        console.error('Revalidation failed (non-critical):', revalErr);
      }
      return NextResponse.json(caseStudy);
    } catch (error) {
      console.error('Failed to update case study:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: `Failed to update case study: ${errorMessage}` }, { status: 500 });
    }
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

  if (resource === 'projects' && id) {
    try {
      await deleteProjectRecord(id);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Failed to delete project:', error);
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
  }

  if (resource === 'case-studies' && id) {
    try {
      await prisma.caseStudy.delete({ where: { id } });
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Failed to delete case study:', error);
      return NextResponse.json({ error: 'Failed to delete case study' }, { status: 500 });
    }
  }

  return notFound();
}