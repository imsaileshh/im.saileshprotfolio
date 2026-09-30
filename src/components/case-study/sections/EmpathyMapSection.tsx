'use client';

import { EmpathyMapData } from '@/types/case-study-builder';
import {
  User,
  Sparkles,
  Target,
  AlertCircle,
  Heart,
  MessageSquare,
  Brain,
  Zap,
  Shield,
} from 'lucide-react';
import Image from 'next/image';

interface EmpathyMapSectionProps {
  empathyMap?: EmpathyMapData;
}

export function EmpathyMapSection({ empathyMap }: EmpathyMapSectionProps) {
  if (!empathyMap || !empathyMap.persona) return null;

  const {
    persona,
    thinks = [],
    feels = [],
    says = [],
    does = [],
    painPoints = [],
    goals = [],
    needs = [],
    motivations = [],
  } = empathyMap;

  // Extract avatar URL
  const avatarUrl = persona.avatarUrl || (persona as any).imageUrl;
  const initials = (persona.name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0].toUpperCase())
    .join('');

  // Fallbacks for lists if persona object has custom arrays
  const personaFrustrations: string[] =
    persona.frustrations && persona.frustrations.length > 0 ? persona.frustrations : painPoints;
  const personaMotivations: string[] =
    persona.motivations && persona.motivations.length > 0 ? persona.motivations : motivations;
  const personaGoals: string[] =
    persona.goals && persona.goals.length > 0 ? persona.goals : goals;
  const personaNeeds: string[] =
    persona.needs && persona.needs.length > 0 ? persona.needs : needs;

  const personalityTags: string[] =
    persona.personalityTags || (persona as any).tags || ['Calm', 'Thinker', 'Analytical', 'Tech-Savvy'];

  return (
    <div className="w-full max-w-[1080px] mx-auto space-y-10">
      {/* ── PART 1: USER PERSONA SECTION ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-accent tracking-wider">04</span>
          <span className="text-muted/60">/</span>
          <span className="font-mono text-xs uppercase tracking-widest text-muted font-medium">
            User Persona & Profile
          </span>
        </div>

        {/* 2-Column Desktop Persona Container */}
        <div className="rounded-2xl border border-border-subtle bg-[var(--card)] p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── LEFT COLUMN: Persona Profile (5 Cols) ── */}
            <div className="lg:col-span-5 space-y-6">
              {/* Photo + Name + Role */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start text-center sm:text-left gap-5">
                {/* Persona Photo (Uploaded Image with Aspect-Square) */}
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border border-border-subtle bg-[var(--panel)] shadow-sm shrink-0 group">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={persona.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-2xl font-bold text-foreground bg-[var(--panel)]">
                      {initials || <User size={36} className="text-muted" />}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 min-w-0">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold block">
                    TARGET USER PERSONA
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground font-display leading-tight truncate">
                    {persona.name}
                  </h3>
                  <p className="text-xs font-mono text-muted font-medium leading-snug">
                    {persona.role}
                  </p>
                </div>
              </div>

              {/* Persona Metadata Specs Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-border-subtle/80 bg-[var(--panel)]">
                {persona.age && (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">Age</span>
                    <span className="text-xs font-medium text-foreground block truncate">{persona.age}</span>
                  </div>
                )}
                {persona.location && (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">Location</span>
                    <span className="text-xs font-medium text-foreground block truncate">{persona.location}</span>
                  </div>
                )}
                {persona.occupation && (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">Occupation</span>
                    <span className="text-xs font-medium text-foreground block truncate">{persona.occupation}</span>
                  </div>
                )}
                {persona.status && (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">Status</span>
                    <span className="text-xs font-medium text-foreground block truncate">{persona.status}</span>
                  </div>
                )}
                {persona.education && (
                  <div className="space-y-0.5 col-span-2">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">Education</span>
                    <span className="text-xs font-medium text-foreground block truncate">{persona.education}</span>
                  </div>
                )}
              </div>

              {/* Personality Tags */}
              {personalityTags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold block">
                    Personality Traits
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {personalityTags.map((tag: string, tIdx: number) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded-md bg-[var(--panel)] border border-border-subtle font-mono text-[10px] text-foreground font-medium"
                      >
                        [{tag}]
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Brief Story / Bio */}
              {persona.bio && (
                <div className="pt-4 border-t border-border-subtle space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold block">
                    Brief Story
                  </span>
                  <p className="text-xs text-foreground/90 leading-relaxed italic">
                    &ldquo;{persona.bio}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: Goals / Frustrations / Needs / Motivations (7 Cols) ── */}
            <div className="lg:col-span-7 rounded-xl border border-border-subtle/80 bg-[var(--panel)] p-6 space-y-6">
              {/* GOALS */}
              {personaGoals.length > 0 && (
                <div className="pb-5 border-b border-border-subtle space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
                    <Target size={15} />
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider">
                      GOALS
                    </h4>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-foreground/90">
                    {personaGoals.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-emerald-500 dark:text-emerald-400 font-bold shrink-0 mt-0.5">&bull;</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* FRUSTRATIONS */}
              {personaFrustrations.length > 0 && (
                <div className="pb-5 border-b border-border-subtle space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
                    <AlertCircle size={15} />
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider">
                      FRUSTRATIONS & PAIN POINTS
                    </h4>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-foreground/90">
                    {personaFrustrations.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-amber-500 dark:text-amber-400 font-bold shrink-0 mt-0.5">&bull;</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* NEEDS */}
              {personaNeeds.length > 0 && (
                <div className="pb-5 border-b border-border-subtle space-y-2.5">
                  <div className="flex items-center gap-2 text-accent">
                    <Shield size={15} />
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider">
                      NEEDS & REQUIREMENTS
                    </h4>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-foreground/90">
                    {personaNeeds.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-accent font-bold shrink-0 mt-0.5">&bull;</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* MOTIVATIONS */}
              {personaMotivations.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400">
                    <Sparkles size={15} />
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider">
                      MOTIVATIONS
                    </h4>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-foreground/90">
                    {personaMotivations.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-purple-500 dark:text-purple-400 font-bold shrink-0 mt-0.5">&bull;</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── PART 2: EMPATHY MAP SECTION (True 2x2 Matrix) ── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-amber-500 dark:text-amber-400 tracking-wider">05</span>
          <span className="text-muted/60">/</span>
          <span className="font-mono text-xs uppercase tracking-widest text-muted font-medium">
            Empathy Map Matrix
          </span>
        </div>

        {/* 2x2 Empathy Matrix Container */}
        <div className="relative rounded-2xl border border-border-subtle bg-[var(--card)] p-6 sm:p-8 shadow-sm overflow-hidden">
          {/* Centered Persona Badge at Axis Intersection */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-subtle bg-[var(--card)] shadow-md z-10">
            <div className="w-5 h-5 rounded-full overflow-hidden relative border border-border-subtle shrink-0">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={persona.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-[var(--panel)] text-[9px] font-bold text-foreground flex items-center justify-center">
                  {initials}
                </div>
              )}
            </div>
            <span className="font-mono text-[10px] font-bold text-foreground tracking-wider uppercase">
              {persona.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* QUADRANT 1 (Top-Left): SAYS */}
            <div className="rounded-xl border border-border-subtle/80 bg-[var(--panel)] p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-border-subtle">
                <MessageSquare size={16} className="text-amber-500 dark:text-amber-400 shrink-0" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
                  SAYS
                </span>
                <span className="text-[10px] text-muted font-mono ml-auto">Public Statements</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-foreground/90">
                {says.length > 0 ? (
                  says.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-amber-500 dark:text-amber-400 font-bold shrink-0 mt-0.5">&bull;</span>
                      <span className="leading-relaxed italic">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-muted italic">No public quotes recorded...</li>
                )}
              </ul>
            </div>

            {/* QUADRANT 2 (Top-Right): THINKS */}
            <div className="rounded-xl border border-border-subtle/80 bg-[var(--panel)] p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-border-subtle">
                <Brain size={16} className="text-accent shrink-0" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-accent">
                  THINKS
                </span>
                <span className="text-[10px] text-muted font-mono ml-auto">Internal Thoughts</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-foreground/90">
                {thinks.length > 0 ? (
                  thinks.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-accent font-bold shrink-0 mt-0.5">&bull;</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-muted italic">No internal thoughts recorded...</li>
                )}
              </ul>
            </div>

            {/* QUADRANT 3 (Bottom-Left): DOES */}
            <div className="rounded-xl border border-border-subtle/80 bg-[var(--panel)] p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-border-subtle">
                <Zap size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
                  DOES
                </span>
                <span className="text-[10px] text-muted font-mono ml-auto">Observed Behaviors</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-foreground/90">
                {does.length > 0 ? (
                  does.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-emerald-500 dark:text-emerald-400 font-bold shrink-0 mt-0.5">&bull;</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-muted italic">No observed actions recorded...</li>
                )}
              </ul>
            </div>

            {/* QUADRANT 4 (Bottom-Right): FEELS */}
            <div className="rounded-xl border border-border-subtle/80 bg-[var(--panel)] p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-border-subtle">
                <Heart size={16} className="text-purple-500 dark:text-purple-400 shrink-0" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400">
                  FEELS
                </span>
                <span className="text-[10px] text-muted font-mono ml-auto">Emotions & State</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-foreground/90">
                {feels.length > 0 ? (
                  feels.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-purple-500 dark:text-purple-400 font-bold shrink-0 mt-0.5">&bull;</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-muted italic">No emotional states recorded...</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
