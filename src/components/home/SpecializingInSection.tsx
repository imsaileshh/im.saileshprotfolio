'use client';

import type { SpecializingInSectionConfig, SpecializingInSkillItem } from '@/types/homepage-cms';
import { DEFAULT_SPECIALIZING_IN_SKILLS } from '@/types/homepage-cms';

interface SpecializingInSectionProps {
  config?: Partial<SpecializingInSectionConfig> | null;
  className?: string;
}

/**
 * Returns a minimal, elegant vector icon matching the skill/tool.
 * Uses currentColor for seamless theme and hover styling.
 */
function getSkillIcon(skillName: string, className = 'w-full h-full shrink-0') {
  const norm = (skillName || '').toLowerCase().trim();

  // 1. Figma: Geometric icon
  if (norm.includes('figma')) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
        <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
        <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
        <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
        <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
      </svg>
    );
  }

  // 2. Adobe Photoshop: Subtle Ps mark
  if (norm.includes('photoshop') || norm === 'ps') {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="3.5" />
        <path d="M7 15V9h3a2 2 0 0 1 0 4H7" />
        <path d="M14 15c.5.7 1.2 1 2 1a1.5 1.5 0 0 0 0-3c-1.5 0-2-1-2-1.8a1.5 1.5 0 0 1 1.7-1.2c.7 0 1.3.3 1.8.8" />
      </svg>
    );
  }

  // 3. Adobe Illustrator: Compact Ai mark
  if (norm.includes('illustrator') || norm === 'ai') {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="3.5" />
        <path d="M7 16l2.5-7 2.5 7" />
        <path d="M8 14h3" />
        <path d="M15 9v7" />
      </svg>
    );
  }

  // 4. UI/UX Design: Geometric layout / design grid
  if (norm.includes('ui/ux') || norm.includes('design') || norm.includes('product design')) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect width="18" height="18" x="3" y="3" rx="2.5" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    );
  }

  // 5. Frontend: Technical code angle brackets < >
  if (norm.includes('frontend') || norm.includes('web') || norm.includes('code')) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    );
  }

  // 6. React: Clean atom orbit
  if (norm.includes('react')) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <ellipse cx="12" cy="12" rx="10" ry="4.2" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  // 7. Next.js: Sharp N-circle mark
  if (norm.includes('next')) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M9 16V8l8 9V8" />
      </svg>
    );
  }

  // 8. TypeScript: Minimal TS badge
  if (norm.includes('typescript') || norm === 'ts') {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="3.5" />
        <path d="M7 9h4" />
        <path d="M9 9v7" />
        <path d="M13 14.5c.4.6 1 1 1.8 1 1 0 1.6-.6 1.6-1.3 0-.8-.7-1.1-1.5-1.4l-.5-.2c-1.1-.4-1.7-.9-1.7-1.9 0-1.1.9-1.9 2.2-1.9.9 0 1.6.4 2.1 1.1" />
      </svg>
    );
  }

  // Default subtle minimal indicator
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Returns mobile font size scaling so long names fit without clipping
 * while maintaining 14–16px readable sizes for standard skills.
 */
function getSkillMobileFontSize(name: string, customSize?: string): string {
  const norm = (name || '').toLowerCase().trim();
  if (customSize && !['12px', '13px', '13.5px', '14px', '14.5px', '15px'].includes(customSize)) {
    return `clamp(13px, 3.5vw, ${customSize})`;
  }
  if (norm.includes('illustrator') || norm.includes('photoshop')) {
    return 'clamp(12.5px, 3.4vw, 14.5px)';
  }
  if (norm.includes('design') || norm.includes('frontend') || norm.includes('typescript')) {
    return 'clamp(13.5px, 3.7vw, 15px)';
  }
  return 'clamp(14px, 4vw, 16px)';
}

/**
 * Returns distinct typography presets if not explicitly customized
 */
function getSkillTypographyPreset(name: string) {
  const norm = (name || '').toLowerCase().trim();

  if (norm.includes('figma')) {
    return {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '600',
      letterSpacing: '-0.02em',
      fontSize: '14.5px',
    };
  }
  if (norm.includes('photoshop')) {
    return {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '400',
      letterSpacing: '0',
      fontSize: '14px',
    };
  }
  if (norm.includes('illustrator')) {
    return {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '500',
      letterSpacing: '-0.025em',
      fontSize: '14px',
    };
  }
  if (norm.includes('ui/ux')) {
    return {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '600',
      letterSpacing: '0.04em',
      fontSize: '13.5px',
    };
  }
  if (norm === 'frontend' || norm.includes('frontend')) {
    return {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontWeight: '500',
      letterSpacing: '0.02em',
      fontSize: '13.5px',
    };
  }
  if (norm.includes('react')) {
    return {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '600',
      letterSpacing: '-0.015em',
      fontSize: '14.5px',
    };
  }
  if (norm.includes('next')) {
    return {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '700',
      letterSpacing: '-0.03em',
      fontSize: '14.5px',
    };
  }
  if (norm.includes('typescript')) {
    return {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '600',
      letterSpacing: '-0.01em',
      fontSize: '14px',
    };
  }

  return {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: '500',
    letterSpacing: 'normal',
    fontSize: '14px',
  };
}

export function SpecializingInSection({ config, className = '' }: SpecializingInSectionProps) {
  if (config && config.visible === false) {
    return null;
  }

  const title = config?.title || 'SPECIALIZING IN';
  const rawSkills = config?.skills && config.skills.length > 0 ? config.skills : DEFAULT_SPECIALIZING_IN_SKILLS;

  // Filter to visible skills and sort by saved dashboard order
  const activeSkills: SpecializingInSkillItem[] = rawSkills
    .filter((s) => s.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (activeSkills.length === 0) {
    return null;
  }

  return (
    <div className={`w-full flex flex-col items-start ${className}`}>
      {/* ── Section Label ── */}
      <div className="mb-2.5 sm:mb-3">
        <span className="font-helvetica text-[10px] sm:text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.2em] uppercase select-none">
          {title}
        </span>
      </div>

      {/* ── Wordmark Skills: Responsive 2-column grid on mobile (<768px), flex-wrap on desktop (>=768px) ── */}
      <div className="grid grid-cols-2 gap-x-3.5 sm:gap-x-4 gap-y-4 sm:gap-y-5 md:flex md:flex-wrap md:items-center md:gap-x-6 md:gap-y-3.5 w-full max-w-full">
        {activeSkills.map((skill) => {
          const preset = getSkillTypographyPreset(skill.name);
          const fontFamily = skill.fontFamily || preset.fontFamily;
          const desktopFs = skill.fontSize || preset.fontSize;
          const mobileFs = getSkillMobileFontSize(skill.name, skill.fontSize);
          const fontWeight = skill.fontWeight || preset.fontWeight;
          const letterSpacing = skill.letterSpacing || preset.letterSpacing;

          // Ensure muted gray has accessible contrast in both light & dark themes
          const isDefaultOrMutedColor =
            !skill.color ||
            skill.color.toLowerCase() === '#9a9ca2' ||
            skill.color.toLowerCase() === '#a1a1aa' ||
            skill.color.toLowerCase() === '#71717a';

          const textColor = isDefaultOrMutedColor ? 'var(--text-secondary)' : skill.color;

          return (
            <div
              key={skill.id}
              className="group flex items-center gap-2 sm:gap-2.5 min-w-0 md:inline-flex md:items-center md:gap-1.5 lg:gap-2 text-[var(--text-secondary)] transition-colors duration-200 hover:text-foreground cursor-default select-none md:whitespace-nowrap"
              style={{
                fontFamily,
                fontWeight,
                letterSpacing,
                color: textColor,
                '--skill-mobile-fs': mobileFs,
                '--skill-desktop-fs': desktopFs,
              } as React.CSSProperties}
            >
              {/* Minimal consistent icon: 20px on mobile (<768px), 14px on desktop (>=768px) */}
              <span
                className="text-[var(--text-muted)] group-hover:text-accent transition-colors duration-200 shrink-0 flex items-center justify-center w-5 h-5 md:w-3.5 md:h-3.5"
                aria-hidden="true"
              >
                {getSkillIcon(skill.name, 'w-full h-full shrink-0')}
              </span>

              {/* Tool / skill name */}
              <span className="leading-tight transition-colors duration-200 group-hover:!text-foreground min-w-0 text-[length:var(--skill-mobile-fs)] md:text-[length:var(--skill-desktop-fs)]">
                {skill.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
