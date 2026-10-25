"""Pydantic schemas for Construction Project Planning, Scheduling, and WBS."""

import re
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, model_validator


class TaskItem(BaseModel):
    """Granular task in a project phase."""

    task_id: str = Field(..., description="Unique task code (e.g. T_01)")
    task_name: str = Field(..., description="Actionable task title")
    duration_days: int = Field(..., ge=1, description="Estimated duration in working days")
    start_day: int = Field(..., ge=1, description="Project timeline start day")
    end_day: int = Field(..., ge=1, description="Project timeline completion day")
    required_trade: str = Field(..., description="Primary subcontractor trade (e.g. Electrical, Carpentry)")
    dependencies: List[str] = Field(default_factory=list, description="IDs of prerequisite tasks")
    estimated_cost: float = Field(default=0.0, ge=0.0, description="Allocated task budget")
    is_critical_path: bool = Field(default=False, description="Whether this task lies on the critical path")


class ProjectPhase(BaseModel):
    """Major construction phase (WBS Level 1/2)."""

    phase_id: str = Field(..., description="Phase code (e.g. PHASE_01)")
    phase_name: str = Field(..., description="Phase title (e.g. Substructure & Foundation)")
    sequence_order: int = Field(..., ge=1, description="Execution sequence")
    duration_days: int = Field(..., ge=1, description="Phase duration in days")
    start_day: int = Field(..., ge=1, description="Starting calendar day on timeline")
    end_day: int = Field(..., ge=1, description="Completion calendar day on timeline")
    budget_allocation: float = Field(default=0.0, ge=0.0, description="Phase budget portion")
    description: str = Field(..., description="Scope summary for this phase")
    tasks: List[TaskItem] = Field(default_factory=list, description="Work packages in this phase")


class Milestone(BaseModel):
    """Key contractual or technical project milestone."""

    milestone_id: str = Field(..., description="Milestone code (e.g. M_01)")
    title: str = Field(..., description="Milestone milestone title")
    target_day: int = Field(..., ge=1, description="Target calendar day from notice to proceed")
    criteria: str = Field(..., description="Verification and inspection acceptance criteria")


class RiskFactor(BaseModel):
    """Identified project risk and contingency plan."""

    risk_name: str = Field(..., description="Identified risk scenario")
    likelihood: Literal["Low", "Medium", "High"] = Field(..., description="Probability of occurrence")
    impact: Literal["Low", "Medium", "High"] = Field(..., description="Severity of impact on schedule/cost")
    mitigation_strategy: str = Field(..., description="Proactive mitigation and recovery protocol")


class ProjectPlanRequest(BaseModel):
    """Input payload for automated project planning generation."""

    project_name: str = Field(default="Apex Commercial Project", description="Project name / identifier")
    project_type: str = Field(
        default="Commercial Building",
        description="Project typology (e.g. Residential Multi-family, Commercial, Industrial, Civil Infrastructure)",
    )
    scope_description: str = Field(default="Full-cycle structural, envelope, and MEP construction.", description="Detailed scope")
    target_duration_days: int = Field(default=180, gt=0, description="Target total duration in days")
    total_budget: float = Field(default=1000000.0, gt=0.0, description="Authorized project budget")
    currency: str = Field(default="USD", description="Currency denomination")
    site_conditions: Optional[str] = Field("Urban infill site, standard soil bearing capacity", description="Site conditions")
    constraints: Optional[str] = Field("Standard operating hours", description="Constraints or permits")
    team_size: Optional[int] = Field(25, gt=0, description="Average expected site workforce headcount")

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapped = dict(data)
            if "projectName" in mapped and "project_name" not in mapped:
                mapped["project_name"] = mapped["projectName"]
            if "projectType" in mapped and "project_type" not in mapped:
                mapped["project_type"] = mapped["projectType"]
            if "timelineMonths" in mapped and "target_duration_days" not in mapped:
                try:
                    mapped["target_duration_days"] = int(float(mapped["timelineMonths"]) * 30)
                except (ValueError, TypeError):
                    mapped["target_duration_days"] = 365
            if "budget" in mapped and "total_budget" not in mapped:
                val_str = re.sub(r"[^\d.]", "", str(mapped["budget"]))
                try:
                    mapped["total_budget"] = float(val_str) if val_str else 1000000.0
                except (ValueError, TypeError):
                    mapped["total_budget"] = 1000000.0
            if "scope_description" not in mapped:
                specs = mapped.get("specialRequirements", "") or ""
                loc = mapped.get("location", "") or ""
                area = mapped.get("siteAreaSqFt", "") or ""
                mapped["scope_description"] = f"Development at {loc} ({area} sq.ft). Requirements: {specs}".strip()
            return mapped
        return data


class ProjectPlanResponse(BaseModel):
    """Comprehensive generated construction master schedule and plan."""

    project_name: str = Field(..., description="Project name")
    project_type: str = Field(..., description="Project classification")
    total_estimated_duration_days: int = Field(..., ge=1, description="Calculated project timeline length")
    estimated_total_cost: float = Field(..., ge=0.0, description="Summed construction cost projection")
    currency: str = Field(default="USD", description="Currency denomination")
    recommended_crew_size: int = Field(..., ge=1, description="Recommended average site labor staffing")
    contingency_budget_percentage: float = Field(
        default=10.0, ge=0.0, le=50.0, description="Recommended contingency reserve percentage"
    )
    phases: List[ProjectPhase] = Field(default_factory=list, description="Sequential project phases")
    milestones: List[Milestone] = Field(default_factory=list, description="Critical progress milestones")
    critical_path: List[str] = Field(default_factory=list, description="Sequence of zero-float critical path items")
    risk_contingencies: List[RiskFactor] = Field(
        default_factory=list, description="Identified project risks and countermeasures"
    )
