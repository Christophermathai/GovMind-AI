"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function toggleTaskStatus(taskId: string, currentStatus: string) {
  const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
  
  const { error } = await supabase
    .from('compliance_tasks')
    .update({ status: newStatus })
    .eq('id', taskId);
    
  if (error) {
    console.error("Error toggling task:", error);
    throw new Error("Failed to update task status");
  }
  
  revalidatePath('/business');
  return { success: true };
}

export async function chatWithAssistant(query: string) {
  // In reality, this would hit the Python ingestion service or Next.js API route
  // that uses match_documents to find relevant chunks. For now, simulate the RAG response.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        response: `SYSTEM RESPONSE: Based on the Government Knowledge Engine, the query regarding "${query}" requires adherence to section 4(b) of the MSME compliance framework. Ensure relevant filings are updated within 30 days.`
      });
    }, 1500);
  });
}
