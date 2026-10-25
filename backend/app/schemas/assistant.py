"""Pydantic schemas for Daily Site Supervisor Assistant and Daily Logs."""

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, model_validator


class TradeProgress(BaseModel):
    """Subcontractor trade daily output and headcount."""

    trade_name: str = Field(..., description="Trade discipline (e.g. Electrical, Plumbing, Concrete)")
    contractor: Optional[str] = Field("Subcontractor", description="Subcontractor company name")
    workers_count: Optional[int] = Field(0, ge=0, description="Worker headcount deployed")
    work_summary: str = Field(..., description="Tasks advanced or finished")
    status: str = Field(default="In Progress", description="Status (Completed, In Progress, Blocked)")


class DailyLogRequest(BaseModel):
    """Raw daily field notes submitted by site supervisor."""

    site_name: str = Field(default="Project Site A", description="Jobsite name or project code")
    report_date: Optional[str] = Field(
        default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d"),
        description="Date of log in YYYY-MM-DD",
    )
    weather_summary: Optional[str] = Field("Clear, 22°C, light wind", description="Weather during shift")
    trades_on_site: Optional[str] = Field("Framing, Electrical, Mechanical", description="Active trades")
    worker_count: Optional[int] = Field(35, ge=0, description="Total site headcount")
    work_completed: str = Field(..., description="Description of completed work during shift")
    issues_encountered: Optional[str] = Field("None", description="Blockers, delays, or material shortages")
    safety_notes: Optional[str] = Field("No incidents", description="Near misses, incidents, or toolbox talks")
    equipment_notes: Optional[str] = Field("All equipment operational", description="Heavy machinery status")
    next_shift_goals: Optional[str] = Field("Continue rough-ins", description="Planned goals for next shift")


class DailyLogResponse(BaseModel):
    """Executive daily construction log report."""

    site_name: str = Field(..., description="Jobsite name")
    report_date: str = Field(..., description="Date of report")
    executive_summary: str = Field(..., description="Narrative executive briefing")
    overall_site_status: Literal["On Schedule", "Delayed", "Ahead of Schedule", "Critical Issues"] = Field(
        ..., description="Overall status indicator"
    )
    total_workers_reported: int = Field(default=0, ge=0, description="Total headcount audited")
    key_accomplishments: List[str] = Field(default_factory=list, description="Primary accomplishments")
    work_completed_by_trade: List[TradeProgress] = Field(
        default_factory=list, description="Discipline breakdown"
    )
    active_delays_and_blockers: List[str] = Field(
        default_factory=list, description="Issues requiring resolution"
    )
    safety_and_incidents: str = Field(..., description="Safety and incident overview")
    equipment_and_materials: str = Field(..., description="Equipment utilization and logistics")
    priorities_for_tomorrow: List[str] = Field(
        default_factory=list, description="Top action items for upcoming shift"
    )
    toolbox_talk_topic: str = Field(..., description="Recommended safety briefing topic for morning huddle")


class AssistantChatRequest(BaseModel):
    """Direct query to the site assistant."""

    query: str = Field(default="Provide site operations overview", description="Question or task instruction")
    site_context: Optional[str] = Field(None, description="Optional ongoing project context")

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapped = dict(data)
            if "message" in mapped and "query" not in mapped:
                mapped["query"] = mapped["message"]
            if "history" in mapped and not mapped.get("site_context"):
                history = mapped["history"]
                if isinstance(history, list):
                    last_few = history[-4:]
                    mapped["site_context"] = "Recent discussion:\n" + "\n".join(
                        f"{item.get('role', 'user')}: {item.get('content', '')}"
                        for item in last_few if isinstance(item, dict)
                    )
            return mapped
        return data


class AssistantChatResponse(BaseModel):
    """Assistant chat response."""

    response: str = Field(..., description="Assistant answer and guidance")
    suggested_followups: List[str] = Field(default_factory=list, description="Follow-up suggestions")
