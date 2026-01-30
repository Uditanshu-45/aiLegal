// Test script for /api/analyze endpoint
const fs = require('fs');
const path = require('path');

async function testAnalyzeEndpoint() {
    const filePath = path.join(__dirname, 'data', 'test_predatory_contract.txt');
    const fileContent = fs.readFileSync(filePath);

    // Create FormData manually for Node.js
    const boundary = '----FormBoundary' + Date.now();
    const body = Buffer.concat([
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from(`Content-Disposition: form-data; name="file"; filename="test_predatory_contract.txt"\r\n`),
        Buffer.from(`Content-Type: text/plain\r\n\r\n`),
        fileContent,
        Buffer.from(`\r\n--${boundary}\r\n`),
        Buffer.from(`Content-Disposition: form-data; name="language"\r\n\r\n`),
        Buffer.from(`en`),
        Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    let output = '';

    try {
        const response = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: body
        });

        const result = await response.json();

        output += '\n========== API TEST RESULTS ==========\n';
        output += 'Status: ' + response.status + '\n';
        output += 'Success: ' + result.success + '\n';

        if (result.success) {
            output += '\n--- Document Info ---\n';
            output += 'File: ' + result.document.fileName + '\n';
            output += 'Characters: ' + result.document.extractedCharacters + '\n';

            output += '\n--- Analysis Summary ---\n';
            output += 'Risk Score: ' + result.analysis.overallRiskScore + ' / 100\n';
            output += 'Risk Level: ' + result.analysis.riskLevel + '\n';
            output += 'Total Clauses: ' + result.analysis.totalClauses + '\n';
            output += 'Risky Clauses Found: ' + result.analysis.riskyClausesFound + '\n';
            output += 'Breakdown: ' + JSON.stringify(result.analysis.breakdown) + '\n';

            output += '\n--- Risky Clauses ---\n';
            result.riskyClauses.forEach((clause, i) => {
                output += `\n[${i + 1}] ${clause.violationType}\n`;
                output += `    Risk: ${clause.riskLevel} (${clause.riskScore} pts)\n`;
                output += `    Law: ${clause.indianLawReference?.section}\n`;
                output += `    Applies To: ${clause.appliesTo?.join(', ') || 'N/A'}\n`;
                output += `    Business Risk: ${clause.businessRisk || 'N/A'}\n`;
                output += `    Keywords: ${clause.matchedKeywords?.join(', ')}\n`;
                output += `    Explanation: ${clause.explanation?.simple?.substring(0, 150)}...\n`;
            });

            output += '\n--- Deviations from Fair Contract ---\n';
            result.deviations.forEach((dev, i) => {
                output += `[${i + 1}] ${dev.category}: ${dev.deviationLevel}\n`;
            });

            // Save full JSON for analysis
            fs.writeFileSync('test-results.json', JSON.stringify(result, null, 2));
            output += '\n[Full JSON saved to test-results.json]\n';
        } else {
            output += 'Error: ' + result.error + '\n';
        }

        output += '\n======================================\n';

    } catch (error) {
        output += 'Test failed: ' + error.message + '\n';
    }

    // Write to file AND console
    fs.writeFileSync('test-output.txt', output);
    console.log(output);
}

testAnalyzeEndpoint();
