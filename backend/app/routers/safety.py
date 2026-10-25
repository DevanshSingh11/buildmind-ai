"""API Router for Safety Monitoring and OSHA Compliance Image Analysis."""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.schemas.safety import SafetyAnalysisResponse
from app.services.ai_service import AIService, get_ai_service
from app.services.prompts import SAFETY_ANALYSIS_PROMPT

router = APIRouter(prefix="/safety", tags=["Safety Monitoring"])
logger = logging.getLogger("construction_ai.routers.safety")

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"}


@router.post(
    "/analyze",
    response_model=SafetyAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze construction site image for PPE compliance and OSHA hazards",
)
async def analyze_safety_image(
    file: Optional[UploadFile] = File(None, description="Jobsite photo for safety evaluation"),
    image: Optional[UploadFile] = File(None, description="Jobsite photo (alias)"),
    site_name: Optional[str] = Form(None, description="Construction site name"),
    zone: Optional[str] = Form(None, description="Zone name"),
    inspection_type: Optional[str] = Form(
        "General PPE & Hazard Audit", description="Type of safety inspection"
    ),
    notes: Optional[str] = Form(None, description="Additional site notes"),
    ai_service: AIService = Depends(get_ai_service),
) -> SafetyAnalysisResponse:
    """Evaluate construction site image for worker PPE compliance and OSHA violations."""
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

        resolved_site = site_name or zone or "Active Jobsite"
        prompt = f"""
{SAFETY_ANALYSIS_PROMPT}

CONTEXT:
Site Name / Zone: {resolved_site}
Inspection Focus: {inspection_type}
Field Notes: {notes or 'Standard site inspection'}
"""
        raw_result = ai_service.analyze_image(
            image_bytes=image_bytes,
            mime_type=target_file.content_type,
            prompt=prompt,
            allow_fallback=True,
        )

        validated_response = SafetyAnalysisResponse.model_validate(raw_result)
        return validated_response

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Safety analysis endpoint failure: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Safety inspection analysis failed: {str(exc)}",
        )
