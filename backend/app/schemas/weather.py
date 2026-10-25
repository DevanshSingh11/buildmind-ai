"""Pydantic schemas for Weather Advisory and Construction Weather Risk Analysis."""

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, model_validator


class ActivitySuitability(BaseModel):
    """Safety and operational viability for a specific construction trade task."""

    activity_name: str = Field(..., description="Construction trade task (e.g. Crane Lifting, Concrete Pour)")
    status: Literal["Safe to Proceed", "Proceed with Caution", "Work Stoppage Recommended"] = Field(
        ..., description="Operational status recommendation"
    )
    reasoning: str = Field(..., description="Meteorological and engineering reasoning")
    precautionary_measures: List[str] = Field(
        default_factory=list, description="Mandatory risk mitigation controls"
    )


class HourlyAdvisory(BaseModel):
    """Operational window guidance during shift hours."""

    timeframe: str = Field(..., description="Shift timeframe (e.g. '08:00 - 12:00')")
    operational_guidance: str = Field(..., description="Specific operational guidelines during window")


class WeatherAdvisoryRequest(BaseModel):
    """Payload for construction weather impact advisory."""

    location: Optional[str] = Field(
        default="Austin, TX",
        description="City or site location string (e.g. 'Austin, TX', 'London, UK')",
    )
    latitude: Optional[float] = Field(None, description="Optional GPS latitude coordinate")
    longitude: Optional[float] = Field(None, description="Optional GPS longitude coordinate")
    planned_activities: List[str] = Field(
        default_factory=lambda: [
            "Concrete Pouring",
            "Crane Lifting & Rigging",
            "Exterior Scaffolding & High Work",
            "Roofing Membrane Application",
            "Trenching & Excavation",
        ],
        description="List of planned activities for the shift",
    )

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapped = dict(data)
            if "activities" in mapped and "planned_activities" not in mapped:
                mapped["planned_activities"] = mapped["activities"]
            return mapped
        return data


class WeatherAdvisoryResponse(BaseModel):
    """Comprehensive weather risk and operational protocol advisory."""

    location: str = Field(..., description="Evaluated jobsite location")
    weather_summary: str = Field(..., description="Current atmospheric condition summary")
    overall_construction_risk: Literal["Low", "Moderate", "High", "Severe"] = Field(
        ..., description="Overall weather risk tier for the site"
    )
    activity_advisories: List[ActivitySuitability] = Field(
        default_factory=list, description="Activity-by-activity risk advisories"
    )
    worker_safety_advisory: str = Field(
        ..., description="Personnel environmental health guidance (heat stress, wind, lightning)"
    )
    hourly_recommendations: List[HourlyAdvisory] = Field(
        default_factory=list, description="Temporal operational recommendations"
    )
    critical_alerts: List[str] = Field(
        default_factory=list, description="Urgent warnings or severe weather stops"
    )
