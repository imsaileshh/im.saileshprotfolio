'use client';

import { useState } from 'react';
import { Plus, Trash2, Type } from 'lucide-react';
import { TypographyToken, TypographyLevel } from '@/types/case-study-builder';
import { DEFAULT_TYPOGRAPHY_DEMO } from '@/lib/data/case-study-demo-data';

interface TypographyTokenEditorProps {
  typography?: TypographyToken[];
  onChange: (data: TypographyToken[]) => void;
}

export function TypographyTokenEditor({
  typography = DEFAULT_TYPOGRAPHY_DEMO,
  onChange,
}: TypographyTokenEditorProps) {
  const addToken = () => {
    const newToken: TypographyToken = {
      id: `typo-${Date.now().toString(36)}`,
      level: 'H3',
      fontFamily: 'Inter, sans-serif',
      fontSize: '20px',
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0em',
      sampleText: 'Sample Typography Specimen Text',
    };
    onChange([...typography, newToken]);
  };

  const updateToken = (id: string, updated: Partial<TypographyToken>) => {
    const nextTokens = typography.map((t) => (t.id === id ? { ...t, ...updated } : t));
    onChange(nextTokens);
  };

  const removeToken = (id: string) => {
    const nextTokens = typography.filter((t) => t.id !== id);
    onChange(nextTokens);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Type size={16} className="text-accent" />
              <span>Typography Scale Tokens ({typography.length} Levels)</span>
            </h4>
            <p className="text-xs text-muted mt-0.5">Configure font family, font size, line height, and letter spacing tokens.</p>
          </div>
          <button
            type="button"
            onClick={addToken}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all"
          >
            <Plus size={14} />
            <span>Add Level</span>
          </button>
        </div>

        <div className="space-y-4">
          {typography.map((tok) => (
            <div key={tok.id} className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                  <select
                    value={tok.level}
                    onChange={(e) => updateToken(tok.id, { level: e.target.value as TypographyLevel })}
                    className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs font-bold text-accent focus:border-accent focus:outline-none"
                  >
                    <option value="Display">Display</option>
                    <option value="H1">H1</option>
                    <option value="H2">H2</option>
                    <option value="H3">H3</option>
                    <option value="Body Large">Body Large</option>
                    <option value="Body">Body</option>
                    <option value="Small">Small</option>
                    <option value="Caption">Caption</option>
                    <option value="Mono">Mono</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Font Family (e.g. Syne, sans-serif)"
                    value={tok.fontFamily}
                    onChange={(e) => updateToken(tok.id, { fontFamily: e.target.value })}
                    className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs text-foreground focus:border-accent focus:outline-none flex-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Size (48px)"
                    value={tok.fontSize}
                    onChange={(e) => updateToken(tok.id, { fontSize: e.target.value })}
                    className="w-20 rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs font-mono text-foreground focus:border-accent focus:outline-none text-center"
                  />
                  <input
                    type="text"
                    placeholder="Weight (600)"
                    value={tok.fontWeight}
                    onChange={(e) => updateToken(tok.id, { fontWeight: e.target.value })}
                    className="w-20 rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs font-mono text-foreground focus:border-accent focus:outline-none text-center"
                  />
                  <input
                    type="text"
                    placeholder="Line Height (1.2)"
                    value={tok.lineHeight}
                    onChange={(e) => updateToken(tok.id, { lineHeight: e.target.value })}
                    className="w-20 rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs font-mono text-foreground focus:border-accent focus:outline-none text-center"
                  />
                  <button
                    type="button"
                    onClick={() => removeToken(tok.id)}
                    className="p-1 rounded text-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Sample text input */}
              <input
                type="text"
                placeholder="Specimen Sample Text"
                value={tok.sampleText || ''}
                onChange={(e) => updateToken(tok.id, { sampleText: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs text-muted focus:border-accent focus:outline-none"
              />

              {/* Live Preview */}
              <div className="p-3 rounded-lg border border-white/5 bg-black/60 overflow-hidden">
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted block mb-1">Live Specimen Preview</span>
                <p
                  style={{
                    fontFamily: tok.fontFamily,
                    fontSize: tok.fontSize,
                    fontWeight: tok.fontWeight,
                    lineHeight: tok.lineHeight,
                    letterSpacing: tok.letterSpacing,
                  }}
                  className="text-foreground truncate"
                >
                  {tok.sampleText || 'The quick brown fox jumps over the lazy dog'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
