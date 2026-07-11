from __future__ import annotations

from datetime import date

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.enums import BookingStatus
from app.models import Booking


# A confirmed booking overlaps the requested range. Back-to-back stays are allowed
# because the bounds are strict (< and >), not <= and >=.
def booking_overlap_condition(check_in: date, check_out: date):
    return and_(
        Booking.status == BookingStatus.confirmed,
        Booking.check_in < check_out,
        Booking.check_out > check_in,
    )


# True when no confirmed booking overlaps the requested range for this listing.
def is_listing_available(db: Session, listing_id: int, check_in: date, check_out: date) -> bool:
    conflict = db.scalar(
        select(Booking.id)
        .where(Booking.listing_id == listing_id, booking_overlap_condition(check_in, check_out))
        .limit(1)
    )
    return conflict is None