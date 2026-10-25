"""Streamlit front end for BuildMind AI, reusing the existing FastAPI routes in-process."""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

import streamlit as st
from dotenv import load_dotenv
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
load_dotenv(BACKEND / ".env", override=False)

# Streamlit Community Cloud secrets are exposed to the same environment variables
# used by the existing Pydantic settings class. Never place secrets in source code.
try:
    for key in ("GEMINI_API_KEY", "GEMINI_MODEL", "OPENWEATHERMAP_API_KEY", "PROJECTS_DB_PATH"):
        if key in st.secrets and not os.getenv(key):
            os.environ[key] = str(st.secrets[key])
except Exception:
    # Local development has no st.secrets file; backend/.env is supported above.
    pass

sys.path.insert(0, str(BACKEND))
from app.main import app as fastapi_app  # noqa: E402

st.set_page_config(page_title="BuildMind AI", page_icon="🏗️", layout="wide")

@st.cache_resource
def get_client() -> TestClient:
    """Call the existing FastAPI application in-process; no second server required."""
    return TestClient(fastapi_app)

client = get_client()

st.markdown("""
<style>
.block-container {padding-top: 1.6rem; padding-bottom: 3rem; max-width: 1400px;}
[data-testid="stSidebar"] {border-right: 1px solid rgba(128,128,128,.18);}
.hero {padding: 1.4rem 1.6rem; border-radius: 18px; background: linear-gradient(120deg,#102a43,#176b87); color: white; margin-bottom: 1.1rem;}
.hero h1 {margin:0 0 .35rem 0; font-size:2.2rem;}
.hero p {margin:0; opacity:.88;}
</style>
<div class="hero"><h1>🏗️ BuildMind AI</h1><p>Multimodal construction intelligence · Safety · Structural diagnostics · Planning · Valuation</p></div>
""", unsafe_allow_html=True)

if not os.getenv("GEMINI_API_KEY"):
    st.warning("Gemini API key is not configured. Add GEMINI_API_KEY to backend/.env for local use or Streamlit app Secrets for deployment. AI features may fail or use existing backend fallback behavior.")

NAV = [
    "Overview", "Site Safety & PPE", "Crack Diagnostics", "Real Estate Valuation",
    "Project Planning", "Daily Site Assistant", "Weather Advisory", "Construction Knowledge", "Project Workspace"
]
page = st.sidebar.radio("Navigate", NAV)
st.sidebar.caption("AI output is decision-support only. Verify safety and engineering findings with qualified professionals.")


def show_response(response, title: str = "Result") -> None:
    st.subheader(title)
    try:
        data = response.json()
    except Exception:
        data = {"detail": response.text}
    if response.is_success:
        st.success(f"Request completed · HTTP {response.status_code}")
    else:
        st.error(f"Request failed · HTTP {response.status_code}")
        st.caption("The backend did not return a successful result. Check the details below and the app logs.")
    st.json(data, expanded=True)
    st.download_button("Download JSON", json.dumps(data, indent=2, ensure_ascii=False), file_name="buildmind-result.json", mime="application/json")


def post_json(path: str, payload: dict[str, Any], title: str = "Result") -> None:
    with st.spinner("Processing with BuildMind AI…"):
        try:
            response = client.post(path, json=payload)
            show_response(response, title)
        except Exception as exc:
            st.error(f"Request could not be completed: {exc}")


def post_image(path: str, uploaded, fields: dict[str, Any], title: str) -> None:
    if not uploaded:
        st.info("Upload an image to continue.")
        return
    files = {"file": (uploaded.name, uploaded.getvalue(), uploaded.type or "application/octet-stream")}
    with st.spinner("Sending uploaded image to the existing analysis endpoint…"):
        try:
            response = client.post(path, files=files, data=fields)
            show_response(response, title)
        except Exception as exc:
            st.error(f"Image analysis could not be completed: {exc}")


if page == "Overview":
    st.subheader("Construction intelligence in one workspace")
    cols = st.columns(4)
    for col, label, detail in zip(cols, ["Safety", "Structural", "Planning", "Operations"], ["PPE and site hazards", "Crack diagnostics", "Schedules and budgets", "Weather and field Q&A"]):
        with col:
            st.metric(label, "Ready to use")
            st.caption(detail)
    st.markdown("### Modules")
    st.write("Use the sidebar to run the existing FastAPI capabilities through this Streamlit interface. The existing API routes and Pydantic response contracts are reused in-process; no separate FastAPI server is needed on Streamlit Community Cloud.")
    try:
        health = client.get("/health")
        st.caption(f"Backend status: {health.json().get('status', health.status_code)} · model configured: {health.json().get('ai_model', 'unknown')}")
    except Exception as exc:
        st.error(f"Could not initialize backend: {exc}")

elif page == "Site Safety & PPE":
    st.subheader("Site Safety & PPE Audit")
    uploaded = st.file_uploader("Upload a construction-site image", type=["jpg", "jpeg", "png", "webp", "bmp", "tif", "tiff"], key="safety_image")
    if uploaded: st.image(uploaded, caption=uploaded.name, use_container_width=True)
    with st.form("safety_form"):
        site = st.text_input("Site name", "Active Jobsite")
        zone = st.text_input("Zone", "Zone A")
        inspection = st.selectbox("Inspection focus", ["General PPE & Hazard Audit", "PPE compliance", "Crane and lifting safety", "Housekeeping", "Fall protection"])
        notes = st.text_area("Field notes (optional)")
        submitted = st.form_submit_button("Analyze site image", type="primary")
    if submitted: post_image("/api/safety/analyze", uploaded, {"site_name": site, "zone": zone, "inspection_type": inspection, "notes": notes}, "Safety inspection report")

elif page == "Crack Diagnostics":
    st.subheader("Crack Diagnostics & Structural Integrity")
    uploaded = st.file_uploader("Upload a crack or defect image", type=["jpg", "jpeg", "png", "webp", "bmp", "tif", "tiff"], key="crack_image")
    if uploaded: st.image(uploaded, caption=uploaded.name, use_container_width=True)
    with st.form("crack_form"):
        surface = st.selectbox("Surface / element", ["Reinforced Concrete Wall", "Concrete Slab", "Beam", "Column", "Brick Masonry", "Plaster", "Other"])
        age = st.number_input("Structure age (years; 0 = unknown)", min_value=0, max_value=500, value=0)
        location = st.text_input("Location / structural member", "Exterior structural member")
        notes = st.text_area("Additional observations")
        submitted = st.form_submit_button("Analyze defect", type="primary")
    if submitted: post_image("/api/crack/analyze", uploaded, {"surface_type": surface, "structure_age_years": str(age) if age else "", "location_context": location, "notes": notes}, "Crack diagnostics report")

elif page == "Real Estate Valuation":
    st.subheader("Real Estate & Construction Valuation")
    with st.form("valuation_form"):
        c1, c2 = st.columns(2)
        property_type = c1.selectbox("Property type", ["Residential", "Single Family Residence", "Apartment / Multi-family", "Commercial Office", "Industrial Warehouse", "Retail"])
        area = c2.number_input("Built-up area (sq ft)", min_value=1.0, value=2500.0, step=100.0)
        location = st.text_input("Location", "Indore, Madhya Pradesh, India")
        year = st.number_input("Year built (0 = unknown)", min_value=0, max_value=2100, value=0)
        condition = st.selectbox("Condition", ["Excellent", "Good", "Fair", "Distressed"])
        quality = st.selectbox("Quality grade", ["Economy", "Standard / Modern", "Premium", "Luxury"])
        amenities = st.text_area("Amenities / construction notes", "")
        submitted = st.form_submit_button("Estimate valuation", type="primary")
    if submitted:
        post_json("/api/valuation/estimate-json", {"property_type": property_type, "square_footage": area, "location": location, "year_built": year or None, "condition": condition, "quality_grade": quality, "amenities": amenities}, "Valuation report")

elif page == "Project Planning":
    st.subheader("Project Planning & Scheduling")
    with st.form("planning_form"):
        name = st.text_input("Project name", "BuildMind Project")
        project_type = st.selectbox("Project type", ["Residential Building", "Commercial Building", "Industrial", "Civil Infrastructure", "Renovation"])
        scope = st.text_area("Project scope", "Site preparation, foundations, structure, envelope, MEP, finishes and inspections.")
        c1, c2, c3 = st.columns(3)
        duration = c1.number_input("Target duration (days)", min_value=1, value=180)
        budget = c2.number_input("Total budget", min_value=1.0, value=10000000.0, step=100000.0)
        currency = c3.selectbox("Currency", ["INR", "USD", "GBP", "EUR"])
        conditions = st.text_input("Site conditions", "Urban site; soil assessment pending")
        constraints = st.text_input("Constraints / permits", "Local permits and standard working hours")
        team = st.number_input("Expected team size", min_value=1, value=25)
        submitted = st.form_submit_button("Generate project plan", type="primary")
    if submitted: post_json("/api/planning/generate", {"project_name": name, "project_type": project_type, "scope_description": scope, "target_duration_days": duration, "total_budget": budget, "currency": currency, "site_conditions": conditions, "constraints": constraints, "team_size": team}, "Project plan")

elif page == "Daily Site Assistant":
    st.subheader("Daily Site Assistant")
    tab_chat, tab_log = st.tabs(["Ask the site assistant", "Generate daily log"])
    with tab_chat:
        with st.form("chat_form"):
            query = st.text_area("Question", placeholder="What checks should happen before a concrete pour?")
            context = st.text_area("Site context (optional)")
            submitted = st.form_submit_button("Ask", type="primary")
        if submitted and query.strip(): post_json("/api/assistant/chat", {"query": query, "site_context": context}, "Assistant response")
    with tab_log:
        with st.form("daily_log_form"):
            site = st.text_input("Site name", "Project Site A")
            completed = st.text_area("Work completed", placeholder="Describe work completed during this shift…")
            c1, c2 = st.columns(2)
            workers = c1.number_input("Worker count", min_value=0, value=20)
            weather = c2.text_input("Weather summary", "Clear, light wind")
            issues = st.text_area("Issues / delays", "None reported")
            safety = st.text_area("Safety notes", "No incidents reported")
            next_goals = st.text_area("Next shift goals", "Continue scheduled work")
            submitted_log = st.form_submit_button("Generate daily report", type="primary")
        if submitted_log and completed.strip(): post_json("/api/assistant/daily-log", {"site_name": site, "work_completed": completed, "worker_count": workers, "weather_summary": weather, "issues_encountered": issues, "safety_notes": safety, "next_shift_goals": next_goals}, "Daily site log")

elif page == "Weather Advisory":
    st.subheader("Weather-Aware Site Advisory")
    with st.form("weather_form"):
        location = st.text_input("Jobsite city / location", "Indore, Madhya Pradesh, India")
        activities = st.text_area("Planned activities (one per line)", "Concrete pouring\nCrane lifting and rigging\nScaffolding and work at height\nTrenching and excavation")
        submitted = st.form_submit_button("Generate weather advisory", type="primary")
    if submitted:
        post_json("/api/weather/advisory", {"location": location, "planned_activities": [x.strip() for x in activities.splitlines() if x.strip()]}, "Weather advisory")

elif page == "Construction Knowledge":
    st.subheader("Construction Knowledge Assistant")
    with st.form("knowledge_form"):
        question = st.text_area("Your construction / engineering question", "What checks should be completed before stripping concrete formwork?")
        category = st.selectbox("Discipline", ["Building Code & Safety", "OSHA Safety", "Concrete & Foundation", "Structural Steel", "MEP", "Project Management"])
        standard = st.text_input("Relevant standards", "OSHA / IBC / ACI; verify local applicability")
        submitted = st.form_submit_button("Ask knowledge assistant", type="primary")
    if submitted and question.strip(): post_json("/api/knowledge/query", {"question": question, "category": category, "standard_or_code": standard}, "Knowledge response")

elif page == "Project Workspace":
    st.subheader("Project Workspace")
    tab_list, tab_create = st.tabs(["Saved projects", "Create project"])
    with tab_list:
        if st.button("Refresh projects"):
            st.session_state["refresh_projects"] = True
        try:
            response = client.get("/api/projects")
            if response.is_success:
                items = response.json().get("items", [])
                if items: st.dataframe(items, use_container_width=True, hide_index=True)
                else: st.info("No saved projects yet. Create one in the next tab.")
            else: show_response(response, "Projects")
        except Exception as exc: st.error(f"Could not load projects: {exc}")
    with tab_create:
        with st.form("create_project_form"):
            name = st.text_input("Project name")
            location = st.text_input("Location", "Indore, Madhya Pradesh, India")
            project_type = st.selectbox("Type", ["Residential", "Commercial", "Industrial", "Infrastructure", "Renovation"])
            status = st.selectbox("Status", ["Planning", "In Progress", "On Hold", "Completed"])
            budget = st.number_input("Budget (INR)", min_value=0.0, value=0.0, step=100000.0)
            progress = st.slider("Progress (%)", 0, 100, 0)
            notes = st.text_area("Notes")
            submitted = st.form_submit_button("Save project", type="primary")
        if submitted:
            try:
                response = client.post("/api/projects", json={"name": name, "location": location, "project_type": project_type, "status": status, "budget": budget, "progress": progress, "notes": notes})
                show_response(response, "Created project")
            except Exception as exc: st.error(f"Could not save project: {exc}")

st.divider()
st.caption("BuildMind AI · Streamlit interface reusing the existing FastAPI backend routes and schemas.")
