"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Building2, Scale, FileText, Activity, Zap } from "lucide-react";

const NAV_ITEMS = [
  { name: "Knowledge Engine", href: "/", icon: Home },
  { name: "Citizen Intel", href: "/citizen", icon: Users },
  { name: "Business Compliance", href: "/business", icon: Building2 },
  { name: "Rights & Contracts", href: "/rights", icon: Scale },
  { name: "Form Assistant", href: "/forms", icon: FileText },
  { name: "Regulation Monitor", href: "/regulations", icon: Activity },
  { name: "Opportunity Engine", href: "/opportunities", icon: Zap },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 h-auto md:h-screen flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="font-sans text-xl uppercase tracking-wider font-bold text-zinc-50">
          GovMind <span className="text-accent">AI</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1 font-mono">v1.0.0-alpha / SYS_ONLINE</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors border border-transparent ${
                isActive 
                  ? "bg-zinc-900 border-zinc-800 text-zinc-50" 
                  : "text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900/50 hover:border-zinc-800"
              }`}
            >
              <Icon size={16} className={isActive ? "text-accent" : ""} />
              <span className="font-sans font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono tracking-widest">
          <div className="w-2 h-2 rounded-none bg-green-500 shadow-[0_0_8px_#22c55e]" />
          SYSTEM SECURE
        </div>
      </div>
    </aside>
  );
}
