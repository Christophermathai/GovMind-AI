import { ReactNode } from "react";

interface BentoCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function BentoCard({ title, children, className = "", action }: BentoCardProps) {
  return (
    <div className={`border border-zinc-800 bg-zinc-950/50 flex flex-col ${className}`}>
      <div className="border-b border-zinc-800 px-4 py-3 flex justify-between items-center bg-zinc-900">
        <h3 className="font-sans text-sm font-semibold tracking-wide uppercase text-zinc-300">
          {title}
        </h3>
        {action && <div>{action}</div>}
      </div>
      <div className="p-4 flex-1">
        {children}
      </div>
    </div>
  );
}
