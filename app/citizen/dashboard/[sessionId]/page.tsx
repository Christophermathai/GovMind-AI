import { redirect } from 'next/navigation';
import { checkEligibility } from '@/app/actions/checkEligibility';
import { ResultsShell } from '@/components/citizen/ResultsShell';

export const metadata = {
  title: 'Your Schemes — GovMind AI',
  description: 'Government schemes and benefits matched to your citizen profile.',
};

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  // params is a Promise in Next.js 16 (per route.md docs)
  const { sessionId } = await params;

  const result = await checkEligibility(sessionId);

  if (!result.success) {
    // Profile not found — redirect back to wizard
    redirect('/citizen');
  }

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full gap-6">
      {/* Header */}
      <section className="flex flex-col gap-1 pt-8">
        <h2 className="font-sans text-3xl font-bold tracking-tight text-white">
          Your Matched Schemes
        </h2>
        <p className="text-zinc-400 text-sm font-sans max-w-2xl">
          Based on your profile — {result.profile.age} years old, {result.profile.state},{' '}
          {result.profile.occupation}, {result.profile.social_category}. Switch to{' '}
          <span className="text-accent font-medium">Ask AI</span> to ask free-form questions about
          any scheme or right.
        </p>
      </section>

      {/* Results shell with Dashboard + Chat modes */}
      <section className="w-full">
        <ResultsShell results={result.results} profile={result.profile as Parameters<typeof ResultsShell>[0]['profile']} />
      </section>
    </div>
  );
}
