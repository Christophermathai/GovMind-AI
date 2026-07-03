'use client';

import { MessageSquare } from 'lucide-react';

interface EmptyEligibilityStateProps {
  onOpenChat: () => void;
}

export function EmptyEligibilityState({ onOpenChat }: EmptyEligibilityStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="border border-zinc-800 p-4 text-zinc-600">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="4" y="8" width="32" height="24" rx="0" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10" y1="22" x2="22" y2="22" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="flex flex-col gap-2 max-w-sm">
        <p className="font-sans font-semibold text-zinc-200">No schemes matched your profile</p>
        <p className="text-sm text-zinc-500 font-sans">
          Your current profile doesn&apos;t match any schemes in our registry, but GovMind AI can
          help you explore options or refine your understanding of eligibility rules.
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenChat}
        className="flex items-center gap-2 px-5 py-2.5 border border-zinc-700 text-sm font-mono text-zinc-300 hover:border-accent hover:text-accent transition-colors"
      >
        <MessageSquare size={14} />
        Ask AI for guidance
      </button>
    </div>
  );
}
