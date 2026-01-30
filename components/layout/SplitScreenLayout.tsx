'use client';

import { useState, useRef, useEffect } from 'react';
import { GripVertical, FileText, BarChart3 } from 'lucide-react';

interface Props {
    leftPanel: React.ReactNode;
    rightPanel: React.ReactNode;
    defaultSplit?: number;
}

export default function SplitScreenLayout({
    leftPanel,
    rightPanel,
    defaultSplit = 50
}: Props) {
    const [splitPosition, setSplitPosition] = useState(defaultSplit);
    const [isDragging, setIsDragging] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [activeTab, setActiveTab] = useState<'contract' | 'analysis'>('contract');
    const containerRef = useRef<HTMLDivElement>(null);

    // Check for mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const container = containerRef.current.getBoundingClientRect();
        const newPosition = ((e.clientX - container.left) / container.width) * 100;

        // Constrain between 30% and 70%
        setSplitPosition(Math.max(30, Math.min(70, newPosition)));
    };

    // Mobile: Show tabs
    if (isMobile) {
        return (
            <div className="flex flex-col h-full">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 bg-white">
                    <button
                        onClick={() => setActiveTab('contract')}
                        className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'contract'
                                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        <FileText className="h-4 w-4" />
                        Contract
                    </button>
                    <button
                        onClick={() => setActiveTab('analysis')}
                        className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'analysis'
                                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        <BarChart3 className="h-4 w-4" />
                        Analysis
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'contract' ? leftPanel : rightPanel}
                </div>
            </div>
        );
    }

    // Desktop: Split screen
    return (
        <div
            ref={containerRef}
            className="flex h-full overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* LEFT PANEL - Contract Viewer */}
            <div
                className="overflow-y-auto bg-white"
                style={{ width: `${splitPosition}%` }}
            >
                {leftPanel}
            </div>

            {/* RESIZABLE DIVIDER */}
            <div
                className={`w-1.5 flex-shrink-0 relative cursor-col-resize transition-colors ${isDragging ? 'bg-indigo-500' : 'bg-gray-200 hover:bg-indigo-400'
                    }`}
                onMouseDown={handleMouseDown}
            >
                {/* Divider Handle */}
                <div
                    className={`absolute top-1/2 -translate-y-1/2 -left-2.5 w-6 h-16 
            flex items-center justify-center rounded-full shadow-lg border
            transition-colors cursor-col-resize z-10 ${isDragging
                            ? 'bg-indigo-500 border-indigo-600'
                            : 'bg-white border-gray-300 hover:bg-indigo-50 hover:border-indigo-300'
                        }`}
                >
                    <GripVertical className={`h-4 w-4 ${isDragging ? 'text-white' : 'text-gray-400'}`} />
                </div>
            </div>

            {/* RIGHT PANEL - Analysis */}
            <div
                className="overflow-y-auto bg-gray-50"
                style={{ width: `${100 - splitPosition}%` }}
            >
                {rightPanel}
            </div>
        </div>
    );
}
