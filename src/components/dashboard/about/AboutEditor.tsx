'use client';

import { useState } from 'react';
import { updateAboutSectionAction } from '@/lib/dashboard/client-actions';
import { Plus, Trash2, ArrowUp, ArrowDown, Check, X } from 'lucide-react';
import { ConfirmSubmitButton } from '@/components/dashboard/ConfirmSubmitButton';

const inputClass = 'h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF]';
const textareaClass = 'min-h-24 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF]';

export function AboutEditor({ settings }: { settings: any }) {
  const [activeTab, setActiveTab] = useState<'home' | 'intro' | 'approach' | 'bring' | 'enjoy' | 'philosophy' | 'values'>('home');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2 rounded-lg border border-white/10 bg-[#111113] p-2">
        <TabButton id="home" label="HOME PREVIEW" current={activeTab} onClick={setActiveTab} />
        <TabButton id="intro" label="ABOUT INTRO" current={activeTab} onClick={setActiveTab} />
        <TabButton id="approach" label="MY APPROACH" current={activeTab} onClick={setActiveTab} />
        <TabButton id="bring" label="WHAT I BRING" current={activeTab} onClick={setActiveTab} />
        <TabButton id="enjoy" label="WHAT I ENJOY" current={activeTab} onClick={setActiveTab} />
        <TabButton id="philosophy" label="MY PHILOSOPHY" current={activeTab} onClick={setActiveTab} />
        <TabButton id="values" label="I BELIEVE IN" current={activeTab} onClick={setActiveTab} />
      </div>

      <div className="rounded-lg border border-white/10 bg-[#111113] p-6 animate-in fade-in">
        {activeTab === 'home' && <HomePreviewEditor data={settings.aboutContent} />}
        {activeTab === 'intro' && <IntroEditor data={settings.aboutPageIntro} />}
        {activeTab === 'approach' && <ListEditor sectionKey="aboutApproach" data={settings.aboutApproach} defaultItem={{ step: '00', title: 'NEW STEP', desc: '' }} fields={[{ name: 'step', label: 'Step (e.g. 01)', type: 'text' }, { name: 'title', label: 'Title', type: 'text' }, { name: 'desc', label: 'Description', type: 'text' }]} />}
        {activeTab === 'bring' && <ListEditor sectionKey="aboutBring" data={settings.aboutBring} defaultItem={{ category: '00', title: 'New Skill', desc: '' }} fields={[{ name: 'category', label: 'Number / Category', type: 'text' }, { name: 'title', label: 'Title', type: 'text' }, { name: 'desc', label: 'Description', type: 'textarea' }]} />}
        {activeTab === 'enjoy' && <ListEditor sectionKey="aboutEnjoy" data={settings.aboutEnjoy} defaultItem={{ title: 'New Card', desc: '' }} fields={[{ name: 'title', label: 'Title', type: 'text' }, { name: 'desc', label: 'Description', type: 'textarea' }]} />}
        {activeTab === 'philosophy' && <ListEditor sectionKey="aboutPhilosophy" data={settings.aboutPhilosophy} defaultItem={{ number: '00', title: 'NEW PHILOSOPHY', desc: '' }} fields={[{ name: 'number', label: 'Number', type: 'text' }, { name: 'title', label: 'Title', type: 'text' }, { name: 'desc', label: 'Description', type: 'textarea' }]} />}
        {activeTab === 'values' && <ListEditor sectionKey="aboutValues" data={settings.aboutValues} defaultItem={{ title: 'NEW VALUE' }} fields={[{ name: 'title', label: 'Value Text', type: 'text' }]} />}
      </div>
    </div>
  );
}

// ── HomePreviewEditor ────────────────────────────────────────────────────────
// Edits siteSettings.aboutContent — the About preview on the homepage.

function HomePreviewEditor({ data }: { data: any }) {
  const defaults = {
    eyebrow: 'ABOUT ME',
    heading: 'Design. Build. Ship.',
    role: 'Frontend Developer & UI/UX Designer',
    paragraph:
      'I bridge the gap between design and engineering, crafting digital experiences that are not only visually stunning but also highly performant and accessible.',
    ctaText: 'Read my full story',
    ctaLink: '/about',
    capabilities: [
      { title: 'UI / UX Design', desc: 'Crafting intuitive, beautiful interfaces that users love.' },
      { title: 'Frontend Engineering', desc: 'Building fast, accessible, production-grade web apps.' },
      { title: 'Design Systems', desc: 'Creating scalable component libraries and style guides.' },
      { title: 'Performance', desc: 'Optimising for Core Web Vitals and real-world speed.' },
    ],
  };

  const current = data || defaults;
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [capabilities, setCapabilities] = useState<{ title: string; desc: string }[]>(
    current.capabilities || defaults.capabilities,
  );

  const actionWrapper = async (formData: FormData) => {
    setIsPending(true);
    try {
      const payload = {
        eyebrow: formData.get('eyebrow'),
        heading: formData.get('heading'),
        role: formData.get('role'),
        paragraph: formData.get('paragraph'),
        ctaText: formData.get('ctaText'),
        ctaLink: formData.get('ctaLink'),
        capabilities,
      };
      const fd = new FormData();
      fd.append('sectionKey', 'aboutContent');
      fd.append('jsonData', JSON.stringify(payload));
      await updateAboutSectionAction(fd);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setIsPending(false);
    }
  };

  const addCap = () => setCapabilities([...capabilities, { title: 'NEW CAPABILITY', desc: '' }]);
  const removeCap = (i: number) => setCapabilities(capabilities.filter((_, idx) => idx !== i));
  const moveCap = (i: number, dir: 'up' | 'down') => {
    if (dir === 'up' && i === 0) return;
    if (dir === 'down' && i === capabilities.length - 1) return;
    const next = [...capabilities];
    [next[i], next[dir === 'up' ? i - 1 : i + 1]] = [next[dir === 'up' ? i - 1 : i + 1], next[i]];
    setCapabilities(next);
  };
  const updateCap = (i: number, field: 'title' | 'desc', val: string) => {
    const next = [...capabilities];
    next[i][field] = val;
    setCapabilities(next);
  };

  return (
    <form action={actionWrapper} className="space-y-6">
      <h2 className="text-lg font-semibold text-white mb-1">Homepage About Preview</h2>
      <p className="text-xs text-zinc-500 -mt-4">Controls the About section on the public homepage (not the full /about page).</p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-zinc-400">Eyebrow Label</span>
          <input name="eyebrow" defaultValue={current.eyebrow} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-zinc-400">Heading</span>
          <input name="heading" defaultValue={current.heading} className={inputClass} />
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="mb-1.5 block font-medium text-zinc-400">Role / Subtitle</span>
          <input name="role" defaultValue={current.role} className={inputClass} />
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="mb-1.5 block font-medium text-zinc-400">Description Paragraph</span>
          <textarea name="paragraph" defaultValue={current.paragraph} className={textareaClass} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-zinc-400">CTA Button Text</span>
          <input name="ctaText" defaultValue={current.ctaText} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-zinc-400">CTA Button Link</span>
          <input name="ctaLink" defaultValue={current.ctaLink} className={inputClass} />
        </label>
      </div>

      {/* Capabilities list */}
      <div className="border-t border-white/10 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Capabilities</h3>
          <button type="button" onClick={addCap} className="flex h-8 items-center gap-1 rounded-lg bg-white/10 px-3 text-xs font-medium text-white hover:bg-white/20">
            <Plus size={14} /> Add
          </button>
        </div>
        <div className="space-y-3">
          {capabilities.map((cap, i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-white/10 bg-black/20 p-3">
              <div className="flex flex-col gap-1 pr-2 border-r border-white/10">
                <button type="button" onClick={() => moveCap(i, 'up')} disabled={i === 0} className="p-1 text-zinc-500 hover:text-white disabled:opacity-30">
                  <ArrowUp size={14} />
                </button>
                <button type="button" onClick={() => moveCap(i, 'down')} disabled={i === capabilities.length - 1} className="p-1 text-zinc-500 hover:text-white disabled:opacity-30">
                  <ArrowDown size={14} />
                </button>
              </div>
              <div className="flex-1 grid gap-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-xs text-zinc-500">Title (all caps)</span>
                  <input value={cap.title} onChange={e => updateCap(i, 'title', e.target.value)} className={`${inputClass} h-9`} />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-xs text-zinc-500">Description</span>
                  <input value={cap.desc} onChange={e => updateCap(i, 'desc', e.target.value)} className={`${inputClass} h-9`} />
                </label>
              </div>
              <div className="pl-2 border-l border-white/10 flex items-center">
                <button type="button" onClick={() => removeCap(i)} className="p-1 text-zinc-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {capabilities.length === 0 && (
            <div className="text-center py-6 text-zinc-600 border border-dashed border-white/10 rounded-lg text-sm">
              No capabilities. Add one above.
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-white/10 pt-6">
        {success && <span className="text-sm text-green-400 flex items-center gap-1"><Check size={16} /> Saved</span>}
        <button type="submit" disabled={isPending} className="h-10 rounded-lg bg-[#4F8CFF] px-6 text-sm font-semibold text-white hover:bg-[#3B78EB] disabled:opacity-50">
          Save Home Preview
        </button>
      </div>
    </form>
  );
}

// ── TabButton ─────────────────────────────────────────────────────────────────

function TabButton({ id, label, current, onClick }: { id: any, label: string, current: string, onClick: (id: any) => void }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`rounded-lg px-4 py-2 text-xs font-semibold tracking-wider transition-colors ${current === id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
    >
      {label}
    </button>
  );
}

function IntroEditor({ data }: { data: any }) {
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const intro = data || {
    eyebrow: 'ABOUT / 01',
    heading1: 'Designing.',
    heading2: 'Building.',
    heading3: 'Improving digital experiences.',
    role: "I'm a UI/UX Designer, Frontend Developer, Shopify Developer and Vibe Coder.",
    paragraph: 'I combine design thinking, frontend development, e-commerce expertise and AI-assisted workflows to create intuitive interfaces, responsive websites and scalable digital products.'
  };

  const actionWrapper = async (formData: FormData) => {
    setIsPending(true);
    try {
      const jsonData = JSON.stringify({
        eyebrow: formData.get('eyebrow'),
        heading1: formData.get('heading1'),
        heading2: formData.get('heading2'),
        heading3: formData.get('heading3'),
        role: formData.get('role'),
        paragraph: formData.get('paragraph'),
      });
      const data = new FormData();
      data.append('sectionKey', 'aboutPageIntro');
      data.append('jsonData', jsonData);
      await updateAboutSectionAction(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form action={actionWrapper} className="space-y-6">
      <h2 className="text-lg font-semibold text-white mb-4">About Intro Content</h2>
      
      <label className="block text-sm max-w-sm">
        <span className="mb-1.5 block font-medium text-zinc-400">Eyebrow / Section Label</span>
        <input name="eyebrow" defaultValue={intro.eyebrow} className={inputClass} />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-zinc-400">Heading Line 1</span>
          <input name="heading1" defaultValue={intro.heading1} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-zinc-400">Heading Line 2</span>
          <input name="heading2" defaultValue={intro.heading2} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-zinc-400">Heading Line 3 (Accent)</span>
          <input name="heading3" defaultValue={intro.heading3} className={inputClass} />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-zinc-400">Role Subtitle</span>
        <input name="role" defaultValue={intro.role} className={inputClass} />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-zinc-400">Main Description Paragraph</span>
        <textarea name="paragraph" defaultValue={intro.paragraph} className={textareaClass} />
      </label>

      <div className="flex items-center justify-end gap-4 border-t border-white/10 pt-6">
        {success && <span className="text-sm text-green-400 flex items-center gap-1"><Check size={16}/> Saved</span>}
        <button type="submit" disabled={isPending} className="h-10 rounded-lg bg-[#4F8CFF] px-6 text-sm font-semibold text-white hover:bg-[#3B78EB] disabled:opacity-50">
          Save Intro
        </button>
      </div>
    </form>
  );
}

function ListEditor({ sectionKey, data, defaultItem, fields }: { sectionKey: string, data: any[], defaultItem: any, fields: any[] }) {
  const [items, setItems] = useState<any[]>(data || []);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
  };

  const handleDelete = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleAdd = () => {
    setItems([...items, { ...defaultItem }]);
  };

  const saveAction = async () => {
    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append('sectionKey', sectionKey);
      formData.append('jsonData', JSON.stringify(items));
      await updateAboutSectionAction(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
        <h2 className="text-lg font-semibold text-white">List Items</h2>
        <button onClick={handleAdd} className="flex h-9 items-center justify-center rounded-lg bg-white/10 px-3 text-sm font-medium text-white hover:bg-white/20">
          <Plus size={16} className="mr-1" /> Add Item
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex gap-4 rounded-lg border border-white/10 bg-black/20 p-4">
            
            <div className="flex flex-col gap-1 pr-2 border-r border-white/10">
              <button type="button" onClick={() => handleMove(index, 'up')} disabled={index === 0} className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30">
                <ArrowUp size={16} />
              </button>
              <button type="button" onClick={() => handleMove(index, 'down')} disabled={index === items.length - 1} className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30">
                <ArrowDown size={16} />
              </button>
            </div>

            <div className="flex-1 grid gap-4">
              {fields.map((field) => (
                <label key={field.name} className="block text-sm">
                  <span className="mb-1 block font-medium text-zinc-500">{field.label}</span>
                  {field.type === 'textarea' ? (
                    <textarea 
                      value={item[field.name]} 
                      onChange={(e) => handleUpdate(index, field.name, e.target.value)} 
                      className={textareaClass + " !min-h-16"} 
                    />
                  ) : (
                    <input 
                      type="text" 
                      value={item[field.name]} 
                      onChange={(e) => handleUpdate(index, field.name, e.target.value)} 
                      className={inputClass + " h-9"} 
                    />
                  )}
                </label>
              ))}
            </div>

            <div className="pl-2 border-l border-white/10 flex items-start">
              <button type="button" onClick={() => handleDelete(index)} className="p-1.5 text-zinc-500 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-8 text-zinc-500 border border-dashed border-white/10 rounded-lg">
            No items. Add one above.
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-white/10 pt-6">
        {success && <span className="text-sm text-green-400 flex items-center gap-1"><Check size={16}/> Saved</span>}
        <button onClick={saveAction} disabled={isPending} className="h-10 rounded-lg bg-[#4F8CFF] px-6 text-sm font-semibold text-white hover:bg-[#3B78EB] disabled:opacity-50">
          Save Section
        </button>
      </div>
    </div>
  );
}
