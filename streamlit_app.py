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

# BuildMind design system — polished dark surfaces with restrained cyan accents.
st.markdown(r"""
<style>
:root {
  --bm-bg: #070b14; --bm-panel: #0e1625; --bm-panel-2: #111d2e;
  --bm-border: #243449; --bm-text: #edf5fb; --bm-muted: #91a4b8;
  --bm-cyan: #22d3ee; --bm-teal: #2dd4bf; --bm-blue: #0891b2;
}
.stApp { background: radial-gradient(ellipse at 80% -15%, rgba(8,145,178,.12), transparent 38%), var(--bm-bg); color: var(--bm-text); }
[data-testid="stHeader"] { background: rgba(7,11,20,.88); }
[data-testid="stSidebar"] { background: #0b1320; border-right: 1px solid var(--bm-border); }
[data-testid="stSidebar"] > div:first-child { padding-top: 1.2rem; }
.block-container { max-width: 1240px; padding-top: 1.25rem; padding-bottom: 2.5rem; }
[data-testid="stSidebar"] [data-testid="stRadio"] label { border-radius: 9px; padding: .28rem .42rem; }
[data-testid="stSidebar"] [data-testid="stRadio"] label:hover { background: rgba(34,211,238,.08); }
[data-testid="stSidebar"] [data-testid="stRadio"] div[role="radiogroup"] { gap: .18rem; }
[data-testid="stSidebar"] [data-testid="stRadio"] div[role="radiogroup"] > label > div:first-child { border-color: #3a526b; }
[data-testid="stSidebar"] [data-testid="stRadio"] div[role="radiogroup"] > label[data-checked="true"] > div:first-child { border-color: var(--bm-teal); background: var(--bm-teal); }
h1,h2,h3,h4 { color: var(--bm-text) !important; letter-spacing: -.025em; }
h1 { font-size: clamp(1.8rem, 3vw, 2.35rem) !important; }
h2 { font-size: 1.55rem !important; }
h3 { font-size: 1.15rem !important; }
p, label, .stMarkdown { color: inherit; }
.hero { position: relative; overflow: hidden; padding: 1.45rem 1.7rem; margin: .2rem 0 1.5rem; border: 1px solid #234052; border-radius: 18px; background: linear-gradient(115deg, rgba(17,29,46,.98), rgba(10,23,36,.96) 60%, rgba(8,57,68,.55)); box-shadow: 0 18px 48px rgba(0,0,0,.16); }
.hero:after { content: ''; position: absolute; width: 220px; height: 220px; right: -70px; top: -130px; border-radius: 50%; background: rgba(34,211,238,.12); filter: blur(4px); }
.hero-kicker { color: var(--bm-teal); text-transform: uppercase; letter-spacing: .16em; font-size: .72rem; font-weight: 750; margin-bottom: .5rem; }
.hero h1 { margin: 0 0 .45rem; color: #eafcff !important; font-size: clamp(1.9rem,3vw,2.45rem) !important; }
.hero p { margin: 0; color: #a9bdce; font-size: 1rem; max-width: 720px; }
.section-kicker { color: var(--bm-teal); font-size: .72rem; font-weight: 750; text-transform: uppercase; letter-spacing: .13em; margin-bottom: .25rem; }
.module-card-content { min-height: 182px; display: flex; flex-direction: column; }
[data-testid="stVerticalBlockBorderWrapper"] { border-color: var(--bm-border) !important; border-radius: 15px !important; background: linear-gradient(145deg, rgba(16,27,43,.92), rgba(12,20,33,.96)); }
[data-testid="stVerticalBlockBorderWrapper"]:hover { border-color: #28798a !important; }
.module-icon { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 11px; background: rgba(45,212,191,.1); border: 1px solid rgba(45,212,191,.22); font-size: 1.15rem; margin-bottom: .8rem; }
.module-title { font-weight: 720; font-size: 1rem; color: #eaf4fb; margin-bottom: .35rem; }
.module-desc { color: var(--bm-muted); font-size: .84rem; line-height: 1.5; min-height: 3.4rem; }
.module-tag { color: #5eead4; font-size: .72rem; margin-top: auto; padding-top: .75rem; font-weight: 650; }
[data-testid="stMetric"] { background: linear-gradient(145deg,#101b2b,#0b1421); padding: 1rem 1.1rem; border: 1px solid var(--bm-border); border-radius: 13px; }
[data-testid="stMetricLabel"] { color: var(--bm-muted) !important; }
[data-testid="stMetricValue"] { color: #e9fbff !important; font-size: 1.45rem !important; }
[data-testid="stForm"] { padding: 1.2rem; border: 1px solid var(--bm-border); border-radius: 15px; background: rgba(14,22,37,.68); }
[data-baseweb="input"], [data-baseweb="textarea"], [data-baseweb="select"] > div { background: #09111d !important; border-color: #2a3d52 !important; border-radius: 9px !important; }
[data-baseweb="input"] input, [data-baseweb="textarea"] textarea { color: var(--bm-text) !important; }
[data-baseweb="select"] * { color: var(--bm-text) !important; }
.stButton > button, [data-testid="stFormSubmitButton"] > button { border-radius: 9px; min-height: 2.65rem; font-weight: 650; transition: all .16s ease; }
.stButton > button[kind="primary"], [data-testid="stFormSubmitButton"] > button[kind="primary"] { background: linear-gradient(100deg,#0e7490,#0891b2) !important; border: 1px solid #22d3ee !important; color: #f0fdff !important; }
.stButton > button[kind="primary"]:hover, [data-testid="stFormSubmitButton"] > button[kind="primary"]:hover { background: #0e7490 !important; border-color: #67e8f9 !important; }
.stButton > button:not([kind="primary"]), [data-testid="stDownloadButton"] button { background: #111d2e; border: 1px solid #2a3d52; color: #dceaf4; }
.stButton > button:not([kind="primary"]):hover { border-color: var(--bm-cyan); color: #ecfeff; background: #14283a; }
[data-testid="stSidebar"] [data-testid="stRadio"] label[data-checked="true"] { background: rgba(45,212,191,.09); }
[data-testid="stSidebar"] [data-testid="stRadio"] label[data-checked="true"] p { color: #5eead4 !important; }
[data-testid="stFileUploader"] section { background: rgba(9,17,29,.75); border: 1px dashed #36536b; border-radius: 12px; }
[data-testid="stAlert"] { border-radius: 11px; }
[data-testid="stDataFrame"], [data-testid="stTable"] { border: 1px solid var(--bm-border); border-radius: 12px; overflow: hidden; }
[data-testid="stTabs"] button[role="tab"] { color: var(--bm-muted); }
[data-testid="stTabs"] button[role="tab"][aria-selected="true"] { color: var(--bm-teal); border-bottom-color: var(--bm-teal); }
hr { border-color: var(--bm-border); }
.small-muted { color: var(--bm-muted); font-size: .82rem; }
.footer { border-top: 1px solid var(--bm-border); margin-top: 2.2rem; padding-top: 1rem; color: #71869a; font-size: .78rem; }
@media (max-width: 800px) { .block-container { padding-left: 1rem; padding-right: 1rem; } .hero { padding: 1.2rem; } .module-card-content { min-height: 160px; } }
</style>
""", unsafe_allow_html=True)

# Compact brand header; feature logic below remains connected to the existing API.
st.markdown("""
<div class="hero">
  <div class="hero-kicker">Construction intelligence platform</div>
  <h1>🏗️ BuildMind <span style="color:#22d3ee">AI</span></h1>
  <p>Turn site observations into clearer decisions — safety, structural diagnostics, planning, and field operations in one workspace.</p>
</div>
""", unsafe_allow_html=True)

if not os.getenv("GEMINI_API_KEY"):
    st.warning("Gemini API key is not configured. Add GEMINI_API_KEY to backend/.env for local use or Streamlit app Secrets for deployment. AI features may fail or use existing backend fallback behavior.")

NAV = [
    "Overview", "Site Safety & PPE", "Crack Diagnostics", "Real Estate Valuation",
    "Project Planning", "Daily Site Assistant", "Weather Advisory", "Construction Knowledge", "Project Workspace"
]
st.sidebar.markdown("<div class='section-kicker'>Workspace</div>", unsafe_allow_html=True)
if "page" not in st.session_state:
    st.session_state["page"] = NAV[0]
page = st.sidebar.radio("Navigate", NAV, key="page", label_visibility="collapsed")
st.sidebar.caption("AI output is decision-support only. Verify safety and engineering findings with qualified professionals.")


def show_response(response, title: str = "Result") -> None:
    st.subheader(title)
    try:
        data = response.json()
    except Exception:
        data = {"detail": response.text}

    with st.container():
        if response.is_success:
            st.success(f"Request completed · HTTP {response.status_code}")
        else:
            st.error(f"Request failed · HTTP {response.status_code}")
            st.caption("The backend did not return a successful result. Check the details below.")

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
    with st.spinner("Analyzing image…"):
        try:
            response = client.post(path, files=files, data=fields)
            show_response(response, title)
        except Exception as exc:
            st.error(f"Image analysis could not be completed: {exc}")


if page == "Overview":
    st.markdown("<div class='section-kicker'>Workspace overview</div>", unsafe_allow_html=True)
    st.subheader("Construction intelligence, organized.")
    st.markdown("<p class='small-muted'>Choose a module to get started. Results come from the connected BuildMind backend when you run an analysis.</p>", unsafe_allow_html=True)

    modules = [
        ("🦺", "Site Safety & PPE", "Review site imagery for PPE compliance and potential hazards.", "Image analysis"),
        ("🔎", "Crack Diagnostics", "Inspect visible cracks and defects for decision-support findings.", "Structural review"),
        ("📐", "Project Planning", "Generate project schedules, scope breakdowns, and budget-aware plans.", "Planning tools"),
        ("🏢", "Real Estate Valuation", "Prepare an AI-assisted estimate using property and location details.", "Valuation"),
        ("🌦️", "Weather Advisory", "Review weather-related risks against planned site activities.", "Field conditions"),
        ("💬", "Daily Site Assistant", "Ask field questions or structure a daily shift report.", "Site operations"),
        ("📚", "Construction Knowledge", "Ask questions about construction practices, standards, and safety.", "Knowledge support"),
        ("🗂️", "Project Workspace", "Create and review saved project records in your workspace.", "Project records"),
    ]
    def navigate_to(target: str) -> None:
        st.session_state["page"] = target

    # Each module uses a native bordered Streamlit container so its action
    # remains visually grouped with the card across Streamlit versions.
    grid = st.columns(4, gap="medium")
    for idx, (emoji, title, desc, tag) in enumerate(modules):
        with grid[idx % 4]:
            with st.container(border=True):
                st.markdown(
                    f"<div class='module-card-content'>"
                    f"<div class='module-icon'>{emoji}</div>"
                    f"<div class='module-title'>{title}</div>"
                    f"<div class='module-desc'>{desc}</div>"
                    f"<div class='module-tag'>↗ {tag}</div>"
                    f"</div>",
                    unsafe_allow_html=True,
                )
                st.button(
                    f"Open {title}",
                    key=f"open_{idx}",
                    use_container_width=True,
                    on_click=navigate_to,
                    args=(title,),
                )

    st.markdown("### System status")
    try:
        health = client.get("/health")
        if health.is_success:
            health_data = health.json()
            a, b, c = st.columns(3)
            a.metric("Backend", str(health_data.get("status", "Unknown")).replace("healthy", "Healthy").title())
            b.metric("AI model", health_data.get("ai_model", "Configured by backend"))
            c.metric("API", f"HTTP {health.status_code}")
        else:
            st.warning(f"Backend health check returned HTTP {health.status_code}.")
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

st.markdown("<div class='footer'>BUILD MIND AI &nbsp;·&nbsp; Construction intelligence for better-informed site decisions. &nbsp;·&nbsp; AI outputs require professional verification.</div>", unsafe_allow_html=True)
