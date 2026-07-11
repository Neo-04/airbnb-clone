from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.enums import BookingStatus
from app.models import Booking, Listing, User
from app.schemas.booking import (
    BookingCreateRequest,
    BookingDetail,
    BookingListItem,
    BookingQuoteRequest,
    BookingQuoteResponse,
    GuestSummary,
    ListingSummary,
    MyTripsResponse,
)
from app.services.availability import is_listing_available
from app.services.errors import ServiceError
from app.services.listing_service import paise_to_rupees

# Service fee charged on top of the subtotal.
SERVICE_FEE_RATE = 0.12


@dataclass
class PriceBreakdown:
    number_of_nights: int
    nightly_rate: int
    subtotal: int
    cleaning_fee: int
    service_fee: int
    total_price: int


# Calculate the full booking price on the backend. All values are in paise.
def calculate_price(listing: Listing, nights: int) -> PriceBreakdown:
    nightly = listing.price_per_night
    subtotal = nightly * nights
    cleaning = listing.cleaning_fee
    # Service fee is 12% of the subtotal, rounded to the nearest whole rupee.
    service = round(subtotal * SERVICE_FEE_RATE / 100) * 100
    total = subtotal + cleaning + service
    return PriceBreakdown(nights, nightly, subtotal, cleaning, service, total)


def _cover_image(listing: Listing) -> str | None:
    images = sorted(listing.images, key=lambda i: (i.display_order, i.id))
    return images[0].image_url if images else None


def _trip_type(check_in: date, check_out: date, today: date) -> str:
    if check_out <= today:
        return "past"
    if check_in <= today:
        return "current"
    return "upcoming"


# Shared validation for both quote and creation. Returns the number of nights.
def _validate(listing: Listing, check_in: date, check_out: date, guest_count: int, user: User | None) -> int:
    if check_in >= check_out:
        raise ServiceError(400, "check_in must be before check_out")
    if check_in < date.today():
        raise ServiceError(400, "check_in cannot be in the past")
    if guest_count < 1:
        raise ServiceError(400, "guest_count must be at least 1")
    if guest_count > listing.max_guests:
        raise ServiceError(400, f"guest_count exceeds the listing capacity of {listing.max_guests}")
    # A host cannot book their own listing.
    if user is not None and listing.host_id == user.id:
        raise ServiceError(400, "Hosts cannot book their own listing")
    return (check_out - check_in).days


# Validate and price a stay without saving anything.
def quote_booking(db: Session, req: BookingQuoteRequest) -> BookingQuoteResponse:
    listing = db.get(Listing, req.listing_id)
    if listing is None:
        raise ServiceError(404, "Listing not found")

    nights = _validate(listing, req.check_in, req.check_out, req.guest_count, None)
    if not is_listing_available(db, listing.id, req.check_in, req.check_out):
        raise ServiceError(409, "The selected dates are no longer available.")

    price = calculate_price(listing, nights)
    return BookingQuoteResponse(
        listing_id=listing.id,
        check_in=req.check_in,
        check_out=req.check_out,
        guest_count=req.guest_count,
        number_of_nights=price.number_of_nights,
        nightly_rate=paise_to_rupees(price.nightly_rate),
        subtotal=paise_to_rupees(price.subtotal),
        cleaning_fee=paise_to_rupees(price.cleaning_fee),
        service_fee=paise_to_rupees(price.service_fee),
        total_price=paise_to_rupees(price.total_price),
        available=True,
    )


# Validate again, re-check availability, and persist a confirmed booking.
def create_booking(db: Session, user: User, req: BookingCreateRequest) -> BookingDetail:
    listing = db.get(Listing, req.listing_id)
    if listing is None:
        raise ServiceError(404, "Listing not found")

    nights = _validate(listing, req.check_in, req.check_out, req.guest_count, user)

    # Check availability again immediately before inserting.
    if not is_listing_available(db, listing.id, req.check_in, req.check_out):
        raise ServiceError(409, "The selected dates are no longer available.")

    price = calculate_price(listing, nights)
    booking = Booking(
        listing_id=listing.id,
        guest_id=user.id,
        check_in=req.check_in,
        check_out=req.check_out,
        guest_count=req.guest_count,
        nightly_rate=price.nightly_rate,
        number_of_nights=price.number_of_nights,
        subtotal=price.subtotal,
        cleaning_fee=price.cleaning_fee,
        service_fee=price.service_fee,
        total_price=price.total_price,
        status=BookingStatus.confirmed,
    )
    try:
        db.add(booking)
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(booking)
    return _to_detail(db, booking.id)


# Booking detail, visible only to the guest or the listing's host.
def get_booking_detail(db: Session, user: User, booking_id: int) -> BookingDetail:
    booking = db.scalars(
        select(Booking)
        .where(Booking.id == booking_id)
        .options(selectinload(Booking.listing).selectinload(Listing.images), selectinload(Booking.guest))
    ).first()
    if booking is None:
        raise ServiceError(404, "Booking not found")

    if user.id != booking.guest_id and user.id != booking.listing.host_id:
        raise ServiceError(403, "You are not allowed to view this booking")

    return _detail_from(booking)


def _to_detail(db: Session, booking_id: int) -> BookingDetail:
    booking = db.scalars(
        select(Booking)
        .where(Booking.id == booking_id)
        .options(selectinload(Booking.listing).selectinload(Listing.images), selectinload(Booking.guest))
    ).first()
    return _detail_from(booking)


def _detail_from(booking: Booking) -> BookingDetail:
    listing = booking.listing
    guest = booking.guest
    return BookingDetail(
        id=booking.id,
        status=booking.status.value,
        check_in=booking.check_in,
        check_out=booking.check_out,
        guest_count=booking.guest_count,
        number_of_nights=booking.number_of_nights,
        nightly_rate=paise_to_rupees(booking.nightly_rate),
        subtotal=paise_to_rupees(booking.subtotal),
        cleaning_fee=paise_to_rupees(booking.cleaning_fee),
        service_fee=paise_to_rupees(booking.service_fee),
        total_price=paise_to_rupees(booking.total_price),
        created_at=booking.created_at,
        listing=ListingSummary(
            id=listing.id,
            title=listing.title,
            city=listing.city,
            country=listing.country,
            cover_image=_cover_image(listing),
        ),
        guest=GuestSummary(id=guest.id, name=guest.name, avatar_url=guest.avatar_url),
    )


# Current user's bookings, upcoming first (by nearest date), then past (most recent first).
def list_my_bookings(db: Session, user: User) -> MyTripsResponse:
    bookings = db.scalars(
        select(Booking)
        .where(Booking.guest_id == user.id)
        .options(selectinload(Booking.listing).selectinload(Listing.images))
    ).all()

    today = date.today()
    upcoming = sorted((b for b in bookings if b.check_out > today), key=lambda b: b.check_in)
    past = sorted((b for b in bookings if b.check_out <= today), key=lambda b: b.check_in, reverse=True)

    items = [
        BookingListItem(
            id=b.id,
            status=b.status.value,
            check_in=b.check_in,
            check_out=b.check_out,
            guest_count=b.guest_count,
            number_of_nights=b.number_of_nights,
            total_price=paise_to_rupees(b.total_price),
            trip_type=_trip_type(b.check_in, b.check_out, today),
            listing=ListingSummary(
                id=b.listing.id,
                title=b.listing.title,
                city=b.listing.city,
                country=b.listing.country,
                cover_image=_cover_image(b.listing),
            ),
        )
        for b in [*upcoming, *past]
    ]
    return MyTripsResponse(items=items)