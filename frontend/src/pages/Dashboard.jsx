import React from 'react';
import { Link } from 'react-router-dom';

const modules = [
  {
    path: '/safety-monitor',
    title: 'Site Safety Monitor',
    icon: '🦺',
    tag: 'Vision AI',
    tagColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description:
      'Upload site imagery to identify PPE non-compliance (hard hats, safety vests, harnesses), scaffolding hazards, and OSHA 1926 violations with instant risk scoring.',
    highlights: ['Hard hat & vest detection', 'Fall protection audit', 'OSHA standard cross-reference'],
    accent: 'hover:border-amber-400 group-hover:text-amber-600',
  },
  {
    path: '/crack-detection',
    title: 'Crack & Defect Detection',
    icon: '🔍',
    tag: 'Structural Vision',
    tagColor: 'bg-orange-100 text-orange-800 border-orange-200',
    description:
      'Multimodal computer vision for concrete, beam, column, and foundation inspection. Assesses crack width, propagation risk, and structural remediation urgency.',
    highlights: ['Width & pattern analysis', 'Shear vs settlement classification', 'Epoxy & retrofitting advice'],
    accent: 'hover:border-orange-400 group-hover:text-orange-600',
  },
  {
    path: '/valuation',
    title: 'Real Estate Valuation',
    icon: '🏘️',
    tag: 'Financial AI',
    tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description:
      'Estimate asset valuation, depreciated replacement cost, square footage rates, and cap rate feasibility based on architectural parameters and localized cost indices.',
    highlights: ['Sq.ft cost calculation', 'MEP & structural breakdowns', 'Depreciation & market comps'],
    accent: 'hover:border-emerald-400 group-hover:text-emerald-600',
  },
  {
    path: '/planning',
    title: 'Project Planning & Scheduling',
    icon: '📋',
    tag: 'Optimization',
    tagColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description:
      'Generate comprehensive execution schedules, resource requisition curves, Gantt-ready milestone breakdowns, and critical path risk matrices for your projects.',
    highlights: ['Phased milestone scheduling', 'Crew & machinery allocation', 'Critical path buffer planning'],
    accent: 'hover:border-blue-400 group-hover:text-blue-600',
  },
  {
    path: '/assistant',
    title: 'Site Daily Assistant',
    icon: '📝',
    tag: 'Conversational',
    tagColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description:
      'Interactive AI copilot for project managers, foremen, and safety officers. Generate daily progress summaries, craft safety toolbox talks, and coordinate crews.',
    highlights: ['Daily log distillation', 'Subcontractor briefings', 'Toolbox talk generator'],
    accent: 'hover:border-cyan-400 group-hover:text-cyan-600',
  },
  {
    path: '/weather',
    title: 'Weather Advisory',
    icon: '🌤️',
    tag: 'Forecasting',
    tagColor: 'bg-sky-100 text-sky-800 border-sky-200',
    description:
      'Evaluate meteorological risks for on-site activities. Formulates GO / NO-GO recommendations for concrete pouring, tower crane lifting, and high-altitude works.',
    highlights: ['Concrete cure temperature check', 'Tower crane wind thresholds', 'Rain & lightning delays'],
    accent: 'hover:border-sky-400 group-hover:text-sky-600',
  },
  {
    path: '/knowledge',
    title: 'Engineering Knowledge Assistant',
    icon: '📚',
    tag: 'Codes & Standards',
    tagColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description:
      'Search across International Building Code (IBC), OSHA regulations, ACI concrete standards, and ASTM testing specifications with authoritative clause citations.',
    highlights: ['ACI 318 & 301 compliance', 'OSHA 1926 standards', 'ASTM material tolerances'],
    accent: 'hover:border-purple-400 group-hover:text-purple-600',
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-700/60">
        {/* Background decorative grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Enterprise Multimodal Construction Intelligence</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Autonomous AI for Safer, Faster & Smarter Construction Sites
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Empower project teams with real-time computer vision safety audits, concrete crack severity analysis, financial appraisals, predictive scheduling, and deep engineering standards search.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-amber-400 font-bold">●</span> 7 AI Engines Online
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-emerald-400 font-bold">●</span> OSHA 1926 & ACI 318 Ready
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-cyan-400 font-bold">●</span> Multi-modal Vision + LLM
            </div>
          </div>
        </div>
      </div>

      {/* Module Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Intelligence Modules
            </h3>
            <p className="text-xs text-slate-500">
              Select an AI module below to launch an inspection or run an analysis
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-400 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            7 Active Modules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <Link
              key={mod.path}
              to={mod.path}
              className={`group flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all duration-200 ${mod.accent}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-amber-100/60 text-2xl flex items-center justify-center transition-colors">
                    {mod.icon}
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${mod.tagColor}`}>
                    {mod.tag}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {mod.title}
                </h4>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {mod.description}
                </p>

                {/* Highlights */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                  {mod.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="w-1 h-1 rounded-full bg-slate-400 group-hover:bg-amber-500 transition-colors" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-amber-600 transition-colors">
                <span>Launch Analysis</span>
                <span className="text-sm font-bold group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
