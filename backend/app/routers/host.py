from __future__ import annotations

from fastapi import APIRouter, Depends, Path, Response, status
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import get_current_host, get_db
from app.models import User
from app.schemas.host import (
    HostBookingsResponse,
    HostListingOut,
    HostStats,
    ListingWrite,
)
from app.services import host_service

router = APIRouter(prefix=f"{settings.api_prefix}/host", tags=["Host"])


@router.get("/listings", response_model=list[HostListingOut], summary="List owned listings")
def list_listings(db: Session = Depends(get_db), host: User = Depends(get_current_host)):
    return host_service.list_host_listings(db, host)


@router.post(
    "/listings",
    response_model=HostListingOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a listing",
)
def create_listing(
    payload: ListingWrite,
    db: Session = Depends(get_db),
    host: User = Depends(get_current_host),
):
    return host_service.create_listing(db, host, payload)


@router.put("/listings/{listing_id}", response_model=HostListingOut, summary="Update an owned listing")
def update_listing(
    payload: ListingWrite,
    listing_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    host: User = Depends(get_current_host),
):
    return host_service.update_listing(db, host, listing_id, payload)


@router.delete(
    "/listings/{listing_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an owned listing",
)
def delete_listing(
    listing_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    host: User = Depends(get_current_host),
):
    host_service.delete_listing(db, host, listing_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/bookings", response_model=HostBookingsResponse, summary="Bookings on owned listings")
def host_bookings(db: Session = Depends(get_db), host: User = Depends(get_current_host)):
    return host_service.list_host_bookings(db, host)


@router.get("/stats", response_model=HostStats, summary="Host dashboard statistics")
def host_stats(db: Session = Depends(get_db), host: User = Depends(get_current_host)):
    return host_service.host_stats(db, host)