"use server";

import { supabaseServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleTaskStatus(taskId: string, currentStatus: string) {
  const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
  
  const { error } = await supabaseServer
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

import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { buildBusinessSystemPrompt } from '@/lib/prompts/businessSystemPrompt';

export async function chatWithAssistant(query: string) {
  try {
    // 1. Fetch business profile details from database
    const { data: profile } = await supabaseServer
      .from('compliance_profiles')
      .select('*')
      .limit(1)
      .single();

    const businessName = profile?.business_name || 'GovMind Demo Corp';
    const industry = profile?.industry || 'Technology / SaaS';

    // 2. Call python embedding service to get text embedding
    let retrievedContext = '';
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';
      const embedRes = await fetch(`${pythonServiceUrl}/embed-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query })
      });
      
      if (embedRes.ok) {
        const { embedding } = await embedRes.json();
        
        // 3. Query Supabase vector store for matching document chunks
        const { data: documents, error: matchError } = await supabaseServer.rpc('match_documents', {
          query_embedding: embedding,
          match_threshold: 0.4, // slightly lower threshold to find more relevant rules
          match_count: 3,
        });

        if (!matchError && documents && documents.length > 0) {
          retrievedContext = '\n\nRELEVANT DOCUMENT CONTEXT:\n' +
            documents.map((r: any, i: number) => `[${i + 1}] ${r.content}`).join('\n\n');
        }
      }
    } catch (retrieveError) {
      console.warn('[business-chat] Retrieval failed, using general knowledge:', retrieveError);
    }

    // 4. Build business system prompt with profile and retrieved context
    const systemPrompt = buildBusinessSystemPrompt({ businessName, industry }) + retrievedContext;

    // 5. Query local Ollama model
    const ollamaCompat = createOpenAI({
      baseURL: (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434') + '/v1',
      apiKey: 'ollama',
    });

    const { text } = await generateText({
      model: ollamaCompat('phi4-mini'),
      system: systemPrompt,
      prompt: query,
      maxOutputTokens: 1024,
    });

    return { response: text };
  } catch (error: any) {
    console.error('[business-chat] Error:', error);
    return {
      response: `SYSTEM ERROR: Unable to process compliance query. (${error.message || 'Unknown error'})`
    };
  }
}
