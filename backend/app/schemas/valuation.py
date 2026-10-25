"""Pydantic schemas for Real Estate & Construction Valuation."""

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, model_validator


class RenovationRecommendation(BaseModel):
    """Specific high-ROI renovation recommendation."""

    renovation_name: str = Field(..., description="Renovation or upgrade item")
    estimated_cost: float = Field(..., ge=0.0, description="Estimated investment cost")
    estimated_value_increase: float = Field(..., ge=0.0, description="Estimated added market value")
    roi_percentage: float = Field(..., description="Projected Return on Investment percentage")


class MarketTrendAnalysis(BaseModel):
    """Regional real estate market dynamics and outlook."""

    trend_direction: Literal["Appreciating", "Stable", "Depreciating"] = Field(
        ..., description="Market direction trajectory"
    )
    forecast_12_month_pct: float = Field(
        default=0.0, description="Projected 12-month appreciation or depreciation rate (%)"
    )
    commentary: str = Field(..., description="Qualitative market analysis")


class ValuationRequest(BaseModel):
    """JSON payload for valuation estimation."""

    property_type: str = Field(
        default="Single Family Residence",
        description="Type of property (e.g. Commercial Office, Industrial Warehouse, Multi-Family, Single Family)",
    )
    square_footage: float = Field(default=2500.0, gt=0.0, description="Total gross or usable floor area (sq ft)")
    location: str = Field(default="Austin Metro, TX", description="City, neighborhood, or geographic market")
    year_built: Optional[int] = Field(None, description="Year of original construction")
    condition: Optional[str] = Field("Good", description="Condition rating (e.g. Excellent, Good, Fair, Distressed)")
    quality_grade: Optional[str] = Field("Standard / Modern", description="Finish and materials specification tier")
    bedrooms_bathrooms_info: Optional[str] = Field("3 Bed, 2 Bath", description="Unit mix or layout breakdown")
    amenities: Optional[str] = Field("Central HVAC, attached 2-car garage", description="Key architectural amenities")
    recent_renovations: Optional[str] = Field("None reported", description="Details of recent capital improvements")

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapped = dict(data)
            if "propertyType" in mapped and "property_type" not in mapped:
                mapped["property_type"] = mapped["propertyType"]
            if "areaSqFt" in mapped and "square_footage" not in mapped:
                mapped["square_footage"] = float(mapped["areaSqFt"])
            if "area" in mapped and "square_footage" not in mapped:
                mapped["square_footage"] = float(mapped["area"])
            if "qualityTier" in mapped and "quality_grade" not in mapped:
                mapped["quality_grade"] = mapped["qualityTier"]
            if "yearBuilt" in mapped and "year_built" not in mapped:
                try:
                    mapped["year_built"] = int(mapped["yearBuilt"])
                except (ValueError, TypeError):
                    pass
            if "structuralSystem" in mapped:
                existing_amenities = mapped.get("amenities", "") or ""
                mapped["amenities"] = f"{existing_amenities}; Structural: {mapped['structuralSystem']}".strip("; ")
            return mapped
        return data


class ValuationResponse(BaseModel):
    """Comprehensive construction and real estate appraisal report."""

    property_summary: str = Field(..., description="Executive property description")
    currency: str = Field(default="USD", description="Currency denomination")
    estimated_value_min: float = Field(..., ge=0.0, description="Conservative low estimate")
    estimated_value_max: float = Field(..., ge=0.0, description="Upper boundary valuation")
    estimated_value_mid: float = Field(..., ge=0.0, description="Midpoint benchmark valuation")
    price_per_sqft: float = Field(..., ge=0.0, description="Estimated valuation per square foot")
    condition_score: float = Field(..., ge=0.0, le=100.0, description="Property condition index")
    confidence_score: float = Field(default=88.0, ge=0.0, le=100.0, description="Appraisal confidence percentage")
    market_comparison: str = Field(..., description="Comparison against recent comparable transactions")
    key_value_drivers: List[str] = Field(default_factory=list, description="Primary positive valuation factors")
    risk_and_depreciation_factors: List[str] = Field(
        default_factory=list, description="Obsolescence and depreciation considerations"
    )
    renovation_value_add: List[RenovationRecommendation] = Field(
        default_factory=list, description="Prioritized capital improvements"
    )
    market_trends: MarketTrendAnalysis = Field(..., description="Market environment overview")
