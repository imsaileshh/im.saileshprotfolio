export type CaseStudySectionType =
  | 'standard'
  | 'user_flow'
  | 'information_architecture'
  | 'persona'
  | 'empathy_map'
  | 'journey_map'
  | 'competitive_analysis'
  | 'design_decision'
  | 'metrics'
  | 'design_process'
  | 'design_system'
  | 'color_tokens'
  | 'typography'
  | 'spacing'
  | 'radius'
  | 'shadows'
  | 'component_library'
  | 'gallery';

// ── Node Types for User Flow ──
export type UserFlowNodeStyleType = 'start' | 'screen' | 'decision' | 'action' | 'success' | 'error';

export interface UserFlowNode {
  id: string;
  title: string;
  description?: string;
  type: UserFlowNodeStyleType;
  icon?: string;
  color?: string;
}

export interface UserFlowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface UserFlowData {
  nodes: UserFlowNode[];
  edges: UserFlowEdge[];
}

// ── Information Architecture / Sitemap ──
export interface IANode {
  id: string;
  title: string;
  type: 'root' | 'group' | 'page' | 'child' | 'action' | 'decision' | 'external';
  description?: string;
  edgeLabel?: string;
  url?: string;
  icon?: string;
  children?: IANode[];
}

export interface InformationArchitectureData {
  nodes: IANode[];
}

// ── Persona & Empathy Map ──
export interface PersonaInfo {
  name: string;
  role: string;
  age?: string;
  occupation?: string;
  location?: string;
  status?: string;
  education?: string;
  experience?: string;
  avatarUrl?: string;
  bio?: string;
  personalityTags?: string[];
  goals?: string[];
  frustrations?: string[];
  needs?: string[];
  motivations?: string[];
}

export type EmpathyMapVariant = 'classic' | 'synthesis';

export interface EmpathyMapData {
  persona: PersonaInfo;
  variant: EmpathyMapVariant;
  // Classic quadrants
  thinks: string[];
  feels: string[];
  says: string[];
  does: string[];
  // Research Synthesis quadrants
  cognitiveFriction?: string[];
  environment?: string[];
  expressedNeeds?: string[];
  externalInfluences?: string[];
  // Additional synthesis
  painPoints: string[];
  goals: string[];
  needs: string[];
  motivations: string[];
  influences: string[];
}

// ── User Persona Detailed ──
export interface UserPersonaData {
  name: string;
  imageUrl?: string;
  age: string;
  role: string;
  location: string;
  bio: string;
  goals: string[];
  painPoints: string[];
  needs: string[];
  behaviors: string[];
  motivations: string[];
  tools: string[];
  quote: string;
  sliders?: {
    techSavvy: number; // 0-100
    priceSensitivity: number; // 0-100
    frequencyOfUse: number; // 0-100
  };
}

// ── Journey Map ──
export type JourneyEmotion = 'very-negative' | 'negative' | 'neutral' | 'positive' | 'very-positive';

export interface JourneyStage {
  id: string;
  name: string; // e.g., Awareness, Discovery, Evaluation, Action, Post-Purchase
  actions: string[];
  thoughts: string[];
  painPoints: string[];
  emotion: JourneyEmotion;
  opportunity: string;
}

export interface JourneyMapData {
  journeyName: string;
  personaName: string;
  stages: JourneyStage[];
}

// ── Competitive Analysis ──
export interface CompetitorItem {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  strengths: string[];
  weaknesses: string[];
  keyFeatures: string[];
  notes?: string;
}

export interface FeatureMatrixItem {
  id: string;
  featureName: string;
  ourProduct: boolean | string;
  competitorValues: Record<string, boolean | string>; // competitorId -> value
}

export interface CompetitiveAnalysisData {
  competitors: CompetitorItem[];
  matrix: FeatureMatrixItem[];
}

// ── Design Decisions ──
export interface DesignDecisionItem {
  id: string;
  number: string; // '01', '02'
  category?: string;
  title: string;
  problem: string;
  alternativeConsidered: string;
  whyAlternativeRejected: string;
  chosenSolution: string;
  tradeOff: string;
  resultMetric?: string; // e.g. "+24% Checkout Completion"
}

export interface DesignDecisionData {
  decisions: DesignDecisionItem[];
}

// ── Results / Metrics ──
export interface MetricCardItem {
  id: string;
  value: string; // e.g. "24" or "15" or "0.8"
  prefix?: string; // e.g. "+"
  suffix?: string; // e.g. "%" or "min" or "s"
  label: string; // e.g. "Checkout Completion"
  description?: string;
}

export interface MetricsData {
  items: MetricCardItem[];
  columns: 2 | 3 | 4;
}

// ── Design Process ──
export interface ProcessStepItem {
  id: string;
  number: string;
  title: string;
  description: string;
  icon?: string;
}

export interface DesignProcessData {
  steps: ProcessStepItem[];
}

// ── Color Tokens ──
export interface ColorToken {
  id: string;
  tokenName: string; // e.g. "brand-500"
  hex: string; // e.g. "#ED5555"
  cssVariable?: string; // e.g. "--color-brand-500"
  tailwindName?: string;
  usage?: string; // e.g. "Primary CTA, selected tabs"
  contrastRatio?: string; // e.g. "4.5:1"
}

export interface ColorGroup {
  id: string;
  groupName: string; // e.g. "Brand", "Neutral"
  tokens: ColorToken[];
}

export interface SemanticToken {
  id: string;
  semanticName: string; // e.g. "action-primary", "bg-primary"
  primitiveTokenRef: string; // e.g. "brand-500"
  usage?: string;
}

// ── Typography Tokens ──
export type TypographyLevel =
  | 'Display'
  | 'H1'
  | 'H2'
  | 'H3'
  | 'Body Large'
  | 'Body'
  | 'Small'
  | 'Caption'
  | 'Mono';

export interface TypographyToken {
  id: string;
  level: TypographyLevel;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  sampleText?: string;
}

// ── Spacing Tokens ──
export interface SpacingToken {
  id: string;
  name: string; // e.g. "space-4"
  value: string; // e.g. "16px"
  pxValue: number; // e.g. 16
}

// ── Radius Tokens ──
export interface RadiusToken {
  id: string;
  name: string; // e.g. "radius-md"
  value: string; // e.g. "10px"
  pxValue: number;
}

// ── Shadow Tokens ──
export interface ShadowToken {
  id: string;
  name: string; // e.g. "shadow-md"
  x: number;
  y: number;
  blur: number;
  spread: number;
  opacity: number;
  color?: string;
}

export interface ComponentStateVisual {
  name: string;
  assetUrl: string;
}

// ── Component Library ──
export interface ComponentToken {
  id: string;
  name: string; // e.g. "Button"
  category: string; // e.g. "Inputs", "Feedback", "Navigation"
  description: string;
  imageUrl?: string;
  assetUrl?: string;
  assetType?: 'svg' | 'png' | 'jpeg' | 'webp';
  previewBackground?: 'transparent' | 'light' | 'dark' | 'custom';
  previewBackgroundColor?: string;
  states?: string[]; // ['Default', 'Hover', 'Active', 'Disabled']
  stateVisuals?: ComponentStateVisual[];
  variants?: string[]; // ['Primary', 'Secondary', 'Ghost']
  usage?: string;
  doNotes?: string;
  dontNotes?: string;
}

// ── Design System Aggregate Data ──
export interface DesignSystemData {
  colorGroups: ColorGroup[];
  semanticTokens: SemanticToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  radius: RadiusToken[];
  shadows: ShadowToken[];
  components: ComponentToken[];
}

// ── Gallery Block ──
export type GalleryLayout =
  | 'grid2'
  | 'grid3'
  | 'masonry'
  | 'scroll'
  | 'hero_supporting'
  | 'device_showcase';

export interface GalleryImageItem {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
}

export interface GalleryData {
  layout: GalleryLayout;
  images: GalleryImageItem[];
}

// ── Base Metadata for CaseStudySection ──
export interface ExtendedSectionMetadata {
  sectionType?: CaseStudySectionType;
  hidden?: boolean;
  collapsed?: boolean;
  customTitle?: string;
  subtitle?: string;
  layout?: string;
  
  // Specific Data Payloads
  userFlow?: UserFlowData;
  informationArchitecture?: InformationArchitectureData;
  empathyMap?: EmpathyMapData;
  persona?: UserPersonaData;
  journeyMap?: JourneyMapData;
  competitiveAnalysis?: CompetitiveAnalysisData;
  designDecision?: DesignDecisionData;
  metrics?: MetricsData;
  designProcess?: DesignProcessData;
  designSystem?: DesignSystemData;
  colorTokens?: { colorGroups: ColorGroup[]; semanticTokens?: SemanticToken[] };
  typographyTokens?: TypographyToken[];
  spacingTokens?: SpacingToken[];
  radiusTokens?: RadiusToken[];
  shadowTokens?: ShadowToken[];
  componentLibrary?: ComponentToken[];
  gallery?: GalleryData;

  // Media / Blocks
  media?: any[];
  blocks?: any[];
  stats?: Array<{ value: string; label: string }>;
  [key: string]: unknown;
}

// ── Category Tabs Block ──
export interface CategoryTabItem {
  id: string;
  number?: string;
  label: string;
  eyebrow?: string;
  title?: string;
  metric?: {
    value?: string;
    label?: string;
  };
  blocks: any[];
  hidden?: boolean;
}

export interface CategoryTabsBlockData {
  title?: string;
  description?: string;
  categories: CategoryTabItem[];
  settings?: {
    showCounter?: boolean;
    showArrows?: boolean;
    allowMobileScroll?: boolean;
  };
}

// ── My Role & Responsibilities Block ──
export interface RoleResponsibilityItem {
  id: string;
  label: string;
  icon?: string;
  category?: string;
}

export interface RoleResponsibilitiesData {
  title?: string;
  description?: string;
  items: RoleResponsibilityItem[];
}

// ── Design Thinking Process Block ──
export interface DesignThinkingStep {
  id: string;
  number: string;
  title: string;
  icon?: string;
  items: string[];
}

export interface DesignThinkingProcessData {
  title?: string;
  description?: string;
  steps: DesignThinkingStep[];
}

// ── Project Timeline Block ──
export interface TimelinePhase {
  id: string;
  title: string;
  start: number;
  end: number;
  accent?: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  start: number;
  end: number;
  phaseId?: string;
  description?: string;
  icon?: string;
}

export interface ProjectTimelineData {
  title?: string;
  description?: string;
  totalUnits: number;
  unitLabel: string;
  phases: TimelinePhase[];
  items: TimelineItem[];
}

// ── Milestones Block ──
export interface MilestoneItem {
  id: string;
  date: string;
  title: string;
  description?: string;
}

export interface MilestonesData {
  title?: string;
  description?: string;
  items: MilestoneItem[];
}
