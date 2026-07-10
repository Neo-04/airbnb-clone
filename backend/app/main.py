from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.exceptions import register_exception_handlers
from app.routers import health


# Run startup/shutdown logic. Tables are created on startup.
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    description="Backend API for an Airbnb-style booking marketplace.",
    lifespan=lifespan,
)

# Restrict CORS to the known frontend origin(s); wildcard is avoided so credentials stay allowed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(health.router)
