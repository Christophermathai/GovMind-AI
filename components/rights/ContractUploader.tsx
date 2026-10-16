"use client";

import { useState } from "react";
import { BentoCard } from "@/components/ui/BentoCard";
import { FileText, Upload, Briefcase, Home, ShieldAlert, Sparkles } from "lucide-react";
import { loadSampleContract, analyzeCustomContract } from "@/app/rights/actions";
import { ContractAnalysis } from "@/lib/schemas/contractAnalysis";
import { SAMPLE_CONTRACTS } from "@/lib/fixtures/sampleContracts";

interface ContractUploaderProps {
  onAnalysisLoaded: (analysis: ContractAnalysis) => void;
  sessionUuid: string;
}

export function ContractUploader({ onAnalysisLoaded, sessionUuid }: ContractUploaderProps) {
  const [activeTab, setActiveTab] = useState<'samples' | 'custom'>('samples');
  const [customText, setCustomText] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectSample = async (key: 'employment' | 'tenancy') => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await loadSampleContract(key, sessionUuid);
      if (res.success && res.data) {
        onAnalysisLoaded(res.data);
      } else {
        setErrorMsg(res.error || 'Failed to load sample contract.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading sample.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const text = await file.text();
      const filename = file.name;
      const res = await analyzeCustomContract(text, filename, sessionUuid);
      if (res.success && res.data) {
        onAnalysisLoaded(res.data);
      } else {
        setErrorMsg(res.error || 'Analysis failed. Please paste text directly if file format is unsupported.');
      }
    } catch (err: any) {
      setErrorMsg('Could not read file text. Please try pasting raw contract text.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const filename = documentTitle.trim() || 'Uploaded Legal Agreement';
      const res = await analyzeCustomContract(customText, filename, sessionUuid);
      if (res.success && res.data) {
        onAnalysisLoaded(res.data);
      } else {
        setErrorMsg(res.error || 'Failed to analyze text.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Mode Selector Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('samples')}
          className={`flex items-center gap-2 px-6 py-3 font-mono text-xs uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'samples'
              ? 'border-accent text-white font-bold bg-zinc-900/50'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles size={14} className={activeTab === 'samples' ? 'text-accent' : ''} />
          Pre-Loaded Real World Agreements
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`flex items-center gap-2 px-6 py-3 font-mono text-xs uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'custom'
              ? 'border-accent text-white font-bold bg-zinc-900/50'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Upload size={14} className={activeTab === 'custom' ? 'text-accent' : ''} />
          Upload or Paste Agreement
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 border border-red-800 bg-red-950/30 text-red-300 font-mono text-xs flex items-center gap-2">
          <ShieldAlert size={16} className="text-red-400 shrink-0" />
          {errorMsg}
        </div>
      )}

      {loading && (
        <div className="p-12 border border-zinc-800 bg-zinc-950 text-center font-mono text-sm text-accent animate-pulse flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          AUDITING CONTRACT CLAUSES &amp; STATUTORY CODES...
        </div>
      )}

      {!loading && activeTab === 'samples' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sample 1: Tech Employment */}
          <div className="border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between hover:border-zinc-700 transition-all group">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-mono text-xs text-zinc-400 uppercase">
                  <Briefcase size={14} className="text-accent" />
                  Employment Agreement
                </span>
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 border border-red-800 bg-red-950/40 text-red-300">
                  {SAMPLE_CONTRACTS.employment.badge}
                </span>
              </div>

              <h3 className="font-sans font-bold text-lg text-white group-hover:text-accent transition-colors">
                {SAMPLE_CONTRACTS.employment.name}
              </h3>

              <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                {SAMPLE_CONTRACTS.employment.description}
              </p>

              <div className="p-3 bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono text-zinc-400 space-y-1">
                <div>&bull; 1-Year Non-Compete (Void under Contract Act §27)</div>
                <div>&bull; 90-Day Employee Notice vs 0-Day Employer Exit</div>
                <div>&bull; Universal 24/7 Code &amp; Side-Project Assignment</div>
              </div>
            </div>

            <button
              onClick={() => handleSelectSample('employment')}
              className="mt-6 w-full py-2.5 font-mono text-xs uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-accent text-white transition-colors"
            >
              Audit Employment Contract &rarr;
            </button>
          </div>

          {/* Sample 2: Residential Lease */}
          <div className="border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between hover:border-zinc-700 transition-all group">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-mono text-xs text-zinc-400 uppercase">
                  <Home size={14} className="text-accent" />
                  Tenancy Agreement
                </span>
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 border border-red-800 bg-red-950/40 text-red-300">
                  {SAMPLE_CONTRACTS.tenancy.badge}
                </span>
              </div>

              <h3 className="font-sans font-bold text-lg text-white group-hover:text-accent transition-colors">
                {SAMPLE_CONTRACTS.tenancy.name}
              </h3>

              <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                {SAMPLE_CONTRACTS.tenancy.description}
              </p>

              <div className="p-3 bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono text-zinc-400 space-y-1">
                <div>&bull; 10-Month Deposit Demand (Model Tenancy Cap: 2 Months)</div>
                <div>&bull; Auto-Renewal with 10% Mandatory Rent Jump</div>
                <div>&bull; Forfeiture of Full Deposit + Remainder Rent on Early Move</div>
              </div>
            </div>

            <button
              onClick={() => handleSelectSample('tenancy')}
              className="mt-6 w-full py-2.5 font-mono text-xs uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-accent text-white transition-colors"
            >
              Audit Tenancy Agreement &rarr;
            </button>
          </div>
        </div>
      )}

      {!loading && activeTab === 'custom' && (
        <div className="border border-zinc-800 bg-zinc-950 p-6 flex flex-col gap-6">
          {/* File input */}
          <div className="border border-dashed border-zinc-700 hover:border-accent p-8 text-center flex flex-col items-center justify-center gap-3 transition-colors bg-zinc-900/20 cursor-pointer relative">
            <Upload size={24} className="text-zinc-500" />
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-zinc-200 uppercase tracking-wider">
                Upload Contract Document (.txt / unencrypted text)
              </span>
              <span className="font-mono text-[11px] text-zinc-500">
                Processed locally. No documents leave your machine.
              </span>
            </div>
            <input
              type="file"
              accept=".txt,.md,.pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-800"></div>
            <span className="font-mono text-xs text-zinc-500 uppercase">Or Paste Contract Text</span>
            <div className="flex-1 h-px bg-zinc-800"></div>
          </div>

          <form onSubmit={handleAnalyzeText} className="flex flex-col gap-4">
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="Agreement Title (e.g., Consultant Agreement, Mumbai Apartment Lease)"
              className="bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono text-xs p-3 focus:outline-none focus:border-accent"
            />

            <textarea
              rows={8}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste contract clauses or full agreement text here..."
              className="bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono text-xs p-3 focus:outline-none focus:border-accent resize-none leading-relaxed"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!customText.trim()}
                className="px-6 py-2.5 font-mono text-xs uppercase tracking-wider bg-accent text-black font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Analyze Agreement &rarr;
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
