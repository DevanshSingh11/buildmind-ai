"""API Router for Weather Advisories and Activity Risk Assessment."""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.weather import WeatherAdvisoryRequest, WeatherAdvisoryResponse
from app.services.ai_service import AIService, get_ai_service
from app.services.prompts import WEATHER_ADVISORY_PROMPT, render_prompt
from app.services.weather_service import WeatherService, get_weather_service

router = APIRouter(prefix="/weather", tags=["Weather Advisory"])
logger = logging.getLogger("construction_ai.routers.weather")


@router.post(
    "/advisory",
    response_model=WeatherAdvisoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate weather conditions against planned construction tasks and operations",
)
async def get_weather_advisory(
    payload: WeatherAdvisoryRequest,
    weather_service: WeatherService = Depends(get_weather_service),
    ai_service: AIService = Depends(get_ai_service),
) -> WeatherAdvisoryResponse:
    """Fetch real-time atmospheric data and generate AI-driven activity-specific safety recommendations."""
    try:
        weather_data = await weather_service.get_weather_data(
            city=payload.location,
            lat=payload.latitude,
            lon=payload.longitude,
        )

        planned_str = "\n".join(f"- {act}" for act in payload.planned_activities)

        formatted_prompt = render_prompt(
            WEATHER_ADVISORY_PROMPT,
            location=weather_data["location"],
            temperature_c=weather_data["temperature_c"],
            temperature_f=weather_data["temperature_f"],
            feels_like_c=weather_data["feels_like_c"],
            feels_like_f=weather_data["feels_like_f"],
            humidity=weather_data["humidity"],
            wind_speed_kmh=weather_data["wind_speed_kmh"],
            wind_gust_kmh=weather_data["wind_gust_kmh"],
            precipitation=weather_data["precipitation"],
            weather_description=weather_data["weather_description"],
            forecast_summary=weather_data["forecast_summary"],
            planned_activities=planned_str,
        )

        raw_result = ai_service.generate_text(formatted_prompt, allow_fallback=True)
        validated_response = WeatherAdvisoryResponse.model_validate(raw_result)
        return validated_response

    except Exception as exc:
        logger.exception("Weather advisory endpoint failure: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Weather advisory generation failed: {str(exc)}",
        )


@router.get(
    "/current",
    status_code=status.HTTP_200_OK,
    summary="Fetch current atmospheric weather conditions for a construction location",
)
async def get_current_weather(
    location: str = Query("Austin, TX", description="City, state, or coordinates"),
    weather_service: WeatherService = Depends(get_weather_service),
):
    """Retrieve raw atmospheric readings for jobsite dashboard."""
    try:
        return await weather_service.get_weather_data(city=location)
    except Exception as exc:
        logger.exception("Current weather endpoint failure: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch weather: {str(exc)}",
        )
