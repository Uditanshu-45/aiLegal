import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

export async function GET() {
    try {
        const sections = db.prepare(`
      SELECT section_number, section_title, summary
      FROM act_sections
      ORDER BY id
    `).all();

        return NextResponse.json({
            totalSections: sections.length,
            source: 'Indian Contract Act, 1872',
            sourceUrl: 'https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf',
            sections: sections
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to fetch laws'
            },
            { status: 500 }
        );
    }
}
