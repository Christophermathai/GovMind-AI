"use client";

import { Search, Loader2 } from "lucide-react";
import { useState } from "react";

export function Omnibar() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    // Simulate network request for now
    setTimeout(() => {
      setIsSearching(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSearch} className="w-full relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {isSearching ? (
          <Loader2 className="h-6 w-6 text-accent animate-spin" />
        ) : (
          <Search className="h-6 w-6 text-zinc-500" />
        )}
      </div>
      <input
        type="text"
        className="w-full block pl-14 pr-4 py-6 bg-zinc-900 border border-zinc-800 text-zinc-50 font-sans text-xl placeholder-zinc-600 focus:outline-none focus:border-accent transition-colors shadow-xl"
        placeholder="Query Government Knowledge Engine..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 border border-zinc-800 bg-zinc-950 text-xs text-zinc-500 font-mono">
          <span className="text-xs">↵</span> ENTER
        </kbd>
      </div>
    </form>
  );
}
