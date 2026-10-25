"""Pydantic schemas for Crack Detection and Structural Health Diagnostics."""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class RemediationStep(BaseModel):
    """Step in structural repair and remediation plan."""

    step_number: int = Field(..., ge=1, description="Sequential order of remediation task")
    action: str = Field(..., description="Actionable repair instruction")
    materials_needed: str = Field(..., description="Recommended structural materials and specifications")
    urgency: Literal["Immediate", "Within 1 Week", "Within 1 Month", "Routine Monitoring"] = Field(
        ..., description="Repair urgency classification"
    )


class CrackAnalysisResponse(BaseModel):
    """Diagnostic report for structural crack and defect evaluation."""

    detected: bool = Field(..., description="Whether a structural defect or crack was detected")
    crack_type: str = Field(
        ...,
        description="Type of crack (e.g. Hairline, Structural, Settlement, Shrinkage, Shear, Spalling)",
    )
    severity: Literal["Minor", "Moderate", "Severe", "Critical"] = Field(
        ..., description="Structural severity classification"
    )
    confidence_score: float = Field(
        default=90.0, ge=0.0, le=100.0, description="Diagnostics confidence rating"
    )
    estimated_width_mm: str = Field(..., description="Estimated aperture width range (e.g. '2.0mm - 3.5mm')")
    estimated_length_cm: str = Field(..., description="Estimated physical span/length")
    affected_material: str = Field(..., description="Substrate material (e.g. Reinforced Concrete, Masonry)")
    structural_integrity_risk: Literal["Low", "Medium", "High", "Critical"] = Field(
        ..., description="Threat level to structural load-bearing capacity"
    )
    potential_causes: List[str] = Field(
        default_factory=list, description="Forensic root cause hypotheses"
    )
    detailed_analysis: str = Field(..., description="In-depth engineering defect analysis")
    remediation_steps: List[RemediationStep] = Field(
        default_factory=list, description="Prescribed repair protocol"
    )
    requires_licensed_engineer: bool = Field(
        default=True, description="Whether on-site licensed PE/SE inspection is mandatory"
    )
    preventive_measures: List[str] = Field(
        default_factory=list, description="Preventative and structural maintenance measures"
    )
