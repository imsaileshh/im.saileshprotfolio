'use client';

import { useState } from 'react';
import {
  Search,
  Type,
  AlignLeft,
  List,
  Quote,
  Globe,
  Layout,
  Image as ImageIcon,
  Grid,
  FileText,
  Users,
  Heart,
  SearchCode,
  AlertTriangle,
  Target,
  GitFork,
  MapPin,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  Clock,
  Layers,
  Palette,
  Sliders,
  Box,
  SlidersHorizontal,
  Info,
  Minus,
  Maximize2,
  SlidersVertical,
  Split,
  Plus,
} from 'lucide-react';
import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';

export interface BlockMenuItem {
  type: ContentBlockItem['type'];
  title: string;
  description: string;
  category:
    | 'CONTENT'
    | 'MEDIA & SCREENSHOTS'
    | 'UX RESEARCH'
    | 'UX ARCHITECTURE'
    | 'PRODUCT THINKING'
    | 'PROCESS'
    | 'DESIGN SYSTEM'
    | 'DATA'
    | 'SPECIAL';
  icon: any;
}

export const ALL_BLOCK_MENU_ITEMS: BlockMenuItem[] = [
  // CONTENT
  { type: 'heading', title: 'Heading', description: 'Section subheader or topic title (H2, H3, H4)', category: 'CONTENT', icon: Type },
  { type: 'paragraph', title: 'Text', description: 'Standard prose paragraph block with rich text formatting', category: 'CONTENT', icon: AlignLeft },
  { type: 'project_details', title: 'Custom Content', description: 'Key-value pairs or structured detail metadata rows', category: 'CONTENT', icon: FileText },
  { type: 'bullet_list', title: 'Bullet Points', description: 'Unordered bullet point list of key takeaways', category: 'CONTENT', icon: List },
  { type: 'numbered_list', title: 'Numbered Points', description: 'Sequential numbered step list', category: 'CONTENT', icon: List },
  { type: 'quote', title: 'Quote / Insight', description: 'Highlighted pull-quote or user testimonial', category: 'CONTENT', icon: Quote },

  // MEDIA & SCREENSHOTS
  { type: 'webpage', title: 'Webpage Screenshot', description: 'Full website frame mockup container', category: 'MEDIA & SCREENSHOTS', icon: Globe },
  { type: 'dashboard', title: 'Dashboard / UI Screen', description: 'Padded desktop web app frame mockup', category: 'MEDIA & SCREENSHOTS', icon: Layout },
  { type: 'image', title: 'Standard Image', description: 'Single hero photograph, figure, or screenshot', category: 'MEDIA & SCREENSHOTS', icon: ImageIcon },
  { type: 'image_grid', title: 'Image Gallery', description: 'Multi-image grid or masonry showcase', category: 'MEDIA & SCREENSHOTS', icon: Grid },
  { type: 'image_text', title: 'Image + Text', description: 'Side-by-side text description with supporting image', category: 'MEDIA & SCREENSHOTS', icon: Split },
  { type: 'svg', title: 'SVG Vector', description: 'Clean inline SVG diagram or vector asset', category: 'MEDIA & SCREENSHOTS', icon: Sparkles },

  // UX RESEARCH
  { type: 'user_persona', title: 'User Persona', description: 'Document user archetypes, goals, pain points, and traits', category: 'UX RESEARCH', icon: Users },
  { type: 'empathy_map', title: 'Empathy Map', description: 'Document what users think, feel, say, and do', category: 'UX RESEARCH', icon: Heart },
  { type: 'research_findings', title: 'Research Findings', description: 'Qualitative user findings with evidence and impact', category: 'UX RESEARCH', icon: SearchCode },
  { type: 'pain_points', title: 'Pain Points', description: 'Highlight user friction points and obstacles', category: 'UX RESEARCH', icon: AlertTriangle },
  { type: 'user_goals', title: 'Goals / Needs', description: 'Target user objectives and system expectations', category: 'UX RESEARCH', icon: Target },
  { type: 'competitive_analysis', title: 'Competitive Analysis', description: 'Benchmark competitors with feature matrix teardowns', category: 'UX RESEARCH', icon: Grid },

  // UX ARCHITECTURE
  { type: 'user_flow', title: 'User Flow', description: 'Map screens, actions, and decisions in a flowchart', category: 'UX ARCHITECTURE', icon: GitFork },
  { type: 'task_flow', title: 'Task Flow', description: 'Step-by-step navigational user journey', category: 'UX ARCHITECTURE', icon: SlidersHorizontal },
  { type: 'information_architecture', title: 'Information Architecture', description: 'Visual sitemap tree hierarchy of categories and pages', category: 'UX ARCHITECTURE', icon: Layers },
  { type: 'journey_map', title: 'Journey Map', description: 'Map customer experience stages, emotions, & opportunities', category: 'UX ARCHITECTURE', icon: MapPin },

  // PRODUCT THINKING
  { type: 'problem_statement', title: 'Problem Statement', description: 'Define core problem, context, and "How Might We"', category: 'PRODUCT THINKING', icon: HelpCircle },
  { type: 'design_decision', title: 'Design Decision', description: 'Document tradeoffs, alternatives considered, & metric impact', category: 'PRODUCT THINKING', icon: Sparkles },
  { type: 'category_tabs', title: 'Category Tabs', description: 'Organize multiple related topics into clickable rectangular cards', category: 'PRODUCT THINKING', icon: Layers },
  { type: 'before_after', title: 'Before vs After', description: 'Side-by-side redesign comparison', category: 'PRODUCT THINKING', icon: Split },

  // PROCESS
  { type: 'role_responsibilities', title: 'My Role / Responsibilities', description: 'Summarize responsibilities, methods and design activities.', category: 'PROCESS', icon: Users },
  { type: 'design_thinking_process', title: 'Design Thinking Process', description: 'Show the UX process from research to testing.', category: 'PROCESS', icon: CheckCircle2 },
  { type: 'project_timeline', title: 'Project Timeline', description: 'Visualize project phases and weekly activity.', category: 'PROCESS', icon: Clock },
  { type: 'milestones', title: 'Milestones', description: 'Highlight important delivery checkpoints.', category: 'PROCESS', icon: Sparkles },
  { type: 'design_process', title: 'Design Process', description: 'Sequential process timeline and design methodology', category: 'PROCESS', icon: CheckCircle2 },
  { type: 'timeline', title: 'Timeline & Milestones', description: 'Project milestones and execution roadmap', category: 'PROCESS', icon: Clock },

  // DESIGN SYSTEM
  { type: 'design_system', title: 'Design System Overview', description: 'Complete design token suite and component guidelines', category: 'DESIGN SYSTEM', icon: Layers },
  { type: 'color_tokens', title: 'Color Tokens', description: 'Show primitive color scales (50-950) & semantic mappings', category: 'DESIGN SYSTEM', icon: Palette },
  { type: 'typography_tokens', title: 'Typography', description: 'Typography scale specimen cards with font metrics', category: 'DESIGN SYSTEM', icon: Type },
  { type: 'spacing_tokens', title: 'Spacing Tokens', description: 'Visual bar scale representing padding & margin tokens', category: 'DESIGN SYSTEM', icon: Maximize2 },
  { type: 'radius_tokens', title: 'Radius Tokens', description: 'Curvature radius sample boxes', category: 'DESIGN SYSTEM', icon: SlidersHorizontal },
  { type: 'shadow_tokens', title: 'Shadow Tokens', description: 'Elevation box shadows with live previews', category: 'DESIGN SYSTEM', icon: SlidersVertical },
  { type: 'component_showcase', title: 'Component Showcase', description: 'Component cards with state variants & Do/Don\'t rules', category: 'DESIGN SYSTEM', icon: Box },

  // DATA
  { type: 'metric', title: 'Metric', description: 'Single high-impact stat number card', category: 'DATA', icon: TrendingUp },
  { type: 'metric_group', title: 'Stats / Metrics Group', description: 'Multi-column grid of key project impact metrics', category: 'DATA', icon: Info },
  { type: 'feature_list', title: 'Key Features', description: 'Structured feature cards with thumbnail visuals', category: 'DATA', icon: CheckCircle2 },

  // SPECIAL
  { type: 'callout', title: 'Callout Box', description: 'Highlighted summary box with accent background border', category: 'SPECIAL', icon: Info },
  { type: 'divider', title: 'Divider Line', description: 'Subtle horizontal section divider line', category: 'SPECIAL', icon: Minus },
];

interface AddContentBlockMenuProps {
  onSelectBlock: (type: ContentBlockItem['type']) => void;
  onClose: () => void;
  excludeTypes?: string[];
}

export function AddContentBlockMenu({ onSelectBlock, onClose, excludeTypes = [] }: AddContentBlockMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = [
    'ALL',
    'CONTENT',
    'MEDIA & SCREENSHOTS',
    'UX RESEARCH',
    'UX ARCHITECTURE',
    'PRODUCT THINKING',
    'PROCESS',
    'DESIGN SYSTEM',
    'DATA',
    'SPECIAL',
  ];

  const filteredItems = ALL_BLOCK_MENU_ITEMS.filter((item) => {
    if (excludeTypes.includes(item.type)) return false;
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0E0F12] text-foreground shadow-2xl overflow-hidden my-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#14161C]/60">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-[#4F8CFF]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">ADD CONTENT BLOCK</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b border-white/10 bg-[#121419] space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search content blocks (e.g. User Flow, Color Tokens, Persona)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 pl-10 pr-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-[#4F8CFF] focus:outline-none"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-[#4F8CFF]/20 text-[#4F8CFF] border border-[#4F8CFF]/40 font-bold'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blocks Grid */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.type + item.title}
                  type="button"
                  onClick={() => {
                    onSelectBlock(item.type);
                    onClose();
                  }}
                  className="group flex flex-col text-left p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#4F8CFF]/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF] group-hover:scale-110 transition-transform">
                      <IconComp size={16} />
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 bg-white/5 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white mb-0.5 group-hover:text-[#4F8CFF] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                    {item.description}
                  </p>
                </button>
              );
            })
          ) : (
            <div className="col-span-full text-center py-10 text-xs text-zinc-500">
              No content blocks match your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
