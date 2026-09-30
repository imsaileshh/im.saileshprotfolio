'use client';

import { useState } from 'react';
import { Plus, Trash2, Maximize } from 'lucide-react';
import { SpacingToken, RadiusToken, ShadowToken } from '@/types/case-study-builder';
import { DEFAULT_SPACING_DEMO, DEFAULT_RADIUS_DEMO, DEFAULT_SHADOW_DEMO } from '@/lib/data/case-study-demo-data';

interface SpacingTokenEditorProps {
  spacing?: SpacingToken[];
  radius?: RadiusToken[];
  shadows?: ShadowToken[];
  onChange: (data: { spacing: SpacingToken[]; radius: RadiusToken[]; shadows: ShadowToken[] }) => void;
}

export function SpacingTokenEditor({
  spacing = DEFAULT_SPACING_DEMO,
  radius = DEFAULT_RADIUS_DEMO,
  shadows = DEFAULT_SHADOW_DEMO,
  onChange,
}: SpacingTokenEditorProps) {
  // Spacing actions
  const addSpacing = () => {
    const next: SpacingToken = {
      id: `sp-${Date.now().toString(36)}`,
      name: `space-${spacing.length + 1}`,
      value: '20px',
      pxValue: 20,
    };
    onChange({ spacing: [...spacing, next], radius, shadows });
  };

  const updateSpacing = (id: string, updated: Partial<SpacingToken>) => {
    const nextSpacing = spacing.map((s) => (s.id === id ? { ...s, ...updated } : s));
    onChange({ spacing: nextSpacing, radius, shadows });
  };

  const removeSpacing = (id: string) => {
    onChange({ spacing: spacing.filter((s) => s.id !== id), radius, shadows });
  };

  // Radius actions
  const addRadius = () => {
    const next: RadiusToken = {
      id: `r-${Date.now().toString(36)}`,
      name: `radius-custom`,
      value: '12px',
      pxValue: 12,
    };
    onChange({ spacing, radius: [...radius, next], shadows });
  };

  const updateRadius = (id: string, updated: Partial<RadiusToken>) => {
    const nextRadius = radius.map((r) => (r.id === id ? { ...r, ...updated } : r));
    onChange({ spacing, radius: nextRadius, shadows });
  };

  const removeRadius = (id: string) => {
    onChange({ spacing, radius: radius.filter((r) => r.id !== id), shadows });
  };

  // Shadow actions
  const addShadow = () => {
    const next: ShadowToken = {
      id: `sh-${Date.now().toString(36)}`,
      name: `shadow-custom`,
      x: 0,
      y: 4,
      blur: 12,
      spread: 0,
      opacity: 0.2,
    };
    onChange({ spacing, radius, shadows: [...shadows, next] });
  };

  const updateShadow = (id: string, updated: Partial<ShadowToken>) => {
    const nextShadows = shadows.map((sh) => (sh.id === id ? { ...sh, ...updated } : sh));
    onChange({ spacing, radius, shadows: nextShadows });
  };

  const removeShadow = (id: string) => {
    onChange({ spacing, radius, shadows: shadows.filter((sh) => sh.id !== id) });
  };

  return (
    <div className="space-y-6">
      {/* Spacing Scale */}
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Maximize size={16} className="text-accent" />
              <span>Spacing Tokens & Scale ({spacing.length})</span>
            </h4>
            <p className="text-xs text-muted mt-0.5">Visual bar scale representing padding & margin tokens.</p>
          </div>
          <button
            type="button"
            onClick={addSpacing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all"
          >
            <Plus size={14} />
            <span>Add Spacing</span>
          </button>
        </div>

        <div className="space-y-3">
          {spacing.map((sp) => (
            <div key={sp.id} className="p-3 rounded-lg border border-white/10 bg-black/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-44">
                <input
                  type="text"
                  value={sp.name}
                  onChange={(e) => updateSpacing(sp.id, { name: e.target.value })}
                  className="w-24 rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs font-mono font-bold text-accent focus:border-accent focus:outline-none"
                />
                <input
                  type="text"
                  value={sp.value}
                  onChange={(e) => {
                    const px = parseInt(e.target.value) || 0;
                    updateSpacing(sp.id, { value: e.target.value, pxValue: px });
                  }}
                  className="w-16 rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs font-mono text-foreground focus:border-accent focus:outline-none text-center"
                />
              </div>

              {/* Visual Bar Indicator */}
              <div className="flex-1 bg-black/60 rounded-full p-1 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-accent/70 transition-all"
                  style={{ width: `${Math.min(sp.pxValue * 3, 100)}%`, minWidth: '4px' }}
                />
              </div>

              <button
                type="button"
                onClick={() => removeSpacing(sp.id)}
                className="p-1 text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Border Radius Tokens */}
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span>Border Radius Scale ({radius.length})</span>
            </h4>
            <p className="text-xs text-muted mt-0.5">Live radius curvature previews.</p>
          </div>
          <button
            type="button"
            onClick={addRadius}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all"
          >
            <Plus size={14} />
            <span>Add Radius</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {radius.map((r) => (
            <div key={r.id} className="p-3 rounded-xl border border-white/10 bg-black/40 flex flex-col items-center gap-2 text-center">
              <div
                className="w-16 h-16 border-2 border-accent bg-accent/10 shadow-sm transition-all"
                style={{ borderRadius: r.value }}
              />
              <input
                type="text"
                value={r.name}
                onChange={(e) => updateRadius(r.id, { name: e.target.value })}
                className="w-full rounded border border-white/10 bg-black/60 px-2 py-0.5 text-xs font-mono font-bold text-accent text-center focus:border-accent focus:outline-none"
              />
              <input
                type="text"
                value={r.value}
                onChange={(e) => updateRadius(r.id, { value: e.target.value })}
                className="w-full rounded border border-white/10 bg-black/60 px-2 py-0.5 text-xs font-mono text-muted text-center focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeRadius(r.id)}
                className="p-1 text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Shadow Elevation Tokens */}
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span>Shadow & Elevation Tokens ({shadows.length})</span>
            </h4>
            <p className="text-xs text-muted mt-0.5">Box shadow parameters and live elevation previews.</p>
          </div>
          <button
            type="button"
            onClick={addShadow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all"
          >
            <Plus size={14} />
            <span>Add Shadow</span>
          </button>
        </div>

        <div className="space-y-3">
          {shadows.map((sh) => {
            const shadowStyle = `${sh.x}px ${sh.y}px ${sh.blur}px ${sh.spread}px rgba(0, 0, 0, ${sh.opacity})`;
            return (
              <div key={sh.id} className="p-3.5 rounded-xl border border-white/10 bg-black/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={sh.name}
                    onChange={(e) => updateShadow(sh.id, { name: e.target.value })}
                    className="w-32 rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs font-mono font-bold text-accent focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Parameters */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-muted block">Y</span>
                    <input
                      type="number"
                      value={sh.y}
                      onChange={(e) => updateShadow(sh.id, { y: parseInt(e.target.value) || 0 })}
                      className="w-14 rounded border border-white/10 bg-black/60 px-1 py-0.5 text-center text-foreground"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-muted block">Blur</span>
                    <input
                      type="number"
                      value={sh.blur}
                      onChange={(e) => updateShadow(sh.id, { blur: parseInt(e.target.value) || 0 })}
                      className="w-14 rounded border border-white/10 bg-black/60 px-1 py-0.5 text-center text-foreground"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-muted block">Spread</span>
                    <input
                      type="number"
                      value={sh.spread}
                      onChange={(e) => updateShadow(sh.id, { spread: parseInt(e.target.value) || 0 })}
                      className="w-14 rounded border border-white/10 bg-black/60 px-1 py-0.5 text-center text-foreground"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-muted block">Opacity</span>
                    <input
                      type="number"
                      step="0.05"
                      value={sh.opacity}
                      onChange={(e) => updateShadow(sh.id, { opacity: parseFloat(e.target.value) || 0 })}
                      className="w-14 rounded border border-white/10 bg-black/60 px-1 py-0.5 text-center text-foreground"
                    />
                  </div>
                </div>

                {/* Shadow Box Preview */}
                <div className="w-24 h-10 rounded-lg bg-[#1D2127] border border-white/10 flex items-center justify-center text-[10px] font-mono text-muted" style={{ boxShadow: shadowStyle }}>
                  Preview
                </div>

                <button
                  type="button"
                  onClick={() => removeShadow(sh.id)}
                  className="p-1 text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
