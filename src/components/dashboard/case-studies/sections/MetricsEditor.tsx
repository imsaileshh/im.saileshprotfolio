'use client';

import { useState } from 'react';
import { Plus, Trash2, TrendingUp, LayoutGrid } from 'lucide-react';
import { MetricsData, MetricCardItem } from '@/types/case-study-builder';
import { DEFAULT_METRICS_DEMO } from '@/lib/data/case-study-demo-data';

interface MetricsEditorProps {
  data?: MetricsData;
  onChange: (newData: MetricsData) => void;
}

export function MetricsEditor({ data = DEFAULT_METRICS_DEMO, onChange }: MetricsEditorProps) {
  const items = data?.items || [];
  const columns = data?.columns || 4;

  const setColumns = (cols: 2 | 3 | 4) => {
    onChange({ ...data, columns: cols });
  };

  const addMetric = () => {
    const newItem: MetricCardItem = {
      id: `met-${Date.now().toString(36)}`,
      value: '24',
      prefix: '+',
      suffix: '%',
      label: 'Metric Impact Label',
      description: 'Metric measurement context...',
    };
    onChange({ ...data, items: [...items, newItem] });
  };

  const updateMetric = (id: string, updated: Partial<MetricCardItem>) => {
    const nextItems = items.map((it) => (it.id === id ? { ...it, ...updated } : it));
    onChange({ ...data, items: nextItems });
  };

  const removeMetric = (id: string) => {
    const nextItems = items.filter((it) => it.id !== id);
    onChange({ ...data, items: nextItems });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp size={16} className="text-accent" />
              <span>Results & Key Metric Cards ({items.length})</span>
            </h4>
            <p className="text-xs text-muted mt-0.5">High-impact statistic cards showing design conversion and user satisfaction outcomes.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Columns Selector */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
              <span className="text-[10px] font-mono text-muted px-2">Cols:</span>
              {[2, 3, 4].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColumns(c as 2 | 3 | 4)}
                  className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                    columns === c
                      ? 'bg-accent text-black'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={addMetric}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all"
            >
              <Plus size={14} />
              <span>Add Metric</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((met) => (
            <div key={met.id} className="p-3.5 rounded-xl border border-white/10 bg-black/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 flex-1 w-full">
                <input
                  type="text"
                  placeholder="Prefix (+)"
                  value={met.prefix || ''}
                  onChange={(e) => updateMetric(met.id, { prefix: e.target.value })}
                  className="rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs text-center font-mono text-accent focus:border-accent focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Value (24)"
                  value={met.value}
                  onChange={(e) => updateMetric(met.id, { value: e.target.value })}
                  className="rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs text-center font-mono font-bold text-foreground focus:border-accent focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Suffix (%)"
                  value={met.suffix || ''}
                  onChange={(e) => updateMetric(met.id, { suffix: e.target.value })}
                  className="rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs text-center font-mono text-accent focus:border-accent focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Label (Checkout Completion)"
                  value={met.label}
                  onChange={(e) => updateMetric(met.id, { label: e.target.value })}
                  className="col-span-2 sm:col-span-2 rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs font-medium text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => removeMetric(met.id)}
                className="p-1.5 text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
