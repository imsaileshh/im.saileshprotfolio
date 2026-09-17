'use client';

import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TypeWriter } from '@/components/ui/TypeWriter';

const ease = [0.22, 1, 0.36, 1] as const;

export function HomeHero({ heroContent }: { heroContent?: any }) {
  const shouldReduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  const content = {
    eyebrow: 'UI/UX DESIGNER • FRONTEND DEVELOPER • VIBE CODER',
    heading1: "Hey, I'm",
    heading2: 'Sailesh',
    description1: 'I’m a UI/UX Designer & Frontend Developer',
    description2: "I'm passionate about turning ideas into intuitive digital experiences. From designing user-focused interfaces to building responsive web applications, I blend creative design, frontend development, and AI-powered workflows to create experiences that feel alive.",
    primaryCtaText: 'Explore My Work',
    primaryCtaLink: '#projects',
    secondaryCtaText: heroContent?.secondaryCtaText || 'Contact Me',
    secondaryCtaLink: heroContent?.secondaryCtaLink || '#hire',
    profileName: 'SAILESH P.',
    profileMeta: 'DESIGN / CODE / MOTION',
  };

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const updateDesktop = () => setIsDesktop(media.matches);
    updateDesktop();
    media.addEventListener('change', updateDesktop);
    return () => media.removeEventListener('change', updateDesktop);
  }, []);

  // Desktop subtle ambient cursor glow
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const springY = useSpring(mouseY, { damping: 30, stiffness: 200 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!isDesktop || shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <section
      id="home"
      onMouseMove={handleMouseMove}
      className="relative w-full pt-8 sm:pt-10 md:pt-14 lg:pt-16 pb-12 sm:pb-14 md:pb-16 lg:pb-20 px-5 sm:px-6 md:px-10 lg:px-16 overflow-hidden flex flex-col justify-center min-h-[calc(100dvh-120px)] lg:min-h-[auto]"
    >
      {/* ── Background Subtle Editorial Typographic Watermark ──
           Text intentionally moved to CSS ::before so Chrome does NOT
           pick this decorative element as the LCP candidate. ── */}
      <div
        aria-hidden="true"
        className="hero-watermark absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none w-full max-w-7xl flex justify-center items-center overflow-hidden -z-10"
      />

      {/* ── Desktop Ambient Cursor Radial Glow ── */}
      {isDesktop && !shouldReduceMotion && (
        <motion.div
          aria-hidden="true"
          className="absolute w-[500px] h-[500px] rounded-full pointer-events-none -z-10 blur-[100px] opacity-40"
          style={{
            x: springX,
            y: springY,
            translateX: '-50%',
            translateY: '-50%',
            background: 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 70%)',
          }}
        />
      )}

      {/* ── Main Hero Composition Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 xl:gap-14 items-center w-full max-w-7xl mx-auto">
        
        {/* ── LEFT: Main Content & Headline (Col 1-7) ── */}
        <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
          
          {/* Role Eyebrow Tag */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 mb-4 sm:mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] sm:text-[12px] font-mono font-medium text-muted tracking-[0.18em] uppercase">
              {content.eyebrow}
            </span>
          </motion.div>

          {/* Primary Headline */}
          <h1 className="font-display tracking-tight text-left mb-5 sm:mb-6">
            <motion.span
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="block text-4xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-[70px] font-medium text-foreground leading-[1.05]"
            >
              {content.heading1}
            </motion.span>
            
            <motion.span
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
              className="block text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px] font-semibold text-accent leading-[1.02] mt-1"
            >
              {content.heading2.replace(/\.+$/, '')}
              <motion.span
                animate={shouldReduceMotion ? {} : { opacity: [1, 0.4, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-foreground inline-block"
              >
                .
              </motion.span>
            </motion.span>
          </h1>

          {/* Supporting Statement & Location */}
          <div className="flex flex-col gap-2 mb-8 sm:mb-9 max-w-[540px]">
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3, ease }}
              className="text-base sm:text-lg md:text-[19px] text-foreground/90 font-light leading-[1.5] tracking-tight flex items-center flex-wrap"
            >
              I&apos;m a&nbsp;<TypeWriter words={['UI/UX Designer', 'Frontend Developer', 'Vibe Coder']} />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.38, ease }}
              className="text-[13.5px] sm:text-[14.5px] text-muted leading-relaxed font-normal"
            >
              {content.description2}
            </motion.p>
          </div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease }}
            className="flex flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto"
          >
            {/* Primary CTA (Explore Projects) */}
            <button
              onClick={() => {
                const el = document.getElementById('projects');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-accent text-white px-4 sm:px-8 py-2.5 sm:py-4 rounded-xl text-[13px] sm:text-[15px] font-medium tracking-wide whitespace-nowrap hover:bg-accent/90 active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(45,212,191,0.15)] hover:shadow-[0_0_25px_rgba(45,212,191,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <span>{content.primaryCtaText}</span>
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1 sm:w-4 sm:h-4"
              />
            </button>

            {/* Secondary CTA (Contact Me) */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-hire-me'))}
              className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[var(--card)] text-foreground px-4 sm:px-8 py-2.5 sm:py-4 rounded-xl text-[13px] sm:text-[15px] font-medium whitespace-nowrap hover:bg-foreground/5 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 shadow-sm"
            >
              <span>Contact Me</span>
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1 sm:w-4 sm:h-4"
              />
            </button>
          </motion.div>

        </div>

        {/* ── RIGHT: Editorial Portrait (Col 8-12) ── */}
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.25, ease }}
          className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center w-full z-10 mt-6 lg:mt-0"
        >
          <div className="w-full max-w-[280px] sm:max-w-[310px] md:max-w-[320px] lg:max-w-[330px] flex flex-col group">
            
            {/* Portrait Frame */}
            <div className="relative w-full aspect-[4/5] rounded-[16px] overflow-hidden border border-border-subtle/80 bg-[var(--card)] shadow-md transition-all duration-300 group-hover:border-white/20">
              <Image
                src="/images/profile/IMG_0871.jpg"
                alt="Sailesh P"
                fill
                priority
                sizes="(max-width: 768px) 310px, 340px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />
              
              {/* Discrete Corner Subtle Marker */}
              <div className="absolute top-3.5 right-3.5 pointer-events-none">
                <span className="text-[9.5px] font-mono text-white/40 tracking-wider">
                  / 2026
                </span>
              </div>
            </div>

            {/* Editorial Metadata Below Photo */}
            <div className="flex items-center justify-between mt-3 px-0.5">
              <span className="text-[10px] font-mono font-semibold tracking-[0.16em] uppercase text-foreground/75">
                {content.profileName}
              </span>
              <span className="text-[9.5px] font-mono tracking-[0.14em] uppercase text-muted/60">
                {content.profileMeta}
              </span>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
