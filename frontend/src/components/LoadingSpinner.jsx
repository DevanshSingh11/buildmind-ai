import React from 'react';

export default function LoadingSpinner({
  message = 'AI Multimodal Model Processing...',
  subtext = 'Analyzing spatial features, site telemetry, and structural safety parameters...',
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/80 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-xs text-center my-6">
      {/* Animated Spinner with Dual Rings & Center Icon */}
      <div className="relative w-20 h-20 mb-5 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-amber-200/50 border-t-amber-500 animate-spin" />
        {/* Inner Counter Ring */}
        <div className="absolute inset-2 rounded-full border-4 border-slate-200 border-b-slate-800 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
        {/* Center Icon */}
        <div className="text-2xl animate-pulse select-none">
          🏗️
        </div>
      </div>

      {/* Primary Message */}
      <h3 className="text-base font-bold text-slate-800 tracking-tight">
        {message}
      </h3>

      {/* Subtext explanation */}
      {subtext && (
        <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
          {subtext}
        </p>
      )}

      {/* Progress pill indicator */}
      <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        <span>Inference in progress...</span>
      </div>
    </div>
  );
}
