"""API Router for Real Estate and Construction Valuation."""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status

from app.schemas.valuation import ValuationRequest, ValuationResponse
from app.services.ai_service import AIService, get_ai_service
from app.services.prompts import VALUATION_PROMPT, render_prompt

router = APIRouter(prefix="/valuation", tags=["Real Estate Valuation"])
logger = logging.getLogger("construction_ai.routers.valuation")

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"}


@router.post(
    "/estimate",
    response_model=ValuationResponse,
    status_code=status.HTTP_200_OK,
    summary="Estimate construction / property valuation (JSON body or Form with optional image)",
)
async def estimate_valuation(
    request: Request,
    ai_service: AIService = Depends(get_ai_service),
) -> ValuationResponse:
    """Generate appraisal and valuation estimate supporting JSON body or multipart form data."""
    content_type = request.headers.get("content-type", "")

    # Handle JSON payload
    if "application/json" in content_type:
        try:
            body = await request.json()
            payload = ValuationRequest.model_validate(body)
            return await _process_valuation(payload, None, ai_service)
        except Exception as exc:
            logger.exception("JSON valuation failed: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid JSON valuation request: {str(exc)}",
            )

    # Handle multipart / form data
    try:
        form = await request.form()
        raw_dict = dict(form)
        file = form.get("file") or form.get("image")
        uploaded_file = file if isinstance(file, UploadFile) else None

        payload = ValuationRequest.model_validate(raw_dict)
        return await _process_valuation(payload, uploaded_file, ai_service)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Form valuation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Valuation form processing failed: {str(exc)}",
        )


@router.post(
    "/estimate-json",
    response_model=ValuationResponse,
    status_code=status.HTTP_200_OK,
    summary="Estimate construction / property valuation via JSON body",
)
async def estimate_valuation_json(
    payload: ValuationRequest,
    ai_service: AIService = Depends(get_ai_service),
) -> ValuationResponse:
    """Generate valuation estimate using pure JSON payload."""
    return await _process_valuation(payload, None, ai_service)


async def _process_valuation(
    payload: ValuationRequest,
    file: Optional[UploadFile],
    ai_service: AIService,
) -> ValuationResponse:
    try:
        formatted_prompt = render_prompt(
            VALUATION_PROMPT,
            property_type=payload.property_type,
            square_footage=payload.square_footage,
            location=payload.location,
            year_built=payload.year_built if payload.year_built else "Unknown",
            condition=payload.condition or "Good",
            quality_grade=payload.quality_grade or "Standard",
            bedrooms_bathrooms_info=payload.bedrooms_bathrooms_info or "Standard",
            amenities=payload.amenities or "Standard",
            recent_renovations=payload.recent_renovations or "None",
        )

        if file and file.filename:
            if file.content_type not in ALLOWED_IMAGE_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid image type '{file.content_type}'. Must be one of: {', '.join(ALLOWED_IMAGE_TYPES)}",
                )
            image_bytes = await file.read()
            raw_result = ai_service.analyze_image(
                image_bytes=image_bytes,
                mime_type=file.content_type,
                prompt=f"{formatted_prompt}\n\nPlease factor visual condition visible in the attached property image.",
            )
        else:
            raw_result = ai_service.generate_text(formatted_prompt)

        return ValuationResponse.model_validate(raw_result)

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Valuation execution failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Valuation processing failed: {str(exc)}",
        )
