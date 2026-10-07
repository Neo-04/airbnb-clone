from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.config import settings
from app.database import SessionLocal, init_db
from app.exceptions import register_exception_handlers
from app.models import Amenity
from app.routers import auth, bookings, favourites, health, host, listings

# Standard amenities available for listings. Inserted once on first startup.
STANDARD_AMENITIES = [
    "Wi-Fi",
    "Air conditioning",
    "Kitchen",
    "Free parking",
    "Swimming pool",
    "Washing machine",
    "TV",
    "Workspace",
    "Balcony",
    "Mountain view",
    "Sea view",
    "Breakfast",
    "Heating",
    "Pet friendly",
    "Garden",
]


def _init_amenities() -> None:
    """Populate the amenities table with standard options if empty."""
    db = SessionLocal()
    try:
        existing = db.scalar(select(Amenity.id).limit(1))
        if existing is not None:
            return
        for name in STANDARD_AMENITIES:
            db.add(Amenity(name=name))
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# Create tables and initialize system data on startup.
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    _init_amenities()
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
app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(host.router)
app.include_router(favourites.router)