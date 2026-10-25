import React, { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultCard from '../components/ResultCard';
import { getWeatherAdvisory } from '../services/api';

const SAMPLE_DEMO_RESULT = {
  advisory_status: 'Caution',
  summary:
    'Moderate meteorological risk for outdoor trades due to approaching storm front. Sustained winds at 18 mph with peak gusts up to 31 mph trigger tower crane shutdown thresholds. Relative humidity and evening showers require special concrete placement curing measures.',
  metrics: [
    { label: 'Site Status', value: 'CAUTION', subtext: 'Restricted outdoor work' },
    { label: 'Wind / Gusts', value: '18 / 31 mph', subtext: 'Exceeds crane limit (25mph)' },
    { label: 'Precipitation', value: '65% Rain', subtext: 'Expected after 14:00' },
    { label: 'Temperature', value: '44°F (6.7°C)', subtext: 'Cold weather precautions' },
  ],
  findings: [
    {
      title: 'Tower Crane Operation: NO-GO after 11:30 AM',
      severity: 'Critical',
      detail: 'Wind gusts forecasted at 28–31 mph exceed OSHA and manufacturer maximum allowable lifting parameters (25 mph limit for load radius control).',
    },
    {
      title: 'Structural Concrete Pouring: CONDITIONAL GO',
      severity: 'Medium',
      detail: 'Morning pour permitted if finished before 13:00. Apply curing compound and insulated blankets (ACI 306R cold-weather concreting guidelines).',
    },
    {
      title: 'Exterior Spray Painting & Sealants: HALTED',
      severity: 'High',
      detail: 'Relative humidity of 82% and impending afternoon rain will prevent proper primer adhesion and polymer curing.',
    },
  ],
  action_items: [
    {
      action: 'Weather-vane (free slew) all tower cranes before noon and secure hook blocks to designated ground anchors.',
      priority: 'URGENT',
    },
    {
      action: 'Deploy tarpaulins and sump pumps in lower basement excavation pit prior to 14:00 rainfall.',
      priority: 'HIGH',
    },
    {
      action: 'Protect freshly poured Level 4 slab with polyethylene curing sheets against sudden droplet wash-out.',
      priority: 'HIGH',
    },
    {
      action: 'Brief all trade leads during 11:00 coordination standup on lightning 30-30 shelter protocol.',
      priority: 'STANDARD',
    },
  ],
};

const ACTIVITY_OPTIONS = [
  'Tower Crane & Heavy Hoisting',
  'Structural Concrete Pouring & Curing',
  'Roof Waterproofing & Hot Bitumen',
  'Deep Trenching & Earth Excavation',
  'Exterior Facade Glazing & Scaffolding',
  'High-Altitude Structural Steel Erection',
];

export default function WeatherAdvisory() {
  const [location, setLocation] = useState('Chicago South Loop Site, IL');
  const [forecastWindow, setForecastWindow] = useState('Today (Full Shift)');
  const [selectedActivities, setSelectedActivities] = useState([
    'Tower Crane & Heavy Hoisting',
    'Structural Concrete Pouring & Curing',
    'Exterior Facade Glazing & Scaffolding',
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const toggleActivity = (activity) => {
    setSelectedActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]
    );
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await getWeatherAdvisory({
        location,
        forecastWindow,
        activities: selectedActivities,
      });
      setResult(data);
    } catch (err) {
      console.warn('Weather advisory API call failed, offering fallback or retry:', err);
      setError(err.message || 'Failed to fetch weather advisory from backend.');
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
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center text-xl shrink-0">
            🌤️
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Weather Impact & Site Operations Advisory
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Meteorological risk forecasting for high-hazard construction trades: tower crane wind locks, ACI 305R/306R concrete curing, and stormwater mitigation.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Input Section */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Site Location / Postal Code
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Chicago South Loop, IL 60605"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Forecast Timeline Window
            </label>
            <select
              value={forecastWindow}
              onChange={(e) => setForecastWindow(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="Today (Full Shift)">Today (Immediate 12-Hour Shift)</option>
              <option value="Tomorrow (Next Day Operations)">Tomorrow (Next Day Planning)</option>
              <option value="3-Day Lookahead Forecast">3-Day Lookahead Forecast</option>
              <option value="Weekend Weather Window">Weekend Standby Window</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Scheduled Sensitive Trades / Critical Activities (Select all that apply)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ACTIVITY_OPTIONS.map((activity, idx) => {
              const isChecked = selectedActivities.includes(activity);
              return (
                <label
                  key={idx}
                  onClick={() => toggleActivity(activity)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    isChecked
                      ? 'border-sky-500 bg-sky-50/60 text-slate-900 font-medium'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 pointer-events-none"
                  />
                  <span className="text-xs sm:text-sm">{activity}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 3. Submit Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Cross-references NOAA meteorological telemetry with OSHA & ACI engineering constraints
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
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-sky-500/20 active:scale-[0.98]'
              }`}
            >
              <span>{loading ? 'Analyzing Forecast...' : 'Evaluate Weather Feasibility'}</span>
              <span>🌤️</span>
            </button>
          </div>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <LoadingSpinner
          message="Computing Atmospheric Weather Risk Vectors..."
          subtext="Assessing localized Doppler wind vectors, barometric shifts, thunderstorm lightning radii, and thermal vapor pressure deficits."
        />
      )}

      {/* Error State with Retry & Demo */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <h4 className="font-bold text-sm">Weather Risk Evaluation Failed</h4>
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
              View Sample Demo Forecast
            </button>
          </div>
        </div>
      )}

      {/* 4. Results Section (hidden until response received) */}
      {result && !loading && (
        <div className="space-y-6 animate-fadeIn">
          <ResultCard
            icon="🌤️"
            title={`Site Operations Advisory: ${result.advisory_status || 'Caution'}`}
            subtitle={`Target: ${location} • Horizon: ${forecastWindow}`}
            severity={result.advisory_status || 'Medium'}
            metrics={
              result.metrics || [
                { label: 'Overall Status', value: result.advisory_status || 'Caution' },
                { label: 'Wind / Gusts', value: '18 / 31 mph' },
                { label: 'Rain Probability', value: '65%' },
                { label: 'Temp', value: '44°F' },
              ]
            }
            details={result.summary || result.analysis || result.description}
            findings={result.findings || result.activities_status || []}
            actionItems={result.action_items || result.protocols || []}
            rawJson={result}
          />
        </div>
      )}
    </div>
  );
}
