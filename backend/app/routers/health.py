from fastapi import APIRouter

from app.config import settings

router = APIRouter(tags=["health"])


# Simple root endpoint to confirm the API is up.
@router.get("/")
def root():
    return {"message": "Airbnb Clone API is running"}


# Health check used for monitoring and deployment probes.
@router.get("/health")
def health():
    return {
        "status": "healthy",
        "service": settings.app_name,
        "environment": settings.app_env,
    }
