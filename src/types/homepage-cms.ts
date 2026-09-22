export interface HeroSectionConfig {
  visible: boolean;
  eyebrow: string;
  heading1: string;
  heading2: string;
  subheading: string;
  description1: string;
  description2: string;
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
    works: WorksSectionConfig;
    personalProjects: PersonalProjectsSectionConfig;
    about: AboutSectionConfig;
    stack: StackSectionConfig;
  };
}

export const DEFAULT_SECTION_ITEMS = [
  { id: 'hero', name: 'Hero', description: 'Headline, introduction, portrait image, and primary call-to-actions' },
  { id: 'works', name: 'Works', description: 'Curated commercial case studies and client deliverables' },
  { id: 'personal-projects', name: 'Personal Projects', description: 'Independent builds, open-source work, and experiments' },
  { id: 'about', name: 'About', description: 'Bio, philosophy, and dynamic specialization typewriter' },
  { id: 'stack', name: 'Tools & Technologies', description: 'Categorized technologies, tools, and technical skills' },
] as const;

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  sectionOrder: ['hero', 'works', 'personal-projects', 'about', 'stack'],
  sections: {
    hero: {
      visible: true,
      eyebrow: 'UI/UX DESIGNER • FRONTEND DEVELOPER • VIBE CODER',
      heading1: "Hey, I'm",
      heading2: 'Sailesh.',
      subheading: 'UI/UX Designer, Frontend Developer, Vibe Coder',
      description1: 'I’m a UI/UX Designer & Frontend Developer',
      description2: "I'm passionate about turning ideas into intuitive digital experiences. From designing user-focused interfaces to building responsive web applications, I blend creative design, frontend development, and AI-powered workflows to create experiences that feel alive.",
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
    },
    works: {
      visible: true,
      label: 'WORKS',
      heading: 'Works',
      description: 'A curated collection of work that tells a story.',
      selectedProjectIds: [],
    },
    personalProjects: {
      visible: true,
      label: 'EXPERIMENTS',
      heading: 'Personal Projects',
      description: 'Independent projects, experiments, and things I build.',
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
  const merged: HomepageConfig = {
    sectionOrder: Array.isArray(savedConfig?.sectionOrder) && savedConfig.sectionOrder.length > 0
      ? savedConfig.sectionOrder
      : [...DEFAULT_HOMEPAGE_CONFIG.sectionOrder],
    sections: {
      hero: {
        ...DEFAULT_HOMEPAGE_CONFIG.sections.hero,
        ...(existingHeroContent || {}),
        ...(savedConfig?.sections?.hero || {}),
      },
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
