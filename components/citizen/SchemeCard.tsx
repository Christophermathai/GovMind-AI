'use client';

import { CheckCircle2, XCircle, AlertCircle, ChevronRight, Building2 } from 'lucide-react';
import type { SchemeResult, EligibilityStatus } from '@/app/actions/checkEligibility';

interface SchemeCardProps {
  scheme: SchemeResult;
  onAskAI: (schemeName: string) => void;
}

const STATUS_CONFIG: Record<EligibilityStatus, {
  icon: typeof CheckCircle2;
  label: string;
  color: string;
  border: string;
  bg: string;
}> = {
  eligible: {
    icon: CheckCircle2,
    label: 'Eligible',
    color: 'text-green-400',
    border: 'border-green-900',
    bg: 'bg-green-950/20',
  },
  'check-required': {
    icon: AlertCircle,
    label: 'Check Required',
    color: 'text-amber-400',
    border: 'border-amber-900',
    bg: 'bg-amber-950/20',
  },
  ineligible: {
    icon: XCircle,
    label: 'Not Eligible',
    color: 'text-zinc-600',
    border: 'border-zinc-800',
    bg: 'bg-zinc-950/50',
  },
};

export function SchemeCard({ scheme, onAskAI }: SchemeCardProps) {
  const config = STATUS_CONFIG[scheme.eligibility_status];
  const StatusIcon = config.icon;

  return (
    <div className={`border ${config.border} ${config.bg} flex flex-col`}>
      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-3 flex items-start justify-between gap-3 bg-zinc-900/60">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3 className="font-sans text-sm font-semibold text-zinc-100 leading-snug">
            {scheme.scheme_name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
            <Building2 size={11} />
            {scheme.ministry}
          </div>
        </div>
        <div className={`flex items-center gap-1.5 shrink-0 ${config.color}`}>
          <StatusIcon size={15} />
          <span className="text-xs font-mono font-medium">{config.label}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-4 flex-1">
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">{scheme.description}</p>

        {/* Matched criteria */}
        {scheme.matched_criteria.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">Matched</span>
            <ul className="flex flex-col gap-1">
              {scheme.matched_criteria.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-green-400 font-sans">
                  <CheckCircle2 size={11} className="shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Unmet criteria */}
        {scheme.unmet_criteria.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">Not Met</span>
            <ul className="flex flex-col gap-1">
              {scheme.unmet_criteria.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-zinc-500 font-sans">
                  <XCircle size={11} className="shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => onAskAI(scheme.scheme_name)}
          className="w-full flex items-center justify-center gap-2 py-2 border border-zinc-700 text-xs font-mono text-zinc-300 hover:border-accent hover:text-accent transition-colors"
        >
          Ask AI about this scheme
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
