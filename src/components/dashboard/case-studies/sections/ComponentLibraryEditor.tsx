'use client';

import { Plus, Trash2, Box } from 'lucide-react';
import { ComponentToken } from '@/types/case-study-builder';
import { DEFAULT_COMPONENTS_DEMO } from '@/lib/data/case-study-demo-data';
import { ImageUploader } from '@/components/dashboard/ImageUploader';

interface ComponentLibraryEditorProps {
  components?: ComponentToken[];
  onChange: (data: ComponentToken[]) => void;
}

export function ComponentLibraryEditor({
  components = DEFAULT_COMPONENTS_DEMO,
  onChange,
}: ComponentLibraryEditorProps) {
  const addComponent = () => {
    const newComp: ComponentToken = {
      id: `comp-${Date.now().toString(36)}`,
      name: 'New UI Component',
      category: 'Inputs',
      description: 'Component details & purpose...',
      imageUrl: '',
      assetUrl: '',
      previewBackground: 'dark',
      states: ['Default', 'Hover', 'Active', 'Disabled'],
      variants: ['Primary', 'Secondary'],
      usage: 'Component usage notes...',
      doNotes: 'Best practices for usage...',
      dontNotes: 'Anti-patterns to avoid...',
    };
    onChange([...components, newComp]);
  };

  const updateComponent = (id: string, updated: Partial<ComponentToken>) => {
    const nextComps = components.map((c) => (c.id === id ? { ...c, ...updated } : c));
    onChange(nextComps);
  };

  const removeComponent = (id: string) => {
    const nextComps = components.filter((c) => c.id !== id);
    onChange(nextComps);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Box size={16} className="text-accent" />
              <span>UI Component Library ({components.length} Components)</span>
            </h4>
            <p className="text-xs text-muted mt-0.5">
              Define design system UI components, SVG/image previews, state variants, and Do / Don't guidelines.
            </p>
          </div>
          <button
            type="button"
            onClick={addComponent}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Component</span>
          </button>
        </div>

        <div className="space-y-6">
          {components.map((comp) => {
            const currentAsset = comp.assetUrl || comp.imageUrl || '';

            return (
              <div key={comp.id} className="rounded-xl border border-white/10 bg-black/40 p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={comp.name}
                      onChange={(e) => updateComponent(comp.id, { name: e.target.value })}
                      className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs font-bold text-foreground focus:border-accent focus:outline-none flex-1 max-w-xs"
                      placeholder="Component Name (e.g. Button)"
                    />
                    <select
                      value={comp.category || 'Inputs'}
                      onChange={(e) => updateComponent(comp.id, { category: e.target.value })}
                      className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs font-mono uppercase text-accent focus:border-accent focus:outline-none"
                    >
                      <option value="Actions">Actions</option>
                      <option value="Inputs">Inputs</option>
                      <option value="Navigation">Navigation</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Data Display">Data Display</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Layout">Layout</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeComponent(comp.id)}
                    className="p-1.5 text-muted hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <textarea
                  rows={2}
                  placeholder="Component description & purpose..."
                  value={comp.description}
                  onChange={(e) => updateComponent(comp.id, { description: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-black/60 p-2.5 text-xs text-foreground focus:border-accent focus:outline-none resize-none"
                />

                {/* Upload SVG / Image Visual Asset */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted block">
                      Component Visual Asset (SVG, PNG, WebP)
                    </label>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[10px] font-mono text-muted">Preview BG:</span>
                      <select
                        value={comp.previewBackground || 'dark'}
                        onChange={(e) =>
                          updateComponent(comp.id, {
                            previewBackground: e.target.value as 'transparent' | 'light' | 'dark' | 'custom',
                          })
                        }
                        className="rounded border border-white/10 bg-black px-2 py-0.5 text-[10px] text-foreground font-mono"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="transparent">Transparent</option>
                      </select>
                    </div>
                  </div>

                  <ImageUploader
                    name={`comp-asset-${comp.id}`}
                    value={currentAsset}
                    onChange={(url) => {
                      const isSvg = url.toLowerCase().endsWith('.svg');
                      updateComponent(comp.id, {
                        imageUrl: url,
                        assetUrl: url,
                        assetType: isSvg ? 'svg' : 'png',
                      });
                    }}
                    label="Upload SVG / Image Asset"
                    helperText="Upload vector SVG, PNG, JPG, or WebP preview (max 20MB)."
                    aspectRatio="aspect-[16/9]"
                  />
                </div>

                {/* States & Variants */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted block mb-1">
                      States (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={(comp.states || []).join(', ')}
                      onChange={(e) =>
                        updateComponent(comp.id, {
                          states: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
                      placeholder="Default, Hover, Active, Disabled"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted block mb-1">
                      Variants (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={(comp.variants || []).join(', ')}
                      onChange={(e) =>
                        updateComponent(comp.id, {
                          variants: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
                      placeholder="Primary, Secondary, Ghost"
                    />
                  </div>
                </div>

                {/* Do & Don't */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-1">
                      Do Guidelines
                    </label>
                    <textarea
                      rows={2}
                      value={comp.doNotes || ''}
                      onChange={(e) => updateComponent(comp.id, { doNotes: e.target.value })}
                      className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-xs text-foreground focus:border-emerald-400 focus:outline-none resize-none"
                      placeholder="Best practices for using this component..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-red-400 block mb-1">
                      Don't Guidelines
                    </label>
                    <textarea
                      rows={2}
                      value={comp.dontNotes || ''}
                      onChange={(e) => updateComponent(comp.id, { dontNotes: e.target.value })}
                      className="w-full rounded-lg border border-red-500/30 bg-red-500/5 p-2.5 text-xs text-foreground focus:border-red-400 focus:outline-none resize-none"
                      placeholder="Anti-patterns to avoid..."
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

