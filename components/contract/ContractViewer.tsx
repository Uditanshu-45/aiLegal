'use client';

import { useRef, useEffect } from 'react';
import { AlertTriangle, FileText } from 'lucide-react';

interface RiskyClause {
    id: number;
    text: string;
    startIndex: number;
    endIndex: number;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

interface Props {
    contractText: string;
    riskyClauses: RiskyClause[];
    onClauseClick: (clauseId: number) => void;
    highlightedClauseId?: number;
}

const RISK_HIGHLIGHT_STYLES = {
    CRITICAL: 'bg-red-100 border-l-4 border-red-500 hover:bg-red-200',
    HIGH: 'bg-orange-100 border-l-4 border-orange-500 hover:bg-orange-200',
    MEDIUM: 'bg-yellow-100 border-l-4 border-yellow-500 hover:bg-yellow-200',
    LOW: 'bg-blue-100 border-l-4 border-blue-500 hover:bg-blue-200'
};

const RISK_ICON_COLORS = {
    CRITICAL: 'text-red-600',
    HIGH: 'text-orange-600',
    MEDIUM: 'text-yellow-600',
    LOW: 'text-blue-600'
};

export default function ContractViewer({
    contractText,
    riskyClauses,
    onClauseClick,
    highlightedClauseId
}: Props) {
    const viewerRef = useRef<HTMLDivElement>(null);
    const clauseRefs = useRef<{ [key: number]: HTMLElement }>({});

    // Scroll to highlighted clause when triggered externally
    useEffect(() => {
        if (highlightedClauseId !== undefined && clauseRefs.current[highlightedClauseId]) {
            clauseRefs.current[highlightedClauseId].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [highlightedClauseId]);

    // Build annotated text with highlights
    const renderAnnotatedText = () => {
        if (!contractText) {
            return <p className="text-gray-500 italic">No contract text to display</p>;
        }

        // If no risky clauses, just show plain text
        if (!riskyClauses || riskyClauses.length === 0) {
            return (
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {contractText}
                </div>
            );
        }

        let lastIndex = 0;
        const parts: JSX.Element[] = [];

        // Sort clauses by start position
        const sortedClauses = [...riskyClauses]
            .filter(c => c.startIndex >= 0 && c.endIndex > c.startIndex)
            .sort((a, b) => a.startIndex - b.startIndex);

        sortedClauses.forEach((clause, idx) => {
            // Add text before this clause
            if (clause.startIndex > lastIndex) {
                parts.push(
                    <span key={`text-${idx}`} className="whitespace-pre-wrap">
                        {contractText.substring(lastIndex, clause.startIndex)}
                    </span>
                );
            }

            // Skip if overlapping with previous clause
            if (clause.startIndex < lastIndex) return;

            const isHighlighted = highlightedClauseId === clause.id;

            // Add highlighted clause
            parts.push(
                <span
                    key={`clause-${clause.id}`}
                    ref={(el) => { if (el) clauseRefs.current[clause.id] = el; }}
                    className={`
            ${RISK_HIGHLIGHT_STYLES[clause.riskLevel]}
            cursor-pointer transition-all duration-200
            relative group inline px-1 py-0.5 rounded-sm
            ${isHighlighted ? 'ring-2 ring-offset-2 ring-indigo-500 animate-pulse' : ''}
          `}
                    onClick={() => onClauseClick(clause.id)}
                >
                    <AlertTriangle
                        className={`inline h-4 w-4 mr-1 ${RISK_ICON_COLORS[clause.riskLevel]}`}
                    />
                    <span className="whitespace-pre-wrap">
                        {contractText.substring(clause.startIndex, clause.endIndex)}
                    </span>

                    {/* Hover Tooltip */}
                    <span className="
            invisible group-hover:visible opacity-0 group-hover:opacity-100
            absolute left-0 -top-10 bg-gray-900 text-white text-xs
            px-3 py-1.5 rounded-lg whitespace-nowrap z-20
            shadow-lg transition-opacity duration-200
            after:content-[''] after:absolute after:top-full after:left-4
            after:border-4 after:border-transparent after:border-t-gray-900
          ">
                        ⚠️ {clause.riskLevel} risk - Click to see why
                    </span>
                </span>
            );

            lastIndex = clause.endIndex;
        });

        // Add remaining text after last clause
        if (lastIndex < contractText.length) {
            parts.push(
                <span key="text-end" className="whitespace-pre-wrap">
                    {contractText.substring(lastIndex)}
                </span>
            );
        }

        return parts;
    };

    // Count clauses by risk level
    const riskCounts = riskyClauses.reduce((acc, clause) => {
        acc[clause.riskLevel] = (acc[clause.riskLevel] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div ref={viewerRef} className="p-8">
            {/* Document Header */}
            <div className="mb-6 pb-4 border-b-2 border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Contract Document</h1>
                        <p className="text-sm text-gray-500">
                            {contractText.split(/\s+/).filter(w => w.length > 0).length} words
                        </p>
                    </div>
                </div>

                {/* Legend */}
                {riskyClauses.length > 0 && (
                    <div className="flex flex-wrap gap-3 text-xs">
                        <span className="text-gray-500">Highlights:</span>
                        {riskCounts.CRITICAL && (
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 bg-red-500 rounded-sm" />
                                Critical ({riskCounts.CRITICAL})
                            </span>
                        )}
                        {riskCounts.HIGH && (
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 bg-orange-500 rounded-sm" />
                                High ({riskCounts.HIGH})
                            </span>
                        )}
                        {riskCounts.MEDIUM && (
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 bg-yellow-500 rounded-sm" />
                                Medium ({riskCounts.MEDIUM})
                            </span>
                        )}
                        {riskCounts.LOW && (
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 bg-blue-500 rounded-sm" />
                                Low ({riskCounts.LOW})
                            </span>
                        )}
                    </div>
                )}

                <p className="text-sm text-gray-600 mt-3 bg-indigo-50 p-3 rounded-lg">
                    📄 Risky clauses are highlighted below. <strong>Click any highlighted text</strong> to see the legal analysis.
                </p>
            </div>

            {/* Contract Text with Annotations */}
            <div className="font-serif text-base text-gray-800 leading-relaxed">
                {renderAnnotatedText()}
            </div>
        </div>
    );
}
