import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import SafetyMonitor from './pages/SafetyMonitor';
import CrackDetection from './pages/CrackDetection';
import RealEstateValuation from './pages/RealEstateValuation';
import ProjectPlanning from './pages/ProjectPlanning';
import DailyAssistant from './pages/DailyAssistant';
import WeatherAdvisory from './pages/WeatherAdvisory';
import KnowledgeAssistant from './pages/KnowledgeAssistant';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Hub / Dashboard */}
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />

        {/* 1. Safety Monitor */}
        <Route path="safety-monitor" element={<SafetyMonitor />} />

        {/* 2. Crack Detection */}
        <Route path="crack-detection" element={<CrackDetection />} />

        {/* 3. Real Estate Valuation */}
        <Route path="valuation" element={<RealEstateValuation />} />

        {/* 4. Project Planning */}
        <Route path="planning" element={<ProjectPlanning />} />

        {/* 5. Daily Assistant */}
        <Route path="assistant" element={<DailyAssistant />} />

        {/* 6. Weather Advisory */}
        <Route path="weather" element={<WeatherAdvisory />} />

        {/* 7. Knowledge Assistant */}
        <Route path="knowledge" element={<KnowledgeAssistant />} />

        {/* Catch-all redirect to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
