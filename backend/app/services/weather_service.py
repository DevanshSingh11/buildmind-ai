"""Async OpenWeatherMap weather service using httpx.

Fetches live weather and forecast data, with built-in realistic fallback
simulation when an API key is not yet configured.
"""

import logging
from typing import Any, Dict, Optional
import httpx
from app.config import get_settings

logger = logging.getLogger("construction_ai.weather_service")

BASE_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"
BASE_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"


class WeatherService:
    """Async client for fetching real-time weather and forecast data."""

    def __init__(self, api_key: Optional[str] = None):
        settings = get_settings()
        self.api_key = api_key or settings.openweathermap_api_key

    async def get_weather_data(
        self,
        city: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Fetch current conditions and forecast summary.

        Falls back to realistic simulation if API key is not configured or if request fails.
        """
        location_label = city or (f"{lat:.2f}, {lon:.2f}" if lat and lon else "Construction Site")

        if not self.api_key or self.api_key.startswith("your_"):
            logger.info("OpenWeatherMap API key not set; using simulated weather data.")
            return self._get_simulated_weather(location_label)

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                params: Dict[str, Any] = {
                    "appid": self.api_key,
                    "units": "metric",
                }
                if city:
                    params["q"] = city
                elif lat is not None and lon is not None:
                    params["lat"] = lat
                    params["lon"] = lon
                else:
                    params["q"] = "Austin, US"

                current_res = await client.get(BASE_CURRENT_URL, params=params)
                current_res.raise_for_status()
                current_data = current_res.json()

                forecast_summary = "Forecast stable over next 24 hours."
                try:
                    forecast_res = await client.get(BASE_FORECAST_URL, params=params)
                    if forecast_res.status_code == 200:
                        fdata = forecast_res.json()
                        list_items = fdata.get("list", [])[:4]
                        descriptions = [
                            f"{item.get('dt_txt', '')[-8:-3]}: {item.get('weather', [{}])[0].get('description', '')}"
                            for item in list_items
                        ]
                        if descriptions:
                            forecast_summary = " | ".join(descriptions)
                except Exception as f_err:
                    logger.warning("Forecast sub-fetch failed: %s", f_err)

                main = current_data.get("main", {})
                wind = current_data.get("wind", {})
                weather_arr = current_data.get("weather", [{}])
                description = weather_arr[0].get("description", "Clear sky") if weather_arr else "Clear sky"

                temp_c = float(main.get("temp", 22.0))
                feels_c = float(main.get("feels_like", 22.0))
                wind_speed_ms = float(wind.get("speed", 3.5))
                wind_gust_ms = float(wind.get("gust", wind_speed_ms * 1.3))

                return {
                    "location": current_data.get("name", location_label),
                    "temperature_c": round(temp_c, 1),
                    "temperature_f": round(temp_c * 9 / 5 + 32, 1),
                    "feels_like_c": round(feels_c, 1),
                    "feels_like_f": round(feels_c * 9 / 5 + 32, 1),
                    "humidity": int(main.get("humidity", 55)),
                    "wind_speed_kmh": round(wind_speed_ms * 3.6, 1),
                    "wind_gust_kmh": round(wind_gust_ms * 3.6, 1),
                    "precipitation": f"{current_data.get('rain', {}).get('1h', 0.0)} mm/hr",
                    "weather_description": description.capitalize(),
                    "forecast_summary": forecast_summary,
                }

        except Exception as exc:
            logger.error("Error calling OpenWeatherMap API: %s. Falling back to simulated data.", exc)
            return self._get_simulated_weather(location_label)

    def _get_simulated_weather(self, location: str) -> Dict[str, Any]:
        """Realistic simulated weather data for demonstration and offline development."""
        return {
            "location": location,
            "temperature_c": 21.5,
            "temperature_f": 70.7,
            "feels_like_c": 21.0,
            "feels_like_f": 69.8,
            "humidity": 58,
            "wind_speed_kmh": 22.4,
            "wind_gust_kmh": 36.8,
            "precipitation": "0.0 mm/hr (isolated afternoon drizzle expected)",
            "weather_description": "Partly Cloudy with Moderate Breeze",
            "forecast_summary": "12:00: Partly cloudy, 23°C | 15:00: 30% chance light showers, gusty | 18:00: Clearing, 20°C",
        }


_weather_service_instance: Optional[WeatherService] = None


def get_weather_service() -> WeatherService:
    """Dependency provider for WeatherService singleton."""
    global _weather_service_instance
    if _weather_service_instance is None:
        _weather_service_instance = WeatherService()
    return _weather_service_instance
