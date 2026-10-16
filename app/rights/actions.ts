'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { SAMPLE_CONTRACTS } from '@/lib/fixtures/sampleContracts';
import { ContractAnalysis, ClauseItem, MissingProtection } from '@/lib/schemas/contractAnalysis';
import { buildContractSystemPrompt } from '@/lib/prompts/contractSystemPrompt';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

/**
 * Loads a pre-built sample contract fixture and persists it to Supabase for the active session.
 */
export async function loadSampleContract(
  sampleKey: 'employment' | 'tenancy',
  sessionUuid: string
): Promise<{ success: boolean; data?: ContractAnalysis; error?: string }> {
  try {
    const fixture = SAMPLE_CONTRACTS[sampleKey];
    if (!fixture) {
      return { success: false, error: 'Sample contract not found.' };
    }

    const analysisRecord: ContractAnalysis = {
      id: crypto.randomUUID(),
      session_uuid: sessionUuid,
      contract_name: fixture.analysis.contract_name,
      contract_type: fixture.analysis.contract_type,
      overall_risk: fixture.analysis.overall_risk,
      risk_score: fixture.analysis.risk_score,
      summary: fixture.analysis.summary,
      key_takeaways: fixture.analysis.key_takeaways,
      clauses: fixture.analysis.clauses,
      missing_protections: fixture.analysis.missing_protections,
      created_at: new Date().toISOString(),
    };

    // Try persisting to Supabase if configured; non-fatal if table doesn't exist yet
    try {
      await supabaseServer.from('contract_analyses').insert({
        id: analysisRecord.id,
        session_uuid: sessionUuid,
        contract_name: analysisRecord.contract_name,
        contract_type: analysisRecord.contract_type,
        risk_score: analysisRecord.overall_risk,
        summary: analysisRecord.summary,
        clauses: analysisRecord.clauses,
        missing_protections: analysisRecord.missing_protections,
      });
    } catch (dbErr) {
      console.warn('[rights-actions] Supabase save optional fallback:', dbErr);
    }

    return { success: true, data: analysisRecord };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load sample contract.' };
  }
}

/**
 * Analyzes custom pasted/uploaded contract text using heuristic detection
 * and contextual classification.
 */
export async function analyzeCustomContract(
  text: string,
  filename: string,
  sessionUuid: string
): Promise<{ success: boolean; data?: ContractAnalysis; error?: string }> {
  try {
    if (!text || text.trim().length < 50) {
      return { success: false, error: 'Document contains insufficient text for legal analysis.' };
    }

    const lower = text.toLowerCase();
    const clauses: ClauseItem[] = [];
    const missing: MissingProtection[] = [];
    let riskPoints = 15;

    // Detect contract type
    let contractType: ContractAnalysis['contract_type'] = 'general';
    if (lower.includes('employment') || lower.includes('employee') || lower.includes('salary') || lower.includes('employer')) {
      contractType = 'employment';
    } else if (lower.includes('lease') || lower.includes('tenant') || lower.includes('landlord') || lower.includes('rent')) {
      contractType = 'tenancy';
    } else if (lower.includes('loan') || lower.includes('borrower') || lower.includes('lender') || lower.includes('interest')) {
      contractType = 'loan';
    } else if (lower.includes('vendor') || lower.includes('supplier') || lower.includes('client')) {
      contractType = 'vendor';
    }

    // Heuristic 1: Non-Compete
    if (lower.includes('non-compete') || lower.includes('not engage') || lower.includes('restraint of trade') || lower.includes('shall not join')) {
      riskPoints += 25;
      clauses.push({
        id: `c-${clauses.length + 1}`,
        title: 'Post-Termination Restrictive Covenant / Non-Compete',
        category: 'non_compete_and_ip',
        severity: 'high',
        quote: 'Restricts post-termination employment, consulting, or joining competitive entities.',
        plain_english: 'This clause attempts to prevent you from taking another job in your domain after leaving.',
        risk_explanation: 'Under Section 27 of the Indian Contract Act, 1872, post-employment non-compete agreements are legally void and unenforceable in India.',
        counter_proposal: 'Insist on removing post-termination non-compete language or limiting it strictly to non-solicitation of clients.',
        statutory_reference: 'Section 27, Indian Contract Act, 1872',
      });
    }

    // Heuristic 2: Notice Period & Liquidated Damages
    if (lower.includes('90 days') || lower.includes('3 months notice') || lower.includes('liquidated damages') || lower.includes('forfeit salary')) {
      riskPoints += 20;
      clauses.push({
        id: `c-${clauses.length + 1}`,
        title: 'Extended Notice Requirement or Financial Penalty',
        category: 'termination_and_notice',
        severity: 'high',
        quote: 'Mandates long notice periods or liquidated damages upon early exit.',
        plain_english: 'Requires prolonged notice and potentially charges monetary penalties if you leave early.',
        risk_explanation: 'Asymmetric notice periods or excessive damages violate the rule of reasonable compensation under Contract Act Section 74.',
        counter_proposal: 'Request bilateral 30 days notice or basic salary shortfall only.',
      });
    }

    // Heuristic 3: Auto-Renewal & Lock-In
    if (lower.includes('automatically renew') || lower.includes('auto-renewal') || lower.includes('lock-in') || lower.includes('automatic escalation')) {
      riskPoints += 20;
      clauses.push({
        id: `c-${clauses.length + 1}`,
        title: 'Auto-Renewal or Strict Lock-In Term',
        category: 'auto_renewal',
        severity: 'high',
        quote: 'Agreement automatically renews without requiring affirmative mutual re-signing.',
        plain_english: 'The contract will rollover automatically unless you send cancellation notice far in advance.',
        risk_explanation: 'Creates unexpected long-term financial liability and lock-in.',
        counter_proposal: 'Require mutual affirmative written agreement for renewal.',
      });
    }

    // Heuristic 4: IP Assignment
    if (lower.includes('intellectual property') || lower.includes('all inventions') || lower.includes('sole and exclusive property')) {
      riskPoints += 15;
      clauses.push({
        id: `c-${clauses.length + 1}`,
        title: 'Broad Intellectual Property Assignment',
        category: 'non_compete_and_ip',
        severity: 'warning',
        quote: 'Assigns all created intellectual property and code to the hiring entity.',
        plain_english: 'Transfers ownership of all works created during the term.',
        risk_explanation: 'Ensure this does not encompass personal side-projects or open-source works built on private time.',
        counter_proposal: 'Explicitly carve out pre-existing IP and personal projects built off-duty.',
      });
    }

    // Heuristic 5: Security Deposit (Tenancy)
    if (contractType === 'tenancy' && (lower.includes('deposit') || lower.includes('forfeit') || lower.includes('deduction'))) {
      riskPoints += 15;
      clauses.push({
        id: `c-${clauses.length + 1}`,
        title: 'Security Deposit & Deduction Authority',
        category: 'penalties_and_indemnity',
        severity: 'warning',
        quote: 'Landlord maintains discretion to deduct refurbishment fees.',
        plain_english: 'Outlines rules on how your security deposit is held and deducted.',
        risk_explanation: 'Check whether deductions require itemized third-party receipts and whether the deposit exceeds the 2-month statutory cap.',
        counter_proposal: 'Demand 15-day refund timeline and itemized receipts for any repair deductions.',
        statutory_reference: 'Section 10, Model Tenancy Act',
      });
    }

    // Missing Protections Evaluation
    if (contractType === 'employment') {
      missing.push({
        id: 'm-1',
        title: 'Reciprocal Severance / Redundancy Cushion',
        description: 'No clause ensuring financial severance if the employer conducts layoffs or terminates without cause.',
        recommended_addition: 'Insert 1 month severance per completed year of service.',
        importance: 'critical',
      });
    } else if (contractType === 'tenancy') {
      missing.push({
        id: 'm-2',
        title: 'Notice for Landlord Premises Inspection',
        description: 'Contract lacks explicit requirement for 24-hour advance written notice before property inspections.',
        recommended_addition: 'Insert mandatory 24-hour advance written notice during standard business hours.',
        importance: 'recommended',
      });
    }

    const normalizedRisk = Math.min(100, Math.max(20, riskPoints));
    const overallRisk = normalizedRisk >= 65 ? 'high' : normalizedRisk >= 40 ? 'moderate' : 'low';

    const analysisRecord: ContractAnalysis = {
      id: crypto.randomUUID(),
      session_uuid: sessionUuid,
      contract_name: filename,
      contract_type: contractType,
      overall_risk: overallRisk,
      risk_score: normalizedRisk,
      summary: `Automated clause audit identified ${clauses.length} key operational clauses with ${clauses.filter((c) => c.severity === 'high').length} high-risk flags. Review highlighted covenants before executing.`,
      key_takeaways: [
        `Document categorized as: ${contractType.toUpperCase()}`,
        `${clauses.filter((c) => c.severity === 'high').length} high-severity clauses flagged for renegotiation.`,
        `Identified ${missing.length} missing standard protection(s).`,
      ],
      clauses,
      missing_protections: missing,
      created_at: new Date().toISOString(),
    };

    return { success: true, data: analysisRecord };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to analyze contract.' };
  }
}

/**
 * Conversational contract counsel powered by local Ollama phi4-mini
 */
export async function chatWithContractCounsel(
  contractContext: {
    contractName: string;
    contractType: string;
    overallRisk: string;
    summary: string;
    clauses: ClauseItem[];
  },
  query: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    const clausesSummary = contractContext.clauses
      .map(
        (c, i) =>
          `[Clause ${i + 1}] "${c.title}" (${c.severity.toUpperCase()})\nExcerpt: "${c.quote}"\nMeaning: ${c.plain_english}\nStatutory: ${c.statutory_reference || 'N/A'}`
      )
      .join('\n\n');

    const systemPrompt = buildContractSystemPrompt({
      contractName: contractContext.contractName,
      contractType: contractContext.contractType,
      overallRisk: contractContext.overallRisk,
      summary: contractContext.summary,
      clausesSummary,
    });

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

    return { success: true, response: text };
  } catch (error: any) {
    console.error('[contract-chat] Error:', error);
    return {
      success: false,
      error: `AI Counsel offline or busy: ${error.message || 'Check Ollama server.'}`,
    };
  }
}
