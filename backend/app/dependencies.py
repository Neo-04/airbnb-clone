from app.database import get_db

# Shared request dependencies live here so routers import from one place.
__all__ = ["get_db"]
