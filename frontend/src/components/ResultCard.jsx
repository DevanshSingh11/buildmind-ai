import React, { useState } from 'react';

// Severity badge colors helper
export function SeverityBadge({ level }) {
  if (!level) return null;
  const normalized = String(level).toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-300';
  let dotColor = 'bg-slate-400';
  let label = level;

  if (normalized.includes('low') || normalized.includes('safe') || normalized.includes('pass') || normalized.includes('go')) {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    dotColor = 'bg-emerald-500';
  } else if (normalized.includes('medium') || normalized.includes('moderate') || normalized.includes('caution')) {
    styles = 'bg-amber-50 text-amber-800 border-amber-300';
    dotColor = 'bg-amber-500';
  } else if (normalized.includes('high') || normalized.includes('warning') || normalized.includes('danger')) {
    styles = 'bg-orange-50 text-orange-800 border-orange-300';
    dotColor = 'bg-orange-500';
  } else if (normalized.includes('critical') || normalized.includes('hazard') || normalized.includes('fail') || normalized.includes('severe')) {
    styles = 'bg-rose-50 text-rose-800 border-rose-300';
    dotColor = 'bg-rose-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border shadow-2xs ${styles}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}

export default function ResultCard({
  title,
  subtitle,
  severity,
  metrics = [],
  findings = [],
  actionItems = [],
  details,
  rawJson,
  icon = '📋',
}) {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = rawJson
      ? JSON.stringify(rawJson, null, 2)
      : `${title}\n${subtitle || ''}\n${findings.map((f) => `- ${f}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-200">
      {/* Header Bar */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center text-2xl shrink-0 border border-amber-200/50">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {title || 'AI Assessment Results'}
              </h3>
              {severity && <SeverityBadge level={severity} />}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          title="Copy report to clipboard"
        >
          <span>{copied ? '✓ Copied' : '📋 Copy Report'}</span>
        </button>
      </div>

      {/* Metrics Grid (if provided) */}
      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100 border-b border-slate-100">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white px-5 py-4">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">
                {metric.label}
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {metric.value}
              </div>
              {metric.subtext && (
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {metric.subtext}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Content Body */}
      <div className="p-6 space-y-6">
        {/* Custom Details / Description */}
        {details && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-sm text-slate-700 leading-relaxed">
            {details}
          </div>
        )}

        {/* Findings / Detected Items */}
        {findings && findings.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-amber-500 rounded-sm" />
              Key Findings & Observations ({findings.length})
            </h4>
            <div className="space-y-2.5">
              {findings.map((item, idx) => {
                const isObj = typeof item === 'object' && item !== null;
                const text = isObj ? item.title || item.description || item.name : item;
                const itemSeverity = isObj ? item.severity : null;
                const subtext = isObj ? item.detail || item.standard || item.location : null;

                return (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-amber-500 font-bold text-sm shrink-0 mt-0.5">
                        •
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {text}
                        </div>
                        {subtext && (
                          <div className="text-xs text-slate-500 mt-0.5 font-mono">
                            {subtext}
                          </div>
                        )}
                      </div>
                    </div>
                    {itemSeverity && <SeverityBadge level={itemSeverity} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Items / Recommendations */}
        {actionItems && actionItems.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-emerald-500 rounded-sm" />
              Recommended Corrective Actions ({actionItems.length})
            </h4>
            <div className="space-y-2">
              {actionItems.map((action, idx) => {
                const actionText = typeof action === 'string' ? action : action.action || action.text;
                const priority = typeof action === 'object' ? action.priority : null;

                return (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/60"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-slate-800 font-medium leading-snug">
                        {actionText}
                      </p>
                    </div>
                    {priority && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono shrink-0">
                        {priority}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Collapsible Raw JSON Data */}
        {rawJson && (
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowRaw(!showRaw)}
              className="text-xs font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
            >
              <span>{showRaw ? '▼ Hide' : '▶ Show'} Raw Telemetry & JSON</span>
            </button>
            {showRaw && (
              <pre className="mt-3 p-4 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto max-h-72 border border-slate-800">
                {JSON.stringify(rawJson, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
