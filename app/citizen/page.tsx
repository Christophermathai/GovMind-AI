import { ProfileWizard } from '@/components/citizen/ProfileWizard';

export const metadata = {
  title: 'Citizen Intelligence — GovMind AI',
  description: 'Tell us about yourself and we\'ll match you with the government schemes you qualify for.',
};

export default function OnboardingPage() {
  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full gap-8">
      {/* Header */}
      <section className="flex flex-col gap-2 pt-8">
        <h2 className="font-sans text-3xl font-bold tracking-tight text-white">
          Citizen Intelligence
        </h2>
        <p className="text-zinc-400 max-w-2xl text-sm font-sans">
          Answer a few quick questions and GovMind AI will match you with the government schemes,
          scholarships, and benefits you&apos;re eligible for — then let you ask questions about any of them.
        </p>
      </section>

      {/* Wizard */}
      <section className="w-full">
        <div className="border border-zinc-800 bg-zinc-950/50 p-8">
          <ProfileWizard />
        </div>
      </section>
    </div>
  );
}
