import type { Clause } from '../types/contract.types';

/**
 * Parse contract text into individual clauses
 * Uses multiple strategies to identify clause boundaries
 */
export function parseIntoClauses(text: string): Clause[] {
    const clauses: Clause[] = [];
    let clauseId = 1;

    // Strategy 1: Split by numbered clauses (1., 2., 3. or 1.1, 1.2, etc.)
    const numberedPattern = /(?:^|\n)\s*(\d+\.(?:\d+\.?)?)\s+([^\n]+(?:\n(?!\s*\d+\.)[^\n]*)*)/g;
    let matches = [...text.matchAll(numberedPattern)];

    if (matches.length > 3) {
        // If we found numbered clauses, use them
        matches.forEach((match, index) => {
            clauses.push({
                id: clauseId++,
                text: match[0].trim(),
                position: index
            });
        });
        return clauses;
    }

    // Strategy 2: Split by section headers (PAYMENT:, TERMINATION:, etc.)
    const sectionPattern = /(?:^|\n)\s*([A-Z][A-Z\s]{3,}:)\s+([^\n]+(?:\n(?![A-Z][A-Z\s]{3,}:)[^\n]*)*)/g;
    matches = [...text.matchAll(sectionPattern)];

    if (matches.length > 3) {
        matches.forEach((match, index) => {
            clauses.push({
                id: clauseId++,
                text: match[0].trim(),
                position: index
            });
        });
        return clauses;
    }

    // Strategy 3: Split by paragraphs (fallback)
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);

    paragraphs.forEach((paragraph, index) => {
        clauses.push({
            id: clauseId++,
            text: paragraph.trim(),
            position: index
        });
    });

    return clauses;
}
