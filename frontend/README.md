# BuildMind AI — Multimodal Construction Intelligence Platform

A modern, responsive React frontend built with Vite, Tailwind CSS, and React Router v6 for autonomous construction intelligence and site operations.

## Architecture

- **Build Tool**: Vite
- **UI Framework**: React 18+ (JSX)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Native Fetch API
- **Backend Service**: `http://localhost:8000/api/v1`

## Features & Modules

1. **📊 Overview & Hub** (`/`): Centralized intelligence dashboard.
2. **🦺 Site Safety Monitor** (`/safety-monitor`): Computer vision PPE compliance audit (hard hats, safety vests, harnesses) and OSHA 1926 risk scoring.
3. **🔍 Crack & Defect Detection** (`/crack-detection`): Multi-surface concrete/masonry crack detection, width estimation, and ACI 224R severity grading.
4. **🏘️ Real Estate Valuation** (`/valuation`): Automated construction appraisal, depreciated replacement costing, and capitalization yield modeling.
5. **📋 Project Planning & Scheduling** (`/planning`): Critical Path Method (CPM) milestone scheduler, resource allocation curves, and risk contingency planning.
6. **📝 Site Daily Assistant** (`/assistant`): Conversational copilot for foremen and engineers to distill daily site logs and craft toolbox talks.
7. **🌤️ Weather Advisory** (`/weather`): Meteorological risk forecasting for sensitive outdoor trades (tower crane wind limits, cold/hot weather concrete curing).
8. **📚 Engineering Knowledge Assistant** (`/knowledge`): Authoritative code search engine across IBC, OSHA, ACI 318, and ASTM standards.

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on [http://localhost:5173](http://localhost:5173).
