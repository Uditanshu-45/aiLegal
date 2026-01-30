'use client';

import { useRef, useEffect } from 'react';
import RiskScoreMeter from './RiskScoreMeter';
import ViolationCard from './ViolationCard';
import { AlertTriangle, CheckCircle, Shield } from 'lucide-react';

interface Violation {
    id: number;
    clauseNumber: number;
    originalText: string;
    violationType: string;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    riskScore: number;
    indianLawReference: {
        section: string;
        title: string;
        fullText: string;
        summary: string;
        url: string;
    };
    explanation: {
        simple: string;
        realLifeImpact: string;
    };
    matchedKeywords?: string[];
}

interface RiskBreakdown {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
}

interface Props {
    overallScore: number;
    riskLevel: string;
    breakdown: RiskBreakdown;
    violations: Violation[];
    deviations: any[];
    onJumpToClause: (clauseId: number) => void;
    highlightedViolationId?: number;
}

export default function AnalysisPanel({
    overallScore,
    riskLevel,
    breakdown,
    violations,
    deviations,
    onJumpToClause,
    highlightedViolationId
}: Props) {
    const violationRefs = useRef<{ [key: number]: HTMLElement }>({});

    // Scroll to violation when triggered externally
    useEffect(() => {
        if (highlightedViolationId !== undefined && violationRefs.current[highlightedViolationId]) {
            violationRefs.current[highlightedViolationId].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [highlightedViolationId]);

    const totalIssues = violations.length + deviations.length;

    return (
        <div className="p-6 space-y-6">
            {/* Sticky Header with Score */}
            <div className="sticky top-0 bg-gray-50 z-10 pb-4 -mx-6 px-6 pt-2 border-b border-gray-200">
                <RiskScoreMeter
                    score={overallScore}
                    level={riskLevel}
                    breakdown={breakdown}
                />

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                        <span className="text-xl font-bold text-red-600">{breakdown.CRITICAL}</span>
                        <p className="text-xs text-red-700">Critical</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
                        <span className="text-xl font-bold text-orange-600">{breakdown.HIGH}</span>
                        <p className="text-xs text-orange-700">High</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2  text-center">
                        <span className="text-xl font-bold text-yellow-600">{breakdown.MEDIUM}</span>
                        <p className="text-xs text-yellow-700">Medium</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                        <span className="text-xl font-bold text-blue-600">{breakdown.LOW}</span>
                        <p className="text-xs text-blue-700">Low</p>
                    </div>
                </div>
            </div>

            {/* No Issues State */}
            {totalIssues === 0 && (
                <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                        No Risky Clauses Found! 🎉
                    </h3>
                    <p className="text-gray-600 max-w-sm mx-auto">
                        This contract appears to follow fair practices under Indian law.
                        However, we still recommend a professional legal review.
                    </p>
                </div>
            )}

            {/* Violations List */}
            {violations.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <span>Risky Clauses Found</span>
                        <span className="text-sm font-normal text-gray-500 ml-1">
                            ({violations.length} {violations.length === 1 ? 'issue' : 'issues'})
                        </span>
                    </h2>

                    {violations.map((violation) => (
                        <div
                            key={violation.id}
                            ref={(el) => { if (el) violationRefs.current[violation.id] = el; }}
                            className="transition-all duration-300"
                        >
                            <ViolationCard
                                violation={violation}
                                onJumpToClause={() => onJumpToClause(violation.clauseNumber)}
                                isHighlighted={highlightedViolationId === violation.clauseNumber}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Deviations from Fair Contract */}
            {deviations.length > 0 && (
                <div className="space-y-4 mt-8">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-orange-500" />
                        <span>Deviations from Fair Practice</span>
                        <span className="text-sm font-normal text-gray-500 ml-1">
                            ({deviations.length})
                        </span>
                    </h2>

                    {deviations.map((deviation, idx) => (
                        <div
                            key={idx}
                            className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-orange-900">{deviation.category}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${deviation.deviationLevel === 'EXTREME'
                                        ? 'bg-red-200 text-red-800'
                                        : 'bg-orange-200 text-orange-800'
                                    }`}>
                                    {deviation.deviationLevel}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                <div className="bg-white/50 rounded p-2">
                                    <p className="text-gray-500 text-xs mb-1">Found in Contract</p>
                                    <p className="text-orange-900 font-medium">{deviation.foundInContract}</p>
                                </div>
                                <div className="bg-white/50 rounded p-2">
                                    <p className="text-gray-500 text-xs mb-1">Fair Standard</p>
                                    <p className="text-green-800 font-medium">{deviation.fairStandard}</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-700">{deviation.explanation}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Bottom Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-8">
                <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>⚖️ Legal Disclaimer:</strong> This analysis is for educational purposes only
                    and does not constitute legal advice. The detection of risky clauses is based on
                    pattern matching against the Indian Contract Act, 1872. Always consult a qualified
                    lawyer before signing any contract or making legal decisions.
                </p>
            </div>
        </div>
    );
}
