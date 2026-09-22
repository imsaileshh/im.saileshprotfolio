'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/dashboard/auth';
import type { HomepageConfig } from '@/types/homepage-cms';

export async function saveHomepageConfigAction(config: HomepageConfig) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    throw new Error('Unauthorized');
  }

  const heroContent = {
    eyebrow: config.sections.hero.eyebrow,
    heading1: config.sections.hero.heading1,
    heading2: config.sections.hero.heading2,
    subheading: config.sections.hero.subheading,
    description1: config.sections.hero.description1,
    description2: config.sections.hero.description2,
    imageUrl: config.sections.hero.imageUrl,
    primaryCtaText: config.sections.hero.primaryCtaText,
    primaryCtaLink: config.sections.hero.primaryCtaLink,
    primaryCtaVisible: config.sections.hero.primaryCtaVisible,
    primaryCtaNewTab: config.sections.hero.primaryCtaNewTab,
    secondaryCtaText: config.sections.hero.secondaryCtaText,
    secondaryCtaLink: config.sections.hero.secondaryCtaLink,
    secondaryCtaVisible: config.sections.hero.secondaryCtaVisible,
    secondaryCtaNewTab: config.sections.hero.secondaryCtaNewTab,
    profileLabels: config.sections.hero.profileLabels,
    supportingText: config.sections.hero.supportingText,
    visible: config.sections.hero.visible,
  };

  const aboutContent = {
    eyebrow: config.sections.about.label,
    heading: config.sections.about.heading,
    role: config.sections.about.subheading,
    paragraph: config.sections.about.content,
    specializations: config.sections.about.specializations,
    ctaText: config.sections.about.ctaText,
    ctaLink: config.sections.about.ctaLink,
    visible: config.sections.about.visible,
  };

  const updatedSettings = await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {
      homepageConfig: config as unknown as Prisma.InputJsonValue,
      heroContent: heroContent as unknown as Prisma.InputJsonValue,
      aboutContent: aboutContent as unknown as Prisma.InputJsonValue,
    },
    create: {
      id: 'singleton',
      homepageConfig: config as unknown as Prisma.InputJsonValue,
      heroContent: heroContent as unknown as Prisma.InputJsonValue,
      aboutContent: aboutContent as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath('/');
  revalidatePath('/dashboard/home');
  revalidatePath('/about');

  return { 
    success: true, 
    updatedAt: updatedSettings.updatedAt.toISOString() 
  };
}

export async function toggleSkillSectionVisibilityAction(sectionId: string, visible: boolean) {
  const auth = await requireAdmin();
  if (!auth.authorized) throw new Error('Unauthorized');

  await prisma.skillSection.update({
    where: { id: sectionId },
    data: { visible },
  });

  revalidatePath('/');
  revalidatePath('/dashboard/home');
  revalidatePath('/dashboard/stack');
  return { success: true };
}

export async function toggleSkillVisibilityAction(skillId: string, visible: boolean) {
  const auth = await requireAdmin();
  if (!auth.authorized) throw new Error('Unauthorized');

  await prisma.skill.update({
    where: { id: skillId },
    data: { visible },
  });

  revalidatePath('/');
  revalidatePath('/dashboard/home');
  revalidatePath('/dashboard/stack');
  return { success: true };
}
