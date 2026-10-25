"""API Router for Structural Crack Detection and Material Diagnostics."""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.schemas.crack import CrackAnalysisResponse
from app.services.ai_service import AIService, get_ai_service
from app.services.prompts import CRACK_ANALYSIS_PROMPT

router = APIRouter(prefix="/crack", tags=["Crack Detection"])
logger = logging.getLogger("construction_ai.routers.crack")

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"}


@router.post(
    "/analyze",
    response_model=CrackAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze structural image for crack classification, severity, and remediation",
)
async def analyze_crack_image(
    file: Optional[UploadFile] = File(None, description="High-resolution photo of crack or defect"),
    image: Optional[UploadFile] = File(None, description="High-resolution photo (alias)"),
    surface_type: Optional[str] = Form(
        "Reinforced Concrete Wall", description="Type of structural material / element"
    ),
    structure_age_years: Optional[int] = Form(
        None, description="Approximate age of the structure in years"
    ),
    location_context: Optional[str] = Form(
        None, description="Location or member in building"
    ),
    location: Optional[str] = Form(
        None, description="Location alias"
    ),
    notes: Optional[str] = Form(None, description="Additional site notes"),
    ai_service: AIService = Depends(get_ai_service),
) -> CrackAnalysisResponse:
    """Classify structural crack, estimate dimensions, assess risk, and formulate repair protocol."""
    target_file = file or image
    if not target_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image uploaded. Please upload an image file using 'file' or 'image' field.",
        )

    if target_file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{target_file.content_type}'. Must be one of: {', '.join(ALLOWED_IMAGE_TYPES)}",
        )

    try:
        image_bytes = await target_file.read()
        if not image_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        resolved_loc = location_context or location or "Exterior structural member"
        prompt = f"""
{CRACK_ANALYSIS_PROMPT}

CONTEXT:
Substrate Material: {surface_type}
Structure Age: {structure_age_years if structure_age_years else 'Unknown'} years
Location / Structural Member: {resolved_loc}
Field Notes: {notes or 'Standard structural inspection'}
"""
        raw_result = ai_service.analyze_image(
            image_bytes=image_bytes,
            mime_type=target_file.content_type,
            prompt=prompt,
            allow_fallback=True,
        )

        validated_response = CrackAnalysisResponse.model_validate(raw_result)
        return validated_response

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Crack analysis endpoint failure: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Crack detection analysis failed: {str(exc)}",
        )
