import { getAllClausePatterns } from '../db/queries';
import type { Clause, IndianLawViolation } from '../types/contract.types';

// Fallback patterns when database is empty (for demo/testing)
const FALLBACK_PATTERNS = [
    {
        clause_type: 'non_compete_section27',
        keywords: JSON.stringify(['non-compete', 'non compete', 'shall not compete', 'restraint of trade', 'not engage in similar', 'cannot work for competitor']),
        risk_level: 'CRITICAL',
        risk_score: 40,
        section_number: 'Section 27',
        section_title: 'Agreement in restraint of trade void',
        full_text: 'Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void.',
        description: 'Non-compete clause restricting freelancer from taking other work',
        gov_url: 'https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf'
    },
    {
        clause_type: 'unlimited_liability_section73',
        keywords: JSON.stringify(['unlimited liability', 'all damages', 'consequential damages', 'indirect damages', 'liable for all losses', 'without limitation']),
        risk_level: 'HIGH',
        risk_score: 25,
        section_number: 'Section 73',
        section_title: 'Compensation for loss or damage caused by breach of contract',
        full_text: 'When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby.',
        description: 'Freelancer liable for unlimited damages without reasonable cap',
        gov_url: 'https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf'
    },
    {
        clause_type: 'excessive_penalty_section74',
        keywords: JSON.stringify(['penalty of', 'liquidated damages', 'shall pay', 'penalty equal to', 'forfeit', 'breach penalty']),
        risk_level: 'HIGH',
        risk_score: 20,
        section_number: 'Section 74',
        section_title: 'Compensation for breach of contract where penalty stipulated for',
        full_text: 'When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach, the party complaining of the breach is entitled, whether or not actual damage or loss is proved to have been caused thereby, to receive from the party who has broken the contract reasonable compensation.',
        description: 'Excessive penalty that exceeds reasonable compensation for breach',
        gov_url: 'https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf'
    },
    {
        clause_type: 'unilateral_termination',
        keywords: JSON.stringify(['terminate at will', 'without cause', 'immediate termination', 'terminate without notice', 'at sole discretion', 'cancel anytime']),
        risk_level: 'MEDIUM',
        risk_score: 15,
        section_number: 'Section 10',
        section_title: 'What agreements are contracts',
        full_text: 'All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object.',
        description: 'Client can terminate without reason or notice period',
        gov_url: 'https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf'
    },
    {
        clause_type: 'foreign_jurisdiction',
        keywords: JSON.stringify(['governed by laws of', 'jurisdiction of', 'courts of USA', 'UK jurisdiction', 'Singapore courts', 'Delaware', 'California law']),
        risk_level: 'MEDIUM',
        risk_score: 12,
        section_number: 'Section 10',
        section_title: 'What agreements are contracts',
        full_text: 'All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object.',
        description: 'Disputes must be resolved in foreign jurisdiction (expensive for freelancer)',
        gov_url: 'https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf'
    }
];

/**
 * Check contract clauses against Indian Contract Act
 * This is RULE-BASED, NOT AI-based (for reliability)
 */
export function validateAgainstIndianLaw(clauses: Clause[]): IndianLawViolation[] {
    const violations: IndianLawViolation[] = [];

    // Get all clause patterns from DB (with fallback)
    let patterns: any[] = [];
    try {
        patterns = getAllClausePatterns() as any[] || [];
    } catch (error) {
        console.warn('Could not load clause patterns from database:', error);
    }

    // Use fallback patterns if database is empty
    if (!patterns || patterns.length === 0) {
        console.log('Using fallback clause patterns (database not seeded)');
        patterns = FALLBACK_PATTERNS;
    }

    // Check each clause against patterns
    for (const clause of clauses) {
        const lowerText = clause.text.toLowerCase();

        for (const pattern of patterns) {
            let keywords: string[];
            try {
                keywords = typeof pattern.keywords === 'string'
                    ? JSON.parse(pattern.keywords)
                    : pattern.keywords;
            } catch {
                keywords = [];
            }

            const matchedKeywords = keywords.filter(kw =>
                lowerText.includes(kw.toLowerCase())
            );

            // If 2+ keywords match, flag as violation
            if (matchedKeywords.length >= 2) {
                violations.push({
                    clauseId: clause.id,
                    clauseText: clause.text,
                    violationType: pattern.clause_type,
                    sectionNumber: pattern.section_number || pattern.linked_section,
                    sectionTitle: pattern.section_title || 'Indian Contract Act',
                    sectionFullText: pattern.full_text || pattern.description,
                    riskLevel: pattern.risk_level,
                    riskScore: pattern.risk_score,
                    matchedKeywords,
                    explanation: pattern.description,
                    govUrl: pattern.gov_url || 'https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf'
                });
                break; // One violation per clause (for simplicity)
            }
        }
    }

    return violations;
}
