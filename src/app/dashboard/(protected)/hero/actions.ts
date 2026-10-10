'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/dashboard/auth';

export async function updateHeroAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.authorized) throw new Error('Unauthorized');

  const heroContent = {
    eyebrow: (formData.get('eyebrow') as string) || 'UI/UX DESIGNER · FRONTEND DEVELOPER',
    heading: (formData.get('heading') as string) || "Hey, I'm Sailesh P!",
    headingHighlight: (formData.get('headingHighlight') as string) || 'Sailesh P!',
    tagline: (formData.get('tagline') as string) || 'Designing experiences. Building digital products.',
    description: (formData.get('description') as string) || "I'm a UI/UX Designer and Frontend Developer focused on creating intuitive user experiences and high-performance web applications.",
    headingFontFamily: (formData.get('headingFontFamily') as string) || undefined,
    headingFontWeight: (formData.get('headingFontWeight') as string) || undefined,
    headingFontSize: (formData.get('headingFontSize') as string) || undefined,
    highlightColor: (formData.get('highlightColor') as string) || undefined,
    heading1: formData.get('heading1') as string,
    heading2: formData.get('heading2') as string,
    description1: formData.get('description1') as string,
    description2: formData.get('description2') as string,
    primaryCtaText: formData.get('primaryCtaText') as string,
    primaryCtaLink: formData.get('primaryCtaLink') as string,
    secondaryCtaText: formData.get('secondaryCtaText') as string,
    secondaryCtaLink: formData.get('secondaryCtaLink') as string,
    profileLabels: formData.get('profileLabels') as string,
    supportingText: formData.get('supportingText') as string,
  };

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: { heroContent: heroContent as Prisma.InputJsonValue },
    create: { id: 'singleton', heroContent: heroContent as Prisma.InputJsonValue },
  });

  revalidatePath('/dashboard/hero');
  revalidatePath('/dashboard/home');
  revalidatePath('/');
}
