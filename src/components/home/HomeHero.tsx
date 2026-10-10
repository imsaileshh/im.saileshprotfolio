'use client';

import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { SpecializingInSection } from './SpecializingInSection';

import type { HeroSectionConfig, SpecializingInSectionConfig } from '@/types/homepage-cms';

const ease = [0.22, 1, 0.36, 1] as const;

interface HomeHeroProps {
  heroContent?: Partial<HeroSectionConfig> | null;
  specializingIn?: Partial<SpecializingInSectionConfig> | null;
}

function renderHeadingWithHighlight(
  heading: string,
  highlight: string,
  highlightColor?: string
) {
  if (!highlight || !heading.includes(highlight)) {
    return <span>{heading}</span>;
  }
  const parts = heading.split(highlight);
  return (
    <>
      {parts[0]}
      <span
        className="text-accent"
        style={highlightColor ? { color: highlightColor } : undefined}
      >
        {highlight}
      </span>
      {parts.slice(1).join(highlight)}
    </>
  );
}

export function HomeHero({ heroContent, specializingIn }: HomeHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  // Content defaults conforming to the exact specification
  const content = {
    eyebrow: heroContent?.eyebrow || 'UI/UX DESIGNER · FRONTEND DEVELOPER',
    heading: heroContent?.heading || "Hey, I'm Sailesh P!",
    headingHighlight: heroContent?.headingHighlight || 'Sailesh P!',
    tagline: heroContent?.tagline || 'Designing experiences. Building digital products.',
    description:
      heroContent?.description ||
      heroContent?.description2 ||
      "I'm a UI/UX Designer and Frontend Developer focused on creating intuitive user experiences and high-performance web applications.",
    headingFontFamily: heroContent?.headingFontFamily || '"Helvetica Neue", Helvetica, Arial, sans-serif',
    headingFontWeight: heroContent?.headingFontWeight || '600',
    headingFontSize: heroContent?.headingFontSize || 'clamp(30px, 4.5vw, 50px)',
    headingColor: heroContent?.headingColor || '',
    highlightColor: heroContent?.highlightColor || '',
    imageUrl: heroContent?.imageUrl || '/images/profile/IMG_0871.jpg',
    profileName: heroContent?.profileLabels || 'SAILESH P.',
  };

  const specializingInConfig = specializingIn || heroContent?.specializingIn;

  const [imgSrc, setImgSrc] = useState(content.imageUrl);
  useEffect(() => {
    setImgSrc(content.imageUrl);
  }, [content.imageUrl]);

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
    mouseX.set(e.nativeEvent.offsetX);
    mouseY.set(e.nativeEvent.offsetY);
  };

  if (heroContent && heroContent.visible === false) {
    return null;
  }

  return (
    <section
      id="home"
      onMouseMove={handleMouseMove}
      className="relative w-full pt-4 sm:pt-6 lg:pt-16 pb-8 sm:pb-12 lg:pb-18 px-4 sm:px-6 md:px-10 lg:px-16 overflow-hidden flex flex-col justify-center min-h-0 lg:min-h-[auto]"
    >
      {/* ── Background Editorial Typographic Watermark ── */}
      <div
        aria-hidden="true"
        className="hero-watermark absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none w-full max-w-7xl flex justify-center items-center overflow-hidden -z-10"
      />

      {/* ── Desktop Ambient Cursor Radial Glow ── */}
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
            background:
              'radial-gradient(circle 250px at center, rgba(45,212,191,0.08) 0%, rgba(45,212,191,0.03) 35%, transparent 70%)',
          }}
        />
      )}

      {/* ── Main Hero Composition Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 xl:gap-14 items-center w-full max-w-7xl mx-auto">
        {/* ── LEFT: Main Content & Headline (Col 1-7 on Desktop, Order 2 on Mobile) ── */}
        <div className="lg:col-span-7 flex flex-col items-start text-left z-10 order-2 lg:order-1">
          {/* Eyebrow Label: Instant paint, zero hydration delay */}
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-helvetica text-[10px] sm:text-[11px] md:text-[12px] font-medium text-[var(--text-muted)] tracking-[0.16em] uppercase">
              {content.eyebrow}
            </span>
          </div>

          {/* Primary Headline: Continuous, Helvetica Neue, highlight on Sailesh P! Visible immediately on first paint for instant LCP */}
          <h1
            style={{
              fontFamily: content.headingFontFamily,
              fontWeight: content.headingFontWeight,
              fontSize: content.headingFontSize,
              letterSpacing: '-0.035em',
              color: content.headingColor || undefined,
            }}
            className="text-left mb-3 sm:mb-4 text-foreground leading-[1.12] tracking-[-0.035em]"
          >
            {renderHeadingWithHighlight(content.heading, content.headingHighlight, content.highlightColor)}
          </h1>

          {/* Tagline */}
          <p className="font-helvetica text-[16px] sm:text-[18px] md:text-[19px] lg:text-[20px] font-medium text-foreground leading-snug tracking-normal mb-2.5 sm:mb-3">
            {content.tagline}
          </p>

          {/* Description */}
          <p className="font-helvetica text-[14px] sm:text-[15px] md:text-[16px] font-normal text-[var(--text-secondary)] leading-relaxed max-w-none lg:max-w-[560px] mb-6 sm:mb-8">
            {content.description}
          </p>

          {/* Specializing In Section (Typography Wordmarks with Icon + Text) */}
          <SpecializingInSection
            config={specializingInConfig}
            className="w-full"
          />
        </div>

        {/* ── RIGHT: Editorial Portrait Card (Col 8-12 on Desktop, Order 1 on Mobile) ── */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center w-full z-10 mt-2 sm:mt-4 lg:mt-0 order-1 lg:order-2">
          <div className="relative w-full max-w-[280px] xs:max-w-[300px] sm:max-w-[320px] lg:max-w-[350px] mx-auto lg:ml-auto lg:mr-0 group">
            {/* Top Badge: Floating Animation */}
            {/* Top Badge: Hardware-accelerated CSS float */}
            <div className="hero-float-badge absolute top-3 left-1 sm:top-5 sm:-left-5 z-20 inline-flex items-center gap-1.5 bg-[var(--card)]/90 backdrop-blur-md text-foreground text-xs sm:text-[13px] font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-border shadow-lg shadow-black/10 dark:shadow-black/30 transition-all duration-300 group-hover:border-accent/40 group-hover:shadow-accent/10 select-none">
              <span className="text-accent font-bold text-xs sm:text-sm animate-pulse">⚡</span>
              <span>UI/UX &amp; Frontend</span>
            </div>

            {/* Location Badge: Hardware-accelerated CSS float */}
            <div className="hero-float-badge-alt absolute bottom-4 right-1 sm:bottom-8 sm:-right-5 z-20 inline-flex items-center gap-1.5 bg-[var(--card)]/90 backdrop-blur-md text-foreground text-xs sm:text-[13px] font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-border shadow-lg shadow-black/10 dark:shadow-black/30 transition-all duration-300 group-hover:border-accent/40 group-hover:shadow-accent/10 select-none">
              <span className="text-accent text-xs sm:text-sm">📍</span>
              <span>Kerala, India</span>
            </div>

            {/* Main Portrait Card Frame */}
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden border border-border bg-[var(--card)] shadow-xl transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-accent/40 group-hover:shadow-2xl">
              <Image
                src={imgSrc}
                alt={content.profileName || 'Sailesh P'}
                fill
                priority
                sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, 350px"
                quality={85}
                unoptimized={imgSrc.startsWith('/uploads/')}
                onError={() => {
                  if (imgSrc !== '/images/profile/IMG_0871.jpg') {
                    setImgSrc('/images/profile/IMG_0871.jpg');
                  }
                }}
                className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />

              {/* Subtle Bottom Fade Gradient */}
              <div className="absolute inset-x-0 bottom-0 h-[25%] bg-gradient-to-t from-[var(--card)] via-[var(--card)]/50 to-transparent pointer-events-none z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
