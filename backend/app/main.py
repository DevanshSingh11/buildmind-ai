"""Construction Intelligence Platform Backend Application.

Main FastAPI application entry point with CORS configuration, global error handling,
health checks, and routing for all multimodal AI capabilities across both /api and /api/v1.
"""

import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routers import (
    assistant,
    crack,
    knowledge,
    planning,
    projects,
    safety,
    valuation,
    weather,
)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("construction_ai.main")

settings = get_settings()

app = FastAPI(
    title="Construction Intelligence Platform API",
    description="Multimodal AI-powered platform for construction site safety, structural diagnostics, valuation, planning, weather advisory, and knowledge assistance.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware (allowing localhost:5173, localhost:3000, and configured origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handlers for strict JSON contract compliance
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Format request validation errors cleanly."""
    logger.warning("Validation error on %s: %s", request.url.path, exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "detail": exc.errors(),
            "path": request.url.path,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Catch unhandled errors and format as JSON."""
    logger.exception("Unhandled error on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "path": request.url.path,
        },
    )


# Mount All Feature Routers under both /api and /api/v1 for seamless compatibility
all_routers = [
    safety.router,
    crack.router,
    valuation.router,
    planning.router,
    assistant.router,
    weather.router,
    knowledge.router,
    projects.router,
]

for base_prefix in ["/api", "/api/v1"]:
    for r in all_routers:
        app.include_router(r, prefix=base_prefix)

# Additional alias for crack/cracks pluralization support
for base_prefix in ["/api", "/api/v1"]:
    app.include_router(crack.router, prefix=f"{base_prefix}s")


# Health Check Endpoints
@app.get("/health", status_code=status.HTTP_200_OK, tags=["System"], summary="Health check endpoint")
@app.get("/api/health", status_code=status.HTTP_200_OK, tags=["System"], summary="Health check endpoint")
@app.get("/api/v1/health", status_code=status.HTTP_200_OK, tags=["System"], summary="Health check endpoint")
async def health_check():
    """System health check and runtime status."""
    return {
        "status": "healthy",
        "service": "Construction Intelligence Platform Backend",
        "version": "1.0.0",
        "environment": settings.environment,
        "ai_model": settings.gemini_model,
    }


@app.get("/", status_code=status.HTTP_200_OK, tags=["System"], summary="Root metadata endpoint")
async def root():
    """Platform API overview and registered capability modules."""
    return {
        "message": "Welcome to Construction Intelligence Platform API",
        "documentation": "/docs",
        "modules": [
            {"name": "Safety Monitoring", "prefix": "/api/safety", "type": "Multimodal Image Analysis"},
            {"name": "Crack Detection", "prefix": "/api/crack", "type": "Multimodal Image Analysis"},
            {"name": "Real Estate Valuation", "prefix": "/api/valuation", "type": "Multimodal & JSON"},
            {"name": "Project Planning", "prefix": "/api/planning", "type": "WBS & Critical Path Schedule"},
            {"name": "Daily Site Assistant", "prefix": "/api/assistant", "type": "Field Logs & Superintendent Q&A"},
            {"name": "Weather Advisory", "prefix": "/api/weather", "type": "Real-time Meteorology & Activity Risk"},
            {"name": "Knowledge Assistant", "prefix": "/api/knowledge", "type": "OSHA, IBC, ACI Building Codes"},
        ],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
