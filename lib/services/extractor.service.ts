import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import type { ExtractedText } from '../types/contract.types';

/**
 * Extract text from PDF, DOCX, TXT, or image files
 * Handles multiple file formats for maximum flexibility
 */
export async function extractText(file: File): Promise<ExtractedText> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
        // Plain text extraction (most reliable)
        if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
            const text = await file.text();
            return {
                text,
                metadata: {
                    characterCount: text.length,
                    wordCount: text.split(/\s+/).filter(w => w.length > 0).length
                }
            };
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // PDF extraction
        if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
            try {
                const data = await pdfParse(buffer, {
                    // Options to handle problematic PDFs
                    max: 0, // No page limit
                });

                if (!data.text || data.text.trim().length === 0) {
                    throw new Error('PDF appears to be empty or contains only images. Please try uploading a text-based PDF or use the TXT format.');
                }

                return {
                    text: data.text,
                    metadata: {
                        characterCount: data.text.length,
                        pageCount: data.numpages,
                        wordCount: data.text.split(/\s+/).filter(w => w.length > 0).length
                    }
                };
            } catch (pdfError) {
                // Handle specific PDF parsing errors
                const errorMessage = pdfError instanceof Error ? pdfError.message : 'Unknown PDF error';

                if (errorMessage.includes('compression') || errorMessage.includes('flate')) {
                    throw new Error('This PDF uses an unsupported compression format. Please try converting it to a different format (TXT or DOCX) or re-save it using a different PDF tool.');
                }

                if (errorMessage.includes('password') || errorMessage.includes('encrypted')) {
                    throw new Error('This PDF is password-protected. Please provide an unencrypted version.');
                }

                throw new Error(`PDF parsing failed: ${errorMessage}. Try converting to TXT format.`);
            }
        }

        // DOCX extraction
        if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
            const result = await mammoth.extractRawText({ buffer });
            return {
                text: result.value,
                metadata: {
                    characterCount: result.value.length,
                    wordCount: result.value.split(/\s+/).filter(w => w.length > 0).length
                }
            };
        }

        // Image extraction (OCR)
        if (fileType.startsWith('image/') || fileName.match(/\.(png|jpg|jpeg|gif|bmp|webp)$/)) {
            const { data } = await Tesseract.recognize(buffer, 'eng', {
                logger: (m) => console.log('OCR Progress:', m.status, m.progress)
            });
            return {
                text: data.text,
                metadata: {
                    characterCount: data.text.length,
                    wordCount: data.text.split(/\s+/).filter(w => w.length > 0).length
                }
            };
        }

        throw new Error(`Unsupported file type: ${fileType}. Supported formats: PDF, DOCX, TXT, PNG, JPG`);
    } catch (error) {
        // Re-throw if already formatted
        if (error instanceof Error && error.message.includes('PDF') ||
            error instanceof Error && error.message.includes('Unsupported')) {
            throw error;
        }
        throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
