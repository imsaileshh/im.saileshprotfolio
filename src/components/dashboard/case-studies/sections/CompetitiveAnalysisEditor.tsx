'use client';

import { useState } from 'react';
import { Plus, Trash2, Search, Check, X } from 'lucide-react';
import { CompetitiveAnalysisData, CompetitorItem, FeatureMatrixItem } from '@/types/case-study-builder';
import { DEFAULT_COMPETITIVE_ANALYSIS_DEMO } from '@/lib/data/case-study-demo-data';

interface CompetitiveAnalysisEditorProps {
  data?: CompetitiveAnalysisData;
  onChange: (newData: CompetitiveAnalysisData) => void;
}

export function CompetitiveAnalysisEditor({
  data = DEFAULT_COMPETITIVE_ANALYSIS_DEMO,
  onChange,
}: CompetitiveAnalysisEditorProps) {
  const competitors = data?.competitors || [];
  const matrix = data?.matrix || [];

  const addCompetitor = () => {
    const newComp: CompetitorItem = {
      id: `comp-${Date.now().toString(36)}`,
      name: 'Competitor Name',
      website: 'competitor.com',
      strengths: ['Strength...'],
      weaknesses: ['Weakness...'],
      keyFeatures: ['Feature...'],
    };
    onChange({ ...data, competitors: [...competitors, newComp] });
  };

  const updateCompetitor = (id: string, updated: Partial<CompetitorItem>) => {
    const nextComps = competitors.map((c) => (c.id === id ? { ...c, ...updated } : c));
    onChange({ ...data, competitors: nextComps });
  };

  const removeCompetitor = (id: string) => {
    const nextComps = competitors.filter((c) => c.id !== id);
    onChange({ ...data, competitors: nextComps });
  };

  const addMatrixFeature = () => {
    const newFeature: FeatureMatrixItem = {
      id: `feat-${Date.now().toString(36)}`,
      featureName: 'New Feature Comparison',
      ourProduct: true,
      competitorValues: {},
    };
    onChange({ ...data, matrix: [...matrix, newFeature] });
  };

  const updateMatrixFeature = (id: string, updated: Partial<FeatureMatrixItem>) => {
    const nextMatrix = matrix.map((f) => (f.id === id ? { ...f, ...updated } : f));
    onChange({ ...data, matrix: nextMatrix });
  };

  const removeMatrixFeature = (id: string) => {
    const nextMatrix = matrix.filter((f) => f.id !== id);
    onChange({ ...data, matrix: nextMatrix });
  };

  return (
    <div className="space-y-6">
      {/* Competitors List */}
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Search size={16} className="text-accent" />
            <span>Competitor Profiles ({competitors.length})</span>
          </h4>
          <button
            type="button"
            onClick={addCompetitor}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all"
          >
            <Plus size={14} />
            <span>Add Competitor</span>
          </button>
        </div>

        <div className="space-y-4">
          {competitors.map((comp) => (
            <div key={comp.id} className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={comp.name}
                    onChange={(e) => updateCompetitor(comp.id, { name: e.target.value })}
                    className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs font-bold text-foreground focus:border-accent focus:outline-none"
                    placeholder="Competitor Name"
                  />
                  <input
                    type="text"
                    value={comp.website || ''}
                    onChange={(e) => updateCompetitor(comp.id, { website: e.target.value })}
                    className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs text-muted focus:border-accent focus:outline-none"
                    placeholder="website.com"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCompetitor(comp.id)}
                  className="p-1 rounded text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted block mb-1">Strengths (comma-separated)</label>
                  <input
                    type="text"
                    value={comp.strengths.join(', ')}
                    onChange={(e) => updateCompetitor(comp.id, { strengths: e.target.value.split(',').map((s) => s.trim()) })}
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted block mb-1">Weaknesses (comma-separated)</label>
                  <input
                    type="text"
                    value={comp.weaknesses.join(', ')}
                    onChange={(e) => updateCompetitor(comp.id, { weaknesses: e.target.value.split(',').map((s) => s.trim()) })}
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Matrix */}
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>Feature Comparison Matrix ({matrix.length})</span>
          </h4>
          <button
            type="button"
            onClick={addMatrixFeature}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all"
          >
            <Plus size={14} />
            <span>Add Feature Row</span>
          </button>
        </div>

        <div className="space-y-3">
          {matrix.map((row) => (
            <div key={row.id} className="p-3 rounded-lg border border-white/10 bg-black/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <input
                type="text"
                value={row.featureName}
                onChange={(e) => updateMatrixFeature(row.id, { featureName: e.target.value })}
                className="rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-foreground font-semibold focus:border-accent focus:outline-none flex-1 w-full sm:w-auto"
                placeholder="Feature Name"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateMatrixFeature(row.id, { ourProduct: !row.ourProduct })}
                  className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 ${
                    row.ourProduct
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  <span>Our Product:</span>
                  {row.ourProduct ? <Check size={14} /> : <X size={14} />}
                </button>

                <button
                  type="button"
                  onClick={() => removeMatrixFeature(row.id)}
                  className="p-1.5 text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
