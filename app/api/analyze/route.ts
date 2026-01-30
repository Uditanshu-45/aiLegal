import { NextRequest, NextResponse } from 'next/server';
import { extractText } from '@/lib/services/extractor.service';
import { parseIntoClauses } from '@/lib/services/parser.service';
import { validateAgainstIndianLaw } from '@/lib/services/indianLawValidator.service';
import { checkDeviationsFromFairContract } from '@/lib/services/deviationChecker.service';
import { calculateRiskScore, getRiskLevel } from '@/lib/services/scorer.service';
import { explainClause } from '@/lib/services/explainer.service';
import { cleanupFile } from '@/lib/utils/fileCleanup';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, DISCLAIMER } from '@/lib/utils/constants';

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        // 1. Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const language = (formData.get('language') as string) || 'en';

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // 2. Validate file
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: 'Only PDF, DOCX, TXT, PNG, JPG files allowed' },
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: 'File must be under 10MB' },
                { status: 400 }
            );
        }

        // 3. Extract text
        const { text, metadata } = await extractText(file);

        // 4. Parse into clauses
        const clauses = parseIntoClauses(text);

        // 5. Validate against Indian Contract Act (RULE-BASED)
        const violations = validateAgainstIndianLaw(clauses);

        // 6. Check deviations from fair contract baseline
        const deviations = checkDeviationsFromFairContract(clauses);

        // 7. Calculate 0-100 risk score
        const riskScore = calculateRiskScore(violations);

        // 8. Generate ELI5 explanations using Gemini (IN PARALLEL for speed)
        const explainedViolations = await Promise.all(
            violations.map(async (violation) => {
                const { simpleExplanation, realLifeImpact } = await explainClause(
                    violation.clauseText,
                    violation.violationType,
                    violation.sectionFullText,
                    language as 'en' | 'hi'
                );

                return {
                    clauseNumber: violation.clauseId,
                    originalText: violation.clauseText,
                    violationType: violation.violationType,
                    riskLevel: violation.riskLevel,
                    riskScore: violation.riskScore,
                    indianLawReference: {
                        section: violation.sectionNumber,
                        title: violation.sectionTitle,
                        fullText: violation.sectionFullText,
                        summary: violation.explanation,
                        url: violation.govUrl
                    },
                    explanation: {
                        simple: simpleExplanation,
                        realLifeImpact,
                        generatedBy: 'gemini-1.5-flash'
                    },
                    matchedKeywords: violation.matchedKeywords
                };
            })
        );

        // 9. Format response
        const response = {
            success: true,
            processingTimeMs: Date.now() - startTime,
            document: {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                extractedCharacters: metadata.characterCount,
                pageCount: metadata.pageCount
            },
            analysis: {
                overallRiskScore: riskScore,
                riskLevel: getRiskLevel(riskScore),
                totalClauses: clauses.length,
                riskyClausesFound: violations.length,
                deviationsFromFairContract: deviations.length,
                breakdown: {
                    CRITICAL: violations.filter(v => v.riskLevel === 'CRITICAL').length,
                    HIGH: violations.filter(v => v.riskLevel === 'HIGH').length,
                    MEDIUM: violations.filter(v => v.riskLevel === 'MEDIUM').length,
                    LOW: violations.filter(v => v.riskLevel === 'LOW').length
                }
            },
            riskyClauses: explainedViolations,
            deviations: deviations,
            disclaimer: DISCLAIMER
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            },
            { status: 500 }
        );
    }
}
