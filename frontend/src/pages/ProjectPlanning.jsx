import React, { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultCard from '../components/ResultCard';
import { generateProjectPlan } from '../services/api';

const SAMPLE_DEMO_RESULT = {
  project_summary:
    'Optimized Critical Path Method (CPM) 16-month execution schedule for a 12-story commercial tower. The plan establishes 5 core phases, incorporates a 21-day weather buffer, and schedules tower crane erection to maximize parallel superstructure and MEP installation workflows.',
  metrics: [
    { label: 'Planned Duration', value: '16 Months', subtext: 'Target: 18 Months' },
    { label: 'Total Budget', value: '$28.5M', subtext: 'Contingency: 8.5%' },
    { label: 'Peak Labor', value: '145 Workers', subtext: 'Month 8–11' },
    { label: 'Schedule Risk', value: 'Low', subtext: 'Buffer: 21 Days' },
  ],
  phases: [
    {
      title: 'Phase 1: Excavation, Shoring & Deep Foundations (Months 1–3)',
      severity: 'Low',
      detail: 'Secant piling shoring wall, bulk excavation 24,000 cu.yd, and 6ft thick reinforced raft slab pour.',
    },
    {
      title: 'Phase 2: Core Concrete & Superstructure (Months 3–8)',
      severity: 'Medium',
      detail: 'Self-climbing formwork for central shear core; 7-day floor cycle for post-tensioned slabs (Levels 1–12).',
    },
    {
      title: 'Phase 3: Exterior Curtain Wall & Envelope (Months 6–11)',
      severity: 'Low',
      detail: 'Unitized double-glazed aluminum curtain wall panels installed 3 floors trailing concrete operations.',
    },
    {
      title: 'Phase 4: MEP Rough-In, Fitout & Elevators (Months 8–14)',
      severity: 'Medium',
      detail: 'HVAC risers, dual electric substations, dry pipe fire suppression, and traction high-speed elevators.',
    },
    {
      title: 'Phase 5: Commissioning, Fire Marshall Sign-Off & Handover (Months 14–16)',
      severity: 'Low',
      detail: 'Integrated MEP testing, life safety smoke evacuation checks, and certificate of occupancy (CO) procurement.',
    },
  ],
  action_items: [
    {
      action: 'Procure long-lead electrical switchgear and chillers at least 26 weeks prior to Phase 4 start.',
      priority: 'CRITICAL',
    },
    {
      action: 'Finalize tower crane municipal airspace right-of-way permit 60 days before Phase 2.',
      priority: 'HIGH',
    },
    {
      action: 'Establish concrete batching plant backup contract to mitigate single-supplier batch failure.',
      priority: 'HIGH',
    },
    {
      action: 'Conduct weekly 4D BIM clash detection reviews between structural steel and MEP duct routes.',
      priority: 'STANDARD',
    },
  ],
};

export default function ProjectPlanning() {
  const [formData, setFormData] = useState({
    projectName: 'Apex Center Tower',
    projectType: 'Commercial High-Rise Office',
    budget: '$28,500,000',
    timelineMonths: 16,
    siteAreaSqFt: 65000,
    location: 'Denver Metro, CO',
    specialRequirements: 'LEED Gold Target, Winter concrete curing heating plan, Urban zero-lot-line site',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await generateProjectPlan(formData);
      setResult(data);
    } catch (err) {
      console.warn('Planning API call failed, offering fallback or retry:', err);
      setError(err.message || 'Failed to generate project plan from backend.');
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
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center text-xl shrink-0">
            📋
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              AI Project Planning & Schedule Optimization
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Automated milestone sequencing, critical path analysis (CPM), resource crew curve estimation, and supply chain contingency scheduling.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Input Section */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Project Title / Name
            </label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="e.g., Metro Tech Center Phase II"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Project Category
            </label>
            <select
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Commercial High-Rise Office">Commercial High-Rise Office</option>
              <option value="Residential Multi-Family Tower">Residential Multi-Family Tower</option>
              <option value="Industrial Logistics Warehouse">Industrial Logistics & Fulfillment</option>
              <option value="Civil Infrastructure & Bridge">Civil Infrastructure & Bridge</option>
              <option value="Healthcare & Specialty Hospital">Healthcare & Specialty Hospital</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Total Target Budget ($)
            </label>
            <input
              type="text"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="e.g., $25,000,000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Target Timeline (Months)
            </label>
            <input
              type="number"
              name="timelineMonths"
              min="2"
              max="60"
              value={formData.timelineMonths}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Site Location / City
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Denver Metro, CO"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Constraints, Certifications & Special Site Requirements
            </label>
            <input
              type="text"
              name="specialRequirements"
              value={formData.specialRequirements}
              onChange={handleChange}
              placeholder="e.g., LEED Gold Target, winter cold weather curing, zero-lot-line urban boundary"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 3. Submit Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Synthesizes CPM sequencing, resource constraints, and risk mitigation buffers
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
              disabled={loading}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md ${
                loading
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20 active:scale-[0.98]'
              }`}
            >
              <span>{loading ? 'Synthesizing Schedule...' : 'Generate Project Plan'}</span>
              <span>📋</span>
            </button>
          </div>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <LoadingSpinner
          message="Synthesizing Critical Path (CPM) & Milestone Schedule..."
          subtext="Balancing trade crew productivity curves, material delivery lead-times, seasonal weather windows, and safety buffer float."
        />
      )}

      {/* Error State with Retry & Demo */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <h4 className="font-bold text-sm">Schedule Generation Failed</h4>
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
              View Sample Demo Plan
            </button>
          </div>
        </div>
      )}

      {/* 4. Results Section (hidden until response received) */}
      {result && !loading && (
        <div className="space-y-6 animate-fadeIn">
          <ResultCard
            icon="📋"
            title={`Execution Schedule: ${formData.projectName}`}
            subtitle={`${formData.projectType} • Budget: ${formData.budget} • Location: ${formData.location}`}
            severity="Low"
            metrics={
              result.metrics || [
                { label: 'Total Duration', value: `${formData.timelineMonths} Months` },
                { label: 'Budget Target', value: formData.budget },
                { label: 'Phases', value: '5 Stages' },
                { label: 'Critical Path Buffer', value: '21 Days' },
              ]
            }
            details={result.project_summary || result.summary || result.analysis}
            findings={result.phases || result.milestones || []}
            actionItems={result.action_items || result.recommendations || []}
            rawJson={result}
          />
        </div>
      )}
    </div>
  );
}
