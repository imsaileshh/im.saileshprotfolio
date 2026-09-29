'use client';

import { useActionState, useState } from 'react';
import { updateHomeContentAction } from '@/lib/dashboard/client-actions';

const inputClass = 'h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF]';
const textareaClass = 'min-h-24 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF]';

// Fallbacks are derived from existing hardcoded values
const defaultHero = {
  eyebrowPrefix: 'UI/UX DESIGNER · FRONTEND DEVELOPER · ',
  eyebrowRoles: 'SHOPIFY DEVELOPER,VIBE CODER,E-COMMERCE',
  headingLine1: "Hey, I'm",
  headingLine2: 'Sailesh.',
  paragraph1: 'I design and build modern digital experiences — from intuitive interfaces and Shopify storefronts to scalable web products.',
  paragraph2: 'Blending UI/UX, Frontend development, e-commerce and AI-assisted workflows.',
  primaryBtnText: 'View Projects',
  primaryBtnLink: '/projects',
  secondaryBtnText: 'About Me',
  secondaryBtnLink: '/about',
};

const defaultAbout = {
  eyebrow: 'ABOUT ME',
  heading: 'Design. Build. Ship.',
  role: 'Frontend Developer & UI/UX Designer',
  paragraph: 'I bridge the gap between design and engineering, crafting digital experiences that are not only visually stunning but also highly performant and accessible.',
  ctaText: 'Read my full story',
  ctaLink: '/about',
  capabilities: [
    { title: 'DESIGN', desc: 'UI/UX Design' },
    { title: 'CODE', desc: 'Frontend Development' },
    { title: 'AI DEVELOPMENT', desc: 'AI-Assisted Development' },
    { title: 'COMMERCE', desc: 'Shopify Development' }
  ]
};

export function HomeContentForm({ 
  heroContent, 
  aboutContent 
}: { 
  heroContent: any; 
  aboutContent: any; 
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actionWrapper = async (prevState: any, formData: FormData) => {
    await updateHomeContentAction(formData);
    return { success: true };
  };

  const [state, formAction, isPending] = useActionState(actionWrapper, { success: false });
  const [activeTab, setActiveTab] = useState<'hero' | 'about'>('hero');

  const hero = heroContent || defaultHero;
  const about = aboutContent || defaultAbout;

  return (
    <section className="rounded-lg border border-white/10 bg-[#111113] p-6">
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <h2 className="text-lg font-semibold text-white">Homepage Content</h2>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'hero' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            Hero Section
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('about')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'about' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            About Section
          </button>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        
        {/* HERO TAB */}
        {activeTab === 'hero' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-zinc-400">Eyebrow Prefix</span>
                <input name="hero_eyebrowPrefix" defaultValue={hero.eyebrowPrefix} className={inputClass} />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-zinc-400">Rotating Roles (Comma separated)</span>
                <input name="hero_eyebrowRoles" defaultValue={hero.eyebrowRoles} className={inputClass} />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-zinc-400">Heading Line 1</span>
                <input name="hero_headingLine1" defaultValue={hero.headingLine1} className={inputClass} />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-zinc-400">Heading Line 2</span>
                <input name="hero_headingLine2" defaultValue={hero.headingLine2} className={inputClass} />
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-zinc-400">Paragraph 1</span>
              <textarea name="hero_paragraph1" defaultValue={hero.paragraph1} className={textareaClass} />
              <p className="mt-1 text-xs text-zinc-500">Wrap words in square brackets to apply the accent hover effect. (e.g. [Shopify])</p>
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-zinc-400">Paragraph 2</span>
              <textarea name="hero_paragraph2" defaultValue={hero.paragraph2} className={textareaClass} />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4 rounded-lg border border-white/5 bg-black/20 p-4">
                <h4 className="text-sm font-medium text-white">Primary Button</h4>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-zinc-400">Text</span>
                  <input name="hero_primaryBtnText" defaultValue={hero.primaryBtnText} className={inputClass} />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-zinc-400">Link</span>
                  <input name="hero_primaryBtnLink" defaultValue={hero.primaryBtnLink} className={inputClass} />
                </label>
              </div>

              <div className="space-y-4 rounded-lg border border-white/5 bg-black/20 p-4">
                <h4 className="text-sm font-medium text-white">Secondary Button</h4>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-zinc-400">Text</span>
                  <input name="hero_secondaryBtnText" defaultValue={hero.secondaryBtnText} className={inputClass} />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-zinc-400">Link</span>
                  <input name="hero_secondaryBtnLink" defaultValue={hero.secondaryBtnLink} className={inputClass} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-zinc-400">Eyebrow</span>
                <input name="about_eyebrow" defaultValue={about.eyebrow} className={inputClass} />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-zinc-400">Heading</span>
                <input name="about_heading" defaultValue={about.heading} className={inputClass} />
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-zinc-400">Role / Subheading</span>
              <input name="about_role" defaultValue={about.role} className={inputClass} />
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-zinc-400">Paragraph</span>
              <textarea name="about_paragraph" defaultValue={about.paragraph} className={textareaClass} />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-zinc-400">CTA Text</span>
                <input name="about_ctaText" defaultValue={about.ctaText} className={inputClass} />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-zinc-400">CTA Link</span>
                <input name="about_ctaLink" defaultValue={about.ctaLink} className={inputClass} />
              </label>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Capabilities</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3 rounded-lg border border-white/5 bg-black/20 p-4">
                    <label className="block text-sm">
                      <span className="mb-1.5 block font-medium text-zinc-400">Item {i + 1} Title</span>
                      <input name={`about_cap${i+1}_title`} defaultValue={about.capabilities[i]?.title} className={inputClass} />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1.5 block font-medium text-zinc-400">Item {i + 1} Description</span>
                      <input name={`about_cap${i+1}_desc`} defaultValue={about.capabilities[i]?.desc} className={inputClass} />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-4 border-t border-white/10 pt-6">
          {state.success && (
            <span className="text-sm text-green-400">Saved successfully!</span>
          )}
          <button 
            type="submit" 
            disabled={isPending}
            className="h-10 rounded-lg bg-[#4F8CFF] px-6 text-sm font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all hover:bg-[#3B78EB] disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Content'}
          </button>
        </div>
      </form>
    </section>
  );
}
