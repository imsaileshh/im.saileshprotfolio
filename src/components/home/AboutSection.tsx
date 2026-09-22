'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { User, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { TypeWriter } from '@/components/ui/TypeWriter';

import type { AboutSectionConfig } from '@/types/homepage-cms';

const ease = [0.22, 1, 0.36, 1] as const;

export type AboutSectionContent = Partial<AboutSectionConfig> & {
  paragraph?: React.ReactNode | string;
  eyebrow?: string;
  role?: string;
};

export function AboutSection({ aboutContent }: { aboutContent?: AboutSectionContent | null }) {
  const shouldReduceMotion = useReducedMotion();

  if (aboutContent && aboutContent.visible === false) {
    return null;
  }

  const defaultParagraphs = (
    <>
      <p>I&apos;m a UI/UX Designer and Frontend Developer passionate about creating intuitive digital experiences, interactive interfaces, and modern web applications that look great, feel seamless, and perform well.</p>
      <p className="mt-4">When I&apos;m not designing or building, I&apos;m exploring new technologies, experimenting with AI-powered development, and refining user experiences. My work blends creative design with frontend development — creating clean interfaces, smooth interactions, and digital experiences that feel alive.</p>
    </>
  );

  const formattedParagraph = typeof aboutContent?.paragraph === 'string'
    ? (
      <div className="space-y-4">
        {aboutContent.paragraph.split(/\n\n+/).map((para: string, i: number) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    )
    : (aboutContent?.paragraph || defaultParagraphs);

  const content = {
    label: aboutContent?.label || aboutContent?.eyebrow || 'About Me',
    heading: aboutContent?.heading || 'Design. Build. Ship.',
    role: aboutContent?.subheading || aboutContent?.role || 'UI/UX Designer • Frontend Developer • Vibe Coder',
    paragraph: formattedParagraph,
    ctaText: aboutContent?.ctaText || 'More about me',
    ctaLink: aboutContent?.ctaLink || '/about',
    specializations: Array.isArray(aboutContent?.specializations) && aboutContent.specializations.length > 0
      ? aboutContent.specializations
      : [
          'UI/UX DESIGNER.',
          'PRODUCT DESIGNER.',
          'FRONTEND DEVELOPER.',
          'VIBE CODER.'
        ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease },
    },
  };

  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: 0.08,
      },
    },
  };

  return (
    <section
      id="about-preview"
      className="pt-6 sm:pt-8 md:pt-10 pb-2 sm:pb-4 md:pb-6 relative px-5 sm:px-6 md:px-10 lg:px-16"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-6 xl:gap-8 items-start">
        
        {/* ── LEFT COLUMN (Col 1–7: ~58%) ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="lg:col-span-7 xl:col-span-7 flex flex-col items-start text-left"
        >
          {/* Section Eyebrow + Icon Header */}
          <motion.div variants={itemVariants} className="flex items-center gap-3.5 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-2xl bg-[var(--card)] border border-border-subtle text-accent shadow-xs shrink-0">
              <User size={21} strokeWidth={2} className="text-accent" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-[34px] lg:text-[38px] font-display font-medium tracking-tight text-foreground/90 leading-[1.1]">
              {content.label}
            </h2>
          </motion.div>

          {/* Subheading: Design. Build. Ship. */}
          <motion.h3
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-[36px] lg:text-[42px] font-display font-semibold text-foreground tracking-tight mb-2 leading-[1.15]"
          >
            {content.heading || 'Design. Build. Ship.'}
          </motion.h3>

          {/* Role Label */}
          <motion.p
            variants={itemVariants}
            className="text-xs sm:text-sm md:text-[14px] font-mono tracking-widest text-accent font-semibold uppercase mb-4"
          >
            {content.role}
          </motion.p>

          {/* Paragraph */}
          <motion.div
            variants={itemVariants}
            className="text-[15px] sm:text-base md:text-[17px] lg:text-[18px] text-muted leading-[1.7] font-normal max-w-[540px] mb-6"
          >
            {content.paragraph}
          </motion.div>

          {/* Connected CTA Link */}
          <motion.div variants={itemVariants}>
            <Link
              href={content.ctaLink}
              className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-foreground hover:text-accent transition-colors duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm py-0.5"
            >
              <span className="border-b border-accent/30 group-hover:border-accent transition-colors duration-200 pb-0.5">
                {content.ctaText}
              </span>
              <ArrowUpRight
                size={16}
                className="text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
              />
            </Link>
          </motion.div>
        </motion.div>

        {/* ── RIGHT COLUMN: Editorial 4-Role Index (Col 8–12: ~42%) ── */}
        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="lg:col-span-5 xl:col-span-5 flex flex-col justify-start w-full mt-10 lg:mt-[52px]"
        >
          <div className="text-2xl sm:text-3xl md:text-[34px] lg:text-[40px] font-display font-medium text-muted/50 leading-[1.4] tracking-tight">
            I specialize as a <br className="hidden sm:block" />
            <span className="text-foreground font-semibold">
              <TypeWriter 
                words={content.specializations} 
              />
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
