'use client';

import { useState, useTransition } from 'react';
import { HomeOverviewPreview } from './HomeOverviewPreview';
import { HomeHeroEditor } from './HomeHeroEditor';
import { HomeWorksEditor, WorkProjectItem } from './HomeWorksEditor';
import { HomePersonalProjectsEditor, PersonalProjectItem } from './HomePersonalProjectsEditor';
import { HomeAboutEditor } from './HomeAboutEditor';
import { HomeStackEditor, SkillSectionItem } from './HomeStackEditor';
import { HomeSectionOrderEditor } from './HomeSectionOrderEditor';
import { saveHomepageConfigAction } from '@/app/dashboard/(protected)/home/actions';
import type { HomepageConfig } from '@/types/homepage-cms';
import { Check, AlertCircle, Loader2, RotateCcw, Save } from 'lucide-react';

interface HomeDashboardClientProps {
  initialConfig: HomepageConfig;
  workProjects: WorkProjectItem[];
  personalProjects: PersonalProjectItem[];
  skillSections: SkillSectionItem[];
  lastUpdatedAt?: string | null;
}

export function HomeDashboardClient({
  initialConfig,
  workProjects,
  personalProjects,
  skillSections,
  lastUpdatedAt,
}: HomeDashboardClientProps) {
  const [savedConfig, setSavedConfig] = useState<HomepageConfig>(initialConfig);
  const [currentConfig, setCurrentConfig] = useState<HomepageConfig>(initialConfig);
  const [updatedAt, setUpdatedAt] = useState<string | null>(lastUpdatedAt || null);

  const [activeSection, setActiveSection] = useState('overview');
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if there are unsaved modifications
  const isDirty = JSON.stringify(savedConfig) !== JSON.stringify(currentConfig);

  const handleReset = () => {
    setCurrentConfig(savedConfig);
    setSaveStatus('idle');
    setErrorMessage(null);
  };

  const handleSave = () => {
    setSaveStatus('idle');
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const res = await saveHomepageConfigAction(currentConfig);
        if (res?.success) {
          setSavedConfig(currentConfig);
          setUpdatedAt(res.updatedAt);
          setSaveStatus('success');
          setTimeout(() => setSaveStatus('idle'), 3500);
        } else {
          setSaveStatus('error');
          setErrorMessage('Could not save changes. Please try again.');
        }
      } catch (err: unknown) {
        console.error('Save failed:', err);
        setSaveStatus('error');
        const message = err instanceof Error ? err.message : 'Could not save changes. Please try again.';
        setErrorMessage(message);
      }
    });
  };

  const handleJumpToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-10 pb-28 max-w-5xl mx-auto">
      {/* 1. Header Overview, Quick Navigation & Live Preview */}
      <HomeOverviewPreview
        updatedAt={updatedAt}
        activeSection={activeSection}
        onSelectSection={handleJumpToSection}
      />

      {/* 7. Homepage Section Order Editor */}
      <HomeSectionOrderEditor
        sectionOrder={currentConfig.sectionOrder}
        onChange={(updatedOrder) => {
          setCurrentConfig((prev) => ({
            ...prev,
            sectionOrder: updatedOrder,
          }));
        }}
      />

      {/* 2. Hero Section */}
      <HomeHeroEditor
        hero={currentConfig.sections.hero}
        onChange={(updatedHero) => {
          setCurrentConfig((prev) => ({
            ...prev,
            sections: {
              ...prev.sections,
              hero: updatedHero,
            },
          }));
        }}
      />

      {/* 3. Works Section */}
      <HomeWorksEditor
        worksConfig={currentConfig.sections.works}
        workProjects={workProjects}
        onChange={(updatedWorks) => {
          setCurrentConfig((prev) => ({
            ...prev,
            sections: {
              ...prev.sections,
              works: updatedWorks,
            },
          }));
        }}
      />

      {/* 4. Personal Projects Section */}
      <HomePersonalProjectsEditor
        personalProjectsConfig={currentConfig.sections.personalProjects}
        personalProjects={personalProjects}
        onChange={(updatedPersonal) => {
          setCurrentConfig((prev) => ({
            ...prev,
            sections: {
              ...prev.sections,
              personalProjects: updatedPersonal,
            },
          }));
        }}
      />

      {/* 5. About Section */}
      <HomeAboutEditor
        aboutConfig={currentConfig.sections.about}
        onChange={(updatedAbout) => {
          setCurrentConfig((prev) => ({
            ...prev,
            sections: {
              ...prev.sections,
              about: updatedAbout,
            },
          }));
        }}
      />

      {/* 6. Tools & Technologies (Stack) Section */}
      <HomeStackEditor
        stackConfig={currentConfig.sections.stack}
        sections={skillSections}
        onChange={(updatedStack) => {
          setCurrentConfig((prev) => ({
            ...prev,
            sections: {
              ...prev.sections,
              stack: updatedStack,
            },
          }));
        }}
      />

      {/* Floating Save / Unsaved Changes Bar */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 transition-all duration-300 ${
          isDirty || saveStatus !== 'idle'
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-[#141417]/95 px-5 py-3.5 shadow-2xl backdrop-blur-xl">
          {/* Status Message */}
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            {saveStatus === 'success' ? (
              <span className="flex items-center gap-2 font-medium text-emerald-400">
                <Check size={16} />
                Changes saved
              </span>
            ) : saveStatus === 'error' ? (
              <span className="flex items-center gap-2 font-medium text-red-400">
                <AlertCircle size={16} />
                {errorMessage || 'Could not save changes. Please try again.'}
              </span>
            ) : isDirty ? (
              <span className="flex items-center gap-2 text-amber-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Unsaved changes
              </span>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
              >
                <RotateCcw size={13} />
                <span>Cancel</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || !isDirty}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4F8CFF] px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#3B78EB] transition-colors disabled:opacity-50 shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
