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
