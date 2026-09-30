import {
  UserFlowData,
  InformationArchitectureData,
  EmpathyMapData,
  UserPersonaData,
  JourneyMapData,
  CompetitiveAnalysisData,
  DesignDecisionData,
  MetricsData,
  DesignProcessData,
  DesignSystemData,
  ColorGroup,
  SemanticToken,
  TypographyToken,
  SpacingToken,
  RadiusToken,
  ShadowToken,
  ComponentToken,
  GalleryData,
  RoleResponsibilitiesData,
  DesignThinkingProcessData,
  ProjectTimelineData,
  MilestonesData,
} from '@/types/case-study-builder';

export const DEFAULT_USER_FLOW_DEMO: UserFlowData = {
  nodes: [
    { id: '1', title: 'Landing Page', description: 'User arrives from organic search or marketing ad', type: 'start' },
    { id: '2', title: 'Search Product', description: 'Filters by category, price, and instant rating', type: 'screen' },
    { id: '3', title: 'Product Detail', description: 'Views HD gallery, specs, seller trust score', type: 'screen' },
    { id: '4', title: 'Select Options?', description: 'Checks size, variant, & shipping availability', type: 'decision' },
    { id: '5', title: 'Add to Cart', description: 'One-click slide drawer preview', type: 'action' },
    { id: '6', title: 'Express Checkout', description: 'Biometric Apple Pay / Saved Card checkout', type: 'action' },
    { id: '7', title: 'Order Confirmed', description: 'Real-time tracking link & instant receipt', type: 'success' },
  ],
  edges: [
    { id: 'e1', from: '1', to: '2', label: 'Search / Browse' },
    { id: 'e2', from: '2', to: '3', label: 'Select Product' },
    { id: 'e3', from: '3', to: '4', label: 'Choose Variant' },
    { id: 'e4', from: '4', to: '5', label: 'In Stock' },
    { id: 'e5', from: '5', to: '6', label: 'Proceed to Checkout' },
    { id: 'e6', from: '6', to: '7', label: 'Payment Success' },
  ],
};

export const DEFAULT_IA_DEMO: InformationArchitectureData = {
  nodes: [
    {
      id: 'root',
      title: 'Marketplace Core',
      type: 'root',
      description: 'Main Application Hub',
      children: [
        {
          id: 'auth-decision',
          title: 'Has Account?',
          type: 'decision',
          description: 'Auth status routing',
          children: [
            {
              id: 'signup',
              title: 'Sign Up Flow',
              type: 'action',
              edgeLabel: 'No',
              description: 'New user onboarding',
            },
            {
              id: 'login',
              title: 'User Login',
              type: 'action',
              edgeLabel: 'Yes',
              description: 'Credential auth',
            },
          ],
        },
        {
          id: 'home-hub',
          title: 'Home Hub',
          type: 'page',
          description: 'Central application interface',
          children: [
            {
              id: 'navigation',
              title: 'Menu & Navigation',
              type: 'group',
              description: 'Primary app navigation',
              children: [
                { id: 'home-feed', title: 'Home Feed', type: 'page', description: 'Personalized recommendations' },
                { id: 'browse-brands', title: 'Browse by Brands', type: 'page', description: 'Curated store directory' },
                { id: 'deals-offers', title: 'Deals & Offers', type: 'page', description: 'Flash sales & discounts' },
                { id: 'slide-cart', title: 'Slide-out Cart', type: 'page', description: 'Instant basket editor' },
              ],
            },
            {
              id: 'catalog',
              title: 'Product Engine',
              type: 'group',
              description: 'Catalog & item listing',
              children: [
                { id: 'pdp', title: 'Product Detail (PDP)', type: 'page', description: 'Specs & purchase action' },
                { id: 'gallery', title: 'Media Gallery', type: 'page', description: 'Interactive image showcase' },
                { id: 'variants', title: 'Variants & Stock', type: 'page', description: 'SKU selection' },
                { id: 'reviews', title: 'Customer Reviews', type: 'page', description: 'Verified buyer feedback' },
              ],
            },
            {
              id: 'discovery',
              title: 'Search & Discovery',
              type: 'group',
              description: 'Search & filtering engine',
              children: [
                { id: 'search-main', title: 'Algorithmic Search', type: 'page', description: 'Real-time keyword matching' },
                { id: 'visual-search', title: 'Visual Search', type: 'page', description: 'AI image recognition' },
                { id: 'taxonomy', title: 'Category Taxonomy', type: 'page', description: 'Nested filter trees' },
              ],
            },
            {
              id: 'account-trust',
              title: 'Account & Orders',
              type: 'group',
              description: 'Checkout & customer center',
              children: [
                { id: 'checkout', title: 'Unified Checkout', type: 'page', description: 'Single-page payment' },
                { id: 'orders', title: 'Order Tracking', type: 'page', description: 'Live status timeline' },
                { id: 'bnpl', title: 'Buy Now Pay Later', type: 'page', description: 'Flexible installments' },
                { id: 'support', title: 'External Help Desk', type: 'external', description: 'Zendesk portal link' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const DEFAULT_EMPATHY_MAP_DEMO: EmpathyMapData = {
  persona: {
    name: 'Alex Rivera',
    role: 'Lead UX Buyer & Collector',
    age: '32',
    occupation: 'Senior Product Designer',
    location: 'San Francisco, CA',
    status: 'Tech Professional',
    education: 'M.S. Human-Computer Interaction',
    experience: 'Senior (8+ years)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: 'Alex buys specialized design tools and vintage hardware online weekly. Values frictionless checkout, immediate shipping clarity, and high visual standards across mobile and desktop interfaces.',
    personalityTags: ['Calm', 'Thinker', 'Analytical', 'Detail-Oriented', 'Tech-Savvy'],
    frustrations: [
      'Hidden shipping fees & taxes added at late stage',
      'Slow image rendering on mobile networks',
      'Mandatory registration before browsing products',
    ],
    motivations: [
      'Time efficiency & instant checkout',
      'High design aesthetic & visual polish',
      'Reliable customer support & transparent return policy',
    ],
  },
  variant: 'classic',
  thinks: [
    'Is this seller verified and trustworthy?',
    'Will shipping take longer than expected?',
    'Can I complete this checkout in under 30 seconds without creating an account?',
  ],
  feels: [
    'Anxious when price totals change silently at final checkout',
    'Delighted by micro-interactions and smooth page transitions',
    'Frustrated by multi-step multi-page forms on mobile',
  ],
  says: [
    '"I hate registering just to purchase one item."',
    '"I want to see real product dimensions before buying."',
    '"If checkout takes more than 3 steps, I abandon my cart."',
  ],
  does: [
    'Compares prices across 3 tabs simultaneously',
    'Checks product review images for real-world details',
    'Uses Apple Pay / Wallet for instant checkout',
  ],
  painPoints: [
    'Hidden shipping taxes added at late stage',
    'Slow image rendering on cellular networks',
    'Unclear return and refund policy',
  ],
  goals: [
    'Purchase within 2 clicks from item discovery',
    'Receive real-time push notification updates for delivery',
    'Curate personal saved wishlist collections',
  ],
  needs: [
    'Transparent pricing Breakdown upfront',
    'Biometric 1-click checkout options',
    'High-resolution zoomable media gallery',
  ],
  motivations: ['Time efficiency', 'Design aesthetic excellence', 'Reliable customer protection'],
  influences: ['Peer designer recommendations', 'Tech Twitter / Design community', 'Product Hunt rankings'],
};

export const DEFAULT_PERSONA_DEMO: UserPersonaData = {
  name: 'Elena Rostova',
  age: '29',
  role: 'E-commerce Operations Manager',
  location: 'New York, NY',
  bio: 'Elena manages inventory and vendor orders for a boutique lifestyle brand. She spends 6+ hours daily on web applications and expects enterprise speed paired with consumer-grade UI simplicity.',
  goals: [
    'Streamline bulk order processing without manual CSV cleanups',
    'Track live order dispatch metrics on a single dark dashboard',
    'Minimize customer support tickets regarding order status',
  ],
  painPoints: [
    'Legacy portal dashboards are bloated and slow',
    'Mobile browser view breaks data tables',
    'Lack of dark mode causes eye strain during late shifts',
  ],
  needs: [
    'Keyboard-first shortcuts for rapid data entry',
    'Customizable table column visibility',
    'Instant search across 50,000+ SKU catalog',
  ],
  behaviors: [
    'Uses keyboard shortcuts extensive over mouse navigation',
    'Monitors dashboards on multi-monitor setup',
    'Shares order permalinks directly via Slack',
  ],
  motivations: [
    'Operational velocity',
    'Zero error rate in shipping manifests',
    'Seamless mobile-to-desktop workflow',
  ],
  tools: ['Figma', 'Linear', 'Notion', 'Shopify Plus', 'Slack'],
  quote: '"Great software should feel weightless — speed and predictability over decorative clutter."',
  sliders: {
    techSavvy: 92,
    priceSensitivity: 45,
    frequencyOfUse: 98,
  },
};

export const DEFAULT_JOURNEY_MAP_DEMO: JourneyMapData = {
  journeyName: 'End-to-End E-Commerce Purchase Journey',
  personaName: 'Elena Rostova',
  stages: [
    {
      id: 'stg-1',
      name: 'Awareness',
      actions: ['Sees sponsored post or organic design tweet', 'Clicks link to view marketplace preview'],
      thoughts: ['"Is this platform legit?"', '"The UI looks remarkably clean and fast."'],
      painPoints: ['Slow initial LCP load time on mobile networks'],
      emotion: 'neutral',
      opportunity: 'Deliver static SSR edge response under 100ms with clear trust badges.',
    },
    {
      id: 'stg-2',
      name: 'Discovery',
      actions: ['Searches specific SKU keyword', 'Applies category & rating filters', 'Hovers PDP visual gallery'],
      thoughts: ['"Filters update instantly without page reloads!"', '"Specifications are super detailed."'],
      painPoints: ['Complex category filters hiding high-priority items'],
      emotion: 'positive',
      opportunity: 'Implement instant fuzzy search with live preview drawers.',
    },
    {
      id: 'stg-3',
      name: 'Evaluation',
      actions: ['Compares competitor pricing', 'Reads verified customer reviews with photos'],
      thoughts: ['"Price is transparent. No hidden service charges listed."'],
      painPoints: ['Inconsistent review rating metrics'],
      emotion: 'positive',
      opportunity: 'Highlight transparent pricing breakdowns & verified buyer badges.',
    },
    {
      id: 'stg-4',
      name: 'Action',
      actions: ['Clicks 1-Click Buy', 'Authenticates via FaceID Apple Pay'],
      thoughts: ['"That was the fastest checkout experience I have ever used!"'],
      painPoints: ['Accidental double clicks on slow network connections'],
      emotion: 'very-positive',
      opportunity: 'Optimistic UI update + instant order confirmation state.',
    },
    {
      id: 'stg-5',
      name: 'Post-Purchase',
      actions: ['Receives SMS order tracking URL', 'Views live delivery route map'],
      thoughts: ['"I know exactly when my package arrives today."'],
      painPoints: ['Lack of instant order cancellation window'],
      emotion: 'very-positive',
      opportunity: 'Provide a 15-minute grace period cancel button on order success page.',
    },
  ],
};

export const DEFAULT_COMPETITIVE_ANALYSIS_DEMO: CompetitiveAnalysisData = {
  competitors: [
    {
      id: 'comp-1',
      name: 'Shopify Plus',
      website: 'shopify.com',
      strengths: ['Massive app ecosystem', 'High ecosystem reliability', 'Global payment integrations'],
      weaknesses: ['Fragmented checkout customizability', 'Slower page speed with apps', 'Expensive app stack costs'],
      keyFeatures: ['Shop Pay', 'Inventory Sync', 'Theme Store'],
      notes: 'Market leader for general merchants, but customization requires liquid template skills.',
    },
    {
      id: 'comp-2',
      name: 'Commerce Layer',
      website: 'commercelayer.io',
      strengths: ['Headless flexibility', 'Ultra-fast API responses', 'Multi-currency out of box'],
      weaknesses: ['Requires custom developer setup', 'No native non-code dashboard editor'],
      keyFeatures: ['API-first', 'Sub-second API', 'Global Micro-frontends'],
      notes: 'Ideal for developer-heavy teams, but lacks turn-key visual case study builders.',
    },
  ],
  matrix: [
    { id: 'm1', featureName: 'Instant Search (Sub-50ms)', ourProduct: true, competitorValues: { 'comp-1': false, 'comp-2': true } },
    { id: 'm2', featureName: 'Unified Slide Checkout', ourProduct: true, competitorValues: { 'comp-1': true, 'comp-2': false } },
    { id: 'm3', featureName: 'Modular Design Tokens', ourProduct: true, competitorValues: { 'comp-1': false, 'comp-2': false } },
    { id: 'm4', featureName: 'Biometric 1-Tap Pay', ourProduct: true, competitorValues: { 'comp-1': true, 'comp-2': false } },
    { id: 'm5', featureName: 'Zero-JS SSR Hydration', ourProduct: true, competitorValues: { 'comp-1': false, 'comp-2': true } },
  ],
};

export const DEFAULT_DESIGN_DECISIONS_DEMO: DesignDecisionData = {
  decisions: [
    {
      id: 'dd-1',
      number: '01',
      category: 'CHECKOUT ARCHITECTURE',
      title: 'Single-Page Slide Drawer Checkout vs. Multi-Step Page Flow',
      problem: 'Analytics revealed a 38% cart drop-off between step 2 (Shipping) and step 3 (Payment) on mobile devices due to full page reload friction and form field overload.',
      alternativeConsidered: 'Standard 4-step linear wizard page routing with back/next navigation.',
      whyAlternativeRejected: 'Each step transition incurred network latency and lost user context, leading to cognitive fatigue on low-bandwidth mobile connections.',
      chosenSolution: 'Engineered an inline slide-over drawer with progressive disclosure. Shipping addresses auto-fill via Google Places API and payments complete inline with Apple Pay / WebAuthn.',
      tradeOff: 'Higher upfront client-side JavaScript complexity for managing complex form validation states within a single modal drawer.',
      resultMetric: '+24% Checkout Completion Rate',
    },
    {
      id: 'dd-2',
      number: '02',
      category: 'DESIGN SYSTEM TOKENS',
      title: 'HSL Semantic Color Mapping over Hardcoded Hex Values',
      problem: 'Adapting the application from light to dark mode previously required editing 140+ CSS utility class strings across 45 components.',
      alternativeConsidered: 'Maintaining separate Tailwind CSS theme classes (`dark:bg-zinc-900`) on every individual HTML element.',
      whyAlternativeRejected: 'Extremely error-prone, hard to audit for contrast compliance, and inflated bundle markup size.',
      chosenSolution: 'Defined strict semantic CSS variables (`--color-bg-primary: hsl(var(--brand-hue) ...)`). Components consume single semantic utility classes.',
      tradeOff: 'Initial design system setup required 2 days of color auditing.',
      resultMetric: '100% Theme Consistency across 60+ Components',
    },
  ],
};

export const DEFAULT_METRICS_DEMO: MetricsData = {
  columns: 4,
  items: [
    { id: 'met-1', value: '24', prefix: '+', suffix: '%', label: 'Checkout Completion Rate', description: 'Measured over 60 days post-launch' },
    { id: 'met-2', value: '15', prefix: '', suffix: ' min', label: 'Seller Onboarding Time', description: 'Down from 45 minutes legacy benchmark' },
    { id: 'met-3', value: '0.8', prefix: '', suffix: 's', label: 'Search Response Latency', description: 'Sub-second Algolia search response' },
    { id: 'met-4', value: '4.8', prefix: '', suffix: '/5', label: 'User Satisfaction Score', description: 'Based on 1,200+ buyer surveys' },
  ],
};

export const DEFAULT_DESIGN_PROCESS_DEMO: DesignProcessData = {
  steps: [
    { id: 'p1', number: '01', title: 'Research & Audits', description: 'Stakeholder interviews, analytics teardown, and 12 competitor benchmark reviews.' },
    { id: 'p2', number: '02', title: 'Problem Definition', description: 'Formulated key friction points, persona maps, and core design success metrics.' },
    { id: 'p3', number: '03', title: 'Information Architecture', description: 'Constructed sitemap taxonomy and mapped critical user conversion funnels.' },
    { id: 'p4', number: '04', title: 'Wireframing & Flow', description: 'Low-fidelity paper prototypes and interactive Figma wireframe user flows.' },
    { id: 'p5', number: '05', title: 'Design Token System', description: 'Engineered cohesive color scales, dynamic typography scales, and modular components.' },
    { id: 'p6', number: '06', title: 'High-Fidelity UI', description: 'Crafted pixel-perfect dark UI screens with rich micro-interactions and visual states.' },
    { id: 'p7', number: '07', title: 'Prototyping & Testing', description: 'Usability testing with 15 target buyers, iterating based on heatmaps.' },
    { id: 'p8', number: '08', title: 'Production Handoff', description: 'Design specs, React component guidelines, and Vercel edge deployment.' },
  ],
};

export const DEFAULT_COLOR_GROUPS_DEMO: ColorGroup[] = [
  {
    id: 'grp-brand',
    groupName: 'Brand Red Accent',
    tokens: [
      { id: 'b50', tokenName: 'brand-50', hex: '#FFF1F1', cssVariable: '--color-brand-50', usage: 'Subtle backgrounds, hover highlights' },
      { id: 'b100', tokenName: 'brand-100', hex: '#FFDFDF', cssVariable: '--color-brand-100', usage: 'Light badge background' },
      { id: 'b500', tokenName: 'brand-500', hex: '#ED5555', cssVariable: '--color-brand-500', usage: 'Primary CTA buttons, active state indicators', contrastRatio: '4.6:1' },
      { id: 'b600', tokenName: 'brand-600', hex: '#D93B3B', cssVariable: '--color-brand-600', usage: 'Hover state for primary buttons' },
      { id: 'b900', tokenName: 'brand-900', hex: '#5E1414', cssVariable: '--color-brand-900', usage: 'Deep dark red cards' },
    ],
  },
  {
    id: 'grp-dark',
    groupName: 'Dark Surface Neutrals',
    tokens: [
      { id: 'n950', tokenName: 'neutral-950', hex: '#0B0C0E', cssVariable: '--color-bg-root', usage: 'Root app background' },
      { id: 'n900', tokenName: 'neutral-900', hex: '#121418', cssVariable: '--color-bg-card', usage: 'Card surfaces & containers' },
      { id: 'n800', tokenName: 'neutral-800', hex: '#1D2127', cssVariable: '--color-bg-elevated', usage: 'Hover state surfaces' },
      { id: 'n700', tokenName: 'neutral-700', hex: '#2E3540', cssVariable: '--color-border-default', usage: 'Subtle card borders' },
      { id: 'n100', tokenName: 'neutral-100', hex: '#F3F4F6', cssVariable: '--color-text-primary', usage: 'Headings & primary body copy' },
    ],
  },
];

export const DEFAULT_SEMANTIC_TOKENS_DEMO: SemanticToken[] = [
  { id: 's1', semanticName: 'action-primary', primitiveTokenRef: 'brand-500', usage: 'Primary conversion buttons' },
  { id: 's2', semanticName: 'bg-primary', primitiveTokenRef: 'neutral-950', usage: 'Application root background' },
  { id: 's3', semanticName: 'surface-card', primitiveTokenRef: 'neutral-900', usage: 'Elevated UI card containers' },
  { id: 's4', semanticName: 'text-primary', primitiveTokenRef: 'neutral-100', usage: 'Main text typography' },
  { id: 's5', semanticName: 'border-default', primitiveTokenRef: 'neutral-700', usage: 'Divider lines & borders' },
];

export const DEFAULT_TYPOGRAPHY_DEMO: TypographyToken[] = [
  { id: 't1', level: 'Display', fontFamily: 'Syne, sans-serif', fontSize: '48px', fontWeight: '700', lineHeight: '1.1', letterSpacing: '-0.02em', sampleText: 'Architecting Next-Gen Digital Products' },
  { id: 't2', level: 'H1', fontFamily: 'Syne, sans-serif', fontSize: '36px', fontWeight: '600', lineHeight: '1.2', letterSpacing: '-0.01em', sampleText: 'Modular Case Study System' },
  { id: 't3', level: 'H2', fontFamily: 'Inter, sans-serif', fontSize: '24px', fontWeight: '600', lineHeight: '1.3', letterSpacing: '-0.01em', sampleText: 'Design Decisions & Metrics' },
  { id: 't4', level: 'Body Large', fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: '400', lineHeight: '1.6', letterSpacing: '0em', sampleText: 'Crafting editorial web experiences with dark mode visual hierarchy.' },
  { id: 't5', level: 'Body', fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: '400', lineHeight: '1.6', letterSpacing: '0em', sampleText: 'Standard body paragraph text rendered with comfortable line height.' },
  { id: 't6', level: 'Mono', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: '500', lineHeight: '1.5', letterSpacing: '0.05em', sampleText: 'const system = new DesignTokenEngine();' },
];

export const DEFAULT_SPACING_DEMO: SpacingToken[] = [
  { id: 'sp1', name: 'space-1', value: '4px', pxValue: 4 },
  { id: 'sp2', name: 'space-2', value: '8px', pxValue: 8 },
  { id: 'sp3', name: 'space-3', value: '12px', pxValue: 12 },
  { id: 'sp4', name: 'space-4', value: '16px', pxValue: 16 },
  { id: 'sp6', name: 'space-6', value: '24px', pxValue: 24 },
  { id: 'sp8', name: 'space-8', value: '32px', pxValue: 32 },
  { id: 'sp12', name: 'space-12', value: '48px', pxValue: 48 },
  { id: 'sp16', name: 'space-16', value: '64px', pxValue: 64 },
];

export const DEFAULT_RADIUS_DEMO: RadiusToken[] = [
  { id: 'r1', name: 'radius-sm', value: '6px', pxValue: 6 },
  { id: 'r2', name: 'radius-md', value: '10px', pxValue: 10 },
  { id: 'r3', name: 'radius-lg', value: '16px', pxValue: 16 },
  { id: 'r4', name: 'radius-xl', value: '24px', pxValue: 24 },
  { id: 'r5', name: 'radius-full', value: '9999px', pxValue: 9999 },
];

export const DEFAULT_SHADOW_DEMO: ShadowToken[] = [
  { id: 'sh1', name: 'shadow-sm', x: 0, y: 2, blur: 4, spread: 0, opacity: 0.15, color: '#000000' },
  { id: 'sh2', name: 'shadow-md', x: 0, y: 8, blur: 16, spread: -2, opacity: 0.25, color: '#000000' },
  { id: 'sh3', name: 'shadow-lg', x: 0, y: 16, blur: 32, spread: -4, opacity: 0.35, color: '#000000' },
  { id: 'sh4', name: 'shadow-modal', x: 0, y: 24, blur: 48, spread: -8, opacity: 0.5, color: '#000000' },
];

export const DEFAULT_COMPONENTS_DEMO: ComponentToken[] = [
  {
    id: 'c1',
    name: 'Primary Button',
    category: 'Inputs',
    description: 'High-contrast action button with micro-interaction active scale state.',
    states: ['Default', 'Hover', 'Active', 'Disabled', 'Loading'],
    variants: ['Primary Accent', 'Secondary Outline', 'Ghost Minimal'],
    usage: 'Use for main conversion actions (e.g. Add to Cart, Save Changes). Max 1 primary button per visual screen area.',
    doNotes: 'Maintain crisp typography and subtle 1px border glow on dark backgrounds.',
    dontNotes: 'Do not use low contrast text colors that fail WCAG AA ratios.',
  },
  {
    id: 'c2',
    name: 'Interactive Search Bar',
    category: 'Navigation',
    description: 'Instant search input field with shortcut key badge and clear button.',
    states: ['Default', 'Focus', 'Filled', 'Searching'],
    variants: ['Header Compact', 'Hero Large'],
    usage: 'Embedded in header and discovery section hero wrappers.',
    doNotes: 'Trigger optimistic UI filtered state immediately on keyup.',
    dontNotes: 'Do not delay UI focus state while waiting for network responses.',
  },
  {
    id: 'c3',
    name: 'Product Spec Card',
    category: 'Cards',
    description: 'Minimalist product summary card featuring thumbnail, badge, and live price.',
    states: ['Default', 'Hover Glow', 'Selected'],
    variants: ['Standard Grid', 'Compact Row'],
    usage: 'Used across discovery grid pages and search result lists.',
    doNotes: 'Ensure images use aspect-ratio wrappers to prevent layout shifts.',
    dontNotes: 'Do not hide item availability tags on mobile viewports.',
  },
];

export const DEFAULT_GALLERY_DEMO: GalleryData = {
  layout: 'grid3',
  images: [
    { id: 'g1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', alt: 'Abstract Dark 3D Screen', caption: '01. Minimal Dark Interface Exploration' },
    { id: 'g2', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80', alt: 'Hardware Spec Sheet', caption: '02. Modular Component Spec System' },
    { id: 'g3', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', alt: 'Design Workstation', caption: '03. User Journey & Wireframe Testing Session' },
  ],
};

export const DEFAULT_DESIGN_SYSTEM_DEMO: DesignSystemData = {
  colorGroups: DEFAULT_COLOR_GROUPS_DEMO,
  semanticTokens: DEFAULT_SEMANTIC_TOKENS_DEMO,
  typography: DEFAULT_TYPOGRAPHY_DEMO,
  spacing: DEFAULT_SPACING_DEMO,
  radius: DEFAULT_RADIUS_DEMO,
  shadows: DEFAULT_SHADOW_DEMO,
  components: DEFAULT_COMPONENTS_DEMO,
};

export const DEFAULT_ROLE_RESPONSIBILITIES_DEMO: RoleResponsibilitiesData = {
  title: 'My Role & Responsibilities',
  description: 'Summarize responsibilities, methods and design activities performed during the project lifecycle.',
  items: [
    { id: '1', label: 'Design Strategy' },
    { id: '2', label: 'Problem Solving' },
    { id: '3', label: 'Information Architecture' },
    { id: '4', label: 'Empathy Mapping' },
    { id: '5', label: 'Usability Testing' },
    { id: '6', label: 'User Flow' },
    { id: '7', label: 'Prototyping' },
    { id: '8', label: 'Wireframes' },
    { id: '9', label: 'Competitive Analysis' },
    { id: '10', label: 'Visual Design' },
    { id: '11', label: 'User Research' },
    { id: '12', label: 'User Personas' },
  ],
};

export const DEFAULT_DESIGN_THINKING_PROCESS_DEMO: DesignThinkingProcessData = {
  title: 'Design Thinking Process',
  description: 'Iterative end-to-end UX methodology applied from discovery to usability validation.',
  steps: [
    {
      id: 'step-1',
      number: '01',
      title: 'Empathize',
      items: ['User Research', 'User Interview', 'Empathy Analysis'],
    },
    {
      id: 'step-2',
      number: '02',
      title: 'Define',
      items: ['User Persona', 'User Journey Map', 'Goal Statement', 'Empathy Map'],
    },
    {
      id: 'step-3',
      number: '03',
      title: 'Ideate',
      items: ['Brainstorming', 'User Flow', 'Information Architecture'],
    },
    {
      id: 'step-4',
      number: '04',
      title: 'Design',
      items: ['Paper Wireframes', 'Low-Fi Prototype', 'High-Fi Visual Design'],
    },
    {
      id: 'step-5',
      number: '05',
      title: 'Test',
      items: ['Usability Testing', 'A/B Testing', 'Iterative Refinements'],
    },
  ],
};

export const DEFAULT_PROJECT_TIMELINE_DEMO: ProjectTimelineData = {
  title: 'Project Timeline & Execution Roadmap',
  description: 'Weekly breakdown of project phases, activities, and milestones over a 12-week schedule.',
  totalUnits: 12,
  unitLabel: 'Week',
  phases: [
    { id: 'ux', title: 'UX Design Phase', start: 1, end: 8, accent: '#4F8CFF' },
    { id: 'ui', title: 'UI Design & System Phase', start: 9, end: 12, accent: '#10B981' },
  ],
  items: [
    { id: 't1', title: 'Research & User Context', start: 1, end: 1, phaseId: 'ux' },
    { id: 't2', title: 'User Interviews & Empathy Map', start: 2, end: 3, phaseId: 'ux' },
    { id: 't3', title: 'Problem Definition & Goals', start: 4, end: 5, phaseId: 'ux' },
    { id: 't4', title: 'Competitive Analysis & IA', start: 6, end: 8, phaseId: 'ux' },
    { id: 't5', title: 'Paper Wireframes', start: 9, end: 9, phaseId: 'ui' },
    { id: 't6', title: 'Visual Design & Prototyping', start: 10, end: 11, phaseId: 'ui' },
    { id: 't7', title: 'Usability Testing & Hand-off', start: 12, end: 12, phaseId: 'ui' },
  ],
};

export const DEFAULT_MILESTONES_DEMO: MilestonesData = {
  title: 'Key Milestones',
  description: 'Important delivery checkpoints and approval milestones throughout the product sprint.',
  items: [
    { id: 'm1', date: 'Week 3', title: 'Research & Empathy Map Complete', description: 'User insights synthesized into actionable problem statements.' },
    { id: 'm2', date: 'Week 6', title: 'Information Architecture Approved', description: 'Sitemap structure and core navigation flows finalized.' },
    { id: 'm3', date: 'Week 10', title: 'High-Fi Interactive Prototype Ready', description: 'Design system components and micro-interactions assembled.' },
    { id: 'm4', date: 'Week 12', title: 'Usability Testing Complete & Hand-off', description: 'Validated test insights integrated into final design specs.' },
  ],
};
