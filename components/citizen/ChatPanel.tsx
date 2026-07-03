'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { Send, RotateCcw, Loader2 } from 'lucide-react';
import type { CitizenProfileInput } from '@/lib/schemas/citizenProfile';

interface ChatPanelProps {
  profile: CitizenProfileInput & { state: string };
  preSeededScheme: string | null;
}

export function ChatPanel({ profile, preSeededScheme }: ChatPanelProps) {
  const prevSchemeRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { profile, schemeName: preSeededScheme },
    }),
    onError: () => setHasError(true),
  });

  // Auto-seed message when a scheme is selected from Dashboard
  useEffect(() => {
    if (preSeededScheme && preSeededScheme !== prevSchemeRef.current) {
      prevSchemeRef.current = preSeededScheme;
      sendMessage({ parts: [{ type: 'text', text: `Tell me about the ${preSeededScheme} scheme and whether I'm eligible.` }] });
    }
  }, [preSeededScheme, sendMessage]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setHasError(false);
    sendMessage({ parts: [{ type: 'text', text: input }] });
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Welcome prompt when no messages */}
        {messages.length === 0 && !preSeededScheme && (
          <div className="flex flex-col gap-3 pt-8 items-center text-center">
            <p className="font-sans text-zinc-300 text-sm font-medium">
              Ask me anything about government schemes, rights, or benefits.
            </p>
            <p className="text-xs text-zinc-500 font-mono max-w-sm">
              Your profile is already loaded — I can personalise answers based on your age, state, occupation, income, and category.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-left w-full max-w-lg">
              {[
                'What scholarships can I apply for?',
                'How do I apply for skill development programs?',
                'What housing schemes am I eligible for?',
                'Explain PM-KISAN eligibility in detail',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage({ parts: [{ type: 'text', text: suggestion }] })}
                  className="text-left px-3 py-2 border border-zinc-800 hover:border-zinc-600 text-xs text-zinc-400 hover:text-zinc-200 font-sans transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((message) => {
          const isUser = message.role === 'user';
          const textPart = message.parts?.find((p: { type: string }) => p.type === 'text') as { type: 'text'; text: string } | undefined;
          const text = textPart?.text ?? '';

          return (
            <div
              key={message.id}
              className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
            >
              <span className="text-xs font-mono text-zinc-600 px-1">
                {isUser ? 'You' : 'GovMind AI'}
              </span>
              <div
                className={`max-w-[85%] px-4 py-3 text-sm font-sans leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                    : 'bg-zinc-950 text-zinc-300 border border-zinc-800'
                }`}
              >
                {text}
              </div>
            </div>
          );
        })}

        {/* Streaming indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono px-1">
            <Loader2 size={12} className="animate-spin" />
            GovMind AI is thinking…
          </div>
        )}

        {/* Error state (EC-5) */}
        {hasError && (
          <div className="flex items-center gap-3 border border-red-900 bg-red-950/20 px-4 py-3">
            <p className="text-xs text-red-400 font-mono flex-1">
              Response was interrupted. You can retry or send a new message.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 shrink-0"
            >
              <RotateCcw size={12} />
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-zinc-800 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask about any government scheme or benefit…"
            className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-50 font-sans text-sm px-4 py-3 focus:outline-none focus:border-accent transition-colors placeholder-zinc-600 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 bg-accent text-white hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
