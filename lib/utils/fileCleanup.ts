import fs from 'fs';

/**
 * Delete file after processing to ensure privacy
 * CRITICAL for privacy-first architecture
 */
export async function cleanupFile(filePath: string): Promise<void> {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted file: ${filePath}`);
        }
    } catch (error) {
        console.error(`Failed to delete file ${filePath}:`, error);
    }
}
