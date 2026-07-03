'use client';

import { useState } from 'react';
import { ModeTab, type ActiveMode } from './ModeTab';
import { SchemeCard } from './SchemeCard';
import { EmptyEligibilityState } from './EmptyEligibilityState';
import { ChatPanel } from './ChatPanel';
import type { SchemeResult } from '@/app/actions/checkEligibility';
import type { CitizenProfileInput } from '@/lib/schemas/citizenProfile';

interface ResultsShellProps {
  results: SchemeResult[];
  profile: CitizenProfileInput & { state: string };
}

export function ResultsShell({ results, profile }: ResultsShellProps) {
  const [activeMode, setActiveMode] = useState<ActiveMode>('dashboard');
  const [preSeededScheme, setPreSeededScheme] = useState<string | null>(null);

  const eligibleCount = results.filter((r) => r.eligibility_status === 'eligible').length;
  const checkCount = results.filter((r) => r.eligibility_status === 'check-required').length;

  const handleAskAI = (schemeName: string) => {
    setPreSeededScheme(schemeName);
    setActiveMode('chat');
  };

  const handleModeChange = (mode: ActiveMode) => {
    // Clear the pre-seeded scheme when switching to chat directly (not via a card)
    if (mode === 'chat' && activeMode !== 'chat') {
      // Keep preSeededScheme if it was already set; clear if switching fresh
      if (preSeededScheme === null) setPreSeededScheme(null);
    }
    setActiveMode(mode);
  };

  return (
    <div className="flex flex-col border border-zinc-800 bg-zinc-950/50">
      {/* Stats row */}
      <div className="border-b border-zinc-800 px-5 py-3 flex items-center gap-6 bg-zinc-900">
        <div className="flex items-center gap-2">
          <span className="text-xl font-sans font-bold text-green-400">{eligibleCount}</span>
          <span className="text-xs text-zinc-500 font-mono">Eligible</span>
        </div>
        <div className="h-4 w-px bg-zinc-800" />
        <div className="flex items-center gap-2">
          <span className="text-xl font-sans font-bold text-amber-400">{checkCount}</span>
          <span className="text-xs text-zinc-500 font-mono">Check Required</span>
        </div>
        <div className="h-4 w-px bg-zinc-800" />
        <div className="flex items-center gap-2">
          <span className="text-xl font-sans font-bold text-zinc-400">{results.length}</span>
          <span className="text-xs text-zinc-500 font-mono">Total Schemes</span>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="px-5 bg-zinc-900/60">
        <ModeTab activeMode={activeMode} onModeChange={handleModeChange} />
      </div>

      {/* Panels — both are mounted; CSS controls visibility to prevent re-mount on tab switch */}
      <div className={activeMode === 'dashboard' ? 'block' : 'hidden'}>
        <div className="p-5">
          {results.length === 0 ? (
            <EmptyEligibilityState onOpenChat={() => handleModeChange('chat')} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {results.map((scheme) => (
                <SchemeCard key={scheme.scheme_id} scheme={scheme} onAskAI={handleAskAI} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={activeMode === 'chat' ? 'block' : 'hidden'}>
        <ChatPanel profile={profile} preSeededScheme={preSeededScheme} />
      </div>
    </div>
  );
}
