import { ContractAnalysis } from '@/lib/schemas/contractAnalysis';

export interface SampleContractFixture {
  id: string;
  name: string;
  type: 'employment' | 'tenancy';
  description: string;
  badge: string;
  rawText: string;
  analysis: Omit<ContractAnalysis, 'id' | 'session_uuid' | 'created_at'>;
}

export const SAMPLE_CONTRACTS: Record<string, SampleContractFixture> = {
  employment: {
    id: 'sample-employment',
    name: 'Tech Startup Senior Software Engineer Agreement',
    type: 'employment',
    description: 'Typical startup contract containing an aggressive 1-year non-compete, 90-day employee notice lock-in, and full side-project IP claim.',
    badge: 'High Risk (4 Critical Flags)',
    rawText: `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into between Apex Cloud Systems Pvt Ltd ("Company") and the Employee.

1. POSITION AND DUTIES
The Employee shall serve as Senior Software Engineer and shall devote all business time, attention, and efforts to the Company.

2. TERMINATION AND NOTICE
(a) The Employee may terminate employment only by giving ninety (90) days prior written notice.
(b) The Company may terminate employment at any time with immediate effect without cause and without payment of any severance or garden leave.
(c) Failure by Employee to serve the full 90-day notice period shall attract liquidated damages equal to six (6) months of gross salary.

3. RESTRICTIVE COVENANTS AND NON-COMPETE
For a period of twelve (12) months following termination of employment for any reason, the Employee shall not directly or indirectly engage in, consult for, advise, or join any entity, startup, or open-source foundation operating in the field of cloud infrastructure, distributed computing, or related software worldwide.

4. INTELLECTUAL PROPERTY AND ASSIGNMENT
All inventions, software code, patents, algorithms, whether developed during working hours or outside working hours, on Company equipment or personal equipment, shall be the sole and exclusive property of the Company from conception.

5. DISPUTE RESOLUTION
All disputes arising under this Agreement shall be subject to binding arbitration seated exclusively in Singapore under SIAC rules.`,
    analysis: {
      contract_name: 'Tech Startup Senior Software Engineer Agreement',
      contract_type: 'employment',
      overall_risk: 'high',
      risk_score: 82,
      summary: 'This employment agreement is heavily one-sided. It imposes an unenforceable 1-year post-employment non-compete under Indian law, an asymmetric 90-day employee notice requirement paired with immediate at-will employer termination, punitive liquidated damages, and overreaching claims on personal side-projects.',
      key_takeaways: [
        'Unenforceable post-employment non-compete under Section 27 of the Indian Contract Act.',
        'Unilateral termination rights: Employee must give 90 days; Company can fire immediately with ₹0 severance.',
        'Punitive 6-month salary liquidated damages for early departure.',
        'Total IP assignment covers off-duty personal software created on your own equipment.',
      ],
      clauses: [
        {
          id: 'emp-1',
          title: 'Post-Employment Non-Compete (12 Months)',
          category: 'non_compete_and_ip',
          severity: 'high',
          quote: 'For a period of twelve (12) months following termination of employment for any reason, the Employee shall not directly or indirectly engage in, consult for, advise, or join any entity operating in cloud infrastructure.',
          plain_english: 'You are barred from working for any company in your industry or cloud computing worldwide for an entire year after leaving.',
          risk_explanation: 'Extremely restrictive. Under Section 27 of the Indian Contract Act, 1872, agreements in restraint of trade are void post-employment. However, companies frequently weaponize such clauses to intimidate exiting workers.',
          counter_proposal: 'Propose replacing post-employment non-compete with standard non-solicitation of clients/coworkers, or restricting non-compete strictly to direct direct trade-secret theft.',
          statutory_reference: 'Section 27, Indian Contract Act, 1872',
        },
        {
          id: 'emp-2',
          title: 'Asymmetric 90-Day Notice vs Immediate Termination',
          category: 'termination_and_notice',
          severity: 'high',
          quote: 'The Employee may terminate employment only by giving ninety (90) days prior written notice. The Company may terminate employment at any time with immediate effect without cause and without payment of any severance.',
          plain_english: 'You are locked in for 3 full months if you want to resign, but the employer can dismiss you on 0 days notice with zero financial buffer.',
          risk_explanation: 'Standard professional norms require bilateral parity. 90-day notice without reciprocal employer severance creates severe livelihood risk.',
          counter_proposal: 'Request bilateral 30-day notice period, or payment of 90 days gross pay in lieu of notice if the company terminates without cause.',
        },
        {
          id: 'emp-3',
          title: 'Punitive Liquidated Damages (6 Months Gross Salary)',
          category: 'penalties_and_indemnity',
          severity: 'high',
          quote: 'Failure by Employee to serve the full 90-day notice period shall attract liquidated damages equal to six (6) months of gross salary.',
          plain_english: 'If you leave early or cannot serve the full 90 days, you owe half a year of your salary to the company.',
          risk_explanation: 'Unreasonable penalty clause. Under Section 74 of the Indian Contract Act, liquidated damages must reflect actual quantifiable loss, not arbitrary punitive fines.',
          counter_proposal: 'Cap notice shortfall payout strictly to basic salary for the unserved working days only.',
          statutory_reference: 'Section 74, Indian Contract Act, 1872',
        },
        {
          id: 'emp-4',
          title: 'Universal 24/7 IP Assignment (Including Personal Time & Gear)',
          category: 'non_compete_and_ip',
          severity: 'high',
          quote: 'All inventions, software code, patents, whether developed during working hours or outside working hours, on Company equipment or personal equipment, shall be the sole property of the Company.',
          plain_english: 'The company claims ownership of everything you code, even on weekends on your personal laptop.',
          risk_explanation: 'Extends company ownership far beyond the employment scope to encompass open-source contributions, weekend hobby apps, and personal projects.',
          counter_proposal: 'Add clause: "Excluding intellectual property created entirely on personal time and equipment that does not relate directly to the Company\'s current business."',
        },
        {
          id: 'emp-5',
          title: 'Offshore Arbitration Venue (Singapore SIAC)',
          category: 'dispute_resolution',
          severity: 'warning',
          quote: 'All disputes arising under this Agreement shall be subject to binding arbitration seated exclusively in Singapore under SIAC rules.',
          plain_english: 'If a dispute occurs, you would have to hire lawyers and arbitrate in Singapore.',
          risk_explanation: 'Prohibitively expensive for an individual employee to enforce rights or recover unpaid dues.',
          counter_proposal: 'Specify local municipal court jurisdiction in the city where the employee resides and performs work.',
        },
      ],
      missing_protections: [
        {
          id: 'emp-mp-1',
          title: 'Severance & Redundancy Protection',
          description: 'No provision for severance pay, retrenchment compensation, or transition support in the event of company layoffs.',
          recommended_addition: 'Add: "In the event of redundancy or termination without cause, Company shall pay 1 month of gross pay per completed year of service."',
          importance: 'critical',
        },
        {
          id: 'emp-mp-2',
          title: 'Personal Open Source Contribution Carve-Out',
          description: 'No explicit protection permitting participation in public open-source or non-competing educational software.',
          recommended_addition: 'Add: "Employee retains full copyright in non-commercial open-source contributions created on personal equipment."',
          importance: 'recommended',
        },
      ],
    },
  },

  tenancy: {
    id: 'sample-tenancy',
    name: 'Residential Tenancy & Apartment Lease Agreement',
    type: 'tenancy',
    description: 'Residential lease with a 10-month security deposit demand, mandatory 10% rent hike upon auto-renewal, and unannounced landlord inspections.',
    badge: 'High Risk (3 Critical Flags)',
    rawText: `TENANCY AND LEASE AGREEMENT

This Agreement is made between the Landlord and the Tenant.

1. TERM AND PREMISES
The Landlord leases Apartment 402 to the Tenant for an initial period of eleven (11) months.

2. SECURITY DEPOSIT
The Tenant shall deposit a refundable security deposit of ten (10) months rent (₹4,00,000). The Landlord reserves sole discretion to deduct refurbishment and repainting costs upon vacation without providing external contractor estimates.

3. AUTO-RENEWAL AND ESCALATION
Unless Tenant provides sixty (60) days advance written notice prior to term expiration, this Agreement shall automatically renew for another term with an automatic non-negotiable rent escalation of 10%.

4. LOCK-IN PERIOD AND EARLY TERMINATION
The entire 11-month term is deemed a strict Lock-In Period. If Tenant vacates prior to the end of the Lock-In Period, Tenant shall forfeit the full security deposit and remain liable for all remaining months' rent.

5. INSPECTION OF PREMISES
The Landlord and Landlord's agents may enter the premises at any time without prior appointment or notice to inspect conditions.`,
    analysis: {
      contract_name: 'Residential Tenancy & Apartment Lease Agreement',
      contract_type: 'tenancy',
      overall_risk: 'high',
      risk_score: 78,
      summary: 'This lease contains illegal or unconscionable clauses: an excessive 10-month deposit (violating the Model Tenancy Act), arbitrary unilateral deductions for painting, complete deposit forfeiture on early exit, automatic 10% rent escalation without affirmative consent, and 0-hour landlord entry.',
      key_takeaways: [
        'Excessive 10-month deposit violates the Model Tenancy Act ceiling (maximum 2 months for residential premises).',
        'Automatic 10% rent hike triggered by auto-renewal unless opt-out notice is given 60 days early.',
        'Strict lock-in forfeits entire security deposit plus demands all remaining months of rent.',
        'Zero privacy protection: Landlord claims right to enter at any time without notice.',
      ],
      clauses: [
        {
          id: 'ten-1',
          title: 'Excessive Security Deposit (10 Months Rent)',
          category: 'penalties_and_indemnity',
          severity: 'high',
          quote: 'The Tenant shall deposit a refundable security deposit of ten (10) months rent (₹4,00,000). The Landlord reserves sole discretion to deduct repainting costs without providing contractor estimates.',
          plain_english: 'Landlord demands 10 months rent upfront and can unilaterally deduct painting costs without proof of expenses.',
          risk_explanation: 'Under Section 10 of the Model Tenancy Act, security deposits for residential premises cannot exceed two (2) months rent. Unilateral deduction rights without itemized invoices enable arbitrary deposit theft.',
          counter_proposal: 'Cap deposit at 2 months rent. Require itemized contractor invoices with prior tenant inspection before any deduction.',
          statutory_reference: 'Section 10, Model Tenancy Act',
        },
        {
          id: 'ten-2',
          title: 'Forfeiture of Deposit + Full Rent Liability on Early Exit',
          category: 'termination_and_notice',
          severity: 'high',
          quote: 'If Tenant vacates prior to the end of the Lock-In Period, Tenant shall forfeit the full security deposit and remain liable for all remaining months rent.',
          plain_english: 'If you need to move out early (e.g. job relocation), the landlord takes all your deposit AND makes you pay all remaining months of rent.',
          risk_explanation: 'Double-dipping penalty. A landlord is required by law to mitigate damages by finding a replacement tenant, rather than extracting double compensation.',
          counter_proposal: 'Permit early termination upon 1 month written notice or payment of 1 month rent in lieu of notice, with deposit returned.',
        },
        {
          id: 'ten-3',
          title: 'Sneaky Auto-Renewal with 10% Escalation',
          category: 'auto_renewal',
          severity: 'high',
          quote: 'Unless Tenant provides sixty (60) days advance notice, this Agreement shall automatically renew for another term with an automatic non-negotiable rent escalation of 10%.',
          plain_english: 'If you forget to give 60 days notice, your lease automatically renews for another year with a 10% price jump.',
          risk_explanation: 'Forces extension without affirmative consent. Normal residential agreements require active execution of a renewal deed.',
          counter_proposal: 'Require mutual written consent for lease renewal at least 30 days prior to expiry.',
        },
        {
          id: 'ten-4',
          title: 'Unannounced Landlord Entry (0 Hours Notice)',
          category: 'general',
          severity: 'warning',
          quote: 'The Landlord and Landlord\'s agents may enter the premises at any time without prior appointment or notice to inspect conditions.',
          plain_english: 'Landlord or agents can unlock and walk into your home at any moment without warning.',
          risk_explanation: 'Violates quiet enjoyment and tenant privacy rights. Statutory tenancy provisions require minimum 24-hour advance written notice.',
          counter_proposal: 'Insert: "Landlord must provide at least 24 hours prior written notice and schedule visits during reasonable daytime hours (9 AM - 6 PM)."',
        },
      ],
      missing_protections: [
        {
          id: 'ten-mp-1',
          title: 'Statutory 2-Month Deposit Cap',
          description: 'Agreement ignores the Model Tenancy Act standard limiting residential deposits.',
          recommended_addition: 'Limit security deposit strictly to two months rent.',
          importance: 'critical',
        },
        {
          id: 'ten-mp-2',
          title: 'Deposit Refund Timetable (15 Days)',
          description: 'No deadline specified for when the landlord must refund the deposit after keys are returned.',
          recommended_addition: 'Add: "Landlord shall refund the full security deposit within 15 calendar days of vacating the premises."',
          importance: 'critical',
        },
      ],
    },
  },
};
