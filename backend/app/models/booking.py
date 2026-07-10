from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.enums import BookingStatus

if TYPE_CHECKING:
    from app.models.listing import Listing
    from app.models.user import User


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        CheckConstraint("guest_count > 0", name="ck_booking_guest_count_positive"),
        CheckConstraint("number_of_nights > 0", name="ck_booking_nights_positive"),
        CheckConstraint("check_out > check_in", name="ck_booking_dates_order"),
        CheckConstraint("total_price >= 0", name="ck_booking_total_non_negative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(
        ForeignKey("listings.id", ondelete="CASCADE"), index=True, nullable=False
    )
    guest_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)

    check_in: Mapped[date] = mapped_column(Date, nullable=False)
    check_out: Mapped[date] = mapped_column(Date, nullable=False)
    guest_count: Mapped[int] = mapped_column(Integer, nullable=False)

    # Pricing snapshot in paise, kept so old bookings stay correct if the listing price changes.
    nightly_rate: Mapped[int] = mapped_column(Integer, nullable=False)
    number_of_nights: Mapped[int] = mapped_column(Integer, nullable=False)
    subtotal: Mapped[int] = mapped_column(Integer, nullable=False)
    cleaning_fee: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    service_fee: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_price: Mapped[int] = mapped_column(Integer, nullable=False)

    status: Mapped[BookingStatus] = mapped_column(
        SAEnum(BookingStatus, native_enum=False), nullable=False, default=BookingStatus.confirmed
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)

    listing: Mapped["Listing"] = relationship("Listing", back_populates="bookings")
    guest: Mapped["User"] = relationship("User", back_populates="bookings")
