"""Persistent project workspace API backed by SQLite."""
import json, sqlite3, os
from datetime import datetime, timezone
from uuid import uuid4
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/projects", tags=["Project Workspace"])
DB_PATH = os.getenv("PROJECTS_DB_PATH", os.path.join(os.path.dirname(__file__), "..", "..", "projects.db"))
DB_PATH = os.path.abspath(DB_PATH)

def connect():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    db.execute("""CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, location TEXT NOT NULL DEFAULT '',
      project_type TEXT NOT NULL DEFAULT 'Residential', status TEXT NOT NULL DEFAULT 'Planning',
      budget REAL NOT NULL DEFAULT 0, progress INTEGER NOT NULL DEFAULT 0,
      start_date TEXT NOT NULL DEFAULT '', target_date TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    )""")
    db.commit()
    return db

class ProjectIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    location: str = Field(default="", max_length=160)
    project_type: str = Field(default="Residential", max_length=80)
    status: str = Field(default="Planning", max_length=40)
    budget: float = Field(default=0, ge=0, le=1e12)
    progress: int = Field(default=0, ge=0, le=100)
    start_date: str = ""
    target_date: str = ""
    notes: str = Field(default="", max_length=5000)

def serialize(row):
    return dict(row)

@router.get("")
def list_projects():
    with connect() as db:
        rows = db.execute("SELECT * FROM projects ORDER BY updated_at DESC").fetchall()
        return {"items": [serialize(row) for row in rows], "count": len(rows)}

@router.post("", status_code=201)
def create_project(payload: ProjectIn):
    now = datetime.now(timezone.utc).isoformat()
    project_id = str(uuid4())
    data = payload.model_dump()
    with connect() as db:
        db.execute("""INSERT INTO projects
        (id,name,location,project_type,status,budget,progress,start_date,target_date,notes,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
        (project_id,data["name"],data["location"],data["project_type"],data["status"],data["budget"],
         data["progress"],data["start_date"],data["target_date"],data["notes"],now,now))
        row = db.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
        return serialize(row)

@router.get("/{project_id}")
def get_project(project_id: str):
    with connect() as db:
        row = db.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
        if not row: raise HTTPException(404, "Project not found")
        return serialize(row)

@router.put("/{project_id}")
def update_project(project_id: str, payload: ProjectIn):
    data = payload.model_dump()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    with connect() as db:
        cur = db.execute("""UPDATE projects SET name=?,location=?,project_type=?,status=?,budget=?,progress=?,
        start_date=?,target_date=?,notes=?,updated_at=? WHERE id=?""",
        (data["name"],data["location"],data["project_type"],data["status"],data["budget"],data["progress"],
         data["start_date"],data["target_date"],data["notes"],data["updated_at"],project_id))
        if not cur.rowcount: raise HTTPException(404, "Project not found")
        return serialize(db.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone())

@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: str):
    with connect() as db:
        cur = db.execute("DELETE FROM projects WHERE id=?", (project_id,))
        if not cur.rowcount: raise HTTPException(404, "Project not found")
