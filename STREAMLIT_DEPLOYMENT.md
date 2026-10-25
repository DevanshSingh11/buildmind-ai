# Deploy BuildMind AI to GitHub + Streamlit Community Cloud

This project now includes `streamlit_app.py`, a Streamlit interface that reuses the existing FastAPI app and routes in-process. It keeps the current backend schemas and AI service logic rather than reimplementing every endpoint.

## 1. Local run (Windows PowerShell)

From the repository root:

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item backend\.env.example backend\.env
# Edit backend\.env locally; add your NEW GEMINI_API_KEY and optional weather key.
streamlit run streamlit_app.py
```

Do not commit `backend/.env`. `.gitignore` excludes `.env` files, virtual environments, SQLite databases, and build outputs.

## 2. Create a GitHub repository

1. Create a new **empty** repository on GitHub, e.g. `buildmind-ai`.
2. Extract this project ZIP into a local folder and open PowerShell in its root (the folder containing `streamlit_app.py`).
3. Run:

```powershell
git init
git add .
git status
git commit -m "Prepare BuildMind AI Streamlit deployment"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/buildmind-ai.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your GitHub username. Before committing, verify `git status` does not list `.env`, API keys, `.venv`, or database files. If GitHub prompts for authentication, use Git Credential Manager or GitHub's supported sign-in flow; never put a password or token in the remote URL.

## 3. Deploy on Streamlit Community Cloud

1. Sign in to Streamlit Community Cloud using GitHub.
2. Choose **Create app**, select your repository, branch `main`, and main file path `streamlit_app.py`.
3. In the app's **Settings → Secrets**, add TOML secrets like:

```toml
GEMINI_API_KEY = "YOUR_NEW_GEMINI_API_KEY"
GEMINI_MODEL = "gemini-3.8-flash"
# Optional, only if weather data provider is configured:
# OPENWEATHERMAP_API_KEY = "YOUR_WEATHER_PROVIDER_KEY"
```

Use your real new key only in the private Secrets settings. Do not paste it into chat, source code, or GitHub.
4. Deploy and inspect app logs if build fails.

## Important deployment limitations

- Streamlit Community Cloud local disk is not durable. The SQLite project workspace can reset after restarts/redeploys; use hosted PostgreSQL if persistent shared project storage is required.
- Weather advisories require the weather provider credentials/configuration expected by the existing backend.
- This Streamlit wrapper invokes the FastAPI app in-process using FastAPI's `TestClient`. It avoids managing a second server, but should be smoke-tested on Streamlit Cloud. If a dependency incompatibility appears, pin compatible FastAPI/Starlette/httpx versions together.
- The existing safety and weather backend routes may still permit fallback/demo behavior. Deployment does not itself prove that every analysis came from Gemini. Verify the backend's response path before relying on safety decisions.
- AI safety and valuation output is informational only and must be reviewed by qualified professionals.
