'use client';

import { LayoutDashboard, MessageSquare } from 'lucide-react';

export type ActiveMode = 'dashboard' | 'chat';

interface ModeTabProps {
  activeMode: ActiveMode;
  onModeChange: (mode: ActiveMode) => void;
}

export function ModeTab({ activeMode, onModeChange }: ModeTabProps) {
  return (
    <div className="flex border-b border-zinc-800">
      <button
        type="button"
        onClick={() => onModeChange('dashboard')}
        className={`flex items-center gap-2 px-5 py-3 text-sm font-sans font-medium transition-colors border-b-2 -mb-px ${
          activeMode === 'dashboard'
            ? 'border-accent text-white'
            : 'border-transparent text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <LayoutDashboard size={15} />
        Dashboard
      </button>
      <button
        type="button"
        onClick={() => onModeChange('chat')}
        className={`flex items-center gap-2 px-5 py-3 text-sm font-sans font-medium transition-colors border-b-2 -mb-px ${
          activeMode === 'chat'
            ? 'border-accent text-white'
            : 'border-transparent text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <MessageSquare size={15} />
        Ask AI
      </button>
    </div>
  );
}
