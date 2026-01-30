/**
 * Risk score constants
 */
export const RISK_SCORES = {
    CRITICAL: 40,  // Section 27 violations, unlawful objects
    HIGH: 25,      // Unlimited liability, blanket IP transfer
    MEDIUM: 15,    // Unilateral termination, payment delays
    LOW: 5,        // Minor issues, vague language
};

/**
 * Allowed file types for upload
 */
export const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'text/plain'
];

/**
 * Maximum file size (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Indian Contract Act PDF URL
 */
export const INDIAN_CONTRACT_ACT_URL = 'https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf';

/**
 * Disclaimer text
 */
export const DISCLAIMER = 'This analysis is for educational purposes only. It does not constitute legal advice. Consult a qualified lawyer before signing any contract.';

/**
 * Impact profiles for founder-friendly output
 * Maps clause types to affected roles and business risk categories
 */
export const IMPACT_PROFILES: Record<string, { appliesTo: string[]; businessRisk: string }> = {
    non_compete_section27: {
        appliesTo: ['Freelancers', 'Agencies', 'Startups'],
        businessRisk: 'Investor Red Flag'
    },
    unlawful_object_section23: {
        appliesTo: ['Freelancers', 'Agencies', 'Startups', 'Enterprises'],
        businessRisk: 'Contract Void'
    },
    unlimited_liability_section73: {
        appliesTo: ['Freelancers', 'Startups'],
        businessRisk: 'Financial Risk'
    },
    excessive_penalty_section74: {
        appliesTo: ['Freelancers', 'Agencies'],
        businessRisk: 'Financial Risk'
    },
    unilateral_termination: {
        appliesTo: ['Freelancers', 'Agencies'],
        businessRisk: 'Job Security Risk'
    },
    unfair_payment_terms: {
        appliesTo: ['Freelancers', 'Agencies', 'Startups'],
        businessRisk: 'Cash Flow Risk'
    },
    foreign_jurisdiction: {
        appliesTo: ['Freelancers', 'Startups'],
        businessRisk: 'Legal Cost Risk'
    },
    blanket_ip_transfer: {
        appliesTo: ['Freelancers', 'Agencies'],
        businessRisk: 'IP Ownership Risk'
    },
    vague_scope: {
        appliesTo: ['Freelancers', 'Agencies'],
        businessRisk: 'Scope Creep Risk'
    },
    undue_influence_section16: {
        appliesTo: ['Freelancers', 'Startups'],
        businessRisk: 'Coercion Risk'
    }
};

