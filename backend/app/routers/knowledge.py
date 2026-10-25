"""API Router for Construction Knowledge Assistant, Building Codes, and Standards."""

import logging
from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.knowledge import KnowledgeQueryRequest, KnowledgeQueryResponse
from app.services.ai_service import AIService, get_ai_service
from app.services.prompts import KNOWLEDGE_QUERY_PROMPT, render_prompt

router = APIRouter(prefix="/knowledge", tags=["Knowledge Assistant"])
logger = logging.getLogger("construction_ai.routers.knowledge")


@router.post(
    "/query",
    response_model=KnowledgeQueryResponse,
    status_code=status.HTTP_200_OK,
    summary="Query technical construction building codes, OSHA regulations, and engineering standards",
)
async def query_knowledge_base(
    payload: KnowledgeQueryRequest,
    ai_service: AIService = Depends(get_ai_service),
) -> KnowledgeQueryResponse:
    """Provide authoritative engineering guidance citing IBC, IRC, OSHA, ACI, AISC, or ASTM standards."""
    try:
        formatted_prompt = render_prompt(
            KNOWLEDGE_QUERY_PROMPT,
            question=payload.question,
            category=payload.category or "Building Code & Safety",
            standard_or_code=payload.standard_or_code or "OSHA / IBC / ACI / AISC",
        )

        raw_result = ai_service.generate_text(formatted_prompt)
        validated_response = KnowledgeQueryResponse.model_validate(raw_result)
        return validated_response

    except Exception as exc:
        logger.exception("Knowledge query endpoint failure: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Knowledge inquiry failed: {str(exc)}",
        )
