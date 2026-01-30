'use client';

import { useState } from 'react';
import ContractUploader from '@/components/upload/ContractUploader';
import RiskScoreMeter from '@/components/analysis/RiskScoreMeter';
import RiskyClauseCard from '@/components/analysis/RiskyClauseCard';
import DeviationHighlighter from '@/components/analysis/DeviationHighlighter';
import { Spinner } from '@/components/ui/Spinner';

export default function Home() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File, language: 'en' | 'hi') => {
    setAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">⚖️</div>
            <div>
              <h1 className="text-3xl font-bold text-indigo-900">
                अंधा क़ानून (AndhaKanoon)
              </h1>
              <p className="text-gray-600 mt-1">
                The AI Legal Sentinel for Indian Freelancers
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Upload Section */}
        {!results && !analyzing && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">
              Upload Your Contract
            </h2>
            <p className="text-gray-600 mb-6">
              We'll analyze it against Indian law (Contract Act 1872) and explain
              risky clauses in simple language.
            </p>
            <ContractUploader onUpload={handleFileUpload} />

            {/* Privacy Notice */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                🔒 <strong>Privacy First:</strong> Your contract is analyzed in-memory
                and deleted immediately. We never store your documents.
              </p>
            </div>

            {/* Features */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl mb-2">📜</div>
                <h3 className="font-semibold mb-1">Indian Law Grounded</h3>
                <p className="text-sm text-gray-600">
                  Validates against 225 sections of Indian Contract Act, 1872
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold mb-1">0-100 Risk Score</h3>
                <p className="text-sm text-gray-600">
                  Deterministic scoring based on clause severity
                </p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <div className="text-2xl mb-2">💡</div>
                <h3 className="font-semibold mb-1">ELI5 Explanations</h3>
                <p className="text-sm text-gray-600">
                  AI-powered simple explanations in English or Hindi
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {analyzing && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Spinner className="mx-auto mb-4" />
            <p className="text-lg text-gray-700">
              Analyzing your contract against Indian law...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Checking 225 sections of the Indian Contract Act, 1872
            </p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Risk Score */}
            <RiskScoreMeter
              score={results.analysis.overallRiskScore}
              level={results.analysis.riskLevel}
              breakdown={results.analysis.breakdown}
            />

            {/* Deviations from Fair Contract */}
            {results.deviations && results.deviations.length > 0 && (
              <DeviationHighlighter deviations={results.deviations} />
            )}

            {/* Risky Clauses */}
            {results.riskyClauses && results.riskyClauses.length > 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Risky Clauses Found ({results.riskyClauses.length})
                </h2>
                <div className="space-y-4">
                  {results.riskyClauses.map((clause: any, index: number) => (
                    <RiskyClauseCard key={index} clause={clause} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-semibold text-green-700 mb-2">
                  No Major Risks Detected!
                </h2>
                <p className="text-gray-600">
                  This contract appears to be relatively fair. However, always review carefully
                  and consider consulting a lawyer before signing.
                </p>
              </div>
            )}

            {/* Processing Stats */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="font-semibold">Processing Time:</span>{' '}
                  {(results.processingTimeMs / 1000).toFixed(2)}s
                </div>
                <div>
                  <span className="font-semibold">Total Clauses:</span>{' '}
                  {results.analysis.totalClauses}
                </div>
                <div>
                  <span className="font-semibold">File Size:</span>{' '}
                  {(results.document.fileSize / 1024).toFixed(2)} KB
                </div>
                <div>
                  <span className="font-semibold">Characters:</span>{' '}
                  {results.document.extractedCharacters.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚖️ <strong>Disclaimer:</strong> {results.disclaimer}
              </p>
            </div>

            {/* Analyze Another */}
            <button
              onClick={() => setResults(null)}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              Analyze Another Contract
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              ❌ <strong>Error:</strong> {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>
            Made for Indian freelancers | Powered by{' '}
            <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              Google Gemini
            </a>
          </p>
          <p className="mt-2 text-xs">
            This tool is for educational purposes only and does not constitute legal advice.
          </p>
        </div>
      </footer>
    </main>
  );
}