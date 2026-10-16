"use client";

import { useState } from "react";
import { ClauseItem, MissingProtection } from "@/lib/schemas/contractAnalysis";
import { ClauseCard } from "./ClauseCard";
import { ShieldAlert, PlusCircle } from "lucide-react";

interface ClauseListProps {
  clauses: ClauseItem[];
  missingProtections: MissingProtection[];
  onAskAI?: (clauseOrQuery: string) => void;
}

export function ClauseList({ clauses, missingProtections, onAskAI }: ClauseListProps) {
  const [filter, setFilter] = useState<string>('all');

  const highRiskCount = clauses.filter((c) => c.severity === 'high').length;

  const filteredClauses = clauses.filter((clause) => {
    if (filter === 'all') return true;
    if (filter === 'high') return clause.severity === 'high';
    if (filter === 'termination') return clause.category === 'termination_and_notice';
    if (filter === 'renewal') return clause.category === 'auto_renewal';
    if (filter === 'non_compete') return clause.category === 'non_compete_and_ip';
    return true;
  });

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-zinc-800">
        <button
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 text-xs font-mono border transition-colors ${
            filter === 'all'
              ? 'bg-zinc-800 border-zinc-600 text-white'
              : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
          }`}
        >
          All Clauses ({clauses.length})
        </button>

        <button
          onClick={() => setFilter('high')}
          className={`px-2.5 py-1 text-xs font-mono border transition-colors ${
            filter === 'high'
              ? 'bg-red-950 border-red-700 text-red-200'
              : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-red-300'
          }`}
        >
          High Risk ({highRiskCount})
        </button>

        <button
          onClick={() => setFilter('termination')}
          className={`px-2.5 py-1 text-xs font-mono border transition-colors ${
            filter === 'termination'
              ? 'bg-zinc-800 border-zinc-600 text-white'
              : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
          }`}
        >
          Termination & Notice
        </button>

        <button
          onClick={() => setFilter('renewal')}
          className={`px-2.5 py-1 text-xs font-mono border transition-colors ${
            filter === 'renewal'
              ? 'bg-zinc-800 border-zinc-600 text-white'
              : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
          }`}
        >
          Auto-Renewal
        </button>

        <button
          onClick={() => setFilter('non_compete')}
          className={`px-2.5 py-1 text-xs font-mono border transition-colors ${
            filter === 'non_compete'
              ? 'bg-zinc-800 border-zinc-600 text-white'
              : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
          }`}
        >
          Non-Compete & IP
        </button>

        <button
          onClick={() => setFilter('missing')}
          className={`px-2.5 py-1 text-xs font-mono border transition-colors ${
            filter === 'missing'
              ? 'bg-purple-950 border-purple-700 text-purple-200'
              : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-purple-300'
          }`}
        >
          Missing Protections ({missingProtections.length})
        </button>
      </div>

      {/* Clause Cards Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filter !== 'missing' && (
          <>
            {filteredClauses.map((clause) => (
              <ClauseCard
                key={clause.id}
                clause={clause}
                onAskAI={(c) => onAskAI && onAskAI(`Explain why the clause "${c.title}" is risky and how I can negotiate it.`)}
              />
            ))}
            {filteredClauses.length === 0 && (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs border border-zinc-800">
                NO CLAUSES MATCHED THE CURRENT FILTER.
              </div>
            )}
          </>
        )}

        {/* Missing Protections Cards */}
        {(filter === 'all' || filter === 'missing') && missingProtections.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert size={14} className="text-purple-400" />
              <span className="font-mono text-xs text-purple-300 uppercase tracking-wider font-semibold">
                Absent Standard Legal Protections
              </span>
            </div>

            {missingProtections.map((m) => (
              <div key={m.id} className="border border-purple-900/40 bg-purple-950/10 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-sans font-bold text-sm text-purple-200">
                    {m.title}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-purple-800 text-purple-300">
                    {m.importance}
                  </span>
                </div>
                <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                  {m.description}
                </p>
                <div className="p-2.5 bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-300">
                  <span className="text-purple-400 block mb-1 uppercase text-[10px]">Recommended Addition:</span>
                  {m.recommended_addition}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
