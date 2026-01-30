'use client';

interface Props {
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    size?: 'sm' | 'md' | 'lg';
}

const RISK_STYLES = {
    CRITICAL: 'bg-red-600 text-white',
    HIGH: 'bg-orange-500 text-white',
    MEDIUM: 'bg-yellow-500 text-white',
    LOW: 'bg-blue-500 text-white'
};

const RISK_LABELS = {
    CRITICAL: '🚨 CRITICAL',
    HIGH: '⚠️ HIGH',
    MEDIUM: '⚡ MEDIUM',
    LOW: 'ℹ️ LOW'
};

const SIZE_STYLES = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
};

export default function Badge({ riskLevel, size = 'md' }: Props) {
    return (
        <span
            className={`
        inline-flex items-center font-semibold rounded-full
        ${RISK_STYLES[riskLevel]}
        ${SIZE_STYLES[size]}
      `}
        >
            {RISK_LABELS[riskLevel]}
        </span>
    );
}
