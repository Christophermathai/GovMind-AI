"use client";

import { BentoCard } from "@/components/ui/BentoCard";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";
import { useTransition } from "react";
import { toggleTaskStatus } from "@/app/business/actions";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
}

interface ComplianceChecklistProps {
  tasks: Task[];
}

export function ComplianceChecklist({ tasks }: ComplianceChecklistProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (taskId: string, status: string) => {
    startTransition(() => {
      toggleTaskStatus(taskId, status);
    });
  };

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <BentoCard title="Compliance Directives" className="h-full">
      <div className="flex flex-col gap-6 h-full">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex flex-col gap-1 w-full mr-6">
            <span className="font-sans text-sm text-zinc-300">Overall Readiness</span>
            <div className="w-full bg-zinc-900 h-2 border border-zinc-800 mt-1">
              <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <span className="font-mono text-xl font-bold text-accent">{progress}%</span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-zinc-500">
              <AlertCircle size={24} />
              <span className="font-mono text-sm">NO DIRECTIVES FOUND IN DATABASE</span>
            </div>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id}
                className={`p-4 border ${task.status === 'completed' ? 'border-zinc-800 bg-zinc-950/50 opacity-60' : 'border-zinc-700 bg-zinc-900'} transition-all`}
              >
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => handleToggle(task.id, task.status)}
                    disabled={isPending}
                    className="mt-0.5 shrink-0 hover:text-accent transition-colors disabled:opacity-50"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <Circle className="text-zinc-500" size={20} />
                    )}
                  </button>
                  <div className="flex flex-col gap-1">
                    <span className={`font-sans text-sm font-semibold ${task.status === 'completed' ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                      {task.title}
                    </span>
                    <span className="font-mono text-xs text-zinc-500 leading-relaxed">
                      {task.description}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </BentoCard>
  );
}
