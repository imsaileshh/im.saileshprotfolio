'use client';

import { useState } from 'react';
import {
  X,
  Plus,
  FileText,
  Search,
  Users,
  Heart,
  GitFork,
  Map,
  Layers,
  Palette,
  Type,
  Maximize2,
  Box,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  HelpCircle,
  Video,
  Monitor,
  Layout,
  Grid,
} from 'lucide-react';
import { CaseStudySectionType } from '@/types/case-study-builder';

export interface SectionTemplateItem {
  id: string;
  type: CaseStudySectionType;
  title: string;
  description: string;
  category: 'Research' | 'UX Architecture' | 'Design' | 'Product Thinking' | 'Media';
  icon: any;
  defaultSubtitle?: string;
}

export const SECTION_TEMPLATES: SectionTemplateItem[] = [
  // Research
  {
    id: 'tmpl-research-summary',
    type: 'standard',
    title: 'Research Summary',
    description: 'User interviews, qualitative findings, key takeaways and survey synthesis.',
    category: 'Research',
    icon: FileText,
  },
  {
    id: 'tmpl-competitive-analysis',
    type: 'competitive_analysis',
    title: 'Competitive Analysis',
    description: 'Competitor profiles, feature matrix comparisons, strengths & weaknesses.',
    category: 'Research',
    icon: Search,
  },
  {
    id: 'tmpl-user-persona',
    type: 'persona',
    title: 'User Persona',
    description: 'Detailed UX research persona artifact with goals, pain points, and sliders.',
    category: 'Research',
    icon: Users,
  },
  {
    id: 'tmpl-empathy-map',
    type: 'empathy_map',
    title: 'Empathy Map',
    description: 'Classic (Thinks/Feels/Says/Does) or Research Synthesis empathy matrix.',
    category: 'Research',
    icon: Heart,
  },

  // UX Architecture
  {
    id: 'tmpl-information-architecture',
    type: 'information_architecture',
    title: 'Information Architecture',
    description: 'Sitemap taxonomy diagram with roots, groups, pages, and descriptions.',
    category: 'UX Architecture',
    icon: GitFork,
  },
  {
    id: 'tmpl-user-flow',
    type: 'user_flow',
    title: 'User Flow',
    description: 'Interactive node-based flowchart with screen, decision, & action steps.',
    category: 'UX Architecture',
    icon: Layout,
  },
  {
    id: 'tmpl-journey-map',
    type: 'journey_map',
    title: 'Journey Map',
    description: '5-stage customer journey matrix with emotional trajectories & opportunities.',
    category: 'UX Architecture',
    icon: Map,
  },

  // Design
  {
    id: 'tmpl-wireframes',
    type: 'standard',
    title: 'Wireframes',
    description: 'Low-fidelity layout explorations and structural content hierarchy.',
    category: 'Design',
    icon: Grid,
  },
  {
    id: 'tmpl-design-system',
    type: 'design_system',
    title: 'Design System',
    description: 'All-in-one token suite: colors, typography, spacing, radius, & components.',
    category: 'Design',
    icon: Layers,
  },
  {
    id: 'tmpl-color-tokens',
    type: 'color_tokens',
    title: 'Color Tokens',
    description: 'Primitive color scales (50-950) + semantic color mapping swatches.',
    category: 'Design',
    icon: Palette,
  },
  {
    id: 'tmpl-typography',
    type: 'typography',
    title: 'Typography',
    description: 'Typography scale specimen cards displaying size, weight, & line-height.',
    category: 'Design',
    icon: Type,
  },
  {
    id: 'tmpl-components',
    type: 'component_library',
    title: 'Components',
    description: 'Component showcase cards with state variants, Do / Don\'t guidelines.',
    category: 'Design',
    icon: Box,
  },
  {
    id: 'tmpl-hifi-screens',
    type: 'standard',
    title: 'High-Fidelity Screens',
    description: 'Pixel-perfect production screens showcase with background glow frames.',
    category: 'Design',
    icon: Monitor,
  },

  // Product Thinking
  {
    id: 'tmpl-problem',
    type: 'standard',
    title: 'Problem',
    description: 'Core problem statement, friction teardown, and operational constraints.',
    category: 'Product Thinking',
    icon: HelpCircle,
  },
  {
    id: 'tmpl-design-decision',
    type: 'design_decision',
    title: 'Design Decision',
    description: 'Problem vs alternatives considered, chosen solution, trade-offs & results.',
    category: 'Product Thinking',
    icon: Sparkles,
  },
  {
    id: 'tmpl-metrics',
    type: 'metrics',
    title: 'Results / Metrics',
    description: 'Impact statistic cards with customizable 2/3/4 grid layout.',
    category: 'Product Thinking',
    icon: TrendingUp,
  },
  {
    id: 'tmpl-learnings',
    type: 'design_process',
    title: 'Design Process / Learnings',
    description: 'Numbered process steps or key retrospective reflections.',
    category: 'Product Thinking',
    icon: CheckCircle2,
  },

  // Media
  {
    id: 'tmpl-image',
    type: 'standard',
    title: 'Image',
    description: 'Single hero photo, diagram screenshot, or visual figure.',
    category: 'Media',
    icon: ImageIcon,
  },
  {
    id: 'tmpl-webpage-screenshot',
    type: 'standard',
    title: 'Webpage Screenshot',
    description: 'Full-width desktop website frame container.',
    category: 'Media',
    icon: Monitor,
  },
  {
    id: 'tmpl-dashboard-screenshot',
    type: 'standard',
    title: 'Dashboard Screenshot',
    description: 'Clean padded dashboard mockup frame container.',
    category: 'Media',
    icon: Layout,
  },
  {
    id: 'tmpl-gallery',
    type: 'gallery',
    title: 'Gallery',
    description: 'Multi-image grid, masonry, or horizontal scroll showcase.',
    category: 'Media',
    icon: Maximize2,
  },
  {
    id: 'tmpl-video',
    type: 'standard',
    title: 'Video Demo',
    description: 'MP4 / Loom product walkthrough video section.',
    category: 'Media',
    icon: Video,
  },
  {
    id: 'tmpl-figma-prototype',
    type: 'standard',
    title: 'Figma Prototype',
    description: 'Interactive iframe or preview modal prototype trigger.',
    category: 'Media',
    icon: Sparkles,
  },
];

interface SectionLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: SectionTemplateItem) => void;
}

export function SectionLibraryModal({ isOpen, onClose, onSelectTemplate }: SectionLibraryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const categories = ['All', 'Research', 'UX Architecture', 'Design', 'Product Thinking', 'Media'];

  const filteredTemplates = SECTION_TEMPLATES.filter((tmpl) => {
    const matchesCat = selectedCategory === 'All' || tmpl.category === selectedCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0E0F12] text-foreground shadow-2xl overflow-hidden my-8 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 bg-[#14161C]/50">
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
              <Plus size={20} className="text-accent" />
              <span>ADD CASE STUDY SECTION</span>
            </h2>
            <p className="text-xs text-muted mt-1">
              Select a modular section template to add to your case study story.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-white/10 hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-5 border-b border-white/10 bg-[#121419]/80 flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-accent/15 text-accent border border-accent/40 font-semibold'
                    : 'bg-white/5 text-muted hover:text-foreground hover:bg-white/10 border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((tmpl) => {
              const IconComp = tmpl.icon;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    onSelectTemplate(tmpl);
                    onClose();
                  }}
                  className="group flex flex-col text-left p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-accent/40 transition-all cursor-pointer relative"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                      <IconComp size={18} />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted/60 px-2 py-0.5 rounded bg-white/5">
                      {tmpl.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-muted/80 leading-relaxed line-clamp-2">
                    {tmpl.description}
                  </p>
                </button>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 text-muted">
              No section templates match your search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
