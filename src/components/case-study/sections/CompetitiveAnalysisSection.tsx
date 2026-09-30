'use client';

import { CompetitiveAnalysisData } from '@/types/case-study-builder';
import { Check, X, ExternalLink } from 'lucide-react';

interface CompetitiveAnalysisSectionProps {
  analysis?: CompetitiveAnalysisData;
}

export function CompetitiveAnalysisSection({ analysis }: CompetitiveAnalysisSectionProps) {
  if (!analysis) return null;

  const { competitors = [], matrix = [] } = analysis;

  return (
    <div className="w-full space-y-10 my-4">
      {/* Feature Matrix Table */}
      {matrix.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
            Feature Matrix Comparison
          </h4>

          <div className="overflow-x-auto no-scrollbar border border-border-subtle rounded-xl bg-[var(--case-card)]">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-border-subtle text-muted uppercase">
                  <th className="py-3.5 px-4 font-semibold">Feature / Capability</th>
                  <th className="py-3.5 px-4 text-foreground font-bold bg-accent/10">Our Product</th>
                  {competitors.map((c) => (
                    <th key={c.id} className="py-3.5 px-4 font-semibold">{c.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {matrix.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--case-surface)] transition-colors">
                    <td className="py-3.5 px-4 font-sans font-medium text-foreground">{row.featureName}</td>
                    <td className="py-3.5 px-4 bg-accent/10 font-bold">
                      {typeof row.ourProduct === 'boolean' ? (
                        row.ourProduct ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Check size={14} /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                            <X size={14} /> No
                          </span>
                        )
                      ) : (
                        <span className="text-foreground">{row.ourProduct}</span>
                      )}
                    </td>
                    {competitors.map((c) => {
                      const val = row.competitorValues?.[c.id];
                      return (
                        <td key={c.id} className="py-3.5 px-4">
                          {typeof val === 'boolean' ? (
                            val ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600/80 dark:text-emerald-400/80">
                                <Check size={14} /> Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-muted">
                                <X size={14} /> No
                              </span>
                            )
                          ) : (
                            <span className="text-muted">{val ?? '—'}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compact Competitor Profile Summaries */}
      {competitors.length > 0 && (
        <div className="pt-6 border-t border-border-subtle space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
            Competitor Summaries
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {competitors.map((comp) => (
              <div key={comp.id} className="p-5 rounded-xl border border-border-subtle bg-[var(--case-surface)] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                  <h5 className="text-sm font-bold text-foreground font-display">{comp.name}</h5>
                  {comp.website && (
                    <a
                      href={`https://${comp.website.replace(/^https?:\/\//, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-muted hover:text-foreground inline-flex items-center gap-1"
                    >
                      <span>{comp.website}</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Strengths */}
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] uppercase text-emerald-600 dark:text-emerald-400 font-bold block">Strengths</span>
                    <ul className="space-y-1 text-foreground/90">
                      {comp.strengths.map((str, sIdx) => (
                        <li key={sIdx}>&check; {str}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] uppercase text-red-600 dark:text-red-400 font-bold block">Weaknesses</span>
                    <ul className="space-y-1 text-muted">
                      {comp.weaknesses.map((wk, wIdx) => (
                        <li key={wIdx}>&times; {wk}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
