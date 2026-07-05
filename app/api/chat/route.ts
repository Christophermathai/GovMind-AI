import { createOpenAI } from '@ai-sdk/openai';
import { streamText, createUIMessageStreamResponse, UI_MESSAGE_STREAM_HEADERS, convertToModelMessages } from 'ai';
import { buildCitizenSystemPrompt } from '@/lib/prompts/citizenSystemPrompt';

export const runtime = 'nodejs';

interface UIMessagePart {
  type: string;
  text?: string;
}

interface UIMessage {
  role: string;
  parts?: UIMessagePart[];
  content?: string;
}

export async function POST(req: Request) {
  try {
    const { messages, profile, schemeName } = await req.json() as {
      messages: UIMessage[];
      profile: Record<string, unknown>;
      schemeName: string | null;
    };

    if (!profile) {
      return Response.json({ error: 'Citizen profile is required' }, { status: 400 });
    }

    // Extract last user message text — v6 messages use parts[]
    const lastUserMsg = messages?.findLast((m) => m.role === 'user');
    const lastUserMessage: string =
      lastUserMsg?.parts?.find((p) => p.type === 'text')?.text ??
      lastUserMsg?.content ??
      '';

    // ── Retrieve relevant document chunks from Knowledge Engine ──────────────
    let retrievedContext = '';
    if (lastUserMessage) {
      try {
        const retrieveUrl = new URL('/api/retrieve', req.url).origin + '/api/retrieve';

        const retrieveRes = await fetch(retrieveUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: schemeName ? `${schemeName} ${lastUserMessage}` : lastUserMessage }),
        });

        if (retrieveRes.ok) {
          const { results } = await retrieveRes.json() as { results?: { content: string }[] };
          if (results && results.length > 0) {
            retrievedContext = '\n\nRELEVANT DOCUMENT CONTEXT (use this to ground your answer):\n' +
              results.map((r, i) => `[${i + 1}] ${r.content}`).join('\n\n');
          }
        }
      } catch (retrieveError) {
        // Non-fatal — proceed without RAG context
        console.warn('[chat] Retrieval failed, proceeding without document context:', retrieveError);
      }
    }

    const systemPrompt = buildCitizenSystemPrompt({ profile: profile as Parameters<typeof buildCitizenSystemPrompt>[0]['profile'], schemeName }) + retrievedContext;

    // ── Convert UIMessages → ModelMessages and stream ────────────────────────
    const modelMessages = await convertToModelMessages(messages as Parameters<typeof convertToModelMessages>[0]);

    // Ollama exposes an OpenAI-compatible API at /v1 — no key required.
    // Uses @ai-sdk/openai's createOpenAI pointed at Ollama for full AI SDK v6 compatibility.
    // Set OLLAMA_BASE_URL in .env to override (default: http://localhost:11434)
    const ollamaCompat = createOpenAI({
      baseURL: (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434') + '/v1',
      apiKey: 'ollama', // Ollama ignores the key but the SDK requires a non-empty string
    });

    const result = streamText({
      model: ollamaCompat('phi4-mini'),
      system: systemPrompt,
      messages: modelMessages,
      maxOutputTokens: 1024,
    });

    return createUIMessageStreamResponse({
      stream: result.toUIMessageStream(),
      headers: UI_MESSAGE_STREAM_HEADERS,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[chat] Error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
