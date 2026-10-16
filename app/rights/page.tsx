"use client";

import { useState, useEffect } from "react";
import { ContractAnalysis } from "@/lib/schemas/contractAnalysis";
import { ContractUploader } from "@/components/rights/ContractUploader";
import { RiskScoreBanner } from "@/components/rights/RiskScoreBanner";
import { ClauseList } from "@/components/rights/ClauseList";
import { ContractChat } from "@/components/rights/ContractChat";
import { Scale } from "lucide-react";

export default function RightsAndContractsPage() {
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [sessionUuid, setSessionUuid] = useState<string>("");
  const [chatPrefillQuery, setChatPrefillQuery] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Generate or retrieve persistent session UUID
    const stored = localStorage.getItem("govmind_session_uuid");
    if (stored) {
      setSessionUuid(stored);
    } else {
      const fresh = crypto.randomUUID();
      localStorage.setItem("govmind_session_uuid", fresh);
      setSessionUuid(fresh);
    }
  }, []);

  const handleAskAI = (queryText: string) => {
    setChatPrefillQuery(queryText);
  };

  const handleReset = () => {
    setAnalysis(null);
    setChatPrefillQuery(undefined);
  };

  return (
    <div className="flex flex-col h-full p-6 max-w-[1600px] mx-auto w-full gap-6">
      {/* Header */}
      <section className="flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <Scale size={20} className="text-accent" />
          <h2 className="font-sans text-3xl font-bold tracking-tight text-white uppercase">
            Rights &amp; Contract Intelligence
          </h2>
        </div>
        <p className="text-zinc-400 text-sm font-mono uppercase tracking-wide">
          Module 004 | Target: Citizens, Employees, Tenants, MSMEs | Statutory Auditing
        </p>
      </section>

      {/* Main Container */}
      {!analysis ? (
        <section className="flex-1 flex flex-col justify-center py-6">
          <ContractUploader
            sessionUuid={sessionUuid || "00000000-0000-0000-0000-000000000000"}
            onAnalysisLoaded={(res) => setAnalysis(res)}
          />
        </section>
      ) : (
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          {/* Top Risk Gauge Banner */}
          <section className="shrink-0">
            <RiskScoreBanner analysis={analysis} onReset={handleReset} />
          </section>

          {/* Split-Screen Console */}
          <section className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
            {/* Left Pane: Filterable Clauses (7 cols) */}
            <div className="lg:col-span-7 h-full overflow-hidden flex flex-col border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4 shrink-0">
                <span className="font-sans font-bold text-base text-zinc-100">
                  Extracted Clauses &amp; Legal Implications
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  {analysis.clauses.length} Clauses Identified
                </span>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                <ClauseList
                  clauses={analysis.clauses}
                  missingProtections={analysis.missing_protections}
                  onAskAI={handleAskAI}
                />
              </div>
            </div>

            {/* Right Pane: AI Contract Counsel (5 cols) */}
            <div className="lg:col-span-5 h-full overflow-hidden flex flex-col">
              <ContractChat
                analysis={analysis}
                prefillQuery={chatPrefillQuery}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
