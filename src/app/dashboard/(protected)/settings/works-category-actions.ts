'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { verifySession } from '@/lib/auth/session';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get current worksPage config from siteSettings
 */
export async function getWorksCategoriesConfig() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
    select: { homepageConfig: true },
  });

  const hpConfig = (settings?.homepageConfig as Record<string, unknown>) || {};
  const worksPage = (hpConfig.worksPage as Record<string, unknown>) || {};

  // Fetch from ProjectTaxonomy as well
  const taxonomies = await prisma.projectTaxonomy.findMany({
    where: { type: 'category' },
    orderBy: { name: 'asc' },
  }).catch(() => []);

  // Fetch unique categories currently assigned to projects
  const projectCategories = await prisma.project.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ['category'],
  });

  const assignedCategories = projectCategories
    .map((p) => p.category?.trim())
    .filter((c): c is string => Boolean(c));

  // Default fallback categories
  const defaultCategories = ['All', 'Web Development', 'E-commerce', 'UI/UX'];

  let categories: string[] = [];

  if (Array.isArray(worksPage.categories) && worksPage.categories.length > 0) {
    categories = worksPage.categories;
  } else if (taxonomies.length > 0) {
    categories = taxonomies.map((t) => t.name);
  } else if (assignedCategories.length > 0) {
    categories = assignedCategories;
  } else {
    categories = defaultCategories;
  }

  // Ensure 'All' is always present and first
  const normalized = Array.from(new Set(categories.map((c) => c.trim()).filter(Boolean)));
  const withoutAll = normalized.filter((c) => c.toLowerCase() !== 'all');
  const finalCategories = ['All', ...withoutAll];

  const showCategoryBar = worksPage.showCategoryBar !== false;

  return {
    showCategoryBar,
    categories: finalCategories,
  };
}

/**
 * Toggle category bar visibility on /works
 */
export async function toggleWorksCategoryBarAction(showCategoryBar: boolean) {
  const session = await verifySession();
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
  });

  const hpConfig = (settings?.homepageConfig as Record<string, unknown>) || {};
  const worksPage = (hpConfig.worksPage as Record<string, unknown>) || {};

  const updatedWorksPage = {
    ...worksPage,
    showCategoryBar,
  };

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {
      homepageConfig: {
        ...hpConfig,
        worksPage: updatedWorksPage,
      },
    },
    create: {
      id: 'singleton',
      homepageConfig: {
        worksPage: updatedWorksPage,
      },
    },
  });

  revalidatePath('/works');
  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/projects');
  return { success: true, showCategoryBar };
}

/**
 * Add a new category
 */
export async function addWorksCategoryAction(name: string) {
  const session = await verifySession();
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const cleanName = name.trim();
  if (!cleanName || cleanName.toLowerCase() === 'all') {
    throw new Error('Invalid category name');
  }

  const slug = slugify(cleanName);

  // 1. Create in ProjectTaxonomy if it doesn't exist
  await prisma.projectTaxonomy.upsert({
    where: {
      type_slug: {
        type: 'category',
        slug,
      },
    },
    update: {
      name: cleanName,
    },
    create: {
      type: 'category',
      name: cleanName,
      slug,
    },
  }).catch(() => null);

  // 2. Add to siteSettings worksPage.categories
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
  });

  const hpConfig = (settings?.homepageConfig as Record<string, unknown>) || {};
  const worksPage = (hpConfig.worksPage as Record<string, unknown>) || {};
  const currentCategories: string[] = Array.isArray(worksPage.categories)
    ? worksPage.categories
    : ['All', 'Web Development', 'E-commerce', 'UI/UX'];

  const updatedCategories = Array.from(new Set([...currentCategories, cleanName]));

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {
      homepageConfig: {
        ...hpConfig,
        worksPage: {
          ...worksPage,
          categories: updatedCategories,
        },
      },
    },
    create: {
      id: 'singleton',
      homepageConfig: {
        worksPage: {
          categories: updatedCategories,
        },
      },
    },
  });

  revalidatePath('/works');
  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/projects');
  return { success: true, categories: updatedCategories };
}

/**
 * Rename an existing category
 * Updates ProjectTaxonomy, worksConfig, and all existing projects assigned to oldName!
 */
export async function renameWorksCategoryAction(oldName: string, newName: string) {
  const session = await verifySession();
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const cleanOld = oldName.trim();
  const cleanNew = newName.trim();

  if (!cleanNew || cleanNew.toLowerCase() === 'all' || cleanOld.toLowerCase() === 'all') {
    throw new Error('Cannot rename to/from "All"');
  }

  const oldSlug = slugify(cleanOld);
  const newSlug = slugify(cleanNew);

  // 1. Update ProjectTaxonomy
  try {
    const existingTax = await prisma.projectTaxonomy.findUnique({
      where: { type_slug: { type: 'category', slug: oldSlug } },
    });
    if (existingTax) {
      await prisma.projectTaxonomy.update({
        where: { id: existingTax.id },
        data: { name: cleanNew, slug: newSlug },
      });
    } else {
      await prisma.projectTaxonomy.upsert({
        where: { type_slug: { type: 'category', slug: newSlug } },
        update: { name: cleanNew },
        create: { type: 'category', name: cleanNew, slug: newSlug },
      });
    }
  } catch {
    // taxonomy error ignored
  }

  // 2. Update all projects with old category to new category
  await prisma.project.updateMany({
    where: {
      category: {
        equals: cleanOld,
        mode: 'insensitive',
      },
    },
    data: {
      category: cleanNew,
    },
  });

  // 3. Update siteSettings worksPage.categories
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
  });

  const hpConfig = (settings?.homepageConfig as Record<string, unknown>) || {};
  const worksPage = (hpConfig.worksPage as Record<string, unknown>) || {};
  const currentCategories: string[] = Array.isArray(worksPage.categories)
    ? worksPage.categories
    : ['All', 'Web Development', 'E-commerce', 'UI/UX'];

  const updatedCategories = currentCategories.map((c) =>
    c.toLowerCase() === cleanOld.toLowerCase() ? cleanNew : c
  );

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {
      homepageConfig: {
        ...hpConfig,
        worksPage: {
          ...worksPage,
          categories: updatedCategories,
        },
      },
    },
    create: {
      id: 'singleton',
      homepageConfig: {
        worksPage: {
          categories: updatedCategories,
        },
      },
    },
  });

  revalidatePath('/works');
  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/projects');
  return { success: true, categories: updatedCategories };
}

/**
 * Delete a category
 */
export async function deleteWorksCategoryAction(name: string) {
  const session = await verifySession();
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const cleanName = name.trim();
  if (cleanName.toLowerCase() === 'all') {
    throw new Error('Cannot delete "All" category');
  }

  const slug = slugify(cleanName);

  // 1. Delete from ProjectTaxonomy
  try {
    await prisma.projectTaxonomy.deleteMany({
      where: {
        type: 'category',
        slug,
      },
    });
  } catch {
    // ignore
  }

  // 2. Remove from siteSettings worksPage.categories
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
  });

  const hpConfig = (settings?.homepageConfig as Record<string, unknown>) || {};
  const worksPage = (hpConfig.worksPage as Record<string, unknown>) || {};
  const currentCategories: string[] = Array.isArray(worksPage.categories)
    ? worksPage.categories
    : ['All', 'Web Development', 'E-commerce', 'UI/UX'];

  const updatedCategories = currentCategories.filter(
    (c) => c.toLowerCase() !== cleanName.toLowerCase()
  );

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {
      homepageConfig: {
        ...hpConfig,
        worksPage: {
          ...worksPage,
          categories: updatedCategories,
        },
      },
    },
    create: {
      id: 'singleton',
      homepageConfig: {
        worksPage: {
          categories: updatedCategories,
        },
      },
    },
  });

  revalidatePath('/works');
  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/projects');
  return { success: true, categories: updatedCategories };
}

/* ─────────────────────────────────────────────────────────────
   PERSONAL PROJECTS CATEGORY ACTIONS
────────────────────────────────────────────────────────────── */

const DEFAULT_PERSONAL_CATEGORIES = [
  'All',
  'Case Studies',
  'Web Development',
  'Tools',
  'Experiments',
  'UI/UX',
];

/**
 * Get current personalProjectsPage config from siteSettings
 */
export async function getPersonalProjectsCategoriesConfig() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
    select: { homepageConfig: true },
  });

  const hpConfig = (settings?.homepageConfig as Record<string, unknown>) || {};
  const personalPage = (hpConfig.personalProjectsPage as Record<string, unknown>) || {};

  // Fetch unique categories currently assigned to personal projects
  const personalProjects = await prisma.project.findMany({
    where: {
      projectType: {
        equals: 'Personal Project',
        mode: 'insensitive',
      },
      category: { not: null },
    },
    select: { category: true },
    distinct: ['category'],
  });

  const assignedCategories = personalProjects
    .map((p) => p.category?.trim())
    .filter((c): c is string => Boolean(c));

  let categories: string[] = [];

  if (Array.isArray(personalPage.categories) && personalPage.categories.length > 0) {
    categories = personalPage.categories as string[];
  } else if (assignedCategories.length > 0) {
    categories = assignedCategories;
  } else {
    categories = DEFAULT_PERSONAL_CATEGORIES;
  }

  // Ensure 'All' is always present and first
  const normalized = Array.from(new Set(categories.map((c) => c.trim()).filter(Boolean)));
  const withoutAll = normalized.filter((c) => c.toLowerCase() !== 'all');
  const finalCategories = ['All', ...withoutAll];

  const showCategoryBar = personalPage.showCategoryBar !== false;

  return {
    showCategoryBar,
    categories: finalCategories,
  };
}

/**
 * Toggle category bar visibility on /personal-projects
 */
export async function togglePersonalProjectsCategoryBarAction(showCategoryBar: boolean) {
  const session = await verifySession();
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
  });

  const hpConfig = (settings?.homepageConfig as Record<string, unknown>) || {};
  const personalPage = (hpConfig.personalProjectsPage as Record<string, unknown>) || {};

  const updatedPersonalPage = {
    ...personalPage,
    showCategoryBar,
  };

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {
      homepageConfig: {
        ...hpConfig,
        personalProjectsPage: updatedPersonalPage,
      },
    },
    create: {
      id: 'singleton',
      homepageConfig: {
        personalProjectsPage: updatedPersonalPage,
      },
    },
  });

  revalidatePath('/personal-projects');
  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/personal-projects');
  return { success: true, showCategoryBar };
}

/**
 * Add a new personal project category
 */
export async function addPersonalProjectsCategoryAction(name: string) {
  const session = await verifySession();
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const cleanName = name.trim();
  if (!cleanName || cleanName.toLowerCase() === 'all') {
    throw new Error('Invalid category name');
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
  });

  const hpConfig = (settings?.homepageConfig as Record<string, unknown>) || {};
  const personalPage = (hpConfig.personalProjectsPage as Record<string, unknown>) || {};
  const currentCategories: string[] = Array.isArray(personalPage.categories)
    ? (personalPage.categories as string[])
    : DEFAULT_PERSONAL_CATEGORIES;

  const updatedCategories = Array.from(new Set([...currentCategories, cleanName]));

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {
      homepageConfig: {
        ...hpConfig,
        personalProjectsPage: {
          ...personalPage,
          categories: updatedCategories,
        },
      },
    },
    create: {
      id: 'singleton',
      homepageConfig: {
        personalProjectsPage: {
          categories: updatedCategories,
        },
      },
    },
  });

  revalidatePath('/personal-projects');
  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/personal-projects');
  return { success: true, categories: updatedCategories };
}

/**
 * Rename an existing personal project category
 * Updates personal projects category list and all matching personal projects!
 */
export async function renamePersonalProjectsCategoryAction(oldName: string, newName: string) {
  const session = await verifySession();
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const cleanOld = oldName.trim();
  const cleanNew = newName.trim();

  if (!cleanNew || cleanNew.toLowerCase() === 'all' || cleanOld.toLowerCase() === 'all') {
    throw new Error('Cannot rename to/from "All"');
  }

  // 1. Update personal projects in DB
  await prisma.project.updateMany({
    where: {
      projectType: {
        equals: 'Personal Project',
        mode: 'insensitive',
      },
      category: {
        equals: cleanOld,
        mode: 'insensitive',
      },
    },
    data: {
      category: cleanNew,
    },
  });

  // 2. Update siteSettings personalProjectsPage.categories
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
  });

  const hpConfig = (settings?.homepageConfig as Record<string, unknown>) || {};
  const personalPage = (hpConfig.personalProjectsPage as Record<string, unknown>) || {};
  const currentCategories: string[] = Array.isArray(personalPage.categories)
    ? (personalPage.categories as string[])
    : DEFAULT_PERSONAL_CATEGORIES;

  const updatedCategories = currentCategories.map((c) =>
    c.toLowerCase() === cleanOld.toLowerCase() ? cleanNew : c
  );

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {
      homepageConfig: {
        ...hpConfig,
        personalProjectsPage: {
          ...personalPage,
          categories: updatedCategories,
        },
      },
    },
    create: {
      id: 'singleton',
      homepageConfig: {
        personalProjectsPage: {
          categories: updatedCategories,
        },
      },
    },
  });

  revalidatePath('/personal-projects');
  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/personal-projects');
  return { success: true, categories: updatedCategories };
}

/**
 * Delete a personal project category
 */
export async function deletePersonalProjectsCategoryAction(name: string) {
  const session = await verifySession();
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const cleanName = name.trim();
  if (cleanName.toLowerCase() === 'all') {
    throw new Error('Cannot delete "All" category');
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
  });

  const hpConfig = (settings?.homepageConfig as Record<string, unknown>) || {};
  const personalPage = (hpConfig.personalProjectsPage as Record<string, unknown>) || {};
  const currentCategories: string[] = Array.isArray(personalPage.categories)
    ? (personalPage.categories as string[])
    : DEFAULT_PERSONAL_CATEGORIES;

  const updatedCategories = currentCategories.filter(
    (c) => c.toLowerCase() !== cleanName.toLowerCase()
  );

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {
      homepageConfig: {
        ...hpConfig,
        personalProjectsPage: {
          ...personalPage,
          categories: updatedCategories,
        },
      },
    },
    create: {
      id: 'singleton',
      homepageConfig: {
        personalProjectsPage: {
          categories: updatedCategories,
        },
      },
    },
  });

  revalidatePath('/personal-projects');
  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/personal-projects');
  return { success: true, categories: updatedCategories };
}

