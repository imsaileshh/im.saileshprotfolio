'use client';

import { useState } from 'react';
import { ColorToken, DesignSystemData } from '@/types/case-study-builder';
import { Palette, Type, Maximize, Box, Copy, Check, Info, X } from 'lucide-react';
import Image from 'next/image';

interface DesignSystemSectionProps {
  designSystemData?: DesignSystemData;
}

export function DesignSystemSection({ designSystemData }: DesignSystemSectionProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'components'>('colors');
  const [selectedColor, setSelectedColor] = useState<ColorToken | null>(null);
  const [selectedCompIndex, setSelectedCompIndex] = useState(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!designSystemData) return null;

  const {
    colorGroups = [],
    semanticTokens = [],
    typography = [],
    spacing = [],
    radius = [],
    shadows = [],
    components = [],
  } = designSystemData;

  const activeComponent = components[selectedCompIndex] || components[0];

  const copyText = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full space-y-8 max-w-[1120px] mx-auto">
      {/* ── Intro Header & Minimal Rectangular Tab Navigation ── */}
      <div className="space-y-4 pb-6 border-b border-border-subtle">
        <p className="text-sm text-muted max-w-xl leading-relaxed">
          A scalable visual language built around reusable tokens, components and interaction patterns.
        </p>

        {/* Minimal Rectangular Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`h-11 px-4 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
              activeTab === 'colors'
                ? 'bg-foreground text-background border-foreground font-bold shadow-sm'
                : 'bg-[var(--card)] text-muted border-border-subtle hover:text-foreground hover:border-border-subtle-strong'
            }`}
          >
            <Palette size={14} />
            <span>Colors ({colorGroups.reduce((acc, g) => acc + g.tokens.length, 0)})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('typography')}
            className={`h-11 px-4 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
              activeTab === 'typography'
                ? 'bg-foreground text-background border-foreground font-bold shadow-sm'
                : 'bg-[var(--card)] text-muted border-border-subtle hover:text-foreground hover:border-border-subtle-strong'
            }`}
          >
            <Type size={14} />
            <span>Typography ({typography.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('spacing')}
            className={`h-11 px-4 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
              activeTab === 'spacing'
                ? 'bg-foreground text-background border-foreground font-bold shadow-sm'
                : 'bg-[var(--card)] text-muted border-border-subtle hover:text-foreground hover:border-border-subtle-strong'
            }`}
          >
            <Maximize size={14} />
            <span>Spacing & Radius</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('components')}
            className={`h-11 px-4 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
              activeTab === 'components'
                ? 'bg-foreground text-background border-foreground font-bold shadow-sm'
                : 'bg-[var(--card)] text-muted border-border-subtle hover:text-foreground hover:border-border-subtle-strong'
            }`}
          >
            <Box size={14} />
            <span>Components ({components.length})</span>
          </button>
        </div>
      </div>

      {/* ── Tab 1: Editorial Color System ── */}
      {activeTab === 'colors' && (
        <div className="space-y-8 sm:space-y-10">
          {colorGroups.map((grp) => (
            <div key={grp.id} className="space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                  {grp.groupName}
                </h4>
                <span className="text-[10px] font-mono text-muted/70">
                  {grp.tokens.length} tokens
                </span>
              </div>

              {/* Compact Responsive Token Grid */}
              <div className="grid grid-cols-4 min-[360px]:grid-cols-5 min-[480px]:grid-cols-6 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-10 gap-x-2 sm:gap-x-3 gap-y-3.5 sm:gap-y-4">
                {grp.tokens.map((tok) => {
                  return (
                    <div
                      key={tok.id}
                      onClick={() => setSelectedColor(tok)}
                      className="group cursor-pointer flex flex-col items-center text-center w-full max-w-[56px] sm:max-w-[68px] mx-auto transition-all"
                      title={`${tok.tokenName} (${tok.hex})`}
                    >
                      {/* Compact Swatch Square */}
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl border border-border-subtle shadow-2xs transition-all group-hover:scale-105 group-hover:border-border-subtle-strong shrink-0"
                        style={{ backgroundColor: tok.hex }}
                      />

                      {/* Token Label & Secondary Hex */}
                      <div className="mt-1.5 w-full flex flex-col items-center">
                        <span className="block w-full text-[9px] sm:text-[10px] font-semibold text-foreground truncate leading-tight">
                          {tok.tokenName}
                        </span>
                        <span className="block w-full text-[7.5px] sm:text-[8px] font-mono text-muted uppercase truncate leading-tight mt-0.5">
                          {tok.hex}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Semantic Token Mapping Table */}
          {semanticTokens.length > 0 && (
            <div className="pt-8 border-t border-border-subtle space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                Semantic Color Mapping
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border-subtle text-muted uppercase">
                      <th className="py-2 pr-4">Semantic Token</th>
                      <th className="py-2 px-4">→</th>
                      <th className="py-2 pl-4">Primitive Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50 text-foreground">
                    {semanticTokens.map((sem) => (
                      <tr key={sem.id} className="hover:bg-[var(--case-surface)] transition-colors">
                        <td className="py-3 pr-4 font-semibold text-foreground">{sem.semanticName}</td>
                        <td className="py-3 px-4 text-muted">&rarr;</td>
                        <td className="py-3 pl-4 text-muted">{sem.primitiveTokenRef}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Flat Typography Specimens ── */}
      {activeTab === 'typography' && (
        <div className="space-y-8">
          {typography.map((tok) => (
            <div key={tok.id} className="pb-8 border-b border-border-subtle space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">{tok.level}</span>
                <span className="font-mono text-xs text-muted">
                  {tok.fontSize} &bull; W{tok.fontWeight} &bull; LH {tok.lineHeight}
                </span>
              </div>
              <p
                style={{
                  fontFamily: tok.fontFamily || 'inherit',
                  fontSize: tok.fontSize,
                  fontWeight: tok.fontWeight,
                  lineHeight: tok.lineHeight,
                  letterSpacing: tok.letterSpacing,
                }}
                className="text-foreground overflow-hidden text-ellipsis leading-tight"
              >
                {tok.sampleText || 'Architecting Next-Gen Digital Products'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab 3: Diagrammatic Spacing, Radius & Elevation ── */}
      {activeTab === 'spacing' && (
        <div className="space-y-12">
          {/* Spacing Proportional Scale */}
          {spacing.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                Spacing Scale
              </h4>
              <div className="space-y-3 font-mono text-xs">
                {spacing.map((sp) => (
                  <div key={sp.id} className="flex items-center gap-4 py-1 border-b border-border-subtle/50">
                    <span className="w-24 font-semibold text-foreground">{sp.name}</span>
                    <span className="w-16 text-muted">{sp.value}</span>
                    <div className="flex-1 bg-[var(--panel)] rounded-full h-3 p-0.5 overflow-hidden">
                      <div className="h-full rounded-full bg-foreground/70" style={{ width: `${Math.min(sp.pxValue * 3.5, 100)}%`, minWidth: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Border Radius Scale */}
          {radius.length > 0 && (
            <div className="space-y-4 pt-8 border-t border-border-subtle">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                Border Radius Scale
              </h4>
              <div className="flex flex-wrap gap-6">
                {radius.map((r) => (
                  <div key={r.id} className="flex flex-col items-center gap-2 text-center text-xs font-mono">
                    <div className="w-16 h-16 border-2 border-border-subtle bg-[var(--panel)]" style={{ borderRadius: r.value }} />
                    <span className="font-semibold text-foreground mt-1">{r.name}</span>
                    <span className="text-muted text-[11px]">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Elevation Tokens */}
          {shadows.length > 0 && (
            <div className="space-y-4 pt-8 border-t border-border-subtle">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                Elevation Tokens
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {shadows.map((sh) => {
                  const shadowStyle = `${sh.x}px ${sh.y}px ${sh.blur}px ${sh.spread}px rgba(0, 0, 0, ${sh.opacity})`;
                  return (
                    <div
                      key={sh.id}
                      className="p-6 rounded-xl bg-[var(--card)] border border-border-subtle flex flex-col items-center justify-center gap-2 text-center text-xs font-mono"
                      style={{ boxShadow: shadowStyle }}
                    >
                      <span className="font-semibold text-foreground">{sh.name}</span>
                      <span className="text-[11px] text-muted">Blur {sh.blur}px &bull; Opacity {sh.opacity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 4: Component Showcase (SVG + Image Asset Support) ── */}
      {activeTab === 'components' && (
        <div className="space-y-8">
          {/* Component Index Selector Bar */}
          {components.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 no-scrollbar">
              {components.map((comp, cIdx) => {
                const isSelected = cIdx === selectedCompIndex;
                return (
                  <button
                    key={comp.id || cIdx}
                    type="button"
                    onClick={() => setSelectedCompIndex(cIdx)}
                    className={`h-11 px-4 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-foreground text-background border-foreground font-bold shadow-sm'
                        : 'bg-[var(--card)] text-muted border-border-subtle hover:text-foreground'
                    }`}
                  >
                    <span>{comp.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Component Specification Panel */}
          {activeComponent && (
            <div key={activeComponent.id || selectedCompIndex} className="pt-2 space-y-8 animate-in fade-in duration-200">
              {/* Header */}
              <div className="pb-6 border-b border-border-subtle space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
                  <span>COMPONENT</span>
                  <span>&bull;</span>
                  <span>{activeComponent.category || 'UI SPECIFICATION'}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground font-display">
                  {activeComponent.name}
                </h3>
                <p className="text-sm text-muted leading-relaxed max-w-2xl">
                  {activeComponent.description}
                </p>
              </div>

              {/* Large Component Visual Asset (SVG / Image Preview) - respects previewBackground */}
              {(activeComponent.assetUrl || activeComponent.imageUrl) && (
                <div
                  className={`w-full rounded-2xl border border-border-subtle p-8 flex items-center justify-center min-h-[240px] max-h-[420px] overflow-hidden ${
                    activeComponent.previewBackground === 'light'
                      ? 'bg-white text-black'
                      : activeComponent.previewBackground === 'dark'
                      ? 'bg-[#0a0b0d] text-white'
                      : activeComponent.previewBackground === 'transparent'
                      ? 'bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:12px_12px]'
                      : 'bg-[var(--card)]'
                  }`}
                >
                  <img
                    src={activeComponent.assetUrl || activeComponent.imageUrl}
                    alt={activeComponent.name}
                    className="max-h-[340px] max-w-full object-contain mx-auto"
                  />
                </div>
              )}

              {/* Variants & States Badges / Previews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {activeComponent.states && activeComponent.states.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted block">
                      Component States
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeComponent.states.map((st, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-3 py-1 rounded-lg bg-[var(--card)] border border-border-subtle text-xs text-foreground font-mono"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeComponent.variants && activeComponent.variants.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted block">
                      Variants
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeComponent.variants.map((vr, vIdx) => (
                        <span
                          key={vIdx}
                          className="px-3 py-1 rounded-lg bg-foreground/10 border border-foreground/20 text-xs text-foreground font-mono"
                        >
                          {vr}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Do & Don't Guidelines */}
              {(activeComponent.doNotes || activeComponent.dontNotes) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-subtle text-xs">
                  {activeComponent.doNotes && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 space-y-1">
                      <strong className="font-mono block font-bold text-emerald-600 dark:text-emerald-400 text-xs">DO:</strong>
                      <p className="leading-relaxed">{activeComponent.doNotes}</p>
                    </div>
                  )}
                  {activeComponent.dontNotes && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-200 space-y-1">
                      <strong className="font-mono block font-bold text-red-600 dark:text-red-400 text-xs">DON'T:</strong>
                      <p className="leading-relaxed">{activeComponent.dontNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Swatch Detail Popup Modal */}
      {selectedColor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-[var(--card)] p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <span className="font-mono text-xs font-bold text-foreground uppercase">{selectedColor.tokenName}</span>
              <button
                type="button"
                onClick={() => setSelectedColor(null)}
                className="text-muted hover:text-foreground p-1 rounded hover:bg-border-subtle/20 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Swatch Preview */}
            <div
              className="w-full h-32 rounded-xl border border-border-subtle shadow-inner"
              style={{ backgroundColor: selectedColor.hex }}
            />

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border-subtle/50">
                <span className="text-muted">HEX</span>
                <span className="text-foreground font-bold">{selectedColor.hex}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border-subtle/50">
                <span className="text-muted">CSS Var</span>
                <span className="text-foreground">{selectedColor.cssVariable || `--color-${selectedColor.tokenName}`}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => copyText(selectedColor.hex)}
                className="flex-1 py-2 rounded-lg bg-foreground text-background font-bold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedText === selectedColor.hex ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedText === selectedColor.hex ? 'Copied!' : 'Copy HEX'}</span>
              </button>
              <button
                type="button"
                onClick={() => copyText(selectedColor.cssVariable || `--color-${selectedColor.tokenName}`)}
                className="flex-1 py-2 rounded-lg bg-[var(--panel)] text-foreground font-semibold text-xs border border-border-subtle hover:bg-border-subtle/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Copy CSS Var</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
