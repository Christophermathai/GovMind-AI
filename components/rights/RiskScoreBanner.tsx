"use client";

import { AlertTriangle, ShieldAlert, ShieldCheck, Info } from "lucide-react";
import { ContractAnalysis } from "@/lib/schemas/contractAnalysis";

interface RiskScoreBannerProps {
  analysis: ContractAnalysis;
  onReset?: () => void;
}

export function RiskScoreBanner({ analysis, onReset }: RiskScoreBannerProps) {
  const isHigh = analysis.overall_risk === 'high';
  const isModerate = analysis.overall_risk === 'moderate';

  const riskColor = isHigh
    ? 'border-red-800 bg-red-950/20 text-red-400'
    : isModerate
    ? 'border-amber-800 bg-amber-950/20 text-amber-400'
    : 'border-emerald-800 bg-emerald-950/20 text-emerald-400';

  const riskBadge = isHigh
    ? 'bg-red-900/60 text-red-200 border-red-700'
    : isModerate
    ? 'bg-amber-900/60 text-amber-200 border-amber-700'
    : 'bg-emerald-900/60 text-emerald-200 border-emerald-700';

  return (
    <div className="flex flex-col gap-4 border border-zinc-800 bg-zinc-950 p-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest px-2 py-0.5 border border-zinc-700 bg-zinc-900 text-zinc-300">
              {analysis.contract_type} contract
            </span>
            <span className={`font-mono text-xs uppercase tracking-wider px-2 py-0.5 border font-semibold ${riskBadge}`}>
              {analysis.overall_risk} risk detected
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-sans text-white mt-2">
            {analysis.contract_name}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="font-mono text-xs text-zinc-500 uppercase">Risk Index</span>
            <span className={`font-mono text-2xl font-bold ${isHigh ? 'text-red-400' : isModerate ? 'text-amber-400' : 'text-emerald-400'}`}>
              {analysis.risk_score} / 100
            </span>
          </div>
          {onReset && (
            <button
              onClick={onReset}
              className="text-xs font-mono px-3 py-2 border border-zinc-700 hover:border-zinc-500 bg-zinc-900 text-zinc-300 hover:text-white transition-colors"
            >
              Analyze Another
            </button>
          )}
        </div>
      </div>

      {/* Summary & Takeaways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="md:col-span-2 flex flex-col gap-2">
          <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Executive Audit</span>
          <p className="text-sm font-sans text-zinc-300 leading-relaxed">
            {analysis.summary}
          </p>

          <div className="mt-3 flex flex-col gap-1.5">
            {analysis.key_takeaways.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs font-sans text-zinc-400">
                <span className="text-accent shrink-0 font-mono">[{idx + 1}]</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="border border-zinc-800 bg-zinc-900/40 p-4 flex flex-col justify-between">
          <div className="flex items-start gap-2 text-zinc-400">
            <Info size={16} className="text-zinc-500 shrink-0 mt-0.5" />
            <div className="text-xs font-sans text-zinc-400 leading-normal">
              <strong className="text-zinc-200 block mb-1 font-mono uppercase">Statutory Notice</strong>
              GovMind AI highlights significant clauses and statutory rights (e.g. Contract Act §27, Model Tenancy Act). This analysis is educational decision-support and does not replace certified legal counsel.
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800 text-[10px] font-mono text-zinc-500">
            CONFIDENTIAL &bull; LOCAL-ONLY REASONING
          </div>
        </div>
      </div>
    </div>
  );
}
