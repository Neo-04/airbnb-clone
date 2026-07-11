from __future__ import annotations

from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import get_current_user, get_db
from app.models import User
from app.schemas.booking import (
    BookingCreateRequest,
    BookingDetail,
    BookingQuoteRequest,
    BookingQuoteResponse,
    MyTripsResponse,
)
from app.services import booking_service

router = APIRouter(prefix=f"{settings.api_prefix}/bookings", tags=["Bookings"])


@router.post("/quote", response_model=BookingQuoteResponse, summary="Price a stay without booking")
def quote(payload: BookingQuoteRequest, db: Session = Depends(get_db)):
    return booking_service.quote_booking(db, payload)


@router.post("", response_model=BookingDetail, status_code=status.HTTP_201_CREATED, summary="Create a booking")
def create(
    payload: BookingCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return booking_service.create_booking(db, user, payload)


# Registered before /{booking_id} so the static path wins.
@router.get("/me", response_model=MyTripsResponse, summary="Current user's bookings")
def my_trips(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return booking_service.list_my_bookings(db, user)


@router.get("/{booking_id}", response_model=BookingDetail, summary="Get booking details")
def detail(
    booking_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return booking_service.get_booking_detail(db, user, booking_id)