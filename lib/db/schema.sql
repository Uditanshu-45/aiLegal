-- =====================================================
-- INDIAN CONTRACT ACT STORAGE
-- =====================================================

-- Full text of all 225 sections from 53-page PDF
CREATE TABLE IF NOT EXISTS act_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_number TEXT NOT NULL UNIQUE,   -- "Section 27", "Section 23"
  section_title TEXT NOT NULL,           -- "Agreements in restraint of trade"
  full_text TEXT NOT NULL,               -- Complete section text from PDF
  summary TEXT NOT NULL,                 -- Plain English summary
  page_number INTEGER,                   -- Page in PDF (1-53)
  chapter TEXT,                          -- "Chapter II: Of Contracts"
  gov_url TEXT DEFAULT 'https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chunked text for semantic search (future: add embeddings)
CREATE TABLE IF NOT EXISTS act_embeddings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_number TEXT NOT NULL,
  chunk_text TEXT NOT NULL,             -- 500-word chunks
  chunk_index INTEGER,                  -- Position in section
  page_number INTEGER,
  FOREIGN KEY (section_number) REFERENCES act_sections(section_number)
);

-- =====================================================
-- CLAUSE DETECTION PATTERNS (RULE-BASED)
-- =====================================================

CREATE TABLE IF NOT EXISTS clause_patterns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clause_type TEXT NOT NULL,            -- "non_compete_section27", "unlawful_object_section23"
  keywords TEXT NOT NULL,               -- JSON array: ["non-compete", "restraint of trade"]
  risk_level TEXT NOT NULL,             -- "CRITICAL", "HIGH", "MEDIUM", "LOW"
  risk_score INTEGER NOT NULL,          -- Numeric: CRITICAL=40, HIGH=25, MEDIUM=15, LOW=5
  linked_section TEXT NOT NULL,         -- "Section 27" (FK to act_sections)
  description TEXT NOT NULL,
  example_violation TEXT,               -- Example of how this appears in contracts
  FOREIGN KEY (linked_section) REFERENCES act_sections(section_number)
);

-- =====================================================
-- FAIR CONTRACT BASELINE
-- =====================================================

CREATE TABLE IF NOT EXISTS fair_contract_baseline (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clause_category TEXT NOT NULL UNIQUE, -- "payment_terms", "termination_notice", etc.
  fair_standard TEXT NOT NULL,          -- "Net 30 days"
  acceptable_range TEXT,                -- "15-45 days"
  red_flag_threshold TEXT,              -- "Beyond 60 days"
  explanation TEXT NOT NULL
);

-- =====================================================
-- EXPLANATION TEMPLATES (FOR CONSISTENCY)
-- =====================================================

CREATE TABLE IF NOT EXISTS explanation_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clause_type TEXT NOT NULL UNIQUE,
  base_explanation_en TEXT NOT NULL,
  base_explanation_hi TEXT,             -- Hindi (future)
  real_life_impact_en TEXT NOT NULL,
  gemini_prompt_hint TEXT               -- Guide AI on what to emphasize
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_section_number ON act_sections(section_number);
CREATE INDEX IF NOT EXISTS idx_clause_type ON clause_patterns(clause_type);
CREATE INDEX IF NOT EXISTS idx_risk_level ON clause_patterns(risk_level);
CREATE INDEX IF NOT EXISTS idx_embeddings_section ON act_embeddings(section_number);
