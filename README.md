# 🚀 AndhaKanoon (अंधा क़ानून)

**The AI Legal Sentinel for Indian Freelancers**

AndhaKanoon is a privacy-first contract analyzer that detects predatory clauses in freelance contracts using **Indian law** (NOT US law), explains risks in simple language, and generates a 0-100 risk score.

## 🎯 Features

- ✅ **Indian Law Grounded**: Validates against 225 sections of the Indian Contract Act, 1872
- ✅ **0-100 Risk Score**: Deterministic scoring based on clause severity (not AI guesswork)
- ✅ **ELI5 Explanations**: AI-powered simple explanations in English or Hindi
- ✅ **Privacy-First**: Contracts analyzed in-memory and deleted immediately
- ✅ **Deviation Detection**: Compares against fair contract baseline
- ✅ **Multi-Format Support**: PDF, DOCX, PNG, JPG (with OCR)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (better-sqlite3)
- **PDF Parsing**: pdf-parse
- **AI**: Google Gemini 1.5 Flash
- **OCR**: Tesseract.js

## 📦 Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/andhakanoon.git
cd andhakanoon
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

Create `.env.local`:

```env
# Get API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Database path
DATABASE_PATH=./data/legal_knowledge.db

# Environment
NODE_ENV=development
```

### 4. Initialize Database

This will download the 53-page Indian Contract Act PDF and load it into SQLite:

```bash
npm run seed
```

Expected output:
```
📥 Downloading Indian Contract Act PDF...
✅ PDF downloaded successfully
📄 Parsing Indian Contract Act PDF...
📊 Loaded PDF: 53 pages, 125000 characters
📚 Found 225 sections
✅ Indian Contract Act loaded into database
✅ Seeded 10 clause patterns
✅ Seeded 6 fair contract baselines
✅ Seeded 4 explanation templates
✅ Database seeded successfully
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

### Test with Sample Contracts

Two sample contracts are included:

1. **Predatory Contract** (`/public/samples/predatory_contract.txt`)
   - Contains Section 27 violations (non-compete)
   - Unlimited liability
   - Excessive penalties
   - Foreign jurisdiction
   - Expected score: **95/100 (DANGEROUS)**

2. **Fair Contract** (`/public/samples/fair_contract.txt`)
   - Balanced terms
   - Net 30 payment
   - Mutual termination rights
   - Expected score: **0-15/100 (SAFE)**

## 📚 How It Works

### 1. **Text Extraction**
- Supports PDF, DOCX, and images (OCR with Tesseract)
- Contract parsed into individual clauses

### 2. **Rule-Based Validation** (NOT AI)
- Each clause checked against 10 clause patterns in database
- Keyword matching triggers violations
- Example: "non-compete" + "shall not work" → Section 27 violation

### 3. **Indian Law Grounding**
- All 225 sections of Indian Contract Act loaded from official 53-page PDF
- Each violation linked to specific section with full text
- Example: Section 27 makes non-compete clauses VOID in India

### 4. **Risk Scoring**
```
CRITICAL: 40 points (Section 27, Section 23 violations)
HIGH: 25 points (Unlimited liability, blanket IP transfer)
MEDIUM: 15 points (Unilateral termination, delayed payments)
LOW: 5 points (Vague scope, minor issues)

Total Score: Sum of all violations (capped at 100)
```

### 5. **AI Explanations** (Gemini 1.5 Flash)
- AI **explains** risky clauses in simple language
- AI does NOT decide legality (that's rule-based)
- Templates ensure consistency

### 6. **Deviation Check**
- Compares contract against "fair baseline"
- Example: "Your payment terms are Net 120 vs standard Net 30"

##  Critical: Indian Law vs US Law

**Section 27 of Indian Contract Act, 1872:**
> "Every agreement by which anyone is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void."

This means:
- ❌ Non-compete clauses are **VOID** in India (unlike enforceable in many US states)
- ❌ You CANNOT be prevented from working with competitors
- ✅ Freelancers can ignore non-compete clauses

**Section 23:**
> "The consideration or object of an agreement is lawful, unless it is forbidden by law; or is of such a nature that, if permitted, it would defeat the provisions of any law; or is fraudulent or involves or implies injury to the person or property of another"

This means:
- ❌ Contracts with illegal purposes are **VOID AB INITIO** (void from the start)
- ❌ Entire contract is unenforceable, not just the clause

## 🔐 Privacy Architecture

1. **No Storage**: Contracts analyzed in-memory
2. **Immediate Deletion**: Files deleted after analysis
3. **No Logging**: Contract content never logged
4. **No Database**: Only analysis results stored temporarily (if needed)

## 📁 Project Structure

```
andhakanoon/
├── app/
│   ├── page.tsx                    # Homepage with upload UI
│   ├── layout.tsx                  # Root layout
│   └── api/
│       ├── analyze/route.ts        # Main analysis endpoint
│       ├── health/route.ts         # Health check
│       └── laws/route.ts           # List Indian laws
│
├── components/
│   ├── upload/
│   │   └── ContractUploader.tsx    # Drag-and-drop uploader
│   └── analysis/
│      ├── RiskScoreMeter.tsx      # 0-100 gauge
│       ├── RiskyClauseCard.tsx     # Clause display
│       └── DeviationHighlighter.tsx # Baseline comparison
│
├── lib/
│   ├── db/
│   │   ├── client.ts               # SQLite connection
│   │   ├── schema.sql              # Database schema
│   │   ├── actLoader.ts            # PDF loader
│   │   ├── seed.ts                 # Seed data
│   │   └── queries.ts              # SQL queries
│   │
│   └── services/
│       ├── extractor.service.ts    # PDF/DOCX/OCR
│       ├── parser.service.ts       # Clause splitting
│       ├── indianLawValidator.service.ts # Rule-based validation
│       ├── deviationChecker.service.ts # Baseline comparison
│       ├── scorer.service.ts       # Risk calculation
│       └── explainer.service.ts    # Gemini explanations
│
├── data/
│   ├── indian_contract_act.pdf     # 53-page PDF (auto-downloaded)
│   └── legal_knowledge.db          # SQLite database
│
└── public/samples/
    ├── predatory_contract.txt      # Test contract (risky)
    └── fair_contract.txt           # Test contract (safe)
```

## 🚨 Common Violations Detected

| Violation Type | Risk Level | Indian Law Section | Points |
|---------------|------------|-------------------|--------|
| Non-compete clause | CRITICAL | Section 27 | 40 |
| Unlawful object | CRITICAL | Section 23 | 40 |
| Unlimited liability | HIGH | Section 73 | 25 |
| Blanket IP transfer | HIGH | Section 10 | 25 |
| Excessive penalties | HIGH | Section 74 | 20 |
| Unilateral termination | MEDIUM | Section 10 | 15 |
| Delayed payments (90+ days) | MEDIUM | Section 73 | 18 |
| Foreign jurisdiction | MEDIUM | Section 10 | 12 |
| Vague scope | LOW | Section 10 | 5 |

## 🔍 API Endpoints

### POST /api/analyze
Analyze a contract file

**Request:**
```typescript
FormData {
  file: File (PDF/DOCX/Image)
  language: 'en' | 'hi'
}
```

**Response:**
```typescript
{
  success: true,
  processingTimeMs: 2345,
  analysis: {
    overallRiskScore: 95,
    riskLevel: "DANGEROUS",
    totalClauses: 10,
    riskyClausesFound: 7,
    breakdown: { CRITICAL: 2, HIGH: 3, MEDIUM: 2, LOW: 0 }
  },
  riskyClauses: [...],
  deviations: [...],
  disclaimer: "..."
}
```

### GET /api/health
Check system health

### GET /api/laws
List all Indian Contract Act sections

## 🤝 Contributing

Contributions welcome! Please:

1. Focus on **Indian law** (not US law)
2. Add more clause patterns to database
3. Improve ELI5 explanations
4. Add support for more Indian languages

## ⚖️ Disclaimer

This tool is for **educational purposes only**. It does not constitute legal advice. Always consult a qualified lawyer before signing any contract.

## 📜 License

MIT License

## 🙏 Acknowledgments

- Indian Contract Act, 1872 (Official PDF): [https://www.indiacode.nic.in/](https://www.indiacode.nic.in/)
- Powered by Google Gemini 1.5 Flash
- Built for Indian freelancers ❤️

---

**Made in India 🇮🇳 for Indian Freelancers**

*"अंधा क़ानून" (Andha Kanoon) means "Blind Law" - highlighting how many freelancers sign contracts without understanding the legal implications.*
