'use client';

export function Spinner({ className = '' }: { className?: string }) {
    return (
        <div className={`inline-block ${className}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
}
