'use client';

import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface WizardStepProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  isLastStep?: boolean;
  isSubmitting?: boolean;
}

export function WizardStep({
  stepNumber,
  totalSteps,
  title,
  children,
  onNext,
  onBack,
  isLastStep = false,
  isSubmitting = false,
}: WizardStepProps) {
  const progress = Math.round((stepNumber / totalSteps) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">
            Step {stepNumber} / {totalSteps}
          </span>
          <span className="text-xs font-mono text-accent">{progress}%</span>
        </div>
        <div className="h-px bg-zinc-800 w-full relative">
          <div
            className="h-px bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step title */}
      <h2 className="font-sans text-xl font-bold text-zinc-50 tracking-tight">{title}</h2>

      {/* Fields */}
      <div className="flex flex-col gap-4">{children}</div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        <button
          type={isLastStep ? 'submit' : 'button'}
          onClick={isLastStep ? undefined : onNext}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-sans font-semibold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="animate-pulse">Processing…</span>
            </>
          ) : (
            <>
              {isLastStep ? 'View My Schemes' : 'Next'}
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
