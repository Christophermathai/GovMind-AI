"use client";

import { useState, useRef, useEffect } from "react";
import { BentoCard } from "@/components/ui/BentoCard";
import { Send, Terminal, Sparkles, Scale } from "lucide-react";
import { ContractAnalysis } from "@/lib/schemas/contractAnalysis";
import { chatWithContractCounsel } from "@/app/rights/actions";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ContractChatProps {
  analysis: ContractAnalysis;
  prefillQuery?: string;
}

export function ContractChat({ analysis, prefillQuery }: ContractChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `AI CONTRACT COUNSEL INITIALIZED. Audited: "${analysis.contract_name}". Ask any question about clause interpretation, statutory rights (Contract Act §27, Tenancy Act), or negotiation strategy.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefillQuery) {
      handleDirectSend(prefillQuery);
    }
  }, [prefillQuery]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleDirectSend = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', content: queryText }]);
    setIsLoading(true);

    try {
      const res = await chatWithContractCounsel(
        {
          contractName: analysis.contract_name,
          contractType: analysis.contract_type,
          overallRisk: analysis.overall_risk,
          summary: analysis.summary,
          clauses: analysis.clauses,
        },
        queryText
      );

      if (res.success && res.response) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.response! }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.error || 'SYSTEM ERROR: Unable to process legal query.' },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `SYSTEM ERROR: ${err.message || 'Model unreachable.'}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const query = input;
    setInput("");
    await handleDirectSend(query);
  };

  const quickPrompts =
    analysis.contract_type === 'employment'
      ? [
          "Is the 1-year non-compete legally valid in India?",
          "How can I negotiate the 90-day notice period down?",
          "Can the employer claim my weekend coding projects?",
        ]
      : [
          "Is the 10-month deposit legal under the Model Tenancy Act?",
          "What happens if I break the lease before 11 months?",
          "Can the landlord enter without advance notice?",
        ];

  return (
    <BentoCard title="AI Contract Counsel" className="h-full">
      <div className="flex flex-col h-full gap-4">
        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-zinc-800">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleDirectSend(q)}
              disabled={isLoading}
              className="text-[11px] font-mono px-2 py-1 border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-accent transition-colors disabled:opacity-50 text-left"
            >
              &gt; {q}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1 font-mono text-xs scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'text-zinc-300' : 'text-zinc-100'}`}>
              <div className={`shrink-0 font-bold ${msg.role === 'user' ? 'text-zinc-500' : 'text-accent'}`}>
                {msg.role === 'user' ? 'USR>' : 'COUNSEL>'}
              </div>
              <div className="leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 text-accent animate-pulse">
              <div className="shrink-0 font-bold">COUNSEL&gt;</div>
              <div>ANALYZING CLAUSES &amp; STATUTORY CODES...</div>
            </div>
          )}
        </div>

        {/* Query Input */}
        <form onSubmit={handleSend} className="relative mt-auto pt-4 border-t border-zinc-800">
          <Terminal className="absolute left-3 top-7 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask about clauses, statutory validity, or counter-proposals..."
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono text-xs py-3 pl-10 pr-12 focus:outline-none focus:border-accent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-[22px] p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50 transition-colors"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </BentoCard>
  );
}
