import { z } from 'zod';

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const;

export const OCCUPATIONS = [
  'student', 'employed', 'self-employed', 'farmer', 'unemployed', 'other',
] as const;

export const INCOME_BRACKETS = [
  '0-2.5L', '2.5L-5L', '5L-8L', '8L-12L', '12L+',
] as const;

export const SOCIAL_CATEGORIES = [
  'General', 'OBC', 'SC', 'ST', 'EWS',
] as const;

export const GENDERS = ['Male', 'Female', 'Other'] as const;

// ─── Income bracket ordering for rule engine comparisons ───────────────────
export const INCOME_BRACKET_ORDER: Record<string, number> = {
  '0-2.5L': 0,
  '2.5L-5L': 1,
  '5L-8L': 2,
  '8L-12L': 3,
  '12L+': 4,
};

// ─── Zod schema ────────────────────────────────────────────────────────────
export const citizenProfileSchema = z.object({
  age: z
    .number({ error: 'Age must be a number' })
    .int('Age must be a whole number')
    .min(1, 'Age must be at least 1')
    .max(120, 'Age must be 120 or under'),
  gender: z.enum(GENDERS, { error: 'Gender is required' }),
  state: z.enum(INDIAN_STATES, { error: 'State is required' }),
  occupation: z.enum(OCCUPATIONS, { error: 'Occupation is required' }),
  income_bracket: z.enum(INCOME_BRACKETS, { error: 'Income bracket is required' }),
  social_category: z.enum(SOCIAL_CATEGORIES, { error: 'Social category is required' }),
});

export type CitizenProfileInput = z.infer<typeof citizenProfileSchema>;
