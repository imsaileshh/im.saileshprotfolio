'use client';

import { UserPersonaData } from '@/types/case-study-builder';
import { User, Quote, Sliders, AlertCircle, Wrench, Target } from 'lucide-react';
import Image from 'next/image';

interface PersonaSectionProps {
  persona?: UserPersonaData;
}

export function PersonaSection({ persona }: PersonaSectionProps) {
  if (!persona) return null;

  const imageUrl = persona.imageUrl || (persona as any).avatarUrl;
  const sliders = persona.sliders || { techSavvy: 85, priceSensitivity: 40, frequencyOfUse: 95 };

  // Generate initials fallback (e.g., "Elena Rostova" -> "ER")
  const initials = (persona.name || 'User Persona')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return (
    <div className="w-full max-w-[960px] mx-auto rounded-2xl border border-border-subtle bg-[var(--card)] p-6 sm:p-8 space-y-8 shadow-sm">
      {/* ── 01. Header Profile & Avatar ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border-subtle/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {imageUrl ? (
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-border-subtle bg-[var(--panel)] shrink-0 shadow-md">
              <Image
                src={imageUrl}
                alt={persona.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 96px, 128px"
              />
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-[var(--panel)] border border-border-subtle flex items-center justify-center text-foreground font-mono text-xl sm:text-2xl font-bold shrink-0 shadow-md">
              {initials || <User size={36} />}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] uppercase tracking-widest text-accent font-semibold">
                USER PERSONA
              </span>
              {persona.age && (
                <>
                  <span className="text-muted/60 font-mono text-xs">&bull;</span>
                  <span className="text-xs font-mono text-muted">Age {persona.age}</span>
                </>
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-semibold text-foreground tracking-tight">
              {persona.name}
            </h3>
            <p className="text-sm font-medium text-muted">
              {persona.role} {persona.location ? `· ${persona.location}` : ''}
            </p>
          </div>
        </div>

        {persona.quote && (
          <div className="p-4 rounded-xl border border-border-subtle bg-[var(--panel)] max-w-sm">
            <p className="text-xs sm:text-[13px] text-foreground italic leading-relaxed flex items-start gap-2">
              <Quote size={15} className="text-accent shrink-0 mt-0.5" />
              <span>&ldquo;{persona.quote}&rdquo;</span>
            </p>
          </div>
        )}
      </div>

      {/* ── 02. Bio Narrative ── */}
      {persona.bio && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted font-semibold">
            Background Narrative
          </h4>
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed max-w-3xl">
            {persona.bio}
          </p>
        </div>
      )}

      {/* ── 03. Behavioral Spectrum Sliders ── */}
      <div className="p-5 rounded-xl border border-border-subtle bg-[var(--panel)] space-y-4">
        <h4 className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold flex items-center gap-2">
          <Sliders size={14} />
          <span>Behavioral Spectrum</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-muted">
              <span>Tech Savvy</span>
              <span className="text-accent font-bold">{sliders.techSavvy}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-border-subtle overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${sliders.techSavvy}%` }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-muted">
              <span>Price Sensitivity</span>
              <span className="text-accent font-bold">{sliders.priceSensitivity}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-border-subtle overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${sliders.priceSensitivity}%` }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-muted">
              <span>Frequency of Use</span>
              <span className="text-accent font-bold">{sliders.frequencyOfUse}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-border-subtle overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${sliders.frequencyOfUse}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 04. Goals, Pain Points, Tools Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {persona.goals && persona.goals.length > 0 && (
          <div className="p-4 sm:p-5 rounded-xl border border-border-subtle bg-[var(--panel)] space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <Target size={14} />
              <span>Goals & Drivers</span>
            </h4>
            <ul className="space-y-2 text-xs text-foreground/90">
              {persona.goals.map((g, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 dark:text-emerald-400 font-bold shrink-0 mt-0.5">&bull;</span>
                  <span className="leading-snug">{g}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {persona.painPoints && persona.painPoints.length > 0 && (
          <div className="p-4 sm:p-5 rounded-xl border border-border-subtle bg-[var(--panel)] space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-amber-500 dark:text-amber-400 font-semibold flex items-center gap-1.5">
              <AlertCircle size={14} />
              <span>Pain Points</span>
            </h4>
            <ul className="space-y-2 text-xs text-foreground/90">
              {persona.painPoints.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 dark:text-amber-400 font-bold shrink-0 mt-0.5">&bull;</span>
                  <span className="leading-snug">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {persona.tools && persona.tools.length > 0 && (
          <div className="p-4 sm:p-5 rounded-xl border border-border-subtle bg-[var(--panel)] space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold flex items-center gap-1.5">
              <Wrench size={14} />
              <span>Tools & Tech</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {persona.tools.map((tl, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-[var(--card)] border border-border-subtle text-xs text-foreground font-medium">
                  {tl}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
