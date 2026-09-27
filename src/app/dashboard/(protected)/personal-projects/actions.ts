'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';
import { requireAdmin } from '@/lib/dashboard/auth';

export type ActionState = {
  success?: boolean;
  error?: string;
  message?: string;
};

function optionalString(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function checked(formData: FormData, name: string) {
  return formData.get(name) === 'on' || formData.get(name) === 'true';
}

function parseTechnologies(value: FormDataEntryValue | null): string[] {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function revalidatePersonalProjects(slug?: string) {
  revalidatePath('/dashboard/personal-projects');
  revalidatePath('/dashboard/home');
  revalidatePath('/personal-projects');
  revalidatePath('/');
  revalidatePath('/projects');
  if (slug) {
    revalidatePath(`/personal-projects/${slug}`);
  }
}

function parseStorySections(rawJson?: string | null) {
  if (!rawJson) return null;
  try {
    const parsed = JSON.parse(rawJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item: any, index: number) => {
        const title = (item.title || `Section ${index + 1}`).trim();
        const cleanSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `sec-${index + 1}`;
        const content = item.content || '';
        const mediaItems = Array.isArray(item.media) ? item.media : [];
        const imageUrls = mediaItems.map((m: any) => m.url).filter(Boolean);

        return {
          title,
          slug: `${cleanSlug}-${index + 1}`,
          order: index,
          content,
          images: imageUrls,
          metadata: {
            subtitle: item.subtitle || '',
            type: item.type || 'rich_text',
            layout: item.layout || 'full_width',
            blocks: Array.isArray(item.blocks) ? item.blocks : [],
            media: mediaItems,
            stats: item.stats || [],
            quote: item.quote || null,
            settings: item.settings || {},
          },
        };
      });
    }
  } catch (e) {
    console.error('Failed to parse caseStudySectionsData', e);
  }
  return null;
}

export async function createPersonalProjectAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return { error: 'Unauthorized' };

    const title = String(formData.get('title') ?? '').trim();
    let slug = String(formData.get('slug') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();

    if (!title) return { error: 'Project title is required' };
    if (!description) return { error: 'Project description is required' };

    if (!slug) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const category = optionalString(formData.get('category')) ?? 'CLI / DevTool';
    const role = optionalString(formData.get('role')) ?? 'Completed';
    const year = optionalString(formData.get('year')) ?? new Date().getFullYear().toString();
    const technologies = parseTechnologies(formData.get('technologies'));
    const liveUrl = optionalString(formData.get('liveUrl'));
    const githubUrl = optionalString(formData.get('githubUrl'));
    const coverImageUrl = optionalString(formData.get('coverImageUrl'));
    const featured = checked(formData, 'featured');
    const publishedCheckbox = checked(formData, 'published');
    const submitAction = String(formData.get('action') ?? '');
    // 'save_draft' forces unpublished; 'publish' forces published; otherwise use checkbox
    const published =
      submitAction === 'save_draft' ? false
      : submitAction === 'publish' ? true
      : publishedCheckbox;
    const caseStudyEnabled = checked(formData, 'caseStudyEnabled');
    const dynamicSections = parseStorySections(optionalString(formData.get('caseStudySectionsData')));
    
    const useCustomBackground = checked(formData, 'useCustomBackground');
    const customBackground = optionalString(formData.get('customBackground'));

    const created = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        projectType: 'Personal Project',
        category,
        role,
        year,
        technologies,
        liveUrl,
        githubUrl,
        coverImageUrl,
        featured,
        published,
        archived: false,
        showOnHomepage: false,
        publishedAt: published ? new Date() : null,
        useCustomBackground,
        customBackground,
        images: coverImageUrl
          ? {
              create: [
                {
                  url: coverImageUrl,
                  isCover: true,
                  order: 0,
                },
              ],
            }
          : undefined,
      },
    });

    if (caseStudyEnabled && dynamicSections && dynamicSections.length > 0) {
      await prisma.caseStudy.create({
        data: {
          projectId: created.id,
          title,
          slug,
          description,
          coverImage: coverImageUrl,
          status: published ? 'PUBLISHED' : 'DRAFT',
          sections: {
            create: dynamicSections,
          },
        },
      });
    }

    revalidatePersonalProjects(slug);
    redirect('/dashboard/personal-projects?saved=created');
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    console.error('Personal project creation failed:', error);
    if (error?.code === 'P2002' && error?.meta?.target?.includes('slug')) {
      return { error: 'This slug is already in use. Please choose a different URL slug.' };
    }
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

export async function updatePersonalProjectAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return { error: 'Unauthorized' };

    const id = String(formData.get('id') ?? '').trim();
    if (!id) return { error: 'Missing project ID' };

    const title = String(formData.get('title') ?? '').trim();
    let slug = String(formData.get('slug') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();

    if (!title) return { error: 'Project title is required' };
    if (!description) return { error: 'Project description is required' };

    if (!slug) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const category = optionalString(formData.get('category')) ?? 'CLI / DevTool';
    const role = optionalString(formData.get('role')) ?? 'Completed';
    const year = optionalString(formData.get('year')) ?? new Date().getFullYear().toString();
    const technologies = parseTechnologies(formData.get('technologies'));
    const liveUrl = optionalString(formData.get('liveUrl'));
    const githubUrl = optionalString(formData.get('githubUrl'));
    const coverImageUrl = optionalString(formData.get('coverImageUrl'));
    const featured = checked(formData, 'featured');
    const publishedCheckbox = checked(formData, 'published');
    const submitAction = String(formData.get('action') ?? '');
    // 'save_draft' forces unpublished; 'publish' forces published; otherwise use checkbox
    const published =
      submitAction === 'save_draft' ? false
      : submitAction === 'publish' ? true
      : publishedCheckbox;
    const caseStudyEnabled = checked(formData, 'caseStudyEnabled');
    const dynamicSections = parseStorySections(optionalString(formData.get('caseStudySectionsData')));
    
    const useCustomBackground = checked(formData, 'useCustomBackground');
    const customBackground = optionalString(formData.get('customBackground'));

    await prisma.project.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        projectType: 'Personal Project',
        category,
        role,
        year,
        technologies,
        liveUrl,
        githubUrl,
        coverImageUrl,
        featured,
        published,
        archived: false,
        showOnHomepage: false,
        publishedAt: published ? new Date() : null,
        useCustomBackground,
        customBackground,
      },
    });

    if (coverImageUrl) {
      await prisma.projectImage.deleteMany({ where: { projectId: id, isCover: true } });
      await prisma.projectImage.create({
        data: {
          projectId: id,
          url: coverImageUrl,
          isCover: true,
          order: 0,
        },
      });
    } else {
      await prisma.projectImage.deleteMany({ where: { projectId: id, isCover: true } });
    }

    // Upsert or remove Project Story
    if (caseStudyEnabled) {
      const existingCs = await prisma.caseStudy.findUnique({ where: { projectId: id } });
      if (existingCs) {
        await prisma.caseStudy.update({
          where: { id: existingCs.id },
          data: {
            title,
            slug,
            description,
            coverImage: coverImageUrl,
            status: published ? 'PUBLISHED' : 'DRAFT',
          },
        });

        if (dynamicSections && dynamicSections.length > 0) {
          await prisma.caseStudySection.deleteMany({ where: { caseStudyId: existingCs.id } });
          await prisma.caseStudySection.createMany({
            data: dynamicSections.map((sec) => ({
              ...sec,
              caseStudyId: existingCs.id,
            })),
          });
        }
      } else if (dynamicSections && dynamicSections.length > 0) {
        await prisma.caseStudy.create({
          data: {
            projectId: id,
            title,
            slug,
            description,
            coverImage: coverImageUrl,
            status: published ? 'PUBLISHED' : 'DRAFT',
            sections: {
              create: dynamicSections,
            },
          },
        });
      }
    } else {
      // If disabled, remove existing case study for clean state
      await prisma.caseStudy.deleteMany({ where: { projectId: id } });
    }

    revalidatePersonalProjects(slug);
    redirect('/dashboard/personal-projects?saved=updated');
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    console.error('Personal project update failed:', error);
    if (error?.code === 'P2002' && error?.meta?.target?.includes('slug')) {
      return { error: 'This slug is already in use. Please choose a different URL slug.' };
    }
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

export async function deletePersonalProjectAction(id: string) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return { error: 'Unauthorized' };

    const project = await prisma.project.findUnique({
      where: { id },
      select: { slug: true },
    });

    await prisma.project.delete({ where: { id } });
    revalidatePersonalProjects(project?.slug);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete personal project:', error);
    return { error: error.message || 'Failed to delete project' };
  }
}

export async function togglePersonalProjectPublishedAction(id: string, currentPublished: boolean) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return { error: 'Unauthorized' };

    await prisma.project.update({
      where: { id },
      data: {
        published: !currentPublished,
        publishedAt: !currentPublished ? new Date() : null,
      },
    });
    revalidatePersonalProjects();
    return { success: true };
  } catch (error: any) {
    console.error('Failed to toggle published status:', error);
    return { error: error.message || 'Failed to update status' };
  }
}

export async function togglePersonalProjectFeaturedAction(id: string, currentFeatured: boolean) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return { error: 'Unauthorized' };

    await prisma.project.update({
      where: { id },
      data: {
        featured: !currentFeatured,
      },
    });
    revalidatePersonalProjects();
    return { success: true };
  } catch (error: any) {
    console.error('Failed to toggle featured status:', error);
    return { error: error.message || 'Failed to update featured' };
  }
}
