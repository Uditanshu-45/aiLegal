'use client';

import { TrendingUp } from 'lucide-react';

interface Deviation {
    category: string;
    foundInContract: string;
    fairStandard: string;
    deviationLevel: 'EXTREME' | 'SIGNIFICANT' | 'MINOR';
    explanation: string;
}

interface Props {
    deviations: Deviation[];
}

export default function DeviationHighlighter({ deviations }: Props) {
    if (deviations.length === 0) {
        return null;
    }

    const getBadgeColor = (level: string) => {
        switch (level) {
            case 'EXTREME':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'SIGNIFICANT':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'MINOR':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-6 w-6 text-orange-600" />
                <h2 className="text-2xl font-semibold">
                    Deviations from Fair Contract Standards
                </h2>
            </div>

            <p className="text-gray-600 mb-6">
                Your contract differs from standard fair freelance contract terms in the following ways:
            </p>

            <div className="space-y-4">
                {deviations.map((deviation, index) => (
                    <div
                        key={index}
                        className="border rounded-lg p-4 bg-gray-50"
                    >
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <h3 className="font-semibold text-gray-900">{deviation.category}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getBadgeColor(deviation.deviationLevel)}`}>
                                {deviation.deviationLevel}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                    Found in Your Contract
                                </p>
                                <p className="text-red-700 font-medium">{deviation.foundInContract}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                    Fair Standard
                                </p>
                                <p className="text-green-700 font-medium">{deviation.fairStandard}</p>
                            </div>
                        </div>

                        <p className="text-gray-700 text-sm">{deviation.explanation}</p>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> These deviations don't necessarily violate Indian law, but they are
                    significantly less favorable to you than standard industry practices. Consider negotiating these terms.
                </p>
            </div>
        </div>
    );
}
