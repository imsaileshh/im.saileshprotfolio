'use client';

import { useState } from 'react';
import { Plus, Trash2, Palette, Copy, Check, Eye } from 'lucide-react';
import { ColorGroup, ColorToken, SemanticToken } from '@/types/case-study-builder';
import { DEFAULT_COLOR_GROUPS_DEMO, DEFAULT_SEMANTIC_TOKENS_DEMO } from '@/lib/data/case-study-demo-data';

interface ColorTokenEditorProps {
  colorGroups?: ColorGroup[];
  semanticTokens?: SemanticToken[];
  onChange: (data: { colorGroups: ColorGroup[]; semanticTokens: SemanticToken[] }) => void;
}

export function ColorTokenEditor({
  colorGroups = DEFAULT_COLOR_GROUPS_DEMO,
  semanticTokens = DEFAULT_SEMANTIC_TOKENS_DEMO,
  onChange,
}: ColorTokenEditorProps) {
  const [selectedToken, setSelectedToken] = useState<ColorToken | null>(colorGroups[0]?.tokens[2] || null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      // Ignore clipboard fallback error
    }
  };

  const addGroup = () => {
    const newGroup: ColorGroup = {
      id: `grp-${Date.now().toString(36)}`,
      groupName: 'New Color Scale',
      tokens: [
        { id: `t1-${Date.now()}`, tokenName: 'scale-500', hex: '#3B82F6', cssVariable: '--color-scale-500', usage: 'Accent color' },
      ],
    };
    onChange({ colorGroups: [...colorGroups, newGroup], semanticTokens });
  };

  const addTokenToGroup = (groupId: string) => {
    const nextGroups = colorGroups.map((grp) => {
      if (grp.id === groupId) {
        const count = grp.tokens.length + 1;
        const newToken: ColorToken = {
          id: `tok-${Date.now().toString(36)}`,
          tokenName: `${grp.groupName.toLowerCase().replace(/\s+/g, '-')}-${count * 100}`,
          hex: '#6366F1',
          cssVariable: `--color-${grp.groupName.toLowerCase().replace(/\s+/g, '-')}-${count * 100}`,
          usage: 'Color swatch usage notes',
        };
        return { ...grp, tokens: [...grp.tokens, newToken] };
      }
      return grp;
    });
    onChange({ colorGroups: nextGroups, semanticTokens });
  };

  const updateToken = (groupId: string, tokenId: string, updated: Partial<ColorToken>) => {
    const nextGroups = colorGroups.map((grp) => {
      if (grp.id === groupId) {
        const nextTokens = grp.tokens.map((t) => (t.id === tokenId ? { ...t, ...updated } : t));
        return { ...grp, tokens: nextTokens };
      }
      return grp;
    });
    if (selectedToken && selectedToken.id === tokenId) {
      setSelectedToken({ ...selectedToken, ...updated });
    }
    onChange({ colorGroups: nextGroups, semanticTokens });
  };

  const removeToken = (groupId: string, tokenId: string) => {
    const nextGroups = colorGroups.map((grp) => {
      if (grp.id === groupId) {
        return { ...grp, tokens: grp.tokens.filter((t) => t.id !== tokenId) };
      }
      return grp;
    });
    if (selectedToken?.id === tokenId) setSelectedToken(null);
    onChange({ colorGroups: nextGroups, semanticTokens });
  };

  const addSemanticToken = () => {
    const newSem: SemanticToken = {
      id: `sem-${Date.now().toString(36)}`,
      semanticName: 'action-accent',
      primitiveTokenRef: colorGroups[0]?.tokens[0]?.tokenName || 'brand-500',
      usage: 'Interactive element background',
    };
    onChange({ colorGroups, semanticTokens: [...semanticTokens, newSem] });
  };

  const updateSemanticToken = (id: string, updated: Partial<SemanticToken>) => {
    const nextSems = semanticTokens.map((s) => (s.id === id ? { ...s, ...updated } : s));
    onChange({ colorGroups, semanticTokens: nextSems });
  };

  const removeSemanticToken = (id: string) => {
    const nextSems = semanticTokens.filter((s) => s.id !== id);
    onChange({ colorGroups, semanticTokens: nextSems });
  };

  return (
    <div className="space-y-6">
      {/* Color Groups & Swatch Scale Editor */}
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Palette size={16} className="text-accent" />
              <span>Color Tokens Palette ({colorGroups.length} Scales)</span>
            </h4>
            <p className="text-xs text-muted mt-0.5">Primitive scale swatches (50-950) with hex & CSS variable inspection.</p>
          </div>
          <button
            type="button"
            onClick={addGroup}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all"
          >
            <Plus size={14} />
            <span>Add Color Group</span>
          </button>
        </div>

        {colorGroups.map((grp) => (
          <div key={grp.id} className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={grp.groupName}
                onChange={(e) => {
                  const nextGroups = colorGroups.map((g) => (g.id === grp.id ? { ...g, groupName: e.target.value } : g));
                  onChange({ colorGroups: nextGroups, semanticTokens });
                }}
                className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs font-bold text-foreground focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => addTokenToGroup(grp.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs text-foreground font-medium transition-all"
              >
                <Plus size={12} />
                <span>Add Token</span>
              </button>
            </div>

            {/* Swatches Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3">
              {grp.tokens.map((tok) => {
                const isSelected = selectedToken?.id === tok.id;
                return (
                  <div
                    key={tok.id}
                    onClick={() => setSelectedToken(tok)}
                    className={`group relative rounded-xl border p-2 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-accent bg-accent/15 shadow-lg scale-105'
                        : 'border-white/10 bg-black/40 hover:border-white/30'
                    }`}
                  >
                    <div
                      className="w-full aspect-square rounded-lg shadow-inner border border-white/20 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: tok.hex }}
                    />
                    <div className="text-center w-full overflow-hidden">
                      <p className="text-[10px] font-mono font-semibold text-foreground truncate">{tok.tokenName}</p>
                      <p className="text-[9px] font-mono text-muted uppercase">{tok.hex}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Selected Swatch Inspector Drawer */}
        {selectedToken && (
          <div className="p-4 rounded-xl border border-accent/40 bg-accent/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl border-2 border-white/20 shadow-md shrink-0"
                style={{ backgroundColor: selectedToken.hex }}
              />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">Selected Swatch Inspector</span>
                <h5 className="text-sm font-bold text-foreground">{selectedToken.tokenName}</h5>
                <p className="text-xs font-mono text-muted">{selectedToken.hex} &bull; {selectedToken.cssVariable}</p>
                {selectedToken.usage && <p className="text-xs text-muted/80 mt-1 italic">{selectedToken.usage}</p>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(selectedToken.hex, 'hex')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-foreground hover:bg-white/10 transition-all"
              >
                {copiedText === 'hex' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedText === 'hex' ? 'Copied Hex!' : 'Copy Hex'}</span>
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(selectedToken.cssVariable || '', 'css')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-foreground hover:bg-white/10 transition-all"
              >
                {copiedText === 'css' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedText === 'css' ? 'Copied Variable!' : 'Copy CSS Var'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Semantic Tokens Table */}
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span>Semantic Design Tokens ({semanticTokens.length})</span>
            </h4>
            <p className="text-xs text-muted mt-0.5">Map functional UI intent (e.g. `action-primary`) to primitive color scale tokens.</p>
          </div>
          <button
            type="button"
            onClick={addSemanticToken}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all"
          >
            <Plus size={14} />
            <span>Add Semantic Mapping</span>
          </button>
        </div>

        <div className="space-y-2">
          {semanticTokens.map((sem) => (
            <div key={sem.id} className="p-3 rounded-lg border border-white/10 bg-black/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <input
                type="text"
                value={sem.semanticName}
                onChange={(e) => updateSemanticToken(sem.id, { semanticName: e.target.value })}
                className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs font-mono font-semibold text-accent focus:border-accent focus:outline-none flex-1 w-full sm:w-auto"
                placeholder="semantic-name"
              />

              <span className="text-xs text-muted font-mono hidden sm:inline">&rarr;</span>

              <input
                type="text"
                value={sem.primitiveTokenRef}
                onChange={(e) => updateSemanticToken(sem.id, { primitiveTokenRef: e.target.value })}
                className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs font-mono text-foreground focus:border-accent focus:outline-none flex-1 w-full sm:w-auto"
                placeholder="brand-500"
              />

              <input
                type="text"
                value={sem.usage || ''}
                onChange={(e) => updateSemanticToken(sem.id, { usage: e.target.value })}
                className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs text-muted focus:border-accent focus:outline-none flex-1 w-full sm:w-auto"
                placeholder="Usage details..."
              />

              <button
                type="button"
                onClick={() => removeSemanticToken(sem.id)}
                className="p-1.5 text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
