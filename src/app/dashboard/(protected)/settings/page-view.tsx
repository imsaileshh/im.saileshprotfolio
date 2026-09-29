'use client';
import { updateSettingsAction } from '@/lib/dashboard/client-actions';
import { HomeContentForm } from '@/components/dashboard/settings/HomeContentForm';
import { ThemeSettingsForm } from '@/components/dashboard/settings/ThemeSettingsForm';
import { WorksCategoriesManager } from '@/components/dashboard/settings/WorksCategoriesManager';
import type { loadPage } from './page-data';

export default function DashboardSettingsPage({ worksCategoriesConfig, personalCategoriesConfig, settings }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings & Content</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage site configuration, works & personal categories, and homepage content.</p>
      </header>

      {/* WORKS PAGE CATEGORIES & FILTER BAR */}
      <WorksCategoriesManager
        target="works"
        initialCategories={worksCategoriesConfig.categories}
        initialShowBar={worksCategoriesConfig.showCategoryBar}
      />

      {/* PERSONAL PROJECTS PAGE CATEGORIES & FILTER BAR */}
      <WorksCategoriesManager
        target="personal"
        initialCategories={personalCategoriesConfig.categories}
        initialShowBar={personalCategoriesConfig.showCategoryBar}
      />

      {/* THEME SETTINGS FORM */}
      <ThemeSettingsForm themeConfig={settings.themeConfig as Parameters<typeof ThemeSettingsForm>[0]['themeConfig']} />

      {/* HOMEPAGE CONTENT FORM */}
      <HomeContentForm 
        heroContent={settings.heroContent} 
        aboutContent={settings.aboutContent} 
      />

      <section className="max-w-3xl rounded-lg border border-white/10 bg-[#111113] p-6">
        <form action={updateSettingsAction} className="space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Availability</h2>
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                name="isHiringOpen" 
                id="isHiringOpen" 
                defaultChecked={settings.isHiringOpen}
                className="h-4 w-4 rounded border-white/20 bg-black text-[#4F8CFF] focus:ring-[#4F8CFF]" 
              />
              <label htmlFor="isHiringOpen" className="text-sm font-medium text-zinc-300">Available for new opportunities</label>
            </div>
            
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-zinc-400">Custom Availability Message (Optional)</span>
              <input 
                name="availabilityMsg" 
                defaultValue={settings.availabilityMsg || ''}
                placeholder="e.g. Currently booking for Q4 2026"
                className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-white outline-none focus:border-[#4F8CFF]" 
              />
            </label>
          </div>

          <div className="space-y-4 border-t border-white/10 pt-6">
            <h2 className="text-lg font-semibold text-white">Site Preferences</h2>
            
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                name="analyticsEnabled" 
                id="analyticsEnabled" 
                defaultChecked={settings.analyticsEnabled}
                className="h-4 w-4 rounded border-white/20 bg-black text-[#4F8CFF] focus:ring-[#4F8CFF]" 
              />
              <label htmlFor="analyticsEnabled" className="text-sm font-medium text-zinc-300">Enable Visitor Analytics tracking</label>
            </div>

            <label className="block text-sm max-w-xs">
              <span className="mb-1.5 block font-medium text-zinc-400">Idle Session Timeout (Minutes)</span>
              <input 
                name="sessionTimeoutMinutes" 
                type="number"
                min={1}
                max={60}
                defaultValue={settings.sessionTimeoutMinutes}
                className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-white outline-none focus:border-[#4F8CFF]" 
              />
            </label>
          </div>

          <div className="space-y-4 border-t border-white/10 pt-6">
            <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                name="maintenanceMode" 
                id="maintenanceMode" 
                defaultChecked={settings.maintenanceMode}
                className="h-4 w-4 rounded border-red-500/30 bg-black text-red-500 focus:ring-red-500" 
              />
              <label htmlFor="maintenanceMode" className="text-sm font-medium text-zinc-300">Enable Maintenance Mode (Hides public portfolio)</label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="h-10 rounded-lg bg-[#4F8CFF] px-6 text-sm font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all hover:bg-[#3B78EB]">
              Save Settings
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
