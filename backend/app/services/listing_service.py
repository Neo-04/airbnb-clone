from __future__ import annotations

from datetime import date
from math import ceil

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.enums import BookingStatus
from app.models import Amenity, Booking, Listing, Review
from app.schemas.listing import (
    AmenityOut,
    AvailabilityResponse,
    DateRange,
    HostPublic,
    ListingCard,
    ListingDetail,
    ListingImageOut,
    ListingListResponse,
    ReviewOut,
)
from app.services.availability import booking_overlap_condition


# Money is stored in paise; the API speaks whole rupees.
def paise_to_rupees(paise: int) -> int:
    return paise // 100


def _rupees_to_paise(rupees: int) -> int:
    return rupees * 100


# Split a comma-separated amenities string into cleaned, lowercased names.
def _parse_amenities(raw: str | None) -> list[str]:
    if not raw:
        return []
    return [a.strip().lower() for a in raw.split(",") if a.strip()]


# Build the list of filter conditions from the parameters the client actually sent.
def _build_conditions(
    *,
    location: str | None,
    guests: int | None,
    min_price: int | None,
    max_price: int | None,
    property_type: str | None,
    amenity_names: list[str],
    check_in: date | None,
    check_out: date | None,
) -> list:
    conditions = []

    if location:
        term = location.strip().lower()
        conditions.append(
            or_(
                func.lower(Listing.city).contains(term),
                func.lower(Listing.country).contains(term),
                func.lower(func.coalesce(Listing.address, "")).contains(term),
                func.lower(Listing.title).contains(term),
            )
        )

    if guests:
        conditions.append(Listing.max_guests >= guests)

    if min_price is not None:
        conditions.append(Listing.price_per_night >= _rupees_to_paise(min_price))
    if max_price is not None:
        conditions.append(Listing.price_per_night <= _rupees_to_paise(max_price))

    if property_type:
        conditions.append(func.lower(Listing.property_type) == property_type.strip().lower())

    # A listing must contain every requested amenity (case-insensitive).
    for name in amenity_names:
        conditions.append(Listing.amenities.any(func.lower(Amenity.name) == name))

    # Exclude listings with a confirmed booking overlapping the requested dates.
    if check_in and check_out:
        conditions.append(~Listing.bookings.any(booking_overlap_condition(check_in, check_out)))

    return conditions


# Return confirmed booking date ranges that block availability for a listing.
def _confirmed_ranges(db: Session, listing_id: int) -> list[DateRange]:
    bookings = db.scalars(
        select(Booking)
        .where(Booking.listing_id == listing_id, Booking.status == BookingStatus.confirmed)
        .order_by(Booking.check_in)
    ).all()
    return [DateRange(check_in=b.check_in, check_out=b.check_out) for b in bookings]


def _to_card(listing: Listing, review_count: int) -> ListingCard:
    # Use the first ordered image as the card cover.
    images = sorted(listing.images, key=lambda i: (i.display_order, i.id))
    cover = images[0].image_url if images else None
    return ListingCard(
        id=listing.id,
        title=listing.title,
        city=listing.city,
        country=listing.country,
        property_type=listing.property_type,
        price_per_night=paise_to_rupees(listing.price_per_night),
        cleaning_fee=paise_to_rupees(listing.cleaning_fee),
        rating=listing.rating,
        review_count=review_count,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        cover_image=cover,
        amenities=[a.name for a in listing.amenities],
    )


# Build listing cards for a set of listings, attaching review counts in one query.
def build_listing_cards(db: Session, listings: list[Listing]) -> list[ListingCard]:
    if not listings:
        return []
    ids = [listing.id for listing in listings]
    rows = db.execute(
        select(Review.listing_id, func.count(Review.id))
        .where(Review.listing_id.in_(ids))
        .group_by(Review.listing_id)
    ).all()
    counts = {listing_id: count for listing_id, count in rows}
    return [_to_card(listing, counts.get(listing.id, 0)) for listing in listings]


# Search listings with optional filters and return a paginated response.
def search_listings(
    db: Session,
    *,
    location: str | None,
    check_in: date | None,
    check_out: date | None,
    guests: int | None,
    min_price: int | None,
    max_price: int | None,
    property_type: str | None,
    amenities: str | None,
    page: int,
    page_size: int,
) -> ListingListResponse:
    conditions = _build_conditions(
        location=location,
        guests=guests,
        min_price=min_price,
        max_price=max_price,
        property_type=property_type,
        amenity_names=_parse_amenities(amenities),
        check_in=check_in,
        check_out=check_out,
    )

    # Count all matching listings before applying pagination.
    count_query = select(func.count()).select_from(Listing)
    for condition in conditions:
        count_query = count_query.where(condition)
    total = db.scalar(count_query) or 0

    # Newest first, with id as a stable tie-breaker.
    query = select(Listing)
    for condition in conditions:
        query = query.where(condition)
    query = (
        query.order_by(Listing.created_at.desc(), Listing.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .options(selectinload(Listing.images), selectinload(Listing.amenities))
    )
    listings = db.scalars(query).all()

    items = build_listing_cards(db, listings)
    total_pages = ceil(total / page_size) if total else 0
    return ListingListResponse(
        items=items, page=page, page_size=page_size, total=total, total_pages=total_pages
    )


# Return the full detail payload for one listing, or None if it doesn't exist.
def get_listing_detail(db: Session, listing_id: int) -> ListingDetail | None:
    listing = db.scalars(
        select(Listing)
        .where(Listing.id == listing_id)
        .options(
            joinedload(Listing.host),
            selectinload(Listing.images),
            selectinload(Listing.amenities),
            selectinload(Listing.reviews).joinedload(Review.user),
        )
    ).first()
    if listing is None:
        return None

    images = sorted(listing.images, key=lambda i: (i.display_order, i.id))
    reviews = sorted(listing.reviews, key=lambda r: r.created_at, reverse=True)

    return ListingDetail(
        id=listing.id,
        host=HostPublic.model_validate(listing.host),
        title=listing.title,
        description=listing.description,
        city=listing.city,
        country=listing.country,
        address=listing.address,
        latitude=listing.latitude,
        longitude=listing.longitude,
        property_type=listing.property_type,
        price_per_night=paise_to_rupees(listing.price_per_night),
        cleaning_fee=paise_to_rupees(listing.cleaning_fee),
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        rating=listing.rating,
        review_count=len(listing.reviews),
        created_at=listing.created_at,
        updated_at=listing.updated_at,
        images=[ListingImageOut.model_validate(i) for i in images],
        amenities=[AmenityOut.model_validate(a) for a in listing.amenities],
        reviews=[
            ReviewOut(
                id=r.id,
                rating=r.rating,
                comment=r.comment,
                created_at=r.created_at,
                reviewer_name=r.user.name,
                reviewer_avatar=r.user.avatar_url,
            )
            for r in reviews
        ],
        unavailable_ranges=_confirmed_ranges(db, listing.id),
    )


# Return unavailable confirmed date ranges for a listing, or None if it doesn't exist.
def get_availability(db: Session, listing_id: int) -> AvailabilityResponse | None:
    exists = db.scalar(select(Listing.id).where(Listing.id == listing_id))
    if not exists:
        return None
    return AvailabilityResponse(
        listing_id=listing_id, unavailable_ranges=_confirmed_ranges(db, listing_id)
    )