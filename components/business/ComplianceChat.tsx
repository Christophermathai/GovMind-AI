"use client";

import { BentoCard } from "@/components/ui/BentoCard";
import { useState, useRef, useEffect } from "react";
import { Send, Terminal } from "lucide-react";
import { chatWithAssistant } from "@/app/business/actions";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ComplianceChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'SYSTEM INITIALIZED. Compliance Assistant ready. Query specific regulations or checklist items for clarification.' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const query = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setIsLoading(true);

    try {
      const res: any = await chatWithAssistant(query);
      setMessages(prev => [...prev, { role: 'assistant', content: res.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'SYSTEM ERROR: Unable to process query.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BentoCard title="AI Intelligence Link" className="h-full">
      <div className="flex flex-col h-full gap-4">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 font-mono text-sm scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'text-zinc-300' : 'text-accent'}`}>
              <div className="shrink-0 mt-0.5 font-bold">
                {msg.role === 'user' ? 'USR>' : 'SYS>'}
              </div>
              <div className="leading-relaxed">
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 text-accent animate-pulse">
              <div className="shrink-0 mt-0.5 font-bold">SYS&gt;</div>
              <div>PROCESSING QUERY...</div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="relative mt-auto pt-4 border-t border-zinc-800">
          <Terminal className="absolute left-3 top-7 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type your query..."
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-50 font-mono text-sm py-3 pl-10 pr-12 focus:outline-none focus:border-accent disabled:opacity-50"
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
