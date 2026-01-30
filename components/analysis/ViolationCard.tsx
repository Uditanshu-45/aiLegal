'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, ArrowRight, Scale, AlertTriangle } from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface ViolationProps {
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

interface Props {
    violation: ViolationProps;
    onJumpToClause: () => void;
    isHighlighted?: boolean;
}

const RISK_BORDER_COLORS = {
    CRITICAL: 'border-red-400 bg-red-50',
    HIGH: 'border-orange-400 bg-orange-50',
    MEDIUM: 'border-yellow-400 bg-yellow-50',
    LOW: 'border-blue-400 bg-blue-50'
};

export default function ViolationCard({ violation, onJumpToClause, isHighlighted }: Props) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className={`
        border-2 rounded-xl p-5 transition-all duration-300
        ${RISK_BORDER_COLORS[violation.riskLevel]}
        ${isHighlighted ? 'ring-4 ring-indigo-500 ring-offset-2 scale-[1.02]' : ''}
      `}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${violation.riskLevel === 'CRITICAL' ? 'bg-red-200' :
                            violation.riskLevel === 'HIGH' ? 'bg-orange-200' :
                                violation.riskLevel === 'MEDIUM' ? 'bg-yellow-200' : 'bg-blue-200'
                        }`}>
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">
                            Clause #{violation.clauseNumber}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
                            {violation.violationType.replace(/_/g, ' ')}
                        </p>
                    </div>
                </div>
                <Badge riskLevel={violation.riskLevel} />
            </div>

            {/* Indian Law Reference */}
            <div className="bg-white/70 rounded-lg p-4 mb-4 border border-gray-200">
                <div className="flex items-start gap-3">
                    <Scale className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold text-indigo-900">
                            Violates: {violation.indianLawReference.section}
                        </p>
                        <p className="text-sm text-gray-700 italic mt-1">
                            "{violation.indianLawReference.title}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Simple Explanation */}
            <div className="mb-4">
                <p className="font-semibold text-sm text-gray-800 mb-2 flex items-center gap-2">
                    <span className="text-lg">🔍</span> What does this mean?
                </p>
                <p className="text-gray-700 leading-relaxed">
                    {violation.explanation.simple || violation.indianLawReference.summary}
                </p>
            </div>

            {/* Real-Life Impact */}
            <div className="bg-white/70 rounded-lg p-4 mb-4 border border-gray-200">
                <p className="font-semibold text-sm text-gray-800 mb-2 flex items-center gap-2">
                    <span className="text-lg">💡</span> How does this affect you?
                </p>
                <p className="text-gray-700 leading-relaxed">
                    {violation.explanation.realLifeImpact || 'This clause may put you at significant legal or financial disadvantage.'}
                </p>
            </div>

            {/* Matched Keywords (if any) */}
            {violation.matchedKeywords && violation.matchedKeywords.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Detected keywords:</p>
                    <div className="flex flex-wrap gap-1">
                        {violation.matchedKeywords.map((keyword, idx) => (
                            <span
                                key={idx}
                                className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onJumpToClause}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
            transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
                >
                    <ArrowRight className="h-4 w-4" />
                    Jump to Clause
                </button>

                <button
                    onClick={() => setExpanded(!expanded)}
                    className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 
            transition-colors flex items-center gap-1 shadow-sm"
                    title={expanded ? 'Show less' : 'Show more details'}
                >
                    {expanded ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </button>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="mt-4 pt-4 border-t border-gray-300 space-y-4 animate-in slide-in-from-top-2">
                    {/* Full Legal Text */}
                    <div>
                        <p className="font-semibold text-sm text-gray-800 mb-2 flex items-center gap-2">
                            <span className="text-lg">📜</span> Full Legal Text:
                        </p>
                        <div className="bg-white rounded-lg p-4 text-sm text-gray-700 font-mono 
              max-h-40 overflow-y-auto border border-gray-200 leading-relaxed">
                            {violation.indianLawReference.fullText}
                        </div>
                    </div>

                    {/* Original Clause Text */}
                    <div>
                        <p className="font-semibold text-sm text-gray-800 mb-2 flex items-center gap-2">
                            <span className="text-lg">📄</span> Original Clause from Contract:
                        </p>
                        <div className="bg-white rounded-lg p-4 text-sm text-gray-700 italic 
              max-h-40 overflow-y-auto border border-gray-200 leading-relaxed">
                            "{violation.originalText}"
                        </div>
                    </div>

                    {/* Government Source Link */}
                    <a
                        href={violation.indianLawReference.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 
              hover:underline transition-colors"
                    >
                        <ExternalLink className="h-4 w-4" />
                        View on IndiaCode.nic.in (Official Source)
                    </a>
                </div>
            )}
        </div>
    );
}
