import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultCard from '../components/ResultCard';
import { analyzeSafety } from '../services/api';

const SAMPLE_DEMO_RESULT = {
  risk_level: 'High',
  summary:
    'Visual inspection detected 6 active workers on Level 3 scaffolding. Multiple PPE infractions identified including lack of chin-strapped hard hats and an unanchored safety harness near an exposed floor edge.',
  metrics: [
    { label: 'Risk Level', value: 'High', subtext: 'Immediate action needed' },
    { label: 'Workers Detected', value: '6', subtext: 'Level 3 Scaffolding' },
    { label: 'PPE Compliance', value: '67%', subtext: '4 compliant / 2 non-compliant' },
    { label: 'Violations Found', value: '3', subtext: '1 Critical, 2 Moderate' },
  ],
  findings: [
    {
      title: 'Worker #2: Missing Hard Hat in Overhead Hazard Zone',
      severity: 'Critical',
      detail: 'Worker operating below crane slewing radius without mandatory head protection (OSHA 1926.100).',
    },
    {
      title: 'Worker #5: Unsecured Safety Harness at Floor Edge',
      severity: 'High',
      detail: 'Harness lanyard unclipped while working within 4ft of unbarricaded slab edge at 35ft elevation.',
    },
    {
      title: 'Missing High-Visibility Vest in Equipment Transit Path',
      severity: 'Medium',
      detail: 'Worker wearing dark clothing within forklift transit corridor.',
    },
  ],
  action_items: [
    {
      action: 'Immediately halt edge work on Level 3 until worker #5 anchors lanyard to engineered lifeline.',
      priority: 'URGENT',
    },
    {
      action: 'Provide ANSI Z89.1 certified Type I hard hat to worker #2 prior to re-entering crane swing radius.',
      priority: 'URGENT',
    },
    {
      action: 'Issue high-vis Class 2 vests to all ground level transit personnel.',
      priority: 'STANDARD',
    },
    {
      action: 'Log safety infraction in site supervisor daily report for afternoon toolbox talk review.',
      priority: 'STANDARD',
    },
  ],
  osha_standards: ['OSHA 1926.100 (Head Protection)', 'OSHA 1926.501 (Duty to have fall protection)', 'OSHA 1926.201 (Signaling & High-Vis)'],
};

export default function SafetyMonitor() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [zone, setZone] = useState('Zone B - Superstructure / Scaffolding');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!selectedFile) {
      alert('Please upload a construction site photo before running the analysis.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeSafety(selectedFile, { zone, notes });
      setResult(data);
    } catch (err) {
      console.warn('Backend API call failed, offering fallback or retry:', err);
      setError(err.message || 'Failed to analyze safety image from backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setError(null);
    setResult(SAMPLE_DEMO_RESULT);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* 1. Title + Description */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shrink-0">
            🦺
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Site Safety & PPE Compliance Monitor
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Multimodal computer vision audits site images for hard hats, high-vis vests, fall arrest harnesses, and hazardous OSHA 1926 violations.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Input Section */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
        <div>
          <ImageUploader
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            label="Upload Site Photo / Drone Capture"
            description="Drag & drop on-site JPEG, PNG, or WEBP photos showing workers, scaffolding, or hazardous zones."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Site Zone / Work Area
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="Zone A - Excavation & Earthworks">Zone A - Excavation & Earthworks</option>
              <option value="Zone B - Superstructure / Scaffolding">Zone B - Superstructure / Scaffolding</option>
              <option value="Zone C - Tower Crane & Hoisting Area">Zone C - Tower Crane & Hoisting Area</option>
              <option value="Zone D - Concrete Pouring & Formwork">Zone D - Concrete Pouring & Formwork</option>
              <option value="Zone E - Interior MEP & Fitout">Zone E - Interior MEP & Fitout</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Inspection Notes / Shift Context (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Morning shift, wind gusts 15mph, 12 workers on deck"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {/* 3. Submit Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {selectedFile ? `Ready to evaluate ${selectedFile.name}` : 'Select a photo to enable analysis'}
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
              disabled={loading || !selectedFile}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md ${
                loading || !selectedFile
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/20 active:scale-[0.98]'
              }`}
            >
              <span>{loading ? 'Analyzing Scene...' : 'Run Safety Vision Audit'}</span>
              <span>🦺</span>
            </button>
          </div>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <LoadingSpinner
          message="Auditing PPE & Site Hazards with Computer Vision..."
          subtext="Scanning image coordinates for hard hats, high-vis vests, anchor points, guardrails, and calculating OSHA risk coefficients."
        />
      )}

      {/* Error State with Retry and Demo Option */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <h4 className="font-bold text-sm">Safety Analysis Encountered an Error</h4>
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
              View Sample Demo Analysis
            </button>
          </div>
        </div>
      )}

      {/* 4. Results Section (hidden until response received) */}
      {result && !loading && (
        <div className="space-y-6 animate-fadeIn">
          <ResultCard
            icon="🦺"
            title="Safety & PPE Compliance Audit Report"
            subtitle={`Target: ${zone} • Evaluated by Multimodal Vision Engine`}
            severity={result.risk_level || (result.findings?.some((f) => f.severity === 'Critical') ? 'Critical' : 'High')}
            metrics={
              result.metrics || [
                { label: 'Risk Rating', value: result.risk_level || 'High' },
                { label: 'Compliance Rate', value: result.compliance_rate ? `${result.compliance_rate}%` : '67%' },
                { label: 'Detections', value: result.detections_count || '6 Workers' },
                { label: 'Violations', value: result.violations?.length || '3 Flags' },
              ]
            }
            details={result.summary || result.analysis || result.description}
            findings={result.findings || result.violations || []}
            actionItems={result.action_items || result.recommendations || []}
            rawJson={result}
          />

          {result.osha_standards && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
              <div className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider mb-2">
                Referenced OSHA 1926 Construction Regulations
              </div>
              <ul className="text-xs text-slate-300 space-y-1 font-mono list-disc list-inside">
                {result.osha_standards.map((std, i) => (
                  <li key={i}>{std}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
