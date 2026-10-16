import { z } from 'zod';

export const RiskSeveritySchema = z.enum(['high', 'warning', 'standard', 'missing']);
export type RiskSeverity = z.infer<typeof RiskSeveritySchema>;

export const ClauseCategorySchema = z.enum([
  'termination_and_notice',
  'auto_renewal',
  'non_compete_and_ip',
  'penalties_and_indemnity',
  'dispute_resolution',
  'general',
]);
export type ClauseCategory = z.infer<typeof ClauseCategorySchema>;

export const ClauseItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: ClauseCategorySchema,
  severity: RiskSeveritySchema,
  quote: z.string(),
  plain_english: z.string(),
  risk_explanation: z.string(),
  counter_proposal: z.string().optional(),
  statutory_reference: z.string().optional(),
});
export type ClauseItem = z.infer<typeof ClauseItemSchema>;

export const MissingProtectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  recommended_addition: z.string(),
  importance: z.enum(['critical', 'recommended']),
});
export type MissingProtection = z.infer<typeof MissingProtectionSchema>;

export const ContractTypeSchema = z.enum(['employment', 'tenancy', 'loan', 'vendor', 'general']);
export type ContractType = z.infer<typeof ContractTypeSchema>;

export const ContractAnalysisSchema = z.object({
  id: z.string().uuid().optional(),
  session_uuid: z.string(),
  contract_name: z.string().min(1),
  contract_type: ContractTypeSchema,
  overall_risk: z.enum(['high', 'moderate', 'low']),
  risk_score: z.number().min(0).max(100),
  summary: z.string(),
  key_takeaways: z.array(z.string()),
  clauses: z.array(ClauseItemSchema),
  missing_protections: z.array(MissingProtectionSchema),
  created_at: z.string().optional(),
});
export type ContractAnalysis = z.infer<typeof ContractAnalysisSchema>;
