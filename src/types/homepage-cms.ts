export interface SpecializingInSkillItem {
  id: string;
  name: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  letterSpacing?: string;
  color?: string;
  order: number;
  visible: boolean;
}

export interface SpecializingInSectionConfig {
  visible: boolean;
  title: string;
  skills: SpecializingInSkillItem[];
}

export interface HeroSectionConfig {
  visible: boolean;
  eyebrow: string;
  heading: string;
  headingHighlight: string;
  tagline: string;
  description: string;
  headingFontFamily?: string;
  headingFontWeight?: string;
  headingFontSize?: string;
  headingColor?: string;
  highlightColor?: string;

  // Legacy fields retained for backwards compatibility
  heading1?: string;
  heading2?: string;
  subheading?: string;
  description1?: string;
  description2?: string;

  imageUrl: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  primaryCtaVisible: boolean;
  primaryCtaNewTab: boolean;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  secondaryCtaVisible: boolean;
  secondaryCtaNewTab: boolean;
  profileLabels?: string;
  supportingText?: string;
  specializingIn?: SpecializingInSectionConfig;
}

export interface WorksSectionConfig {
  visible: boolean;
  label: string;
  heading: string;
  description: string;
  selectedProjectIds: string[];
}

export interface PersonalProjectsSectionConfig {
  visible: boolean;
  label: string;
  heading: string;
  description: string;
  selectedProjectIds: string[];
}

export interface AboutSectionConfig {
  visible: boolean;
  label: string;
  heading: string;
  subheading: string;
  content: string;
  specializations: string[];
  ctaText: string;
  ctaLink: string;
}

export interface StackSectionConfig {
  visible: boolean;
  label: string;
  heading: string;
  description: string;
}

export interface HomepageConfig {
  sectionOrder: string[];
  sections: {
    hero: HeroSectionConfig;
    specializingIn?: SpecializingInSectionConfig;
    works: WorksSectionConfig;
    personalProjects: PersonalProjectsSectionConfig;
    about: AboutSectionConfig;
    stack: StackSectionConfig;
  };
}

export const DEFAULT_SECTION_ITEMS = [
  { id: 'hero', name: 'Hero', description: 'Headline, introduction, portrait image, and primary call-to-actions' },
  { id: 'specializing-in', name: 'Specializing In', description: 'Typography-based wordmark skills section' },
  { id: 'works', name: 'Works', description: 'Curated commercial case studies and client deliverables' },
  { id: 'personal-projects', name: 'Personal Projects', description: 'Independent builds, open-source work, and experiments' },
  { id: 'about', name: 'About', description: 'Bio, philosophy, and dynamic specialization typewriter' },
  { id: 'stack', name: 'Tools & Technologies', description: 'Categorized technologies, tools, and technical skills' },
] as const;

export const DEFAULT_SPECIALIZING_IN_SKILLS: SpecializingInSkillItem[] = [
  {
    id: 'skill-figma',
    name: 'Figma',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '14.5px',
    fontWeight: '600',
    letterSpacing: '-0.02em',
    color: '#9A9CA2',
    order: 0,
    visible: true,
  },
  {
    id: 'skill-photoshop',
    name: 'Adobe Photoshop',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '14px',
    fontWeight: '400',
    letterSpacing: '0',
    color: '#9A9CA2',
    order: 1,
    visible: true,
  },
  {
    id: 'skill-illustrator',
    name: 'Adobe Illustrator',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '14px',
    fontWeight: '500',
    letterSpacing: '-0.025em',
    color: '#9A9CA2',
    order: 2,
    visible: true,
  },
  {
    id: 'skill-uiux',
    name: 'UI/UX Design',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '13.5px',
    fontWeight: '600',
    letterSpacing: '0.04em',
    color: '#9A9CA2',
    order: 3,
    visible: true,
  },
  {
    id: 'skill-frontend',
    name: 'Frontend',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '13.5px',
    fontWeight: '500',
    letterSpacing: '0.02em',
    color: '#9A9CA2',
    order: 4,
    visible: true,
  },
  {
    id: 'skill-react',
    name: 'React',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '14.5px',
    fontWeight: '600',
    letterSpacing: '-0.015em',
    color: '#9A9CA2',
    order: 5,
    visible: true,
  },
  {
    id: 'skill-nextjs',
    name: 'Next.js',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '14.5px',
    fontWeight: '700',
    letterSpacing: '-0.03em',
    color: '#9A9CA2',
    order: 6,
    visible: true,
  },
  {
    id: 'skill-typescript',
    name: 'TypeScript',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '-0.01em',
    color: '#9A9CA2',
    order: 7,
    visible: true,
  },
];

export const DEFAULT_SPECIALIZING_IN_CONFIG: SpecializingInSectionConfig = {
  visible: true,
  title: 'SPECIALIZING IN',
  skills: DEFAULT_SPECIALIZING_IN_SKILLS,
};

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  sectionOrder: ['hero', 'works', 'personal-projects', 'about', 'stack'],
  sections: {
    hero: {
      visible: true,
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
      headingFontSize: 'clamp(32px, 4.5vw, 50px)',
      headingColor: '',
      highlightColor: '#2DD4BF',
      imageUrl: '/images/profile/IMG_0871.jpg',
      primaryCtaText: 'Explore My Work',
      primaryCtaLink: '/works',
      primaryCtaVisible: true,
      primaryCtaNewTab: false,
      secondaryCtaText: 'Contact Me',
      secondaryCtaLink: '#hire',
      secondaryCtaVisible: true,
      secondaryCtaNewTab: false,
      profileLabels: 'AVAILABLE FOR WORK · BASED IN KERALA',
      supportingText: 'Passionate about creating intuitive, engaging, and accessible user experiences.',
      specializingIn: DEFAULT_SPECIALIZING_IN_CONFIG,
    },
    specializingIn: DEFAULT_SPECIALIZING_IN_CONFIG,
    works: {
      visible: true,
      label: 'WORKS',
      heading: 'Works',
      description: 'Client projects, production web applications, e-commerce stores, and digital products.',
      selectedProjectIds: [],
    },
    personalProjects: {
      visible: true,
      label: 'PERSONAL PROJECTS',
      heading: 'Personal Projects',
      description: 'Independent projects, experiments and digital products created to explore design, development and interaction.',
      selectedProjectIds: [],
    },
    about: {
      visible: true,
      label: 'About Me',
      heading: 'Design. Build. Ship.',
      subheading: 'UI/UX Designer • Frontend Developer • Vibe Coder',
      content: "I'm a UI/UX Designer and Frontend Developer passionate about creating intuitive digital experiences, interactive interfaces, and modern web applications that look great, feel seamless, and perform well.\n\nWhen I'm not designing or building, I'm exploring new technologies, experimenting with AI-powered development, and refining user experiences. My work blends creative design with frontend development — creating clean interfaces, smooth interactions, and digital experiences that feel alive.",
      specializations: [
        'UI/UX DESIGNER.',
        'PRODUCT DESIGNER.',
        'FRONTEND DEVELOPER.',
        'VIBE CODER.'
      ],
      ctaText: 'More about me',
      ctaLink: '/about',
    },
    stack: {
      visible: true,
      label: 'STACK',
      heading: 'Tools & Technologies',
      description: 'Technologies I use to design, build and ship digital products.',
    }
  }
};

/**
 * Builds a resolved HomepageConfig using existing DB values where present,
 * seamlessly falling back to default production values without data loss.
 */
export function resolveHomepageConfig(
  savedConfig: Partial<HomepageConfig> | null | undefined,
  existingHeroContent: Record<string, unknown> | null = null,
  existingAboutContent: Record<string, unknown> | null = null,
  defaultWorkProjectIds: string[] = [],
  defaultPersonalProjectIds: string[] = []
): HomepageConfig {
  // Resolve specializingIn configuration
  const rawSpecializingIn = 
    savedConfig?.sections?.specializingIn ||
    (savedConfig?.sections?.hero as unknown as { specializingIn?: SpecializingInSectionConfig })?.specializingIn ||
    (existingHeroContent?.specializingIn as SpecializingInSectionConfig | undefined);

  const resolvedSpecializingIn: SpecializingInSectionConfig = {
    visible: rawSpecializingIn?.visible ?? DEFAULT_SPECIALIZING_IN_CONFIG.visible,
    title: rawSpecializingIn?.title || DEFAULT_SPECIALIZING_IN_CONFIG.title,
    skills: Array.isArray(rawSpecializingIn?.skills) && rawSpecializingIn.skills.length > 0
      ? rawSpecializingIn.skills.map((skill, index) => ({
          id: skill.id || `skill-${index}-${Date.now()}`,
          name: skill.name || '',
          fontFamily: skill.fontFamily || '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: skill.fontSize || '14px',
          fontWeight: skill.fontWeight || '500',
          letterSpacing: skill.letterSpacing || 'normal',
          color: skill.color || '#9A9CA2',
          order: typeof skill.order === 'number' ? skill.order : index,
          visible: skill.visible ?? true,
        }))
      : DEFAULT_SPECIALIZING_IN_SKILLS,
  };

  const rawHero = {
    ...DEFAULT_HOMEPAGE_CONFIG.sections.hero,
    ...(existingHeroContent || {}),
    ...(savedConfig?.sections?.hero || {}),
  };

  // If eyebrow is the older placeholder, upgrade to the requested content
  const resolvedEyebrow =
    rawHero.eyebrow === 'UI/UX DESIGNER • FRONTEND DEVELOPER • VIBE CODER' || !rawHero.eyebrow
      ? DEFAULT_HOMEPAGE_CONFIG.sections.hero.eyebrow
      : rawHero.eyebrow;

  const resolvedHeading =
    rawHero.heading && rawHero.heading !== "Hey, I'm"
      ? rawHero.heading
      : DEFAULT_HOMEPAGE_CONFIG.sections.hero.heading;

  const resolvedHeadingHighlight =
    rawHero.headingHighlight || DEFAULT_HOMEPAGE_CONFIG.sections.hero.headingHighlight;

  const resolvedTagline =
    rawHero.tagline ||
    (rawHero.subheading !== 'UI/UX Designer, Frontend Developer, Vibe Coder' ? rawHero.subheading : '') ||
    DEFAULT_HOMEPAGE_CONFIG.sections.hero.tagline;

  const resolvedDescription =
    rawHero.description ||
    (rawHero.description2 && !rawHero.description2.includes('vibe coder') ? rawHero.description2 : '') ||
    DEFAULT_HOMEPAGE_CONFIG.sections.hero.description;

  const merged: HomepageConfig = {
    sectionOrder: Array.isArray(savedConfig?.sectionOrder) && savedConfig.sectionOrder.length > 0
      ? savedConfig.sectionOrder
      : [...DEFAULT_HOMEPAGE_CONFIG.sectionOrder],
    sections: {
      hero: {
        ...rawHero,
        eyebrow: resolvedEyebrow,
        heading: resolvedHeading,
        headingHighlight: resolvedHeadingHighlight,
        tagline: resolvedTagline,
        description: resolvedDescription,
        headingFontFamily: rawHero.headingFontFamily || DEFAULT_HOMEPAGE_CONFIG.sections.hero.headingFontFamily,
        headingFontWeight: rawHero.headingFontWeight || DEFAULT_HOMEPAGE_CONFIG.sections.hero.headingFontWeight,
        headingFontSize: rawHero.headingFontSize || DEFAULT_HOMEPAGE_CONFIG.sections.hero.headingFontSize,
        highlightColor: rawHero.highlightColor || DEFAULT_HOMEPAGE_CONFIG.sections.hero.highlightColor,
        specializingIn: resolvedSpecializingIn,
      },
      specializingIn: resolvedSpecializingIn,
      works: {
        ...DEFAULT_HOMEPAGE_CONFIG.sections.works,
        selectedProjectIds: savedConfig?.sections?.works?.selectedProjectIds?.length
          ? savedConfig.sections.works.selectedProjectIds
          : defaultWorkProjectIds,
        ...(savedConfig?.sections?.works || {}),
      },
      personalProjects: {
        ...DEFAULT_HOMEPAGE_CONFIG.sections.personalProjects,
        selectedProjectIds: savedConfig?.sections?.personalProjects?.selectedProjectIds?.length
          ? savedConfig.sections.personalProjects.selectedProjectIds
          : defaultPersonalProjectIds,
        ...(savedConfig?.sections?.personalProjects || {}),
      },
      about: {
        ...DEFAULT_HOMEPAGE_CONFIG.sections.about,
        ...(existingAboutContent ? {
          heading: typeof existingAboutContent.heading === 'string' ? existingAboutContent.heading : DEFAULT_HOMEPAGE_CONFIG.sections.about.heading,
          subheading: typeof existingAboutContent.role === 'string' ? existingAboutContent.role : typeof existingAboutContent.subheading === 'string' ? existingAboutContent.subheading : DEFAULT_HOMEPAGE_CONFIG.sections.about.subheading,
          content: typeof existingAboutContent.paragraph === 'string' ? existingAboutContent.paragraph : typeof existingAboutContent.content === 'string' ? existingAboutContent.content : DEFAULT_HOMEPAGE_CONFIG.sections.about.content,
          ctaText: typeof existingAboutContent.ctaText === 'string' ? existingAboutContent.ctaText : DEFAULT_HOMEPAGE_CONFIG.sections.about.ctaText,
          ctaLink: typeof existingAboutContent.ctaLink === 'string' ? existingAboutContent.ctaLink : DEFAULT_HOMEPAGE_CONFIG.sections.about.ctaLink,
          specializations: Array.isArray(existingAboutContent.specializations) ? (existingAboutContent.specializations as string[]) : DEFAULT_HOMEPAGE_CONFIG.sections.about.specializations,
        } : {}),
        ...(savedConfig?.sections?.about || {}),
      },
      stack: {
        ...DEFAULT_HOMEPAGE_CONFIG.sections.stack,
        ...(savedConfig?.sections?.stack || {}),
      }
    }
  };

  // Ensure all known sections are present in sectionOrder
  const allSectionIds = ['hero', 'works', 'personal-projects', 'about', 'stack'];
  for (const id of allSectionIds) {
    if (!merged.sectionOrder.includes(id)) {
      merged.sectionOrder.push(id);
    }
  }

  return merged;
}

