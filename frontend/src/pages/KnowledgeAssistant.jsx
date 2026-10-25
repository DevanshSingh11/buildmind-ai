import React, { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultCard from '../components/ResultCard';
import { queryKnowledgeBase } from '../services/api';

const SAMPLE_DEMO_RESULT = {
  answer:
    'According to ACI 347R-14 (Guide to Formwork for Concrete) Section 5.4 and ACI 301-20 Section 2.3.2:\n\n1. Vertical Formwork (Columns & Wall Faces): Side forms that do not support the dead weight of the concrete can generally be removed once the concrete has attained sufficient strength to avoid mechanical damage or slumping—typically a minimum of 12 hours under favorable ambient temperatures (> 50°F / 10°C) or upon reaching a minimum in-situ compressive strength of 500 psi (3.5 MPa).\n\n2. Flexural Soffit Forms (Slabs & Beams): Bottom forms and shoring must remain in place until the concrete achieves at least 70% to 75% of design compressive strength (f\'c), verified by field-cured test cylinders or non-destructive maturity monitoring (ASTM C1074).',
  metrics: [
    { label: 'Governing Code', value: 'ACI 347R / 301', subtext: 'American Concrete Institute' },
    { label: 'Min Strength', value: '500 psi', subtext: 'For vertical column side forms' },
    { label: 'Soffit Minimum', value: '75% f\'c', subtext: 'Before shore post removal' },
    { label: 'Ambient Min', value: '50°F (10°C)', subtext: 'Without thermal heating' },
  ],
  findings: [
    {
      title: 'ACI 347R-14 §5.4.1 — Side Form Removal Duration',
      severity: 'Low',
      detail: 'Side forms for columns, wall faces, and beam sides may be stripped after 12–24 cumulative hours provided concrete surface is immediately protected with wet curing compound.',
    },
    {
      title: 'ACI 301-20 §2.3.2 — Cold Weather Extension Clause',
      severity: 'Medium',
      detail: 'If ambient temperatures fall below 40°F (4.4°C), cumulative curing hours do not count toward stripping time unless insulated thermal blankets maintain core temperature above 50°F.',
    },
    {
      title: 'ASTM C1074 Maturity Method Verification',
      severity: 'Low',
      detail: 'Smart wireless embedded maturity sensors may be utilized in lieu of break cylinder destruction to permit rapid 18-hour cycle stripping.',
    },
  ],
  action_items: [
    {
      action: 'Test field-cured 4x8 inch cylinder specimens according to ASTM C39 before releasing load-bearing shoring.',
      priority: 'MANDATORY',
    },
    {
      action: 'Immediately coat newly exposed column faces with ASTM C309 membrane-forming curing compound within 30 minutes of stripping.',
      priority: 'MANDATORY',
    },
    {
      action: 'Maintain thermal boundary data logging if daytime temperature falls below 50°F.',
      priority: 'RECOMMENDED',
    },
  ],
};

const SUGGESTED_QUERIES = [
  'Minimum concrete curing time before stripping vertical column forms under ACI 347R?',
  'OSHA 1926.451 tie spacing requirements for tubular welded frame scaffolds?',
  'ASTM C39 compressive testing procedure and cylinder loading rate tolerances?',
  'IBC 2024 Table 601 fire-resistance ratings for Type I-A exterior load-bearing walls?',
];

export default function KnowledgeAssistant() {
  const [query, setQuery] = useState(
    'Minimum concrete curing time before stripping vertical column forms under ACI 347R?'
  );
  const [standardDomain, setStandardDomain] = useState('ACI (American Concrete Institute)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await queryKnowledgeBase({
        query,
        domain: standardDomain,
      });
      setResult(data);
    } catch (err) {
      console.warn('Knowledge query API call failed, offering fallback or retry:', err);
      setError(err.message || 'Failed to query engineering knowledge base from backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setError(null);
    setResult(SAMPLE_DEMO_RESULT);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* 1. Title + Description */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-xl shrink-0">
            📚
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Engineering Standards & Building Code Assistant
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Authoritative query engine synthesizing International Building Code (IBC), OSHA 1926, ACI 318 concrete standards, and ASTM testing specifications.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Queries */}
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">
          Common Engineering Queries:
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(q)}
              className="text-xs text-left px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 text-slate-700 transition-colors shadow-2xs"
            >
              📖 {q}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Input Section */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Engineering Query or Clause Specification
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Minimum lap splice length for #8 Grade 60 rebar in tension?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Governing Standards Domain
            </label>
            <select
              value={standardDomain}
              onChange={(e) => setStandardDomain(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="All Standards & Codes">All Standards & Codes</option>
              <option value="ACI (American Concrete Institute)">ACI (Concrete 318 / 301 / 347)</option>
              <option value="OSHA 1926 (Construction Safety)">OSHA 1926 (Site Safety)</option>
              <option value="IBC (International Building Code)">IBC 2021 / 2024 Code</option>
              <option value="ASTM (Materials Testing)">ASTM Testing Specifications</option>
              <option value="AISC (Structural Steel)">AISC Steel Manual</option>
            </select>
          </div>
        </div>

        {/* 3. Submit Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Searches verified regulatory code repositories with exact clause citations
          </div>

          <div className="flex items-center gap-2">
            {result && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Clear
              </button>
            )}

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md ${
                loading || !query.trim()
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/20 active:scale-[0.98]'
              }`}
            >
              <span>{loading ? 'Searching Codes...' : 'Search Knowledge Base'}</span>
              <span>📚</span>
            </button>
          </div>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <LoadingSpinner
          message="Querying Engineering Regulatory Repositories..."
          subtext="Indexing ACI 318, OSHA 1926, and IBC chapters to synthesize precise code provisions and safety tolerances."
        />
      )}

      {/* Error State with Retry & Demo */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <h4 className="font-bold text-sm">Knowledge Search Failed</h4>
              <p className="text-xs mt-1 text-rose-700">{error}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              Retry Request
            </button>
            <button
              onClick={handleUseDemo}
              className="px-4 py-2 text-xs font-bold bg-white text-rose-800 border border-rose-300 rounded-lg hover:bg-rose-100/60 transition-colors"
            >
              View Sample Demo Answer
            </button>
          </div>
        </div>
      )}

      {/* 4. Results Section (hidden until response received) */}
      {result && !loading && (
        <div className="space-y-6 animate-fadeIn">
          <ResultCard
            icon="📚"
            title="Regulatory Code & Engineering Interpretation"
            subtitle={`Domain: ${standardDomain} • Query: "${query}"`}
            severity="Low"
            metrics={
              result.metrics || [
                { label: 'Code Authority', value: 'ACI 347R-14' },
                { label: 'Form Stripping', value: '12–24 Hours' },
                { label: 'Compressive Req', value: '500 psi' },
                { label: 'Field Verification', value: 'ASTM C39' },
              ]
            }
            details={result.answer || result.summary || result.response}
            findings={result.findings || result.citations || []}
            actionItems={result.action_items || result.mandates || []}
            rawJson={result}
          />
        </div>
      )}
    </div>
  );
}
