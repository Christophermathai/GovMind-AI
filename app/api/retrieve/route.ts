import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Call internal Python endpoint to embed the query using the free local model
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';
    
    const embedRes = await fetch(`${pythonServiceUrl}/embed-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: query })
    });
    
    if (!embedRes.ok) {
        throw new Error('Failed to generate embedding from Python service');
    }
    
    const { embedding } = await embedRes.json();

    // Perform vector search in Supabase
    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 5,
    });

    if (error) throw error;

    return NextResponse.json({ results: documents });
  } catch (error: any) {
    console.error('Retrieval error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
