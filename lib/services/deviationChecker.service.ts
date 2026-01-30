import { getAllFairContractBaselines } from '../db/queries';
import type { Clause, Deviation } from '../types/contract.types';

/**
 * Compare contract against "Fair Contract Baseline"
 * Highlights unusually harsh terms
 * Works even if database is not seeded (graceful degradation)
 */
export function checkDeviationsFromFairContract(clauses: Clause[]): Deviation[] {
    const deviations: Deviation[] = [];

    // Get baselines from database (may be empty if not seeded)
    let baselines: any[] = [];
    try {
        baselines = getAllFairContractBaselines() as any[] || [];
    } catch (error) {
        console.warn('Could not load fair contract baselines:', error);
        baselines = [];
    }

    // Check payment terms
    const paymentClause = clauses.find(c =>
        c.text.toLowerCase().includes('payment') ||
        c.text.toLowerCase().includes('invoice')
    );

    if (paymentClause) {
        const paymentBaseline = baselines.find(b => b?.clause_category === 'payment_terms');
        const fairStandard = paymentBaseline?.fair_standard || 'Net 30 days';

        // Extract days (e.g., "Net 90", "120 days")
        const daysMatch = paymentClause.text.match(/(\d+)\s*days?/i);
        if (daysMatch) {
            const days = parseInt(daysMatch[1]);

            if (days > 90) {
                deviations.push({
                    category: 'Payment Terms',
                    foundInContract: `Net ${days} days`,
                    fairStandard,
                    deviationLevel: 'EXTREME',
                    explanation: `Your contract has ${days}-day payment terms, which is ${days - 30} days beyond the standard Net 30. This creates significant cash flow risk for freelancers.`
                });
            } else if (days > 60) {
                deviations.push({
                    category: 'Payment Terms',
                    foundInContract: `Net ${days} days`,
                    fairStandard,
                    deviationLevel: 'SIGNIFICANT',
                    explanation: `Payment terms are ${days - 30} days beyond industry standard.`
                });
            }
        }
    }

    // Check termination notice
    const terminationClause = clauses.find(c =>
        c.text.toLowerCase().includes('terminate') ||
        c.text.toLowerCase().includes('termination')
    );

    if (terminationClause && terminationClause.text.toLowerCase().includes('immediate')) {
        const terminationBaseline = baselines.find(b => b?.clause_category === 'termination_notice');
        const fairStandard = terminationBaseline?.fair_standard || '15-30 days written notice';

        deviations.push({
            category: 'Termination Notice',
            foundInContract: 'Immediate termination without notice',
            fairStandard,
            deviationLevel: 'SIGNIFICANT',
            explanation: 'Client can terminate instantly without notice period, leaving you without income. Fair contracts have 15-30 day notice periods.'
        });
    }

    // Check liability cap
    const liabilityClause = clauses.find(c =>
        c.text.toLowerCase().includes('liability') ||
        c.text.toLowerCase().includes('indemnify')
    );

    if (liabilityClause && liabilityClause.text.toLowerCase().includes('unlimited')) {
        const liabilityBaseline = baselines.find(b => b?.clause_category === 'liability_cap');
        const fairStandard = liabilityBaseline?.fair_standard || 'Capped at contract value';

        deviations.push({
            category: 'Liability Cap',
            foundInContract: 'Unlimited liability',
            fairStandard,
            deviationLevel: 'EXTREME',
            explanation: 'You could be forced to pay unlimited damages. Fair contracts cap liability at the project value.'
        });
    }

    // Check foreign jurisdiction
    const jurisdictionClause = clauses.find(c =>
        c.text.toLowerCase().includes('jurisdiction') ||
        c.text.toLowerCase().includes('governed by')
    );

    if (jurisdictionClause) {
        const foreignCountries = ['USA', 'United States', 'UK', 'United Kingdom', 'Singapore', 'Delaware', 'California', 'New York'];
        const hasForeignJurisdiction = foreignCountries.some(country =>
            jurisdictionClause.text.includes(country)
        );

        if (hasForeignJurisdiction) {
            deviations.push({
                category: 'Jurisdiction',
                foundInContract: 'Foreign jurisdiction (non-Indian)',
                fairStandard: 'Indian courts',
                deviationLevel: 'SIGNIFICANT',
                explanation: 'Disputes must be resolved in foreign courts, which is expensive and impractical for Indian freelancers. This heavily favors the client.'
            });
        }
    }

    return deviations;
}
