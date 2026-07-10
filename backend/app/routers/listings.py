from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import get_db
from app.schemas.listing import AvailabilityResponse, ListingDetail, ListingListResponse
from app.services import listing_service

router = APIRouter(prefix=f"{settings.api_prefix}/listings", tags=["Listings"])


@router.get("", response_model=ListingListResponse, summary="Search and list properties")
def list_listings(
    location: str | None = Query(None, description="Partial match on city, country, address or title"),
    check_in: date | None = Query(None, description="Start date (must be sent with check_out)"),
    check_out: date | None = Query(None, description="End date (must be sent with check_in)"),
    guests: int | None = Query(None, ge=1, description="Minimum guest capacity"),
    min_price: int | None = Query(None, ge=0, description="Minimum nightly price in INR"),
    max_price: int | None = Query(None, ge=0, description="Maximum nightly price in INR"),
    property_type: str | None = Query(None, description="Property type, case-insensitive"),
    amenities: str | None = Query(None, description="Comma-separated names; listing must have all"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db),
):
    # Availability filtering needs both dates or neither.
    if (check_in is None) != (check_out is None):
        raise HTTPException(status_code=400, detail="check_in and check_out must be provided together")
    if check_in and check_out and check_in >= check_out:
        raise HTTPException(status_code=400, detail="check_in must be before check_out")
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(status_code=400, detail="min_price must not exceed max_price")

    return listing_service.search_listings(
        db,
        location=location,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        min_price=min_price,
        max_price=max_price,
        property_type=property_type,
        amenities=amenities,
        page=page,
        page_size=page_size,
    )


@router.get("/{listing_id}", response_model=ListingDetail, summary="Get listing details")
def get_listing(listing_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    detail = listing_service.get_listing_detail(db, listing_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return detail


@router.get(
    "/{listing_id}/availability",
    response_model=AvailabilityResponse,
    summary="Get unavailable date ranges",
)
def listing_availability(listing_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    result = listing_service.get_availability(db, listing_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return result