"""API Router for Daily Site Assistant and Construction Field Log Processing."""

import logging
from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.assistant import (
    AssistantChatRequest,
    AssistantChatResponse,
    DailyLogRequest,
    DailyLogResponse,
)
from app.services.ai_service import AIService, get_ai_service
from app.services.prompts import DAILY_LOG_ASSISTANT_PROMPT, render_prompt

router = APIRouter(prefix="/assistant", tags=["Daily Site Assistant"])
logger = logging.getLogger("construction_ai.routers.assistant")


@router.post(
    "/daily-log",
    response_model=DailyLogResponse,
    status_code=status.HTTP_200_OK,
    summary="Process raw field notes into structured executive daily site log and action plan",
)
async def process_daily_log(
    payload: DailyLogRequest,
    ai_service: AIService = Depends(get_ai_service),
) -> DailyLogResponse:
    """Synthesize field notes into an executive daily briefing with trade breakdown, blockers, and toolbox talk."""
    try:
        formatted_prompt = render_prompt(
            DAILY_LOG_ASSISTANT_PROMPT,
            site_name=payload.site_name,
            report_date=payload.report_date or "Today",
            weather_summary=payload.weather_summary or "Fair weather",
            trades_on_site=payload.trades_on_site or "General trades",
            worker_count=payload.worker_count or 0,
            work_completed=payload.work_completed,
            issues_encountered=payload.issues_encountered or "None reported",
            safety_notes=payload.safety_notes or "Zero incidents",
            equipment_notes=payload.equipment_notes or "All operational",
            next_shift_goals=payload.next_shift_goals or "Standard scheduled progression",
        )

        raw_result = ai_service.generate_text(formatted_prompt)
        validated_response = DailyLogResponse.model_validate(raw_result)
        return validated_response

    except Exception as exc:
        logger.exception("Daily log processing endpoint failure: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Daily log generation failed: {str(exc)}",
        )


@router.post(
    "/chat",
    response_model=AssistantChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Direct Q&A assistant for field superintendents, site managers, and contractors",
)
async def assistant_chat(
    payload: AssistantChatRequest,
    ai_service: AIService = Depends(get_ai_service),
) -> AssistantChatResponse:
    """Provide situational guidance, calculations, or advice to site personnel."""
    try:
        prompt = f"""
You are a senior construction superintendent and site operations expert.
Respond to the user's field inquiry clearly, concisely, and practically with safety-first priority.

USER INQUIRY:
{payload.query}

PROJECT CONTEXT:
{payload.site_context or 'Standard commercial/residential construction jobsite.'}

You MUST respond strictly with a valid JSON object matching this schema:
{{
  "response": "Detailed, practical answer formatted in readable paragraphs or bullet points...",
  "suggested_followups": [
    "Suggested related question 1",
    "Suggested related question 2"
  ]
}}
"""
        raw_result = ai_service.generate_text(prompt)
        return AssistantChatResponse.model_validate(raw_result)

    except Exception as exc:
        logger.exception("Assistant chat endpoint failure: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Assistant chat failed: {str(exc)}",
        )
