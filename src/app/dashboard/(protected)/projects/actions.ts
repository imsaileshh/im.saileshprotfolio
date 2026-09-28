'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth/session';
import { prisma } from '@/lib/database/prisma';
import {
  bulkUpdateProjects,
  createProjectRecord,
  createProjectTaxonomy,
  deleteProjectRecord,
  deleteProjectTaxonomy,
  duplicateProjectRecord,
  updateProjectRecord,
  updateProjectTaxonomy,
} from '@/lib/dashboard/projects';
import {
  projectBulkMutationSchema,
  projectMutationSchema,
  projectTaxonomyMutationSchema,
} from '@/lib/validation/schemas';

async function requireProjectAdmin() {
  const authSession = await verifySession();
  if (!authSession || authSession.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
}

function optionalString(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function checked(formData: FormData, name: string) {
  return formData.get(name) === 'on' || formData.get(name) === 'true';
}

function projectPayload(formData: FormData) {
  return {
    title: formData.get('title'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    longText: optionalString(formData.get('longText')),
    projectType: optionalString(formData.get('projectType')) ?? 'Client Work',
    category: optionalString(formData.get('category')),
    tags: formData.get('tags'),
    technologies: formData.get('technologies'),
    status: optionalString(formData.get('status')) ?? 'Draft',
    featured: checked(formData, 'featured'),
    showOnHomepage: checked(formData, 'showOnHomepage'),
    publishedAt: optionalString(formData.get('publishedAt')),
    client: optionalString(formData.get('client')),
    role: optionalString(formData.get('role')),
    team: optionalString(formData.get('team')),
    duration: optionalString(formData.get('duration')),
    year: optionalString(formData.get('year')),
    liveUrl: optionalString(formData.get('liveUrl')),
    githubUrl: optionalString(formData.get('githubUrl')),
    previewMode: optionalString(formData.get('previewMode')) ?? 'external',
    previewImageUrl: optionalString(formData.get('previewImageUrl')),
    coverImageUrl: optionalString(formData.get('coverImageUrl')),
    thumbnailUrl: optionalString(formData.get('thumbnailUrl')),
    galleryImages: optionalString(formData.get('galleryImages')),
    demoVideoUrl: optionalString(formData.get('demoVideoUrl')),
    caseStudyEnabled: checked(formData, 'caseStudyEnabled'),
    caseStudySectionsData: optionalString(formData.get('caseStudySectionsData')),
    caseStudyOverview: optionalString(formData.get('caseStudyOverview')),
    caseStudyProblem: optionalString(formData.get('caseStudyProblem')),
    caseStudyProcess: optionalString(formData.get('caseStudyProcess')),
    caseStudySolution: optionalString(formData.get('caseStudySolution')),
    caseStudyResults: optionalString(formData.get('caseStudyResults')),
    seoTitle: optionalString(formData.get('seoTitle')),
    seoDescription: optionalString(formData.get('seoDescription')),
    seoKeywords: formData.get('seoKeywords'),
    ogImage: optionalString(formData.get('ogImage')),
    orderIndex: formData.get('orderIndex') ?? 0,
    useCustomBackground: checked(formData, 'useCustomBackground'),
    customBackground: optionalString(formData.get('customBackground')),
    submitAction: formData.get('action'),
  };
}

function selectedIds(formData: FormData) {
  return formData.getAll('ids').map(String).filter(Boolean);
}

function revalidateProjects(slug?: string) {
  revalidatePath('/dashboard/projects');
  revalidatePath('/dashboard/home');
  revalidatePath('/works');
  revalidatePath('/case-studies');
  revalidatePath('/projects');
  revalidatePath('/');
  if (slug) {
    revalidatePath(`/works/${slug}`);
    revalidatePath(`/projects/${slug}`);
    revalidatePath(`/case-studies/${slug}`);
    revalidatePath(`/case-studies/${slug}-case-study`);
  }
}

export type ActionState = {
  success?: boolean;
  error?: string;
  message?: string;
};

function applyAutoSeo(payload: any) {
  if (!payload.seoTitle && payload.title) {
    payload.seoTitle = `${payload.title} | Sailesh P.`;
  }
  if (!payload.seoDescription && payload.description) {
    payload.seoDescription = payload.description.substring(0, 300);
  }
  if (!payload.ogImage && payload.coverImageUrl) {
    payload.ogImage = payload.coverImageUrl;
  }
  return payload;
}

export async function createProjectAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireProjectAdmin();
    const validated = projectMutationSchema.safeParse(projectPayload(formData));
    
    if (!validated.success) {
      return { error: validated.error.errors[0]?.message || 'Validation failed' };
    }
    
    let payload = validated.data;
    // Set published/draft status based on action button clicked
    if (payload.submitAction === 'publish') {
      payload.status = 'Published';
      if (!payload.publishedAt) payload.publishedAt = new Date();
    } else if (payload.submitAction === 'save_draft') {
      payload.status = 'Draft';
    }
    
    payload = applyAutoSeo(payload);
    
    const project = await createProjectRecord(payload);
    revalidateProjects(project.slug);
    
    redirect(`/dashboard/projects/${project.id}/success`);
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    console.error('Project creation failed:', error);
    if (error?.code === 'P2002' && error?.meta?.target?.includes('slug')) {
      return { error: 'This slug is already in use by another project.' };
    }
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

export async function updateProjectAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireProjectAdmin();
    const id = String(formData.get('id') ?? '');
    if (!id) return { error: 'Missing project id' };
    
    const validated = projectMutationSchema.safeParse(projectPayload(formData));
    
    if (!validated.success) {
      return { error: validated.error.errors[0]?.message || 'Validation failed' };
    }
    
    let payload = validated.data;
    // Set published/draft status based on action button clicked
    if (payload.submitAction === 'publish' || payload.submitAction === 'save_changes') {
      payload.status = 'Published';
      if (!payload.publishedAt) payload.publishedAt = new Date();
    } else if (payload.submitAction === 'save_draft') {
      payload.status = 'Draft';
    }
    
    payload = applyAutoSeo(payload);
    
    const project = await updateProjectRecord(id, payload);
    revalidateProjects(project.slug);
    
    redirect('/dashboard/projects?saved=updated');
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    console.error('Project update failed:', error);
    if (error?.code === 'P2002' && error?.meta?.target?.includes('slug')) {
      return { error: 'This slug is already in use by another project.' };
    }
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

export async function duplicateProjectAction(formData: FormData) {
  await requireProjectAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('Missing project id');
  const duplicated = await duplicateProjectRecord(id);
  revalidateProjects(duplicated?.slug);
}

export async function deleteProjectAction(formData: FormData) {
  await requireProjectAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('Missing project id');
  const existing = await prisma.project.findUnique({ where: { id }, select: { slug: true } });
  await deleteProjectRecord(id);
  revalidateProjects(existing?.slug);
}

export async function quickProjectAction(formData: FormData) {
  await requireProjectAdmin();
  const id = String(formData.get('id') ?? '');
  const action = String(formData.get('action') ?? '');
  if (!id) throw new Error('Missing project id');
  const parsed = projectBulkMutationSchema.parse({ ids: [id], action });
  
  if (parsed.action === 'markFeatured') {
    const featuredCount = await prisma.project.count({ where: { featured: true } });
    if (featuredCount >= 6) {
      throw new Error('Maximum of 6 featured projects allowed. Please remove one first.');
    }
  }
  
  await bulkUpdateProjects(parsed.ids, parsed.action);
  revalidateProjects();
}

export async function bulkProjectAction(formData: FormData) {
  await requireProjectAdmin();
  const parsed = projectBulkMutationSchema.parse({
    ids: selectedIds(formData),
    action: formData.get('action'),
  });
  
  if (parsed.action === 'markFeatured') {
    const featuredCount = await prisma.project.count({ where: { featured: true } });
    if (featuredCount + parsed.ids.length > 6) {
      throw new Error(`Cannot feature ${parsed.ids.length} projects. Maximum of 6 allowed (currently ${featuredCount}).`);
    }
  }
  
  await bulkUpdateProjects(parsed.ids, parsed.action);
  revalidateProjects();
}

export async function createProjectTaxonomyAction(formData: FormData) {
  await requireProjectAdmin();
  const payload = projectTaxonomyMutationSchema.parse({
    type: formData.get('type'),
    name: formData.get('name'),
    slug: optionalString(formData.get('slug')),
    description: optionalString(formData.get('description')),
  });
  await createProjectTaxonomy(payload);
  revalidateProjects();
}

export async function updateProjectTaxonomyAction(formData: FormData) {
  await requireProjectAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('Missing taxonomy id');
  const payload = projectTaxonomyMutationSchema.parse({
    type: formData.get('type'),
    name: formData.get('name'),
    slug: optionalString(formData.get('slug')),
    description: optionalString(formData.get('description')),
  });
  await updateProjectTaxonomy(id, payload);
  revalidateProjects();
}

export async function deleteProjectTaxonomyAction(formData: FormData) {
  await requireProjectAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('Missing taxonomy id');
  await deleteProjectTaxonomy(id);
  revalidateProjects();
}
