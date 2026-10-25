"""Pydantic schemas for Safety Monitoring and OSHA compliance analysis."""

from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class PPEItem(BaseModel):
    """Specific PPE item compliance status."""

    item_name: str = Field(..., description="Name of PPE equipment (e.g. Hard Hat, Safety Vest)")
    compliant: bool = Field(..., description="Whether worker is wearing the equipment correctly")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0, description="Detection confidence score")


class WorkerDetection(BaseModel):
    """Detection and PPE audit for an individual worker."""

    worker_id: str = Field(..., description="Identifier for the worker in the image")
    location_description: Optional[str] = Field(None, description="Spatial location within scene")
    is_fully_compliant: bool = Field(..., description="True if all required PPE items are present")
    ppe_items: List[PPEItem] = Field(default_factory=list, description="Audit of individual PPE equipment")
    violations: List[str] = Field(default_factory=list, description="Specific violations for this worker")


class HazardDetection(BaseModel):
    """Detected physical safety hazard or OSHA code violation."""

    hazard_id: str = Field(..., description="Unique hazard code")
    category: str = Field(..., description="Hazard category (e.g. Fall Protection, Scaffolding, Electrical)")
    description: str = Field(..., description="Detailed explanation of the hazard condition")
    severity: Literal["Low", "Medium", "High", "Critical"] = Field(..., description="Risk severity tier")
    osha_standard_violated: Optional[str] = Field(None, description="Referenced OSHA standard section")
    location_in_image: Optional[str] = Field(None, description="Visual location of the hazard")
    immediate_action_required: Optional[str] = Field(None, description="Urgent step required on site")


class SafetyAnalysisResponse(BaseModel):
    """Comprehensive safety and PPE audit report."""

    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), description="Audit timestamp")
    compliance_score: float = Field(..., ge=0.0, le=100.0, description="Overall safety compliance percentage")
    risk_level: Literal["Low", "Medium", "High", "Critical"] = Field(..., description="Overall jobsite risk rating")
    total_workers_detected: int = Field(default=0, ge=0, description="Count of workers detected")
    compliant_workers_count: int = Field(default=0, ge=0, description="Count of compliant workers")
    non_compliant_workers_count: int = Field(default=0, ge=0, description="Count of non-compliant workers")
    workers: List[WorkerDetection] = Field(default_factory=list, description="Individual worker breakdown")
    hazards_detected: List[HazardDetection] = Field(default_factory=list, description="Detected jobsite hazards")
    safety_recommendations: List[str] = Field(default_factory=list, description="Actionable safety guidance")
    overall_summary: str = Field(..., description="Executive safety overview")
