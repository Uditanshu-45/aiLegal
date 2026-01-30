'use client';

import { AlertTriangle, Shield, AlertCircle } from 'lucide-react';

interface Props {
    score: number;
    level: string;
    breakdown: {
        CRITICAL: number;
        HIGH: number;
        MEDIUM: number;
        LOW: number;
    };
}

export default function RiskScoreMeter({ score, level, breakdown }: Props) {
    const getColor = () => {
        if (score >= 76) return 'text-red-600 bg-red-50 border-red-300';
        if (score >= 51) return 'text-orange-600 bg-orange-50 border-orange-300';
        if (score >= 26) return 'text-yellow-600 bg-yellow-50 border-yellow-300';
        return 'text-green-600 bg-green-50 border-green-300';
    };

    const getIcon = () => {
        if (score >= 76) return <AlertTriangle className="h-12 w-12" />;
        if (score >= 51) return <AlertCircle className="h-12 w-12" />;
        return <Shield className="h-12 w-12" />;
    };

    return (
        <div className={`rounded-lg border-2 p-8 ${getColor()}`}>
            <div className="flex items-center gap-4">
                {getIcon()}
                <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold">{score}</span>
                        <span className="text-2xl">/100</span>
                    </div>
                    <p className="text-xl font-semibold mt-1">{level}</p>
                </div>
            </div>

            {/* Breakdown */}
            <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{breakdown.CRITICAL}</div>
                    <div className="text-xs uppercase tracking-wide mt-1">Critical</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{breakdown.HIGH}</div>
                    <div className="text-xs uppercase tracking-wide mt-1">High</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">{breakdown.MEDIUM}</div>
                    <div className="text-xs uppercase tracking-wide mt-1">Medium</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-gray-600">{breakdown.LOW}</div>
                    <div className="text-xs uppercase tracking-wide mt-1">Low</div>
                </div>
            </div>

            {/* Interpretation */}
            <div className="mt-6 pt-6 border-t border-current border-opacity-20">
                {score >= 76 && (
                    <p className="font-medium">
                        ⚠️ This contract has SEVERE issues. Contains clauses that violate Indian law.
                        <strong> DO NOT SIGN</strong> without legal review.
                    </p>
                )}
                {score >= 51 && score < 76 && (
                    <p className="font-medium">
                        ⚠️ This contract has significant risks. Several clauses may be unenforceable
                        or unfair. Negotiate before signing.
                    </p>
                )}
                {score >= 26 && score < 51 && (
                    <p className="font-medium">
                        ⚠️ This contract has moderate risks. Some clauses need attention, but
                        may be negotiable.
                    </p>
                )}
                {score < 26 && (
                    <p className="font-medium">
                        ✅ This contract appears relatively fair, but still review carefully.
                    </p>
                )}
            </div>
        </div>
    );
}
