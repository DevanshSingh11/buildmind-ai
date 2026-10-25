import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';

const routeTitles = {
  '/projects': { title: 'Project Workspace', subtitle: 'Portfolio Tracking & Delivery Control' },
  '/': { title: 'Platform Overview', subtitle: 'Multimodal Construction Intelligence Hub' },
  '/safety-monitor': { title: 'Site Safety Monitor', subtitle: 'Computer Vision PPE & Hazard Compliance' },
  '/crack-detection': { title: 'Crack & Defect Detection', subtitle: 'Structural Integrity & Concrete Assessment' },
  '/valuation': { title: 'Real Estate Valuation', subtitle: 'Automated Construction Appraisal & Feasibility' },
  '/planning': { title: 'Project Planning & Scheduling', subtitle: 'Phased Execution & Resource Forecasting' },
  '/assistant': { title: 'Site Daily Assistant', subtitle: 'Conversational Operations & Daily Briefings' },
  '/weather': { title: 'Weather Advisory', subtitle: 'Meteorological Risk Assessment for On-Site Activities' },
  '/knowledge': { title: 'Engineering Knowledge Assistant', subtitle: 'Building Codes, Standards & ASTM Queries' },
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentRoute = routeTitles[location.pathname] || {
    title: 'Construction Intelligence',
    subtitle: 'AI-Powered Multimodal Platform',
  };

  return (
    <div className="flex min-h-screen bg-slate-100/80 font-sans text-slate-800 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 bg-white border-b border-slate-200/80 shadow-xs">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            {/* Hamburger Button (Mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              aria-label="Open sidebar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Current View Title */}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate tracking-tight">
                {currentRoute.title}
              </h1>
              <p className="hidden sm:block text-xs text-slate-500 truncate">
                {currentRoute.subtitle}
              </p>
            </div>
          </div>

          {/* Header Right Actions & Badges */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* AI Status Badge */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI Engine Connected</span>
            </div>

            {/* Quick Home Link */}
            <Link
              to="/"
              className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"
              title="Return to Dashboard"
            >
              <span className="text-base sm:text-lg">🏗️</span>
            </Link>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
