'use client';

import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { TypeWriter } from '@/components/ui/TypeWriter';

import type { HeroSectionConfig } from '@/types/homepage-cms';

const ease = [0.22, 1, 0.36, 1] as const;

export function HomeHero({ heroContent }: { heroContent?: Partial<HeroSectionConfig> | null }) {
  const shouldReduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  const content = {
    eyebrow: heroContent?.eyebrow || 'UI/UX DESIGNER • FRONTEND DEVELOPER • VIBE CODER',
    heading1: heroContent?.heading1 ?? "Hey, I'm",
    heading2: heroContent?.heading2 ?? 'Sailesh',
    description1: heroContent?.description1 || 'I’m a UI/UX Designer & Frontend Developer',
    description2: heroContent?.description2 || "I'm passionate about turning ideas into intuitive digital experiences. From designing user-focused interfaces to building responsive web applications, I blend creative design, frontend development, and AI-powered workflows to create experiences that feel alive.",
    imageUrl: heroContent?.imageUrl || '/images/profile/IMG_0871.jpg',
    primaryCtaText: heroContent?.primaryCtaText || 'Explore My Work',
    primaryCtaLink: heroContent?.primaryCtaLink || '/works',
    primaryCtaVisible: heroContent?.primaryCtaVisible ?? true,
    primaryCtaNewTab: heroContent?.primaryCtaNewTab ?? false,
    secondaryCtaText: heroContent?.secondaryCtaText || 'Contact Me',
    secondaryCtaLink: heroContent?.secondaryCtaLink || '#hire',
    secondaryCtaVisible: heroContent?.secondaryCtaVisible ?? true,
    secondaryCtaNewTab: heroContent?.secondaryCtaNewTab ?? false,
    profileName: heroContent?.profileLabels || 'SAILESH P.',
    profileMeta: heroContent?.supportingText || 'DESIGN / CODE / MOTION',
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

  const sectionRef = useRef<HTMLElement>(null);
  const rectRef = useRef<{ left: number; top: number } | null>(null);

  useEffect(() => {
    const handleResetRect = () => {
      rectRef.current = null;
    };
    window.addEventListener('resize', handleResetRect, { passive: true });
    const scrollContainer = document.getElementById('scroll-container');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleResetRect, { passive: true });
    }
    return () => {
      window.removeEventListener('resize', handleResetRect);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleResetRect);
      }
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!isDesktop || shouldReduceMotion) return;
    if (!rectRef.current && sectionRef.current) {
      const r = sectionRef.current.getBoundingClientRect();
      rectRef.current = { left: r.left, top: r.top };
    }
    const left = rectRef.current?.left ?? 0;
    const top = rectRef.current?.top ?? 0;
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  if (heroContent && heroContent.visible === false) {
    return null;
  }

  return (
    <section
      id="home"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative w-full pt-4 sm:pt-6 lg:pt-16 pb-8 sm:pb-12 lg:pb-20 px-4 sm:px-6 md:px-10 lg:px-16 overflow-hidden flex flex-col justify-center min-h-0 lg:min-h-[auto]"
    >
      {/* ── Background Subtle Editorial Typographic Watermark ──
           Text intentionally moved to CSS ::before so Chrome does NOT
           pick this decorative element as the LCP candidate. ── */}
      <div
        aria-hidden="true"
        className="hero-watermark absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none w-full max-w-7xl flex justify-center items-center overflow-hidden -z-10"
      />

      {/* ── Desktop Ambient Cursor Radial Glow (Hardware-accelerated, zero filter overhead) ── */}
      {isDesktop && !shouldReduceMotion && (
        <motion.div
          aria-hidden="true"
          className="absolute w-[500px] h-[500px] rounded-full pointer-events-none -z-10 opacity-50"
          style={{
            x: springX,
            y: springY,
            translateX: '-50%',
            translateY: '-50%',
            willChange: 'transform',
            background: 'radial-gradient(circle 250px at center, rgba(45,212,191,0.08) 0%, rgba(45,212,191,0.03) 35%, transparent 70%)',
          }}
        />
      )}

      {/* ── Main Hero Composition Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 xl:gap-14 items-center w-full max-w-7xl mx-auto">
        
        {/* ── LEFT: Main Content & Headline (Col 1-7 on Desktop, Order 2 on Mobile) ── */}
        <div className="lg:col-span-7 flex flex-col items-start text-left z-10 order-2 lg:order-1">
          
          {/* Role Eyebrow Tag */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 mb-3 sm:mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] sm:text-[12px] font-mono font-medium text-muted tracking-[0.18em] uppercase">
              {content.eyebrow}
            </span>
          </motion.div>

          {/* Primary Headline */}
          <motion.h1
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease }}
            className="font-display tracking-tight text-left mb-4 sm:mb-6"
          >
            <span className="text-[36px] xs:text-[42px] sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px] font-medium text-foreground leading-[1.02]">
              {content.heading1}{' '}
            </span>
            
            <span className="text-[38px] xs:text-[44px] sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px] font-semibold text-accent leading-[1.02]">
              {content.heading2.replace(/\.+$/, '')}
              <motion.span
                animate={shouldReduceMotion ? {} : { opacity: [1, 0.4, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-foreground inline-block"
              >
                .
              </motion.span>
            </span>
          </motion.h1>

          {/* Supporting Statement & Location */}
          <div className="flex flex-col gap-2 mb-6 sm:mb-9 max-w-none lg:max-w-[540px]">
            <div className="text-base sm:text-lg md:text-[19px] text-foreground/90 font-medium leading-[1.5] tracking-tight flex items-center flex-wrap">
              I&apos;m a&nbsp;<TypeWriter words={['UI/UX Designer', 'Frontend Developer', 'Vibe Coder']} />
            </div>
            
            <p className="text-[14px] sm:text-base md:text-[17px] text-muted leading-relaxed font-normal">
              {content.description2}
            </p>
          </div>

          {/* Action CTAs */}
          {(content.primaryCtaVisible || content.secondaryCtaVisible) && (
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease }}
              className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto"
            >
              {/* Primary CTA (Explore Projects) */}
              {content.primaryCtaVisible && (
                <Link
                  href={content.primaryCtaLink}
                  target={content.primaryCtaNewTab ? '_blank' : undefined}
                  rel={content.primaryCtaNewTab ? 'noopener noreferrer' : undefined}
                  className="group relative inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-accent text-white h-11 sm:h-12 px-3 sm:px-8 py-2.5 sm:py-4 rounded-lg text-[13px] sm:text-[15px] font-medium tracking-wide whitespace-nowrap hover:bg-accent/90 active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(45,212,191,0.15)] hover:shadow-[0_0_25px_rgba(45,212,191,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 w-full sm:w-auto"
                >
                  <span>{content.primaryCtaText}</span>
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-1 sm:w-4 sm:h-4"
                  />
                </Link>
              )}

              {/* Secondary CTA (Contact Me) */}
              {content.secondaryCtaVisible && (
                content.secondaryCtaLink.startsWith('#') || !content.secondaryCtaLink ? (
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-hire-me'))}
                    className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[var(--card)] text-foreground h-11 sm:h-12 px-3 sm:px-8 py-2.5 sm:py-4 rounded-lg text-[13px] sm:text-[15px] font-medium whitespace-nowrap hover:bg-foreground/5 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 shadow-sm w-full sm:w-auto"
                  >
                    <span>{content.secondaryCtaText}</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-1 sm:w-4 sm:h-4"
                    />
                  </button>
                ) : (
                  <Link
                    href={content.secondaryCtaLink}
                    target={content.secondaryCtaNewTab ? '_blank' : undefined}
                    rel={content.secondaryCtaNewTab ? 'noopener noreferrer' : undefined}
                    className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[var(--card)] text-foreground h-11 sm:h-12 px-3 sm:px-8 py-2.5 sm:py-4 rounded-lg text-[13px] sm:text-[15px] font-medium whitespace-nowrap hover:bg-foreground/5 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 shadow-sm w-full sm:w-auto"
                  >
                    <span>{content.secondaryCtaText}</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-1 sm:w-4 sm:h-4"
                    />
                  </Link>
                )
              )}
            </motion.div>
          )}

        </div>

        {/* ── RIGHT: Editorial Portrait Card (Col 8-12 on Desktop, Order 1 on Mobile) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
          className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center w-full z-10 mt-2 sm:mt-4 lg:mt-0 order-1 lg:order-2"
        >
          <div className="relative w-full max-w-[280px] xs:max-w-[300px] sm:max-w-[320px] lg:max-w-[350px] mx-auto lg:ml-auto lg:mr-0 group">
            
            {/* ── TOP BADGE: UI/UX & Frontend (Floating Animation) ── */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -12, x: shouldReduceMotion ? 0 : -10 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 1, y: 0, x: 0 }
                  : { opacity: 1, x: 0, y: [0, -5, 0] }
              }
              transition={{
                opacity: { duration: 0.5, delay: 0.4 },
                x: { duration: 0.5, delay: 0.4 },
                y: {
                  repeat: Infinity,
                  duration: 4,
                  ease: 'easeInOut',
                  delay: 0.9,
                },
              }}
              className="absolute top-3 left-1 sm:top-5 sm:-left-5 z-20 inline-flex items-center gap-1.5 bg-[var(--card)]/90 backdrop-blur-md text-foreground text-xs sm:text-[13px] font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-white/10 shadow-lg shadow-black/30 transition-all duration-300 group-hover:border-accent/40 group-hover:shadow-accent/10 select-none"
            >
              <span className="text-accent font-bold text-xs sm:text-sm animate-pulse">⚡</span>
              <span>UI/UX &amp; Frontend</span>
            </motion.div>

            {/* ── LOCATION BADGE: Kerala, India (Floating Animation) ── */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12, x: shouldReduceMotion ? 0 : 10 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 1, y: 0, x: 0 }
                  : { opacity: 1, x: 0, y: [0, 5, 0] }
              }
              transition={{
                opacity: { duration: 0.5, delay: 0.55 },
                x: { duration: 0.5, delay: 0.55 },
                y: {
                  repeat: Infinity,
                  duration: 4.5,
                  ease: 'easeInOut',
                  delay: 1.05,
                },
              }}
              className="absolute bottom-4 right-1 sm:bottom-8 sm:-right-5 z-20 inline-flex items-center gap-1.5 bg-[var(--card)]/90 backdrop-blur-md text-foreground text-xs sm:text-[13px] font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-white/10 shadow-lg shadow-black/30 transition-all duration-300 group-hover:border-accent/40 group-hover:shadow-accent/10 select-none"
            >
              <span className="text-accent text-xs sm:text-sm">📍</span>
              <span>Kerala, India</span>
            </motion.div>

            {/* ── Main Portrait Card Frame ── */}
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden border border-white/10 bg-[var(--card)] shadow-xl transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-white/20 group-hover:shadow-2xl">
              <Image
                src={content.imageUrl}
                alt={content.profileName || "Sailesh P"}
                fill
                priority
                sizes="(max-width: 768px) 340px, 350px"
                className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />

              {/* Subtle Bottom Fade Gradient */}
              <div className="absolute inset-x-0 bottom-0 h-[25%] bg-gradient-to-t from-[var(--card)] via-[var(--card)]/50 to-transparent pointer-events-none z-10" />
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
