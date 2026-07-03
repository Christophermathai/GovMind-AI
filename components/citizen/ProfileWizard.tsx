'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  citizenProfileSchema,
  CitizenProfileInput,
  INDIAN_STATES,
  OCCUPATIONS,
  INCOME_BRACKETS,
  SOCIAL_CATEGORIES,
  GENDERS,
} from '@/lib/schemas/citizenProfile';
import { saveProfile } from '@/app/actions/saveProfile';
import { WizardStep } from './WizardStep';

// ─── Field helpers ─────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-mono text-zinc-400 tracking-widest uppercase mb-1 block">
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-400 font-mono mt-1">{message}</p>;
}

const inputClass =
  'w-full bg-zinc-900 border border-zinc-800 text-zinc-50 font-sans text-sm px-3 py-2.5 focus:outline-none focus:border-accent transition-colors placeholder-zinc-600';

const selectClass = inputClass + ' appearance-none cursor-pointer';

// ─── Main Wizard ───────────────────────────────────────────────────────────

export function ProfileWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<CitizenProfileInput>({
    resolver: zodResolver(citizenProfileSchema),
    mode: 'onBlur',
  });

  // ── Session UUID — generated once and persisted in localStorage ───────────
  const [sessionUuid] = useState(() => {
    if (typeof window === 'undefined') return crypto.randomUUID();
    const stored = localStorage.getItem('govmind_session_uuid');
    if (stored) return stored;
    const fresh = crypto.randomUUID();
    localStorage.setItem('govmind_session_uuid', fresh);
    return fresh;
  });

  // ── Step field groups ─────────────────────────────────────────────────────
  const STEP_FIELDS: Record<number, (keyof CitizenProfileInput)[]> = {
    1: ['age', 'gender', 'state'],
    2: ['occupation', 'income_bracket'],
    3: ['social_category'],
  };

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const onSubmit = async (data: CitizenProfileInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    const result = await saveProfile(sessionUuid, data);
    if (result.success) {
      router.push(`/citizen/dashboard/${result.sessionUuid}`);
    } else {
      setSubmitError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg mx-auto">
      {/* ── Step 1: Personal Info ─────────────────────────────────────────── */}
      {step === 1 && (
        <WizardStep
          stepNumber={1}
          totalSteps={3}
          title="Personal Information"
          onNext={handleNext}
        >
          {/* Age */}
          <div>
            <FieldLabel>Age</FieldLabel>
            <input
              type="number"
              min={1}
              max={120}
              className={inputClass}
              placeholder="e.g. 22"
              {...register('age', { valueAsNumber: true })}
            />
            <FieldError message={errors.age?.message} />
          </div>

          {/* Gender */}
          <div>
            <FieldLabel>Gender</FieldLabel>
            <select className={selectClass} {...register('gender')}>
              <option value="">Select gender…</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <FieldError message={errors.gender?.message} />
          </div>

          {/* State */}
          <div>
            <FieldLabel>State / UT</FieldLabel>
            <select className={selectClass} {...register('state')}>
              <option value="">Select state…</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <FieldError message={errors.state?.message} />
          </div>
        </WizardStep>
      )}

      {/* ── Step 2: Economic Info ─────────────────────────────────────────── */}
      {step === 2 && (
        <WizardStep
          stepNumber={2}
          totalSteps={3}
          title="Occupation & Income"
          onNext={handleNext}
          onBack={handleBack}
        >
          {/* Occupation */}
          <div>
            <FieldLabel>Occupation</FieldLabel>
            <select className={selectClass} {...register('occupation')}>
              <option value="">Select occupation…</option>
              {OCCUPATIONS.map((o) => (
                <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
              ))}
            </select>
            <FieldError message={errors.occupation?.message} />
          </div>

          {/* Income bracket */}
          <div>
            <FieldLabel>Annual Family Income</FieldLabel>
            <select className={selectClass} {...register('income_bracket')}>
              <option value="">Select income bracket…</option>
              {INCOME_BRACKETS.map((b) => (
                <option key={b} value={b}>₹{b} per year</option>
              ))}
            </select>
            <FieldError message={errors.income_bracket?.message} />
          </div>
        </WizardStep>
      )}

      {/* ── Step 3: Social Category + Review ─────────────────────────────── */}
      {step === 3 && (
        <WizardStep
          stepNumber={3}
          totalSteps={3}
          title="Social Category"
          onBack={handleBack}
          isLastStep
          isSubmitting={isSubmitting}
        >
          {/* Social category */}
          <div>
            <FieldLabel>Social Category</FieldLabel>
            <select className={selectClass} {...register('social_category')}>
              <option value="">Select category…</option>
              {SOCIAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <FieldError message={errors.social_category?.message} />
          </div>

          <p className="text-xs text-zinc-500 font-mono">
            This information is used only to match you with relevant government schemes.
            Your profile is stored anonymously.
          </p>

          {submitError && (
            <div className="border border-red-800 bg-red-950/30 px-4 py-3">
              <p className="text-sm text-red-400 font-mono">{submitError}</p>
            </div>
          )}
        </WizardStep>
      )}
    </form>
  );
}
