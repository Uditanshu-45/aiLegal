'use client';

import { useState } from 'react';
import SplitScreenLayout from '@/components/layout/SplitScreenLayout';
import ContractViewer from '@/components/contract/ContractViewer';
import AnalysisPanel from '@/components/analysis/AnalysisPanel';
import ContractUploader from '@/components/upload/ContractUploader';
import { Spinner } from '@/components/ui/Spinner';
import { FileText, Upload, Shield, Scale, Zap, Lock } from 'lucide-react';

interface AnalysisResult {
  success: boolean;
  processingTimeMs: number;
  document: {
    fileName: string;
    fileSize: number;
    fileType: string;
    extractedCharacters: number;
    pageCount?: number;
    extractedText: string;
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
  deviations: any[];
  disclaimer: string;
}

export default function Home() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // For synchronized scrolling
  const [highlightedClauseId, setHighlightedClauseId] = useState<number | undefined>();
  const [highlightedViolationId, setHighlightedViolationId] = useState<number | undefined>();

  const handleFileUpload = async (file: File, language: 'en' | 'hi') => {
    setAnalyzing(true);
    setError(null);

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
        throw new Error(data.error || 'Analysis failed');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle clause click in contract viewer → scroll to analysis
  const handleClauseClick = (clauseId: number) => {
    setHighlightedViolationId(clauseId);
    // Clear after animation
    setTimeout(() => setHighlightedViolationId(undefined), 2000);
  };

  // Handle "Jump to Clause" click in violation card → scroll to contract
  const handleJumpToClause = (clauseId: number) => {
    setHighlightedClauseId(clauseId);
    // Clear after animation
    setTimeout(() => setHighlightedClauseId(undefined), 2000);
  };

  const resetAnalysis = () => {
    setResults(null);
    setError(null);
  };

  // === UPLOAD SCREEN ===
  if (!results && !analyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              अंधा क़ानून
            </h1>
            <p className="text-xl text-indigo-200 mb-2">
              The AI Legal Sentinel for Indian Freelancers
            </p>
            <p className="text-indigo-300 max-w-2xl mx-auto">
              Protect yourself from predatory contracts. Get instant analysis against
              <strong className="text-white"> Indian Contract Act, 1872</strong> with
              plain-language explanations.
            </p>
          </div>

          {/* Upload Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
              <ContractUploader onUpload={handleFileUpload} />

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">
                    ❌ <strong>Error:</strong> {error}
                  </p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-red-600 text-sm underline"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>

            {/* Privacy Badge */}
            <div className="bg-green-900/30 backdrop-blur border border-green-500/30 rounded-xl p-4 mb-8">
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-green-300 font-semibold">Privacy First</p>
                  <p className="text-green-200/80 text-sm">
                    Your contract is analyzed in-memory and deleted immediately.
                    We never store your documents.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Indian Law Based
              </h3>
              <p className="text-indigo-200 text-sm">
                Analyzes against 225 sections of the Indian Contract Act, 1872
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Instant Analysis
              </h3>
              <p className="text-indigo-200 text-sm">
                Get results in seconds with AI-powered explanations in plain language
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Protect Yourself
              </h3>
              <p className="text-indigo-200 text-sm">
                Detect non-compete clauses, unlimited liability, and other traps
              </p>
            </div>
          </div>

          {/* Sample Files */}
          <div className="text-center mt-12">
            <p className="text-indigo-300 text-sm mb-4">Want to try it out? Use a sample contract:</p>
            <div className="flex justify-center gap-4">
              <a
                href="/samples/predatory_contract.txt"
                download
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-400/30 
                  rounded-lg text-red-300 hover:bg-red-500/30 transition-colors text-sm"
              >
                <FileText className="h-4 w-4" />
                Predatory Contract
              </a>
              <a
                href="/samples/fair_contract.txt"
                download
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/30 
                  rounded-lg text-green-300 hover:bg-green-500/30 transition-colors text-sm"
              >
                <FileText className="h-4 w-4" />
                Fair Contract
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-indigo-700/50 mt-16">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center">
            <p className="text-indigo-400 text-sm">
              ⚖️ This tool is for educational purposes only. Not legal advice.
              Consult a qualified lawyer before making legal decisions.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // === LOADING SCREEN ===
  if (analyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
        <div className="text-center">
          <Spinner className="mx-auto mb-6 h-16 w-16 text-white" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Analyzing Your Contract...
          </h2>
          <p className="text-indigo-200 max-w-md mx-auto">
            Checking against 225 sections of the Indian Contract Act, 1872
          </p>
          <div className="mt-6 flex justify-center gap-8 text-sm text-indigo-300">
            <span>📄 Extracting text</span>
            <span>⚖️ Checking law violations</span>
            <span>🤖 Generating explanations</span>
          </div>
        </div>
      </div>
    );
  }

  // === RESULTS SCREEN (Split Layout) ===
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Header */}
      <header className="bg-white border-b shadow-sm z-20 flex-shrink-0">
        <div className="px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-indigo-900">अंधा क़ानून</h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {results.document.fileName}
                </p>
              </div>
            </div>

            {/* Processing Stats */}
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-500 border-l pl-4">
              <span>⏱️ {results.processingTimeMs}ms</span>
              <span>📝 {results.analysis.totalClauses} clauses</span>
              <span className={`font-medium ${results.analysis.riskyClausesFound > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                ⚠️ {results.analysis.riskyClausesFound} issues
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetAnalysis}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg 
                hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Analyze Another</span>
            </button>
          </div>
        </div>
      </header>

      {/* Split Screen Layout */}
      <div className="flex-1 overflow-hidden">
        <SplitScreenLayout
          leftPanel={
            <ContractViewer
              contractText={results.document.extractedText}
              riskyClauses={results.riskyClauses.map((v) => ({
                id: v.clauseNumber,
                text: v.originalText,
                startIndex: v.startIndex,
                endIndex: v.endIndex,
                riskLevel: v.riskLevel
              }))}
              onClauseClick={handleClauseClick}
              highlightedClauseId={highlightedClauseId}
            />
          }
          rightPanel={
            <AnalysisPanel
              overallScore={results.analysis.overallRiskScore}
              riskLevel={results.analysis.riskLevel}
              breakdown={results.analysis.breakdown}
              violations={results.riskyClauses}
              deviations={results.deviations}
              onJumpToClause={handleJumpToClause}
              highlightedViolationId={highlightedViolationId}
            />
          }
        />
      </div>
    </div>
  );
}