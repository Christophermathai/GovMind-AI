"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Scale, Sparkles } from "lucide-react";
import { ClauseItem } from "@/lib/schemas/contractAnalysis";

interface ClauseCardProps {
  clause: ClauseItem;
  onAskAI?: (clause: ClauseItem) => void;
}

export function ClauseCard({ clause, onAskAI }: ClauseCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isHigh = clause.severity === 'high';
  const isWarning = clause.severity === 'warning';
  const isStandard = clause.severity === 'standard';

  const badgeStyle = isHigh
    ? 'border-red-800 bg-red-950/40 text-red-300'
    : isWarning
    ? 'border-amber-800 bg-amber-950/40 text-amber-300'
    : 'border-emerald-800 bg-emerald-950/40 text-emerald-300';

  const Icon = isHigh ? AlertCircle : isWarning ? AlertTriangle : CheckCircle2;

  return (
    <div className={`border transition-colors ${isHigh ? 'border-red-900/50 bg-red-950/10' : 'border-zinc-800 bg-zinc-950/80'} p-4`}>
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Icon size={18} className={`shrink-0 mt-0.5 ${isHigh ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`} />
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-sans font-bold text-sm text-zinc-100">
                {clause.title}
              </span>
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${badgeStyle}`}>
                {clause.severity === 'high' ? 'High Risk' : clause.severity === 'warning' ? 'Caution' : 'Standard'}
              </span>
              {clause.statutory_reference && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-accent px-1.5 py-0.5 border border-zinc-800 bg-zinc-900">
                  <Scale size={10} />
                  {clause.statutory_reference}
                </span>
              )}
            </div>
            <p className="text-xs font-sans text-zinc-300 leading-relaxed mt-1">
              <span className="text-zinc-500 font-mono text-[11px] uppercase mr-1">In Plain English:</span>
              {clause.plain_english}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-zinc-500 hover:text-zinc-200 transition-colors p-1"
          aria-label={expanded ? "Collapse details" : "Expand details"}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col gap-3 font-sans text-xs">
          {/* Verbatim Excerpt */}
          <div className="bg-zinc-900 border-l-2 border-zinc-600 p-2.5 font-mono text-[11px] text-zinc-300 italic">
            &ldquo;{clause.quote}&rdquo;
          </div>

          {/* Risk Explanation */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-zinc-400 text-[11px] uppercase">Why This Matters</span>
            <p className="text-zinc-300 leading-relaxed">
              {clause.risk_explanation}
            </p>
          </div>

          {/* Counter-Proposal Wording */}
          {clause.counter_proposal && (
            <div className="p-3 border border-zinc-800 bg-zinc-900/60 flex flex-col gap-1">
              <span className="font-mono text-accent text-[11px] uppercase flex items-center gap-1.5 font-semibold">
                <Sparkles size={12} />
                Suggested Negotiation Counter-Proposal
              </span>
              <p className="text-zinc-200 font-mono text-[11px] leading-relaxed select-all">
                {clause.counter_proposal}
              </p>
            </div>
          )}

          {/* Action to Ask AI */}
          {onAskAI && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => onAskAI(clause)}
                className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
              >
                Ask AI about this clause &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
