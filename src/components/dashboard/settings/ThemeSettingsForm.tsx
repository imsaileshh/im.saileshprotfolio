'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { updateThemeSettingsAction } from '@/lib/dashboard/client-actions';

interface ThemeConfig {
  homeBackground?: string;
  worksBackground?: string;
  workDetailBackground?: string;
  personalProjectsBackground?: string;
  personalProjectDetailBackground?: string;
  caseStudiesBackground?: string;
  caseStudyDetailBackground?: string;
  aboutBackground?: string;
  stackBackground?: string;
  experienceBackground?: string;
  hireMeBackground?: string;
  resumeBackground?: string;
}

const DEFAULT_THEME: ThemeConfig = {
  homeBackground: '',
  worksBackground: '',
  workDetailBackground: '',
  personalProjectsBackground: '',
  personalProjectDetailBackground: '',
  caseStudiesBackground: '',
  caseStudyDetailBackground: '',
  aboutBackground: '',
  stackBackground: '',
  experienceBackground: '',
  hireMeBackground: '',
  resumeBackground: '',
};

const PAGES = [
  { key: 'homeBackground', label: 'Home' },
  { key: 'worksBackground', label: 'Works Listing' },
  { key: 'workDetailBackground', label: 'Work Detail' },
  { key: 'personalProjectsBackground', label: 'Personal Projects' },
  { key: 'personalProjectDetailBackground', label: 'Personal Project Detail' },
  { key: 'caseStudiesBackground', label: 'Case Studies' },
  { key: 'caseStudyDetailBackground', label: 'Case Study Detail' },
  { key: 'aboutBackground', label: 'About' },
  { key: 'stackBackground', label: 'Stack' },
  { key: 'experienceBackground', label: 'Experience' },
  { key: 'hireMeBackground', label: 'Hire Me' },
  { key: 'resumeBackground', label: 'Resume' },
] as const;

export function ThemeSettingsForm({
  themeConfig,
}: {
  themeConfig: ThemeConfig | null;
}) {
  const [config, setConfig] = useState<ThemeConfig>(themeConfig || DEFAULT_THEME);
  const [isSaving, setIsSaving] = useState(false);
  const [activePreview, setActivePreview] = useState<keyof ThemeConfig>('workDetailBackground');
  const router = useRouter();

  const handleColorChange = (key: keyof ThemeConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setActivePreview(key);
  };

  const handleReset = (key: keyof ThemeConfig) => {
    setConfig((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('themeConfig', JSON.stringify(config));
      await updateThemeSettingsAction(formData);
      router.refresh();
      alert('Theme settings saved successfully!');
    } catch (err) {
      alert('Failed to save theme settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="max-w-4xl rounded-lg border border-white/10 bg-[#111113] p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Page Backgrounds</h2>
          <p className="text-sm text-zinc-400 mb-6">
            Customize the background color for each page. Leave empty to use the default theme color.
            Changes will safely respect the existing dark/light text tokens.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Color Pickers */}
            <div className="space-y-4">
              {PAGES.map((page) => (
                <div key={page.key} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20 hover:bg-black/40 transition-colors" onMouseEnter={() => setActivePreview(page.key)}>
                  <label className="text-sm font-medium text-zinc-300 min-w-[160px]">{page.label}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config[page.key] || '#111113'}
                      onChange={(e) => handleColorChange(page.key, e.target.value)}
                      className="h-8 w-12 rounded cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      placeholder="Default"
                      value={config[page.key] || ''}
                      onChange={(e) => handleColorChange(page.key, e.target.value)}
                      className="w-24 h-8 bg-black/50 border border-white/10 rounded px-2 text-xs text-white placeholder-zinc-500 uppercase font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleReset(page.key)}
                      className="text-xs text-zinc-500 hover:text-white"
                      title="Reset to default"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Preview Panel */}
            <div className="lg:sticky lg:top-8 self-start pt-3">
              <div className="rounded-xl border border-white/10 bg-black p-4">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Live Preview ({PAGES.find(p => p.key === activePreview)?.label})</div>
                <div 
                  className="rounded-lg border border-white/5 h-[400px] overflow-hidden flex flex-col transition-colors duration-300"
                  style={{ backgroundColor: config[activePreview] || 'var(--bg)' }}
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="w-1/3 h-4 bg-foreground/20 rounded mb-4" />
                    <div className="w-3/4 h-8 bg-foreground/90 rounded mb-8" />
                    <div className="w-full h-32 bg-foreground/5 rounded mb-4 border border-border-subtle" />
                    <div className="space-y-2 mt-auto">
                      <div className="w-full h-2 bg-foreground/10 rounded" />
                      <div className="w-5/6 h-2 bg-foreground/10 rounded" />
                      <div className="w-4/6 h-2 bg-foreground/10 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-white/10">
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center gap-2 h-10 rounded-lg bg-[#4F8CFF] px-6 text-sm font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all hover:bg-[#3B78EB] disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Theme Settings
          </button>
        </div>
      </form>
    </section>
  );
}
