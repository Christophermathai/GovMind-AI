import { ComplianceChecklist } from "@/components/business/ComplianceChecklist";
import { ComplianceChat } from "@/components/business/ComplianceChat";
import { createClient } from "@supabase/supabase-js";

// Force dynamic rendering since we fetch from DB
export const dynamic = 'force-dynamic';

export default async function BusinessCompliancePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch all tasks directly
  const { data: tasks, error } = await supabase
    .from('compliance_tasks')
    .select('*')
    .order('created_at', { ascending: false });

  const complianceTasks = tasks || [];

  return (
    <div className="flex flex-col h-full p-6 max-w-[1600px] mx-auto w-full gap-6">
      
      {/* Header */}
      <section className="flex flex-col gap-2 shrink-0">
        <h2 className="font-sans text-3xl font-bold tracking-tight text-white uppercase">
          Business Compliance
        </h2>
        <p className="text-zinc-400 text-sm font-mono uppercase tracking-wide">
          Target: MSME / Retail Sector | Status: Audit Mode
        </p>
      </section>

      {/* Main Split Interface */}
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        
        {/* Left Pane: Checklist */}
        <div className="h-full overflow-hidden flex flex-col">
          <ComplianceChecklist tasks={complianceTasks} />
        </div>

        {/* Right Pane: AI Assistant */}
        <div className="h-full overflow-hidden flex flex-col">
          <ComplianceChat />
        </div>

      </section>
    </div>
  );
}
