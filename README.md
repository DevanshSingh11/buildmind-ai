# BuildMind AI — Construction Intelligence Platform

React + Vite frontend and FastAPI backend for AI-assisted construction site safety, crack diagnostics, planning, valuation, weather advice, and construction Q&A.

## Stack
- Frontend: React, Vite
- Backend: FastAPI, Python
- AI: Google Gemini API
- Storage: SQLite (created locally at runtime)

## Local development (Windows PowerShell)

### Backend
```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
# Edit backend/.env locally and add your NEW Gemini API key
uvicorn app.main:app --reload --port 8000
```

### Frontend (second terminal)
```powershell
cd frontend
npm install
npm run dev
```

## Secrets
Never commit `.env` or paste API keys into source code. Set secrets through the hosting provider's environment-variable settings.

## Deployment note
This repository is a React/Vite + FastAPI application, not a Streamlit app. GitHub can host the source code, but Streamlit Community Cloud does not directly run this existing React frontend and FastAPI service as one app. To keep the current architecture, deploy the backend to a Python web host (for example Render) and the frontend to a static web host (for example Vercel), then configure the frontend API base URL and backend CORS. Alternatively, rewrite the UI as a Streamlit app to deploy on Streamlit Community Cloud.

## Safety disclaimer
AI safety outputs are decision-support only and must be verified by a qualified site safety professional.
