import type { IndianLawViolation } from '../types/contract.types';

/**
 * Calculate 0-100 risk score based on violations
 * Formula is deterministic, NOT AI-based
 */
export function calculateRiskScore(violations: IndianLawViolation[]): number {
    let totalScore = 0;

    for (const violation of violations) {
        totalScore += violation.riskScore;
    }

    // Cap at 100
    return Math.min(totalScore, 100);
}

/**
 * Get risk level based on score
 */
export function getRiskLevel(score: number): string {
    if (score >= 76) return 'DANGEROUS';
    if (score >= 51) return 'HIGH RISK';
    if (score >= 26) return 'MODERATE RISK';
    return 'SAFE';
}
