import { Omnibar } from "@/components/ui/Omnibar";
import { BentoCard } from "@/components/ui/BentoCard";
import { AlertTriangle, FileText } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full gap-8">
      
      {/* Header Section */}
      <section className="flex flex-col gap-2 pt-8">
        <h2 className="font-sans text-3xl font-bold tracking-tight text-white">
          Knowledge Engine Console
        </h2>
        <p className="text-zinc-400 max-w-2xl text-sm font-sans">
          A centralized command center for querying public schemes, laws, and regulations via Retrieval-Augmented Generation. Enter your scenario to begin.
        </p>
      </section>

      {/* Omnibar Section */}
      <section className="w-full">
        <Omnibar />
      </section>

      {/* Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
        
        <BentoCard 
          title="Recent Queries" 
          className="md:col-span-2 md:row-span-2"
          action={<button className="text-xs text-accent hover:underline font-mono">View All</button>}
        >
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-300 font-sans font-medium text-sm">MSME Environmental Clearance Process</span>
                <span className="text-xs text-zinc-600 font-mono">Module: Business Compliance</span>
              </div>
              <span className="text-xs text-zinc-500 font-mono">2 mins ago</span>
            </div>
            
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-300 font-sans font-medium text-sm">Kerala Tech Startup Incentives 2024</span>
                <span className="text-xs text-zinc-600 font-mono">Module: Opportunity Engine</span>
              </div>
              <span className="text-xs text-zinc-500 font-mono">1 hr ago</span>
            </div>
            
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-300 font-sans font-medium text-sm">Notice Period Clauses in Contract</span>
                <span className="text-xs text-zinc-600 font-mono">Module: Rights & Contracts</span>
              </div>
              <span className="text-xs text-zinc-500 font-mono">Yesterday</span>
            </div>
          </div>
        </BentoCard>

        <BentoCard title="System Status">
          <div className="flex flex-col gap-4 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Database</span>
              <span className="text-xs text-green-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500"></div> Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Vector Store</span>
              <span className="text-xs text-green-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500"></div> Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Python Service</span>
              <span className="text-xs text-green-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500"></div> Online
              </span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <span className="text-sm text-zinc-400">Total Chunks</span>
              <span className="text-sm text-zinc-50">14,208</span>
            </div>
          </div>
        </BentoCard>

        <BentoCard title="Latest Regulation Alerts">
          <div className="flex flex-col gap-3 font-sans">
            <div className="p-3 border border-zinc-800 bg-zinc-900 flex items-start gap-3 hover:border-zinc-700 transition-colors cursor-pointer">
              <AlertTriangle className="text-accent shrink-0 mt-0.5" size={16} />
              <div className="flex flex-col gap-1">
                <span className="text-sm text-zinc-300">GST Circular Update 102/2024</span>
                <span className="text-xs text-zinc-500 font-mono">Affects: MSME Retailers</span>
              </div>
            </div>
            <div className="p-3 border border-zinc-800 bg-zinc-900 flex items-start gap-3 hover:border-zinc-700 transition-colors cursor-pointer">
              <FileText className="text-zinc-500 shrink-0 mt-0.5" size={16} />
              <div className="flex flex-col gap-1">
                <span className="text-sm text-zinc-300">New Maternity Benefit Rule</span>
                <span className="text-xs text-zinc-500 font-mono">Affects: All Employers</span>
              </div>
            </div>
          </div>
        </BentoCard>

      </section>
    </div>
  );
}
