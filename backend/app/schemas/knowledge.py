"""Pydantic schemas for Construction Knowledge Assistant and Building Codes."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, model_validator


class CodeReference(BaseModel):
    """Citations of authoritative building code or standard."""

    standard_body: str = Field(..., description="Organization (e.g. OSHA, IBC, ACI, AISC, ASTM, NEC)")
    code_number_or_section: str = Field(..., description="Section or designation (e.g. 29 CFR 1926.501, ACI 318-19 Sec 25)")
    title: str = Field(..., description="Section or standard title")
    requirement_summary: str = Field(..., description="Key technical or safety requirement synopsis")


class KnowledgeQueryRequest(BaseModel):
    """User technical query regarding construction codes and methods."""

    question: str = Field(default="What are formwork stripping guidelines?", description="Technical question")
    category: Optional[str] = Field(
        default="Building Code & Safety",
        description="Discipline (e.g. OSHA Safety, Concrete & Foundation, Structural Steel, MEP)",
    )
    standard_or_code: Optional[str] = Field(
        default="OSHA / IBC / ACI",
        description="Relevant standard framework (e.g. OSHA 1926, IBC 2024, ACI 318, NEC 2023)",
    )

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapped = dict(data)
            if "query" in mapped and "question" not in mapped:
                mapped["question"] = mapped["query"]
            if "domain" in mapped:
                domain_val = str(mapped["domain"])
                if "category" not in mapped:
                    mapped["category"] = domain_val
                if "standard_or_code" not in mapped:
                    mapped["standard_or_code"] = domain_val
            return mapped
        return data


class KnowledgeQueryResponse(BaseModel):
    """Authoritative answer with citations, checklists, and best practices."""

    question: str = Field(..., description="Original user inquiry")
    category: str = Field(..., description="Classified engineering discipline")
    direct_answer: str = Field(..., description="Clear, authoritative direct answer")
    detailed_explanation: str = Field(..., description="Technical engineering rationale and mechanisms")
    applicable_codes_and_standards: List[CodeReference] = Field(
        default_factory=list, description="Referenced statutory codes and standards"
    )
    practical_best_practices: List[str] = Field(
        default_factory=list, description="Recommended field engineering best practices"
    )
    safety_precautions: List[str] = Field(
        default_factory=list, description="Personnel safety safeguards"
    )
    inspection_checklist: List[str] = Field(
        default_factory=list, description="Pre-inspection field checklist items"
    )
    common_mistakes_to_avoid: List[str] = Field(
        default_factory=list, description="Frequent construction pitfalls and errors"
    )
