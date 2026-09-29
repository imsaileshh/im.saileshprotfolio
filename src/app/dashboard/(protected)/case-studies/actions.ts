'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAdmin } from '@/lib/dashboard/auth';
import { resolveImageUrl } from '@/lib/media/resolve-image-url';
import { normalizeSectionMedia } from '@/lib/media/case-study-media';
import { isWorkProjectType, isPersonalProjectType } from '@/lib/constants/project-types';

export type ActionState = {
  success?: boolean;
  error?: string;
  message?: string;
  data?: any;
};

function revalidateCaseStudies(...records: Array<{ slug: string; project?: { slug: string; projectType: string | null } }>) {
  for (const record of records) {
    revalidatePath('/case-studies/' + record.slug);
    if (record.project) {
      revalidatePath('/projects/' + record.project.slug);
      if (isWorkProjectType(record.project.projectType)) revalidatePath('/works/' + record.project.slug);
      if (isPersonalProjectType(record.project.projectType)) revalidatePath('/personal-projects/' + record.project.slug);
    }
  }
  revalidatePath('/case-studies');
  revalidatePath('/works');
  revalidatePath('/personal-projects');
  revalidatePath('/dashboard/case-studies');
  revalidatePath('/dashboard/projects');
  revalidatePath('/projects');
  revalidatePath('/');
}

export async function createCaseStudyAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return { error: 'Unauthorized' };

    const title = String(formData.get('title') ?? '').trim();
    let slug = String(formData.get('slug') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const coverImage = resolveImageUrl(formData.get('coverImage'));
    const technologies = String(formData.get('technologies') ?? '').split(',').map(value => value.trim()).filter(Boolean);
    const showOnHome = formData.get('showOnHome') === 'true';
    const client = String(formData.get('client') ?? '').trim() || null;
    const role = String(formData.get('role') ?? '').trim() || null;
    const year = String(formData.get('year') ?? '').trim() || new Date().getFullYear().toString();
    const duration = String(formData.get('duration') ?? '').trim() || null;
    const team = String(formData.get('team') ?? '').trim() || null;
    const category = String(formData.get('category') ?? '').trim() || 'Product Design';
    const figmaUrl = String(formData.get('figmaUrl') ?? '').trim() || null;
    const liveUrl = String(formData.get('liveUrl') ?? '').trim() || null;
    const githubUrl = String(formData.get('githubUrl') ?? '').trim() || null;
    const rawSections = String(formData.get('sectionsJson') ?? '[]');
    const submitAction = formData.get('action');
    const useCustomBackground = formData.get('useCustomBackground') === 'true' || formData.get('useCustomBackground') === 'on';
    const customBackground = String(formData.get('customBackground') ?? '').trim() || null;

    if (!title) return { error: 'Case study title is required' };

    if (!slug) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const status = submitAction === 'publish' ? 'PUBLISHED' : 'DRAFT';
    let sections: any[] = [];
    try {
      sections = JSON.parse(rawSections);
      if (!Array.isArray(sections) || sections.some(section => !section || typeof section !== 'object')) return { error: 'Invalid sections data' };
    } catch (e) {
      return { error: 'Invalid sections data; nothing was saved' };
    }

    const created = await prisma.$transaction(async (tx) => {
    // 1. Create or find linked project
    let project = await tx.project.findUnique({ where: { slug } });
    if (!project) {
      project = await tx.project.create({
        data: {
          title,
          slug,
          description: description || `${title} — Product Design & UX Case Study`,
          projectType: 'Case Study',
          category,
          year,
          role,
          client,
          liveUrl,
          githubUrl,
          coverImageUrl: coverImage,
          published: status === 'PUBLISHED',
          technologies,
          showOnHomepage: showOnHome,
          images: coverImage
            ? {
                create: [
                  {
                    url: coverImage,
                    isCover: true,
                    order: 0,
                  },
                ],
              }
            : undefined,
        },
      });
    }

    // 2. Create CaseStudy record
    const caseStudy = await tx.caseStudy.create({
      data: {
        projectId: project.id,
        title,
        slug,
        description,
        coverImage,
        status: status as any,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        useCustomBackground,
        customBackground,
        metadata: {
          client,
          role,
          year,
          duration,
          team,
          category,
          figmaUrl,
          liveUrl,
          githubUrl,
          technologies,
          showOnHome,
        },
        sections: {
          create: sections.map((s, idx) => {
            const normalized = normalizeSectionMedia(s);
            const resolvedImages = normalized.images;
            const resolvedMedia = normalized.metadata.media;

            return {
              title: s.title || `Section ${idx + 1}`,
              slug: s.slug || `section-${idx + 1}`,
              order: idx,
              content: s.content || '',
              images: resolvedImages,
              metadata: {
                ...(s.metadata || {}),
                media: resolvedMedia,
              },
            };
          }),
        },
      },
    });

    return { ...caseStudy, project };
    });
    revalidateCaseStudies(created);
    return { success: true, data: { id: created.id }, message: 'Case study created successfully' };
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    console.error('Case study creation failed:', error);
    if (error?.code === 'P2002') {
      return { error: 'A case study with this slug already exists. Please choose another slug.' };
    }
    return { error: error.message || 'Failed to create case study.' };
  }
}

export async function updateCaseStudyAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return { error: 'Unauthorized' };

    const id = String(formData.get('id') ?? '').trim();
    if (!id) return { error: 'Missing Case Study ID' };

    const title = String(formData.get('title') ?? '').trim();
    let slug = String(formData.get('slug') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const coverImage = resolveImageUrl(formData.get('coverImage'));
    const technologies = String(formData.get('technologies') ?? '').split(',').map(value => value.trim()).filter(Boolean);
    const showOnHome = formData.get('showOnHome') === 'true';
    const client = String(formData.get('client') ?? '').trim() || null;
    const role = String(formData.get('role') ?? '').trim() || null;
    const year = String(formData.get('year') ?? '').trim() || new Date().getFullYear().toString();
    const duration = String(formData.get('duration') ?? '').trim() || null;
    const team = String(formData.get('team') ?? '').trim() || null;
    const category = String(formData.get('category') ?? '').trim() || 'Product Design';
    const figmaUrl = String(formData.get('figmaUrl') ?? '').trim() || null;
    const liveUrl = String(formData.get('liveUrl') ?? '').trim() || null;
    const githubUrl = String(formData.get('githubUrl') ?? '').trim() || null;
    const rawSections = String(formData.get('sectionsJson') ?? '[]');
    const submitAction = formData.get('action');
    const useCustomBackground = formData.get('useCustomBackground') === 'true' || formData.get('useCustomBackground') === 'on';
    const customBackground = String(formData.get('customBackground') ?? '').trim() || null;

    if (!title) return { error: 'Case study title is required' };

    const status = submitAction === 'publish' ? 'PUBLISHED' : submitAction === 'save_draft' ? 'DRAFT' : undefined;

    let sections: any[] = [];
    try {
      sections = JSON.parse(rawSections);
      if (!Array.isArray(sections) || sections.some(section => !section || typeof section !== 'object')) return { error: 'Invalid sections data' };
    } catch (e) {
      return { error: 'Invalid sections data; nothing was saved' };
    }

    const existing = await prisma.caseStudy.findUnique({ where: { id }, include: { project: true } });
    if (!existing) return { error: 'Case study not found' };

    if (!slug) slug = existing.slug;
    const updatedProject = await prisma.$transaction(async (tx) => {
    // 1. Update CaseStudy base fields
    const updated = await tx.caseStudy.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        coverImage,
        useCustomBackground,
        customBackground,
        ...(status ? { status: status as any, publishedAt: status === 'PUBLISHED' ? new Date() : null } : {}),
        metadata: {
          client,
          role,
          year,
          duration,
          team,
          category,
          figmaUrl,
          liveUrl,
          githubUrl,
          technologies,
          showOnHome,
        },
      },
    });

    // 2. Sync sections
    await tx.caseStudySection.deleteMany({ where: { caseStudyId: id } });
    if (sections.length > 0) {
      await tx.caseStudySection.createMany({
        data: sections.map((s, idx) => {
          const normalized = normalizeSectionMedia(s);
            const resolvedImages = normalized.images;
            const resolvedMedia = normalized.metadata.media;

          return {
            caseStudyId: id,
            title: s.title || `Section ${idx + 1}`,
            slug: s.slug || `section-${idx + 1}`,
            order: idx,
            content: s.content || '',
            images: resolvedImages,
            metadata: {
              ...(s.metadata || {}),
              media: resolvedMedia,
            },
          };
        }),
      });
    }

    // 3. Sync to linked Project
    return tx.project.update({
      where: { id: existing.projectId },
      data: {
        title,
        slug,
        description: description || existing.description || title,
        coverImageUrl: coverImage,
        role,
        client,
        year,
        category,
        liveUrl,
        githubUrl,
        technologies,
        showOnHomepage: showOnHome,
        published: (status ?? existing.status) === 'PUBLISHED',
      },
    });

    });
    revalidateCaseStudies(existing, { slug, project: updatedProject });
    return { success: true, message: 'Case study saved successfully' };
  } catch (error: any) {
    console.error('Case study update failed:', error);
    return { error: error.message || 'Failed to update case study.' };
  }
}

export async function deleteCaseStudyAction(id: string) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return { error: 'Unauthorized' };

    const deleted = await prisma.caseStudy.delete({ where: { id }, include: { project: true } });
    revalidateCaseStudies(deleted);
    return { success: true };
  } catch (error: any) {
    console.error('Delete case study error:', error);
    return { error: error.message || 'Failed to delete case study' };
  }
}

export async function toggleCaseStudyPublishedAction(id: string, currentStatus: string) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return { error: 'Unauthorized' };

    const existing = await prisma.caseStudy.findUnique({ where: { id }, include: { project: true } });
    if (!existing) return { error: 'Case study not found' };
    const newStatus = existing.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await prisma.$transaction([prisma.caseStudy.update({
      where: { id },
      data: {
        status: newStatus as any,
        publishedAt: newStatus === 'PUBLISHED' ? new Date() : null,
      },
    }), prisma.project.update({ where: { id: existing.projectId }, data: { published: newStatus === 'PUBLISHED' } })]);

    revalidateCaseStudies(existing);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to toggle status' };
  }
}

export async function duplicateCaseStudyAction(id: string) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return { error: 'Unauthorized' };

    const original = await prisma.caseStudy.findUnique({
      where: { id },
      include: { sections: { orderBy: { order: 'asc' } }, project: true },
    });

    if (!original) return { error: 'Original case study not found' };

    const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;
    const newTitle = `${original.title} (Copy)`;

    // Create copy project
    const newProject = await prisma.project.create({
      data: {
        title: newTitle,
        slug: newSlug,
        description: original.project.description,
        projectType: 'Case Study',
        category: original.project.category,
        technologies: original.project.technologies,
        coverImageUrl: original.project.coverImageUrl,
        published: false,
      },
    });

    // Create copy case study
    const newCaseStudy = await prisma.caseStudy.create({
      data: {
        projectId: newProject.id,
        title: newTitle,
        slug: newSlug,
        description: original.description,
        coverImage: original.coverImage,
        status: 'DRAFT',
        metadata: original.metadata || {},
        sections: {
          create: original.sections.map((s) => ({
            title: s.title,
            slug: s.slug,
            order: s.order,
            content: s.content,
            images: s.images,
            metadata: s.metadata || {},
          })),
        },
      },
    });

    revalidateCaseStudies();
    return { success: true, newId: newCaseStudy.id };
  } catch (error: any) {
    console.error('Duplicate case study error:', error);
    return { error: error.message || 'Failed to duplicate case study' };
  }
}
