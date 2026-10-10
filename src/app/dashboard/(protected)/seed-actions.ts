'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAdmin } from '@/lib/dashboard/auth';
import { Prisma } from '@prisma/client';

const HERO_DEFAULTS = {
  eyebrow: 'UI/UX DESIGNER · FRONTEND DEVELOPER',
  heading: "Hey, I'm Sailesh P!",
  headingHighlight: 'Sailesh P!',
  heading1: "Hey, I'm",
  heading2: 'Sailesh P!',
  tagline: 'Designing experiences. Building digital products.',
  subheading: 'Designing experiences. Building digital products.',
  description: "I'm a UI/UX Designer and Frontend Developer focused on creating intuitive user experiences and high-performance web applications.",
  description1: 'UI/UX Designer & Frontend Developer',
  description2: "I'm a UI/UX Designer and Frontend Developer focused on creating intuitive user experiences and high-performance web applications.",
  headingFontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  headingFontWeight: '600',
  headingFontSize: 'clamp(30px, 4.5vw, 50px)',
  highlightColor: '#2DD4BF',
  primaryCtaText: 'Explore My Work',
  primaryCtaLink: '/works',
  secondaryCtaText: 'Contact Me',
  secondaryCtaLink: '#hire',
  profileLabels: 'AVAILABLE FOR WORK · BASED IN KERALA',
  supportingText: 'Passionate about creating intuitive, engaging, and accessible user experiences.',
};

const ABOUT_CONTENT_DEFAULTS = {
  eyebrow: 'ABOUT ME',
  heading: 'Design. Build. Ship.',
  role: 'Frontend Developer & UI/UX Designer',
  paragraph:
    'I bridge the gap between design and engineering, crafting digital experiences that are not only visually stunning but also highly performant and accessible.',
  ctaText: 'Read my full story',
  ctaLink: '/about',
  capabilities: [
    { title: 'UI / UX Design', desc: 'Crafting intuitive, beautiful interfaces that users love.' },
    { title: 'Frontend Engineering', desc: 'Building fast, accessible, production-grade web apps.' },
    { title: 'Design Systems', desc: 'Creating scalable component libraries and style guides.' },
    { title: 'Performance', desc: 'Optimising for Core Web Vitals and real-world speed.' },
  ],
};

/**
 * Seeds heroContent and aboutContent into siteSettings with the
 * existing portfolio defaults — only fills fields that are currently null/missing.
 * Safe to call multiple times; existing saved content is never overwritten.
 */
export async function seedDefaultContentAction() {
  const auth = await requireAdmin();
  if (!auth.authorized) throw new Error('Unauthorized');

  const existing = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
  });

  const updateData: Record<string, Prisma.InputJsonValue> = {};

  if (!existing?.heroContent) {
    updateData.heroContent = HERO_DEFAULTS;
  }
  if (!existing?.aboutContent) {
    updateData.aboutContent = ABOUT_CONTENT_DEFAULTS;
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      update: updateData,
      create: {
        id: 'singleton',
        heroContent: HERO_DEFAULTS,
        aboutContent: ABOUT_CONTENT_DEFAULTS,
      },
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/');
  revalidatePath('/about');
}
