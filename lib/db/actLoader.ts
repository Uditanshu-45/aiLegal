import pdfParse from 'pdf-parse';
import { db } from './client';
import fs from 'fs';
import path from 'path';

interface Section {
    number: string;
    title: string;
    text: string;
    page: number;
    chapter?: string;
}

/**
 * Downloads and parses the 53-page Indian Contract Act PDF
 * Source: https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf
 */
export async function loadIndianContractActPDF(): Promise<void> {
    const pdfPath = path.join(process.cwd(), 'data', 'indian_contract_act.pdf');

    // Download PDF if not exists
    if (!fs.existsSync(pdfPath)) {
        console.log('📥 Downloading Indian Contract Act PDF...');
        try {
            const response = await fetch('https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const buffer = await response.arrayBuffer();
            fs.writeFileSync(pdfPath, Buffer.from(buffer));
            console.log('✅ PDF downloaded successfully');
        } catch (error) {
            console.error('❌ Failed to download PDF:', error);
            throw new Error('Could not download Indian Contract Act PDF. Please download manually from https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf and place it in the data/ directory.');
        }
    }

    // Parse PDF
    console.log('📄 Parsing Indian Contract Act PDF...');
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);

    console.log(`📊 Loaded PDF: ${pdfData.numpages} pages, ${pdfData.text.length} characters`);

    // Extract sections using regex
    const sections = extractSections(pdfData.text);

    console.log(`📚 Found ${sections.length} sections`);

    // Store in database
    const insertSection = db.prepare(`
    INSERT OR REPLACE INTO act_sections 
    (section_number, section_title, full_text, summary, page_number, chapter)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    const insertEmbedding = db.prepare(`
    INSERT INTO act_embeddings 
    (section_number, chunk_text, chunk_index, page_number)
    VALUES (?, ?, ?, ?)
  `);

    for (const section of sections) {
        // Insert main section
        insertSection.run(
            section.number,
            section.title,
            section.text,
            generateSummary(section.text),
            section.page,
            section.chapter || null
        );

        // Chunk text for embeddings (500 words per chunk)
        const chunks = chunkText(section.text, 500);
        chunks.forEach((chunk, index) => {
            insertEmbedding.run(section.number, chunk, index, section.page);
        });
    }

    console.log('✅ Indian Contract Act loaded into database');
}

/**
 * Extract sections from PDF text using patterns like:
 * "Section 27.—Agreement in restraint of trade"
 */
function extractSections(text: string): Section[] {
    const sections: Section[] = [];

    // Regex to match: "Section 10.—What agreements are contracts"
    const sectionRegex = /Section\s+(\d+[A-Za-z]?)\s*[\.—]\s*([^\n]+)/gi;
    const matches = [...text.matchAll(sectionRegex)];

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const nextMatch = matches[i + 1];

        const sectionNumber = `Section ${match[1].trim()}`;
        const sectionTitle = match[2].trim();

        // Extract text between this section and next section
        const startIndex = match.index!;
        const endIndex = nextMatch ? nextMatch.index! : text.length;
        const sectionText = text.substring(startIndex, endIndex).trim();

        // Estimate page number (rough: 2000 chars per page)
        const pageNumber = Math.floor(startIndex / 2000) + 1;

        sections.push({
            number: sectionNumber,
            title: sectionTitle,
            text: sectionText,
            page: pageNumber
        });
    }

    return sections;
}

/**
 * Generate a plain English summary of a section (can enhance with AI later)
 */
function generateSummary(text: string): string {
    // For MVP: Take first 200 characters
    // Future: Use Gemini to generate summary
    return text.substring(0, 200).replace(/\n/g, ' ').trim() + '...';
}

/**
 * Split text into chunks of approximately `maxWords` words
 */
function chunkText(text: string, maxWords: number): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += maxWords) {
        chunks.push(words.slice(i, i + maxWords).join(' '));
    }

    return chunks;
}
