import { GoogleGenerativeAI } from '@google/generative-ai';
import { getExplanationTemplate } from '../db/queries';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * Generate role-based explanations using Gemini API
 * Returns BOTH freelancer and company perspectives in one call
 */
export async function explainClause(
    clauseText: string,
    clauseType: string,
    indianLawSectionText: string,
    language: 'en' | 'hi' = 'en'
): Promise<{
    freelancer: { simpleExplanation: string; realLifeImpact: string; };
    company: { simpleExplanation: string; realLifeImpact: string; };
}> {
    // Get template for consistency
    const template = getExplanationTemplate(clauseType) as any;

    if (!template) {
        // Fallback if no template
        return generateWithoutTemplate(clauseText, indianLawSectionText, language);
    }

    const prompt = `
You are explaining a legal contract clause from TWO different perspectives.

CRITICAL CONTEXT:
- This is for INDIAN law, NOT US law
- Indian Contract Act, 1872 applies
- Example: Non-compete clauses are VOID in India (Section 27)

CLAUSE FROM CONTRACT:
"${clauseText}"

INDIAN LAW SECTION:
${indianLawSectionText}

TEMPLATE GUIDANCE:
Base Explanation: ${template.base_explanation_en}
Real-Life Impact: ${template.real_life_impact_en}
Hint: ${template.gemini_prompt_hint}

YOUR TASK:
Generate explanations for TWO audiences in ${language === 'hi' ? 'Hindi' : 'English'}:

1. FREELANCER/EMPLOYEE perspective:
   - Focus on: personal risk, income protection, career freedom
   - Tone: protective, empathetic, actionable
   - Example: "This could stop you from taking future clients..."

2. COMPANY/EMPLOYER perspective:
   - Focus on: enforceability risk, legal liability, business implications
   - Tone: professional, pragmatic, strategic
   - Example: "This clause may be unenforceable under Indian law..."

RULES:
- Use everyday language (NO legal jargon)
- Be SPECIFIC about impacts
- Cite the Indian law section number
- Keep each explanation to 2-3 sentences

Return JSON:
{
  "freelancer": {
    "simpleExplanation": "...",
    "realLifeImpact": "..."
  },
  "company": {
    "simpleExplanation": "...",
    "realLifeImpact": "..."
  }
}
`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON (handle markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid Gemini response format');
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Gemini API error:', error);
        // Fallback to template if AI fails
        return {
            freelancer: {
                simpleExplanation: template.base_explanation_en,
                realLifeImpact: template.real_life_impact_en
            },
            company: {
                simpleExplanation: 'This clause may expose the company to legal challenges.',
                realLifeImpact: 'Consider reviewing with legal counsel before enforcement.'
            }
        };
    }
}


async function generateWithoutTemplate(
    clauseText: string,
    indianLawSection: string,
    language: 'en' | 'hi'
): Promise<{
    freelancer: { simpleExplanation: string; realLifeImpact: string; };
    company: { simpleExplanation: string; realLifeImpact: string; };
}> {
    const prompt = `
You are a legal expert explaining contract clauses.

CONTEXT: Indian Contract Act, 1872 applies.

CLAUSE: "${clauseText.substring(0, 400)}"
INDIAN LAW: ${indianLawSection.substring(0, 300)}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "freelancer": {
    "simpleExplanation": "2-3 sentences from worker's perspective",
    "realLifeImpact": "Specific impact on their income/career"
  },
  "company": {
    "simpleExplanation": "2-3 sentences from employer's perspective", 
    "realLifeImpact": "Specific business/legal risk"
  }
}
`;

    try {
        console.log(`[GEMINI] 🤖 Calling Gemini for clause explanation...`);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log(`[GEMINI] 📝 Response received (${text.length} chars)`);

        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            console.warn(`[GEMINI] ⚠️ No JSON found in response`);
            throw new Error('No JSON in response');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`[GEMINI] ✅ Successfully parsed explanation`);
        return parsed;

    } catch (error: any) {
        console.error(`[GEMINI] ❌ Error: ${error.message}`);

        // Return clause-type-specific fallback based on clause content
        const clauseLower = clauseText.toLowerCase();

        if (clauseLower.includes('compete') || clauseLower.includes('competitor')) {
            return {
                freelancer: {
                    simpleExplanation: 'This non-compete clause tries to stop you from working with competitors. Under Section 27 of Indian Contract Act, such restrictions are generally VOID.',
                    realLifeImpact: 'Good news: You can likely work wherever you want after leaving. This clause is unenforceable in India.'
                },
                company: {
                    simpleExplanation: 'This non-compete clause is void under Section 27 of Indian Contract Act 1872.',
                    realLifeImpact: 'You cannot legally prevent employees from joining competitors in India.'
                }
            };
        }

        if (clauseLower.includes('intellectual property') || clauseLower.includes('invention') || clauseLower.includes(' ip ')) {
            return {
                freelancer: {
                    simpleExplanation: 'This clause affects ownership of work you create. It may claim rights over your personal projects too.',
                    realLifeImpact: 'Your side projects might belong to the company if this clause is too broad.'
                },
                company: {
                    simpleExplanation: 'This IP assignment clause may be overly broad and face challenges.',
                    realLifeImpact: 'Overly aggressive IP clauses can deter talent and create legal disputes.'
                }
            };
        }

        if (clauseLower.includes('termination') || clauseLower.includes('notice period')) {
            return {
                freelancer: {
                    simpleExplanation: 'This termination clause may allow the company to end your contract with limited notice.',
                    realLifeImpact: 'You may have less job security than expected. Check for mutual termination rights.'
                },
                company: {
                    simpleExplanation: 'This termination clause should comply with applicable labor laws.',
                    realLifeImpact: 'Improper termination procedures can lead to wrongful termination claims.'
                }
            };
        }

        // Generic fallback
        return {
            freelancer: {
                simpleExplanation: 'This clause may affect your rights. Review it carefully before signing.',
                realLifeImpact: 'Consider negotiating or seeking legal advice on unfavorable terms.'
            },
            company: {
                simpleExplanation: 'This clause may have enforceability issues under Indian law.',
                realLifeImpact: 'Consult legal counsel to ensure compliance and enforceability.'
            }
        };
    }
}
