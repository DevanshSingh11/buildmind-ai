import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/projects', label: 'Project Workspace', shortLabel: 'Projects', icon: '🏗️', tag: 'Portfolio', color: 'from-amber-500 to-orange-500' },
  {
    path: '/',
    label: 'Overview & Hub',
    shortLabel: 'Dashboard',
    icon: '📊',
    tag: 'Home',
    color: 'from-amber-500 to-orange-500',
  },
  {
    path: '/safety-monitor',
    label: 'Safety Monitor',
    shortLabel: 'Safety',
    icon: '🦺',
    tag: 'Vision AI',
    color: 'from-amber-400 to-amber-600',
  },
  {
    path: '/crack-detection',
    label: 'Crack Detection',
    shortLabel: 'Cracks',
    icon: '🔍',
    tag: 'Structural',
    color: 'from-orange-500 to-red-500',
  },
  {
    path: '/valuation',
    label: 'Real Estate Valuation',
    shortLabel: 'Valuation',
    icon: '🏘️',
    tag: 'Financial',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    path: '/planning',
    label: 'Project Planning',
    shortLabel: 'Planning',
    icon: '📋',
    tag: 'Schedule',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    path: '/assistant',
    label: 'Daily Assistant',
    shortLabel: 'Assistant',
    icon: '📝',
    tag: 'Conversational',
    color: 'from-cyan-400 to-blue-500',
  },
  {
    path: '/weather',
    label: 'Weather Advisory',
    shortLabel: 'Weather',
    icon: '🌤️',
    tag: 'Forecasting',
    color: 'from-sky-400 to-amber-400',
  },
  {
    path: '/knowledge',
    label: 'Knowledge Assistant',
    shortLabel: 'Knowledge',
    icon: '📚',
    tag: 'Standards',
    color: 'from-violet-400 to-purple-600',
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-slate-900 border-r border-slate-800 text-slate-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40">
              🏗️
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-white text-lg tracking-tight">BuildMind</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide uppercase font-medium">
                Construction Intelligence
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
            Platform Modules
          </div>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive: active }) =>
                  `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-slate-800 text-amber-400 font-semibold shadow-inner border border-amber-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-mono shrink-0 transition-colors ${
                    isActive
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 font-medium'
                      : 'bg-slate-800/80 text-slate-400 border border-slate-700/50 group-hover:text-slate-300'
                  }`}
                >
                  {item.tag}
                </span>

                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-r" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer / System Status */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Backend API</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                v1 Ready
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate font-mono">
              http://localhost:8000
            </div>
          </div>
          <div className="mt-3 text-center text-[11px] text-slate-400">
            Construction Multimodal AI © 2026
          </div>
        </div>
      </aside>
    </>
  );
}
