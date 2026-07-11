from __future__ import annotations

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.enums import PROPERTY_TYPES, BookingStatus
from app.models import Amenity, Booking, Listing, ListingImage, User
from app.schemas.booking import GuestSummary, ListingSummary
from app.schemas.host import (
    HostBookingItem,
    HostBookingsResponse,
    HostImageOut,
    HostListingOut,
    HostStats,
    ListingWrite,
)
from app.services.errors import ServiceError
from app.services.listing_service import paise_to_rupees


def _rupees_to_paise(rupees: int) -> int:
    return rupees * 100


# Match a property type against the allowed list, case-insensitively.
def _normalise_property_type(value: str) -> str:
    for allowed in PROPERTY_TYPES:
        if allowed.lower() == value.strip().lower():
            return allowed
    raise ServiceError(400, f"Invalid property_type. Allowed: {', '.join(PROPERTY_TYPES)}")


# Resolve amenity names to existing Amenity rows, rejecting unknown names.
def _resolve_amenities(db: Session, names: list[str]) -> list[Amenity]:
    if not names:
        return []
    wanted = {n.strip().lower() for n in names if n.strip()}
    found = db.scalars(
        select(Amenity).where(func.lower(Amenity.name).in_(wanted))
    ).all()
    found_names = {a.name.lower() for a in found}
    missing = wanted - found_names
    if missing:
        raise ServiceError(400, f"Unknown amenities: {', '.join(sorted(missing))}")
    return found


def _to_host_listing(listing: Listing) -> HostListingOut:
    images = sorted(listing.images, key=lambda i: (i.display_order, i.id))
    return HostListingOut(
        id=listing.id,
        host_id=listing.host_id,
        title=listing.title,
        description=listing.description,
        city=listing.city,
        country=listing.country,
        address=listing.address,
        latitude=listing.latitude,
        longitude=listing.longitude,
        price_per_night=paise_to_rupees(listing.price_per_night),
        cleaning_fee=paise_to_rupees(listing.cleaning_fee),
        property_type=listing.property_type,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        rating=listing.rating,
        images=[HostImageOut(image_url=i.image_url, display_order=i.display_order) for i in images],
        amenities=[a.name for a in listing.amenities],
        created_at=listing.created_at,
        updated_at=listing.updated_at,
    )


# Load an owned listing or raise 404 (missing) / 403 (not owner).
def _get_owned_listing(db: Session, host: User, listing_id: int) -> Listing:
    listing = db.scalars(
        select(Listing)
        .where(Listing.id == listing_id)
        .options(selectinload(Listing.images), selectinload(Listing.amenities))
    ).first()
    if listing is None:
        raise ServiceError(404, "Listing not found")
    if listing.host_id != host.id:
        raise ServiceError(403, "You do not own this listing")
    return listing


def list_host_listings(db: Session, host: User) -> list[HostListingOut]:
    listings = db.scalars(
        select(Listing)
        .where(Listing.host_id == host.id)
        .options(selectinload(Listing.images), selectinload(Listing.amenities))
        .order_by(Listing.created_at.desc(), Listing.id.desc())
    ).all()
    return [_to_host_listing(listing) for listing in listings]


def create_listing(db: Session, host: User, payload: ListingWrite) -> HostListingOut:
    property_type = _normalise_property_type(payload.property_type)
    amenities = _resolve_amenities(db, payload.amenities)
    listing = Listing(
        host_id=host.id,
        title=payload.title,
        description=payload.description,
        city=payload.city,
        country=payload.country,
        address=payload.address,
        latitude=payload.latitude,
        longitude=payload.longitude,
        price_per_night=_rupees_to_paise(payload.price_per_night),
        cleaning_fee=_rupees_to_paise(payload.cleaning_fee),
        property_type=property_type,
        max_guests=payload.max_guests,
        bedrooms=payload.bedrooms,
        beds=payload.beds,
        bathrooms=payload.bathrooms,
        amenities=amenities,
        images=[
            ListingImage(image_url=url, display_order=i)
            for i, url in enumerate(payload.image_urls)
        ],
    )
    try:
        db.add(listing)
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(listing)
    return _to_host_listing(listing)


# Full update of an owned listing; images and amenities are replaced wholesale.
def update_listing(db: Session, host: User, listing_id: int, payload: ListingWrite) -> HostListingOut:
    listing = _get_owned_listing(db, host, listing_id)
    property_type = _normalise_property_type(payload.property_type)
    amenities = _resolve_amenities(db, payload.amenities)

    listing.title = payload.title
    listing.description = payload.description
    listing.city = payload.city
    listing.country = payload.country
    listing.address = payload.address
    listing.latitude = payload.latitude
    listing.longitude = payload.longitude
    listing.price_per_night = _rupees_to_paise(payload.price_per_night)
    listing.cleaning_fee = _rupees_to_paise(payload.cleaning_fee)
    listing.property_type = property_type
    listing.max_guests = payload.max_guests
    listing.bedrooms = payload.bedrooms
    listing.beds = payload.beds
    listing.bathrooms = payload.bathrooms
    listing.amenities = amenities
    listing.images = [
        ListingImage(image_url=url, display_order=i) for i, url in enumerate(payload.image_urls)
    ]

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(listing)
    return _to_host_listing(listing)


def delete_listing(db: Session, host: User, listing_id: int) -> None:
    listing = _get_owned_listing(db, host, listing_id)
    try:
        db.delete(listing)
        db.commit()
    except Exception:
        db.rollback()
        raise


# Bookings for every listing the host owns, most recent stays first.
def list_host_bookings(db: Session, host: User) -> HostBookingsResponse:
    bookings = db.scalars(
        select(Booking)
        .join(Listing, Booking.listing_id == Listing.id)
        .where(Listing.host_id == host.id)
        .options(selectinload(Booking.listing).selectinload(Listing.images), selectinload(Booking.guest))
        .order_by(Booking.check_in.desc())
    ).all()

    def cover(listing: Listing) -> str | None:
        images = sorted(listing.images, key=lambda i: (i.display_order, i.id))
        return images[0].image_url if images else None

    items = [
        HostBookingItem(
            id=b.id,
            status=b.status.value,
            check_in=b.check_in,
            check_out=b.check_out,
            guest_count=b.guest_count,
            number_of_nights=b.number_of_nights,
            total_price=paise_to_rupees(b.total_price),
            listing=ListingSummary(
                id=b.listing.id,
                title=b.listing.title,
                city=b.listing.city,
                country=b.listing.country,
                cover_image=cover(b.listing),
            ),
            guest=GuestSummary(id=b.guest.id, name=b.guest.name, avatar_url=b.guest.avatar_url),
        )
        for b in bookings
    ]
    return HostBookingsResponse(items=items)


# Simple database-backed dashboard stats for the current host.
def host_stats(db: Session, host: User) -> HostStats:
    owned = select(Listing.id).where(Listing.host_id == host.id).scalar_subquery()
    today = date.today()

    total_listings = db.scalar(
        select(func.count()).select_from(Listing).where(Listing.host_id == host.id)
    ) or 0
    total_bookings = db.scalar(
        select(func.count()).select_from(Booking).where(Booking.listing_id.in_(owned))
    ) or 0
    upcoming_bookings = db.scalar(
        select(func.count())
        .select_from(Booking)
        .where(
            Booking.listing_id.in_(owned),
            Booking.status == BookingStatus.confirmed,
            Booking.check_in >= today,
        )
    ) or 0
    revenue_paise = db.scalar(
        select(func.coalesce(func.sum(Booking.total_price), 0))
        .where(Booking.listing_id.in_(owned), Booking.status == BookingStatus.confirmed)
    ) or 0

    return HostStats(
        total_listings=total_listings,
        total_bookings=total_bookings,
        upcoming_bookings=upcoming_bookings,
        total_confirmed_revenue=paise_to_rupees(revenue_paise),
    )