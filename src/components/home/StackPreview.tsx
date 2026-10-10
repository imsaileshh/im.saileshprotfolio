'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getTechLogo } from '@/lib/stack/tech-logos';

const ease = [0.22, 1, 0.36, 1] as const;

// ── Badge color map ───────────────────────────────────────────────────────────
// [darkBg, darkBorder, darkText, lightBg, lightBorder, lightText]
type BadgeColor = [string, string, string, string, string, string];

const BADGE_COLORS: Record<string, BadgeColor> = {
  // Frontend
  'react.js':          ['rgba(56,189,248,0.09)','rgba(56,189,248,0.22)','#67d2f5','rgba(14,165,233,0.08)','rgba(14,165,233,0.26)','#0369a1'],
  'next.js':           ['rgba(255,255,255,0.06)','rgba(255,255,255,0.13)','#d4d4d8','rgba(0,0,0,0.05)','rgba(0,0,0,0.13)','#3f3f46'],
  'typescript':        ['rgba(59,130,246,0.09)','rgba(59,130,246,0.24)','#93b4fd','rgba(59,130,246,0.08)','rgba(59,130,246,0.22)','#1d4ed8'],
  'tailwind css':      ['rgba(34,211,238,0.09)','rgba(34,211,238,0.22)','#5eead4','rgba(20,184,166,0.08)','rgba(20,184,166,0.22)','#0f766e'],
  'javascript':        ['rgba(234,179,8,0.09)','rgba(234,179,8,0.24)','#fcd34d','rgba(202,138,4,0.08)','rgba(202,138,4,0.22)','#92400e'],
  'html5':             ['rgba(249,115,22,0.09)','rgba(249,115,22,0.22)','#fb923c','rgba(234,88,12,0.08)','rgba(234,88,12,0.24)','#9a3412'],
  'css3':              ['rgba(59,130,246,0.09)','rgba(59,130,246,0.20)','#7cb4fa','rgba(37,99,235,0.08)','rgba(37,99,235,0.20)','#1e3a8a'],
  'html · css':        ['rgba(249,115,22,0.09)','rgba(249,115,22,0.22)','#fb923c','rgba(234,88,12,0.08)','rgba(234,88,12,0.22)','#9a3412'],
  'framer motion':     ['rgba(168,85,247,0.09)','rgba(168,85,247,0.22)','#c084fc','rgba(147,51,234,0.08)','rgba(147,51,234,0.22)','#6b21a8'],
  // Backend
  'node.js':           ['rgba(34,197,94,0.09)','rgba(34,197,94,0.22)','#6ee7a0','rgba(22,163,74,0.08)','rgba(22,163,74,0.22)','#14532d'],
  'express.js':        ['rgba(255,255,255,0.06)','rgba(255,255,255,0.12)','#a1a1aa','rgba(0,0,0,0.05)','rgba(0,0,0,0.12)','#52525b'],
  'rest api':          ['rgba(139,92,246,0.09)','rgba(139,92,246,0.22)','#a78bfa','rgba(124,58,237,0.08)','rgba(124,58,237,0.22)','#4c1d95'],
  'rest apis':         ['rgba(139,92,246,0.09)','rgba(139,92,246,0.22)','#a78bfa','rgba(124,58,237,0.08)','rgba(124,58,237,0.22)','#4c1d95'],
  'graphql':           ['rgba(236,72,153,0.09)','rgba(236,72,153,0.22)','#f472b6','rgba(219,39,119,0.08)','rgba(219,39,119,0.22)','#831843'],
  'redis':             ['rgba(239,68,68,0.09)','rgba(239,68,68,0.22)','#f87171','rgba(220,38,38,0.08)','rgba(220,38,38,0.22)','#7f1d1d'],
  // Database
  'postgresql':        ['rgba(59,130,246,0.09)','rgba(59,130,246,0.22)','#93b4fd','rgba(37,99,235,0.08)','rgba(37,99,235,0.22)','#1e40af'],
  'mongodb':           ['rgba(34,197,94,0.09)','rgba(34,197,94,0.22)','#6ee7a0','rgba(22,163,74,0.08)','rgba(22,163,74,0.22)','#14532d'],
  'prisma':            ['rgba(139,92,246,0.09)','rgba(139,92,246,0.22)','#c4b5fd','rgba(109,40,217,0.08)','rgba(109,40,217,0.22)','#4c1d95'],
  'supabase':          ['rgba(34,197,94,0.09)','rgba(34,197,94,0.22)','#6ee7a0','rgba(22,163,74,0.08)','rgba(22,163,74,0.22)','#14532d'],
  // Tools / Software
  'git':               ['rgba(249,115,22,0.09)','rgba(249,115,22,0.22)','#fb923c','rgba(234,88,12,0.08)','rgba(234,88,12,0.24)','#9a3412'],
  'github':            ['rgba(255,255,255,0.06)','rgba(255,255,255,0.13)','#d4d4d8','rgba(0,0,0,0.05)','rgba(0,0,0,0.12)','#3f3f46'],
  'docker':            ['rgba(59,130,246,0.09)','rgba(59,130,246,0.22)','#7cb4fa','rgba(37,99,235,0.08)','rgba(37,99,235,0.22)','#1e3a8a'],
  'vercel':            ['rgba(255,255,255,0.06)','rgba(255,255,255,0.14)','#e4e4e7','rgba(0,0,0,0.04)','rgba(0,0,0,0.12)','#27272a'],
  'aws':               ['rgba(251,191,36,0.09)','rgba(251,191,36,0.22)','#fcd34d','rgba(202,138,4,0.08)','rgba(202,138,4,0.22)','#92400e'],
  'figma':             ['rgba(168,85,247,0.09)','rgba(168,85,247,0.24)','#d8b4fe','rgba(126,34,206,0.08)','rgba(126,34,206,0.24)','#6b21a8'],
  'framer':            ['rgba(139,92,246,0.09)','rgba(139,92,246,0.24)','#c4b5fd','rgba(109,40,217,0.08)','rgba(109,40,217,0.24)','#4c1d95'],
  'vs code':           ['rgba(59,130,246,0.09)','rgba(59,130,246,0.22)','#93b4fd','rgba(37,99,235,0.08)','rgba(37,99,235,0.22)','#1e40af'],
  'adobe photoshop':   ['rgba(59,130,246,0.09)','rgba(59,130,246,0.22)','#93b4fd','rgba(37,99,235,0.08)','rgba(37,99,235,0.22)','#1e40af'],
  'illustrator':       ['rgba(251,146,60,0.09)','rgba(251,146,60,0.22)','#fdba74','rgba(234,88,12,0.08)','rgba(234,88,12,0.22)','#9a3412'],
  'adobe illustrator': ['rgba(251,146,60,0.09)','rgba(251,146,60,0.22)','#fdba74','rgba(234,88,12,0.08)','rgba(234,88,12,0.22)','#9a3412'],
  'lightroom':         ['rgba(59,130,246,0.09)','rgba(59,130,246,0.20)','#7cb4fa','rgba(37,99,235,0.08)','rgba(37,99,235,0.20)','#1e3a8a'],
  'lightroom classic': ['rgba(59,130,246,0.09)','rgba(59,130,246,0.20)','#7cb4fa','rgba(37,99,235,0.08)','rgba(37,99,235,0.20)','#1e3a8a'],
};

const DEFAULT_BADGE: BadgeColor = [
  'rgba(255,255,255,0.05)','rgba(255,255,255,0.10)','#a1a1aa',
  'rgba(0,0,0,0.04)','rgba(0,0,0,0.10)','#52525b',
];

function BadgeIcon({ name, slug }: { name: string; slug?: string | null }) {
  const [failed, setFailed] = useState(false);
  const entry = getTechLogo(slug ?? name);
  if (!entry || failed) return null;
  return (
    <img
      src={entry.url}
      alt=""
      width={19}
      height={19}
      aria-hidden="true"
      className="w-[19px] h-[19px] object-contain shrink-0"
      style={entry.filter ? { filter: entry.filter } : undefined}
      onError={() => setFailed(true)}
    />
  );
}

function TechBadge({ name, slug }: { name: string; slug?: string | null }) {
  const [darkBg, darkBorder, darkText, lightBg, lightBorder, lightText] =
    BADGE_COLORS[name.toLowerCase()] ?? DEFAULT_BADGE;

  return (
    <span
      data-badge
      className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg text-[14.5px] font-medium leading-none select-none cursor-default whitespace-nowrap border transition-all duration-200 hover:-translate-y-[1px]"
      style={{
        height: '46px',
        // dark mode (default)
        backgroundColor: darkBg,
        borderColor: darkBorder,
        color: darkText,
        // light-mode vars consumed by globals.css
        '--b-lbg': lightBg,
        '--b-lbr': lightBorder,
        '--b-ltx': lightText,
      } as React.CSSProperties}
    >
      <BadgeIcon name={name} slug={slug} />
      {name}
    </span>
  );
}

export function StackPreview({ skillSections = [] }: { skillSections?: any[] }) {
  const shouldReduceMotion = useReducedMotion();

  const categories = skillSections.length > 0 ? skillSections : [
    {
      title: 'FRONTEND',
      skills: [
        { name: 'React.js' }, { name: 'Next.js' }, { name: 'TypeScript' },
        { name: 'JavaScript' }, { name: 'Tailwind CSS' }, { name: 'HTML5' }, { name: 'CSS3' }
      ]
    },
    {
      title: 'BACKEND',
      skills: [
        { name: 'Node.js' }, { name: 'Express.js' }, { name: 'PostgreSQL' },
        { name: 'MongoDB' }, { name: 'REST API' }
      ]
    },
    {
      title: 'DESIGN',
      skills: [
        { name: 'Figma' }, { name: 'Framer' }, { name: 'Adobe Photoshop' },
        { name: 'Illustrator' }, { name: 'Lightroom' }
      ]
    },
    {
      title: 'SOFTWARE',
      skills: [
        { name: 'VS Code' }, { name: 'Git' }, { name: 'GitHub' },
        { name: 'Docker' }, { name: 'Vercel' }
      ]
    }
  ];

  const rowVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease,
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease },
    },
  };

  return (
    <section id="stack-preview" className="py-4 sm:py-6 md:py-8 relative px-5 sm:px-6 md:px-10 lg:px-16">

      {/* HEADER — themed bordered icon + clean heading */}
      <SectionHeader icon={Layers}>
        <h2 className="text-3xl md:text-4xl lg:text-[40px] font-display font-medium tracking-tight text-foreground leading-[1.15]">
          Tools &amp; Technologies
        </h2>
      </SectionHeader>

      {/* CATEGORY ROWS — structure unchanged, only tech items become badges */}
      <div className="w-full flex flex-col">
        {categories.map((item) => (
          <motion.div
            key={item.title}
            variants={rowVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-7 md:py-8 lg:py-10 border-b border-border-subtle/70 relative"
          >
            {/* LEFT: Category label */}
            <motion.div variants={itemVariants} className="w-full lg:w-48 shrink-0">
              <span className="text-[13px] md:text-[14px] font-mono tracking-[0.2em] text-foreground font-semibold uppercase">
                {item.title}
              </span>
            </motion.div>

            {/* RIGHT: Badge pills */}
            <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2.5 flex-1">
              {item.skills.map((tech: any) => (
                <TechBadge key={tech.name} name={tech.name} slug={tech.icon} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
