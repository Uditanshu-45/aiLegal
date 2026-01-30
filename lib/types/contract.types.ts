// Type definitions for contract analysis

export interface ContractMetadata {
    characterCount: number;
    pageCount?: number;
    wordCount?: number;
}

export interface ExtractedText {
    text: string;
    metadata: ContractMetadata;
}

export interface Clause {
    id: number;
    text: string;
    position: number;
}

export interface IndianLawViolation {
    clauseId: number;
    clauseText: string;
    violationType: string;
    sectionNumber: string;
    sectionTitle: string;
    sectionFullText: string;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    riskScore: number;
    matchedKeywords: string[];
    explanation: string;
    govUrl: string;
}

export interface Deviation {
    category: string;
    foundInContract: string;
    fairStandard: string;
    deviationLevel: 'EXTREME' | 'SIGNIFICANT' | 'MINOR';
    explanation: string;
}

export interface AnalysisResult {
    success: boolean;
    processingTimeMs: number;
    document: {
        fileName: string;
        fileSize: number;
        fileType: string;
        extractedCharacters: number;
        pageCount?: number;
    };
    analysis: {
        overallRiskScore: number;
        riskLevel: string;
        totalClauses: number;
        riskyClausesFound: number;
        deviationsFromFairContract: number;
        breakdown: {
            CRITICAL: number;
            HIGH: number;
            MEDIUM: number;
            LOW: number;
        };
    };
    riskyClauses: any[];
    deviations: Deviation[];
    disclaimer: string;
}
