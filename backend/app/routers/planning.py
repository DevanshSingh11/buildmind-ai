"""API Router for Construction Project Planning, Scheduling, and WBS Generation."""

import logging
from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.planning import ProjectPlanRequest, ProjectPlanResponse
from app.services.ai_service import AIService, get_ai_service
from app.services.prompts import PROJECT_PLANNING_PROMPT, render_prompt

router = APIRouter(prefix="/planning", tags=["Project Planning"])
logger = logging.getLogger("construction_ai.routers.planning")


@router.post(
    "/generate",
    response_model=ProjectPlanResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate comprehensive project schedule, WBS, milestones, and critical path",
)
async def generate_project_plan(
    payload: ProjectPlanRequest,
    ai_service: AIService = Depends(get_ai_service),
) -> ProjectPlanResponse:
    """Generate production-grade construction schedule and risk-adjusted work breakdown structure."""
    try:
        formatted_prompt = render_prompt(
            PROJECT_PLANNING_PROMPT,
            project_name=payload.project_name,
            project_type=payload.project_type,
            scope_description=payload.scope_description,
            target_duration_days=payload.target_duration_days,
            total_budget=f"{payload.total_budget:,.2f}",
            currency=payload.currency,
            site_conditions=payload.site_conditions or "Standard conditions",
            constraints=payload.constraints or "Standard operating hours",
            team_size=payload.team_size or 25,
        )

        raw_result = ai_service.generate_text(formatted_prompt)

        validated_response = ProjectPlanResponse.model_validate(raw_result)
        return validated_response

    except Exception as exc:
        logger.exception("Project plan generation endpoint failure: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Project planning generation failed: {str(exc)}",
        )
