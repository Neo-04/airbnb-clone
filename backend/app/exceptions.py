from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.services.errors import ServiceError


# Register app-wide error handlers. FastAPI's own validation errors are left untouched.
def register_exception_handlers(app: FastAPI) -> None:
    # Turn service-layer errors into their intended HTTP responses.
    @app.exception_handler(ServiceError)
    async def service_error_handler(request: Request, exc: ServiceError):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    # Catch anything unhandled and return a generic message without leaking internals.
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})