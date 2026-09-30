'use client';

import { useState } from 'react';
import { FileText, Image as ImageIcon, Layout, Plus, Trash2 } from 'lucide-react';
import { CaseStudyVisualEditor } from '@/components/dashboard/case-studies/CaseStudyVisualEditor';
import { CaseStudyVisual } from '@/types/case-study-visual';

interface StandardSectionEditorProps {
  content: string;
  onChangeContent: (content: string) => void;
  media: CaseStudyVisual[];
  onChangeMedia: (media: CaseStudyVisual[]) => void;
  layout?: string;
  onChangeLayout?: (layout: string) => void;
  subtitle?: string;
  onChangeSubtitle?: (subtitle: string) => void;
}

export function StandardSectionEditor({
  content,
  onChangeContent,
  media,
  onChangeMedia,
  layout = 'full_width',
  onChangeLayout,
  subtitle = '',
  onChangeSubtitle,
}: StandardSectionEditorProps) {
  const [activeSubTab, setActiveSubTab] = useState<'text' | 'visuals' | 'layout'>('text');

  const addVisual = () => {
    const newVis: CaseStudyVisual = {
      id: `v-${Date.now().toString(36)}`,
      imageUrl: '',
      url: '',
      displayType: 'image',
      displaySize: 'large',
      backgroundType: 'none',
      backgroundColor: '#0E0F12',
      fit: 'natural',
    };
    onChangeMedia([...media, newVis]);
  };

  const updateVisual = (idx: number, updated: CaseStudyVisual) => {
    const nextMedia = [...media];
    nextMedia[idx] = updated;
    onChangeMedia(nextMedia);
  };

  const removeVisual = (idx: number) => {
    const nextMedia = media.filter((_, i) => i !== idx);
    onChangeMedia(nextMedia);
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('text')}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'text' ? 'bg-accent/15 text-accent border border-accent/30' : 'text-muted hover:text-foreground'
          }`}
        >
          <FileText size={14} />
          <span>Written Content</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('visuals')}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'visuals' ? 'bg-accent/15 text-accent border border-accent/30' : 'text-muted hover:text-foreground'
          }`}
        >
          <ImageIcon size={14} />
          <span>Visual Media ({media.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('layout')}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'layout' ? 'bg-accent/15 text-accent border border-accent/30' : 'text-muted hover:text-foreground'
          }`}
        >
          <Layout size={14} />
          <span>Layout Options</span>
        </button>
      </div>

      {activeSubTab === 'text' && (
        <div className="space-y-3">
          {onChangeSubtitle && (
            <input
              type="text"
              placeholder="Section Subtitle / Category Tag (optional)"
              value={subtitle}
              onChange={(e) => onChangeSubtitle(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
            />
          )}

          <textarea
            rows={8}
            placeholder="Write section prose, narrative, problem context, bullet points..."
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-xs sm:text-sm text-foreground focus:border-accent focus:outline-none leading-relaxed font-mono resize-y"
          />
        </div>
      )}

      {activeSubTab === 'visuals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Configured Section Showcase Screens</span>
            <button
              type="button"
              onClick={addVisual}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all"
            >
              <Plus size={14} />
              <span>Add Visual Screen</span>
            </button>
          </div>

          {media.length > 0 ? (
            media.map((vis, idx) => (
              <div key={vis.id || idx} className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3 relative">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-mono font-bold text-accent">Visual Frame #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeVisual(idx)}
                    className="p-1 text-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <CaseStudyVisualEditor
                  visual={vis}
                  onChange={(updated) => updateVisual(idx, updated)}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8 border border-dashed border-white/10 rounded-xl text-muted text-xs">
              No visual showcase screens added to this section. Click "Add Visual Screen" to add webpage mockups, dashboard frames, or standard photos.
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'layout' && onChangeLayout && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: 'full_width', label: 'Full Width Stack', desc: 'Prose text stacked above large visual media' },
            { id: 'two_column', label: 'Two Column Grid', desc: 'Text on left, visuals or metrics on right' },
            { id: 'split_text_media', label: 'Split Text / Media', desc: '50/50 split layout with media highlight' },
            { id: 'text_focus', label: 'Editorial Text Focus', desc: 'Narrow centered text container for deep articles' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChangeLayout(opt.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                layout === opt.id
                  ? 'border-accent bg-accent/15 text-foreground shadow-md'
                  : 'border-white/10 bg-black/40 text-muted hover:border-white/20'
              }`}
            >
              <h5 className="text-xs font-bold text-foreground mb-1">{opt.label}</h5>
              <p className="text-[11px] text-muted/80">{opt.desc}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
