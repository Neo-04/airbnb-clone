from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


# Register app-wide error handlers. FastAPI's own validation errors are left untouched.
def register_exception_handlers(app: FastAPI) -> None:
    # Catch anything unhandled and return a generic message without leaking internals.
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )
