import { Prisma } from '@prisma/client';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';
import type {
  projectBulkMutationSchema,
  projectListQuerySchema,
  projectMutationSchema,
  projectTaxonomyMutationSchema,
} from '@/lib/validation/schemas';
import type { z } from 'zod';
import { resolveImageUrl } from '@/lib/media/resolve-image-url';
import { normalizeCaseStudyVisual } from '@/types/case-study-visual';

export const projectQuickViews = [
  'all',
  'caseStudies',
  'featured',
  'clientWork',
  'personalProjects',
  'openSource',
] as const;

export const projectStatusLabels = ['Draft', 'Published', 'Archived'] as const;
export const projectTypeLabels = ['Case Study', 'Client Work', 'Personal Project', 'Open Source'] as const;
export const projectTaxonomyTypes = ['category', 'technology', 'tag'] as const;

type ProjectQuery = z.infer<typeof projectListQuerySchema>;
type ProjectInput = z.infer<typeof projectMutationSchema>;
type ProjectBulkInput = z.infer<typeof projectBulkMutationSchema>;
type ProjectTaxonomyInput = z.infer<typeof projectTaxonomyMutationSchema>;
type ProjectTaxonomyDelegate = {
  findMany: typeof prisma.projectTaxonomy.findMany;
  create: typeof prisma.projectTaxonomy.create;
  update: typeof prisma.projectTaxonomy.update;
  delete: typeof prisma.projectTaxonomy.delete;
};
type ProjectFieldSet = Set<string>;
type ProjectRecord = Record<string, any>;
export type DashboardProjectRecord = ProjectRecord & {
  id: string;
  slug: string;
  title: string;
  description: string;
  longText: string | null;
  technologies: string[];
  featured: boolean;
  published: boolean;
  archived: boolean;
  category: string | null;
  role: string | null;
  year: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  previewMode: string | null;
  previewImageUrl: string | null;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
  images?: Array<{ url: string; alt?: string | null; isCover: boolean; order: number }>;
  projectType: string;
  tags: string[];
  showOnHomepage: boolean;
  publishedAt: Date | null;
  client: string | null;
  team: string | null;
  duration: string | null;
  coverImageUrl: string | null;
  thumbnailUrl: string | null;
  galleryImages: string[];
  demoVideoUrl: string | null;
  caseStudy?: any;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  ogImage: string | null;
  useCustomBackground: boolean;
  customBackground: string | null;
};

function getProjectTaxonomyDelegate(): ProjectTaxonomyDelegate | null {
  const delegate = (prisma as unknown as { projectTaxonomy?: ProjectTaxonomyDelegate }).projectTaxonomy;
  return delegate ?? null;
}

function requireProjectTaxonomyDelegate() {
  const delegate = getProjectTaxonomyDelegate();
  if (!delegate) {
    throw new Error('Project taxonomy is unavailable until the Next.js dev server restarts after Prisma generation.');
  }
  return delegate;
}

function getProjectFieldSet(): ProjectFieldSet {
  const client = prisma as unknown as {
    _runtimeDataModel?: {
      models?: {
        Project?: {
          fields?: Array<{ name: string }>;
        };
      };
    };
  };
  const runtimeFields = client._runtimeDataModel?.models?.Project?.fields;

  if (runtimeFields?.length) {
    return new Set(runtimeFields.map((field) => field.name));
  }

  return new Set([
    'id',
    'slug',
    'title',
    'description',
    'longText',
    'technologies',
    'featured',
    'published',
    'archived',
    'category',
    'role',
    'year',
    'liveUrl',
    'githubUrl',
    'previewMode',
    'previewImageUrl',
    'orderIndex',
    'createdAt',
    'updatedAt',
    'images',
    'useCustomBackground',
    'customBackground',
  ]);
}

function hasProjectField(fields: ProjectFieldSet, name: string) {
  return fields.has(name);
}

function pickSupportedProjectData(data: Record<string, unknown>, fields: ProjectFieldSet) {
  return Object.fromEntries(Object.entries(data).filter(([key]) => hasProjectField(fields, key)));
}

function normalizeProjectForDashboard(project: ProjectRecord): DashboardProjectRecord {
  return {
    ...project,
    projectType: project.projectType ?? 'Personal Project',
    tags: Array.isArray(project.tags) ? project.tags : [],
    showOnHomepage: project.showOnHomepage ?? true,
    publishedAt: project.publishedAt ?? null,
    client: project.client ?? null,
    team: project.team ?? null,
    duration: project.duration ?? null,
    coverImageUrl: project.coverImageUrl ?? null,
    thumbnailUrl: project.thumbnailUrl ?? null,
    galleryImages: Array.isArray(project.galleryImages) ? project.galleryImages : [],
    demoVideoUrl: project.demoVideoUrl ?? null,
    caseStudy: project.caseStudy,
    seoTitle: project.seoTitle ?? null,
    seoDescription: project.seoDescription ?? null,
    seoKeywords: Array.isArray(project.seoKeywords) ? project.seoKeywords : [],
    ogImage: project.ogImage ?? null,
    previewMode: project.previewMode ?? 'external',
    previewImageUrl: project.previewImageUrl ?? null,
    useCustomBackground: project.useCustomBackground ?? false,
    customBackground: project.customBackground ?? null,
  } as DashboardProjectRecord;
}

function clampPage(page: number) {
  return Math.max(1, page);
}

function offset(page: number, limit: number) {
  return (clampPage(page) - 1) * limit;
}

export function slugifyProject(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function getProjectStatus(project: { published: boolean; archived: boolean }) {
  if (project.archived) return 'Archived';
  if (project.published) return 'Published';
  return 'Draft';
}

function statusFlags(status: ProjectInput['status']) {
  if (status === 'Archived') return { published: false, archived: true, publishedAt: null };
  if (status === 'Published') return { published: true, archived: false };
  return { published: false, archived: false, publishedAt: null };
}

function normalizedUnique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function optionalDateForStatus(input: ProjectInput) {
  if (input.status !== 'Published') return null;
  return input.publishedAt ?? new Date();
}

function projectImages(input: ProjectInput) {
  const urls = normalizedUnique([
    ...(input.coverImageUrl ? [input.coverImageUrl] : []),
    ...input.galleryImages,
  ]);

  return urls.map((url, index) => ({
    url,
    alt: index === 0 ? `${input.title} cover image` : `${input.title} gallery image ${index + 1}`,
    isCover: index === 0,
    order: index,
  }));
}

function projectWriteData(input: ProjectInput) {
  const flags = statusFlags(input.status);

  return {
    title: input.title,
    slug: input.slug,
    description: input.description,
    longText: input.longText,
    projectType: input.projectType,
    category: input.category,
    tags: input.tags,
    technologies: input.technologies,
    featured: input.featured,
    showOnHomepage: input.showOnHomepage,
    publishedAt: optionalDateForStatus(input),
    client: input.client,
    role: input.role,
    team: input.team,
    duration: input.duration,
    year: input.year,
    liveUrl: input.liveUrl,
    githubUrl: input.githubUrl,
    previewMode: input.previewMode ?? 'external',
    previewImageUrl: input.previewImageUrl,
    coverImageUrl: input.coverImageUrl,
    thumbnailUrl: input.thumbnailUrl,
    galleryImages: input.galleryImages,
    demoVideoUrl: input.demoVideoUrl,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    seoKeywords: input.seoKeywords,
    ogImage: input.ogImage,
    orderIndex: input.orderIndex,
    useCustomBackground: input.useCustomBackground,
    customBackground: input.customBackground,
    ...flags,
  };
}

function supportedProjectWriteData(input: ProjectInput, fields: ProjectFieldSet) {
  return pickSupportedProjectData(projectWriteData(input), fields);
}

export async function generateUniqueProjectSlug(base: string, excludeId?: string) {
  const cleanBase = slugifyProject(base) || 'project';
  let candidate = cleanBase;
  let suffix = 2;

  while (await prisma.project.findFirst({ where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) } })) {
    candidate = `${cleanBase}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function whereForQuery(query: ProjectQuery, fields: ProjectFieldSet): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {};

  if (query.search) {
    where.OR = [
      hasProjectField(fields, 'title') ? { title: { contains: query.search, mode: 'insensitive' } } : null,
      hasProjectField(fields, 'description') ? { description: { contains: query.search, mode: 'insensitive' } } : null,
      hasProjectField(fields, 'longText') ? { longText: { contains: query.search, mode: 'insensitive' } } : null,
      hasProjectField(fields, 'category') ? { category: { contains: query.search, mode: 'insensitive' } } : null,
      hasProjectField(fields, 'client') ? { client: { contains: query.search, mode: 'insensitive' } } : null,
      hasProjectField(fields, 'role') ? { role: { contains: query.search, mode: 'insensitive' } } : null,
    ].filter(Boolean) as Prisma.ProjectWhereInput[];
  }

  // Works CMS views must not leak Personal Projects
  if (query.view === 'caseStudies') {
    where.caseStudy = { isNot: null };
    where.NOT = [{ projectType: 'Personal Project' }, { projectType: 'Open Source' }];
  } else if (query.view === 'featured') {
    where.featured = true;
    where.NOT = [{ projectType: 'Personal Project' }, { projectType: 'Open Source' }];
  } else if (query.view === 'clientWork' && hasProjectField(fields, 'projectType')) {
    where.projectType = 'Client Work';
  } else if (query.view === 'personalProjects' && hasProjectField(fields, 'projectType')) {
    where.projectType = 'Personal Project';
  } else if (query.view === 'openSource' && hasProjectField(fields, 'projectType')) {
    where.projectType = 'Open Source';
  } else {
    // Default works listing excludes personal projects
    where.NOT = [{ projectType: 'Personal Project' }, { projectType: 'Open Source' }];
  }

  if (query.category) where.category = query.category;
  if (query.technology) where.technologies = { has: query.technology };
  if (query.year) where.year = query.year;
  if (query.status === 'Draft') Object.assign(where, { published: false, archived: false });
  if (query.status === 'Published') Object.assign(where, { published: true, archived: false });
  if (query.status === 'Archived') where.archived = true;

  return where;
}

function orderByForQuery(sort: ProjectQuery['sort']): Prisma.ProjectOrderByWithRelationInput {
  if (sort === 'oldest') return { createdAt: 'asc' };
  if (sort === 'az') return { title: 'asc' };
  if (sort === 'recentlyUpdated') return { updatedAt: 'desc' };
  return { createdAt: 'desc' };
}

export async function getDashboardProjects(query: ProjectQuery) {
  const projectFields = getProjectFieldSet();
  const where = whereForQuery(query, projectFields);
  const taxonomyDelegate = getProjectTaxonomyDelegate();
  const caseStudyWhere: Prisma.ProjectWhereInput = { caseStudy: { isNot: null } };

  const [
    total,
    projects,
    stats,
    categoryRows,
    technologyRows,
    tagRows,
    taxonomies,
    years,
  ] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: { images: { orderBy: { order: 'asc' } } },
      orderBy: orderByForQuery(query.sort),
      skip: offset(query.page, query.limit),
      take: query.limit,
    }),
    Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { published: true, archived: false } }),
      prisma.project.count({ where: { published: false, archived: false } }),
      prisma.project.count({ where: caseStudyWhere }),
      prisma.project.count({ where: { featured: true } }),
      prisma.project.count({ where: { archived: true } }),
    ]),
    prisma.project.findMany({ where: { category: { not: null } }, select: { category: true } }),
    prisma.project.findMany({ select: { technologies: true } }),
    hasProjectField(projectFields, 'tags') ? prisma.project.findMany({ select: { tags: true } }) : Promise.resolve([]),
    taxonomyDelegate ? taxonomyDelegate.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] }) : Promise.resolve([]),
    prisma.project.findMany({ where: { year: { not: null } }, select: { year: true }, distinct: ['year'], orderBy: { year: 'desc' } }),
  ]);

  const taxonomyCategories = taxonomies.filter((item) => item.type === 'category').map((item) => item.name);
  const taxonomyTechnologies = taxonomies.filter((item) => item.type === 'technology').map((item) => item.name);
  const taxonomyTags = taxonomies.filter((item) => item.type === 'tag').map((item) => item.name);

  return {
    projects: projects.map((project) => normalizeProjectForDashboard(project)),
    stats: {
      total: stats[0],
      published: stats[1],
      drafts: stats[2],
      caseStudies: stats[3],
      featured: stats[4],
      archived: stats[5],
    },
    filters: {
      categories: normalizedUnique([...taxonomyCategories, ...categoryRows.map((item) => item.category ?? '')]),
      technologies: normalizedUnique([...taxonomyTechnologies, ...technologyRows.flatMap((item) => item.technologies)]),
      tags: normalizedUnique([...taxonomyTags, ...tagRows.flatMap((item) => item.tags)]),
      years: normalizedUnique(years.map((item) => item.year ?? '')),
    },
    taxonomies,
    pagination: {
      total,
      page: query.page,
      limit: query.limit,
      pageCount: Math.max(1, Math.ceil(total / query.limit)),
      from: total === 0 ? 0 : offset(query.page, query.limit) + 1,
      to: Math.min(total, offset(query.page, query.limit) + projects.length),
    },
  };
}

export async function getProjectForEdit(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: 'asc' } },
      caseStudy: { include: { sections: { orderBy: { order: 'asc' } } } },
    },
  });
  if (!project) notFound();
  return {
    ...normalizeProjectForDashboard(project),
    caseStudy: project.caseStudy,
  };
}

function parseCaseStudySections(rawJson?: string | null) {
  if (!rawJson) return null;
  try {
    const parsed = JSON.parse(rawJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item: any, index: number) => {
        const title = (item.title || `Section ${index + 1}`).trim();
        const cleanSlug = slugifyProject(title) || `sec-${index + 1}`;
        const content = item.content || '';
        const rawMediaItems = Array.isArray(item.media) ? item.media : [];
        const mediaItems = rawMediaItems.map((m: any) => {
          const norm = normalizeCaseStudyVisual(m);
          return {
            ...m,
            ...norm,
            url: norm.url || norm.imageUrl,
            imageUrl: norm.imageUrl || norm.url,
          };
        });
        const imageUrls = mediaItems
          .map((m: any) => resolveImageUrl(m.imageUrl || m.url))
          .filter(Boolean) as string[];

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
            hidden: Boolean(item.hidden),
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

export async function createProjectRecord(input: ProjectInput) {
  const projectFields = getProjectFieldSet();
  const slug = await generateUniqueProjectSlug(input.slug || input.title);
  const data = supportedProjectWriteData({ ...input, slug }, projectFields);
  const images = projectImages(input);

  const project = await prisma.project.create({
    data: {
      ...data,
      ...(images.length ? { images: { create: images } } : {}),
    } as Prisma.ProjectCreateInput,
    include: { images: true },
  });

  // If Case Study is enabled, create the associated CaseStudy record
  if (input.caseStudyEnabled) {
    const csStatus = input.status === 'Published' ? 'PUBLISHED' : 'DRAFT';
    const dynamicSections = parseCaseStudySections((input as any).caseStudySectionsData);

    await prisma.caseStudy.create({
      data: {
        projectId: project.id,
        title: input.title,
        slug: slug,
        description: input.caseStudyOverview || input.description,
        coverImage: input.coverImageUrl,
        status: csStatus as any,
        sections: {
          create: dynamicSections || [
            ...(input.caseStudyOverview ? [{ title: 'Overview', slug: 'overview', order: 0, content: input.caseStudyOverview }] : []),
            ...(input.caseStudyProblem ? [{ title: 'Challenge', slug: 'challenge', order: 1, content: input.caseStudyProblem }] : []),
            ...(input.caseStudyProcess ? [{ title: 'Process', slug: 'process', order: 2, content: input.caseStudyProcess }] : []),
            ...(input.caseStudySolution ? [{ title: 'Solution', slug: 'solution', order: 3, content: input.caseStudySolution }] : []),
            ...(input.caseStudyResults ? [{ title: 'Results', slug: 'results', order: 4, content: input.caseStudyResults }] : []),
          ],
        },
      },
    });
  }

  return project;
}

export async function updateProjectRecord(id: string, input: ProjectInput) {
  const projectFields = getProjectFieldSet();
  const slug = await generateUniqueProjectSlug(input.slug || input.title, id);
  const data = supportedProjectWriteData({ ...input, slug }, projectFields);
  const images = projectImages(input);

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...data,
      images: {
        deleteMany: {},
        ...(images.length ? { create: images } : {}),
      },
    } as Prisma.ProjectUpdateInput,
    include: { images: true, caseStudy: true },
  });

  // Upsert or delete associated CaseStudy
  if (input.caseStudyEnabled) {
    const csStatus = input.status === 'Published' ? 'PUBLISHED' : 'DRAFT';
    const existingCs = await prisma.caseStudy.findUnique({ where: { projectId: id } });
    const dynamicSections = parseCaseStudySections((input as any).caseStudySectionsData);

    if (existingCs) {
      await prisma.caseStudy.update({
        where: { id: existingCs.id },
        data: {
          title: input.title,
          slug,
          description: input.caseStudyOverview || input.description,
          coverImage: input.coverImageUrl,
          status: csStatus as any,
        },
      });

      // Sync sections
      await prisma.caseStudySection.deleteMany({ where: { caseStudyId: existingCs.id } });
      if (dynamicSections && dynamicSections.length > 0) {
        await prisma.caseStudySection.createMany({
          data: dynamicSections.map((sec) => ({
            ...sec,
            caseStudyId: existingCs.id,
          })),
        });
      } else if (input.caseStudyOverview || input.caseStudyProblem || input.caseStudyProcess || input.caseStudySolution || input.caseStudyResults) {
        await prisma.caseStudySection.createMany({
          data: [
            ...(input.caseStudyOverview ? [{ caseStudyId: existingCs.id, title: 'Overview', slug: 'overview', order: 0, content: input.caseStudyOverview }] : []),
            ...(input.caseStudyProblem ? [{ caseStudyId: existingCs.id, title: 'Challenge', slug: 'challenge', order: 1, content: input.caseStudyProblem }] : []),
            ...(input.caseStudyProcess ? [{ caseStudyId: existingCs.id, title: 'Process', slug: 'process', order: 2, content: input.caseStudyProcess }] : []),
            ...(input.caseStudySolution ? [{ caseStudyId: existingCs.id, title: 'Solution', slug: 'solution', order: 3, content: input.caseStudySolution }] : []),
            ...(input.caseStudyResults ? [{ caseStudyId: existingCs.id, title: 'Results', slug: 'results', order: 4, content: input.caseStudyResults }] : []),
          ],
        });
      }
    } else {
      await prisma.caseStudy.create({
        data: {
          projectId: id,
          title: input.title,
          slug,
          description: input.caseStudyOverview || input.description,
          coverImage: input.coverImageUrl,
          status: csStatus as any,
          sections: {
            create: dynamicSections || [
              ...(input.caseStudyOverview ? [{ title: 'Overview', slug: 'overview', order: 0, content: input.caseStudyOverview }] : []),
              ...(input.caseStudyProblem ? [{ title: 'Challenge', slug: 'challenge', order: 1, content: input.caseStudyProblem }] : []),
              ...(input.caseStudyProcess ? [{ title: 'Process', slug: 'process', order: 2, content: input.caseStudyProcess }] : []),
              ...(input.caseStudySolution ? [{ title: 'Solution', slug: 'solution', order: 3, content: input.caseStudySolution }] : []),
              ...(input.caseStudyResults ? [{ title: 'Results', slug: 'results', order: 4, content: input.caseStudyResults }] : []),
            ],
          },
        },
      });
    }
  }

  return project;
}

export async function duplicateProjectRecord(id: string) {
  const projectFields = getProjectFieldSet();
  const source = await prisma.project.findUnique({ where: { id }, include: { images: true } });
  if (!source) notFound();
  const normalizedSource = normalizeProjectForDashboard(source);

  const slug = await generateUniqueProjectSlug(`${source.slug}-copy`);
  return prisma.project.create({
    data: {
      ...pickSupportedProjectData({
      slug,
      title: `${normalizedSource.title} Copy`,
      description: normalizedSource.description,
      longText: normalizedSource.longText,
      projectType: normalizedSource.projectType,
      category: normalizedSource.category,
      tags: normalizedSource.tags,
      technologies: normalizedSource.technologies,
      featured: false,
      published: false,
      archived: false,
      showOnHomepage: false,
      publishedAt: null,
      client: normalizedSource.client,
      role: normalizedSource.role,
      team: normalizedSource.team,
      duration: normalizedSource.duration,
      year: normalizedSource.year,
      liveUrl: normalizedSource.liveUrl,
      githubUrl: normalizedSource.githubUrl,
      coverImageUrl: normalizedSource.coverImageUrl,
      thumbnailUrl: normalizedSource.thumbnailUrl,
      galleryImages: normalizedSource.galleryImages,
      demoVideoUrl: normalizedSource.demoVideoUrl,
      seoTitle: normalizedSource.seoTitle,
      seoDescription: normalizedSource.seoDescription,
      seoKeywords: normalizedSource.seoKeywords,
      ogImage: normalizedSource.ogImage,
      orderIndex: normalizedSource.orderIndex + 1,
      }, projectFields),
      images: {
        create: source.images.map((image) => ({
          url: image.url,
          alt: image.alt,
          isCover: image.isCover,
          order: image.order,
        })),
      },
    } as Prisma.ProjectCreateInput,
  });
}

export async function bulkUpdateProjects(ids: string[], action: ProjectBulkInput['action']) {
  const projectFields = getProjectFieldSet();
  if (action === 'delete') return prisma.project.deleteMany({ where: { id: { in: ids } } });
  if (action === 'publish') return prisma.project.updateMany({ where: { id: { in: ids } }, data: pickSupportedProjectData({ published: true, archived: false, publishedAt: new Date() }, projectFields) });
  if (action === 'unpublish') return prisma.project.updateMany({ where: { id: { in: ids } }, data: pickSupportedProjectData({ published: false, archived: false, publishedAt: null }, projectFields) });
  if (action === 'archive') return prisma.project.updateMany({ where: { id: { in: ids } }, data: pickSupportedProjectData({ published: false, archived: true, publishedAt: null }, projectFields) });
  if (action === 'markFeatured') return prisma.project.updateMany({ where: { id: { in: ids } }, data: { featured: true } });
  if (action === 'removeFeatured') return prisma.project.updateMany({ where: { id: { in: ids } }, data: { featured: false } });

  for (const id of ids) {
    await duplicateProjectRecord(id);
  }

  return { count: ids.length };
}

export async function deleteProjectRecord(id: string) {
  return prisma.project.delete({ where: { id } });
}

export async function createProjectTaxonomy(input: ProjectTaxonomyInput) {
  const slug = input.slug ?? slugifyProject(input.name);
  return requireProjectTaxonomyDelegate().create({ data: { ...input, slug } });
}

export async function updateProjectTaxonomy(id: string, input: ProjectTaxonomyInput) {
  const slug = input.slug ?? slugifyProject(input.name);
  return requireProjectTaxonomyDelegate().update({ where: { id }, data: { ...input, slug } });
}

export async function deleteProjectTaxonomy(id: string) {
  return requireProjectTaxonomyDelegate().delete({ where: { id } });
}
