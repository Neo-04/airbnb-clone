from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.favourite import Favourite
    from app.models.review import Review
    from app.models.user import User


# Many-to-many link between listings and amenities.
listing_amenities = Table(
    "listing_amenities",
    Base.metadata,
    Column("listing_id", ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)


class Listing(Base):
    __tablename__ = "listings"
    __table_args__ = (
        CheckConstraint("price_per_night >= 0", name="ck_listing_price_non_negative"),
        CheckConstraint("cleaning_fee >= 0", name="ck_listing_cleaning_fee_non_negative"),
        CheckConstraint("max_guests > 0", name="ck_listing_max_guests_positive"),
        CheckConstraint("bedrooms >= 0", name="ck_listing_bedrooms_non_negative"),
        CheckConstraint("beds >= 0", name="ck_listing_beds_non_negative"),
        CheckConstraint("bathrooms >= 0", name="ck_listing_bathrooms_non_negative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    host_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)

    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    city: Mapped[str] = mapped_column(String, nullable=False, index=True)
    country: Mapped[str] = mapped_column(String, nullable=False)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Money is stored as integer paise (1 rupee = 100 paise) to avoid float rounding.
    price_per_night: Mapped[int] = mapped_column(Integer, nullable=False)
    cleaning_fee: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    property_type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    max_guests: Mapped[int] = mapped_column(Integer, nullable=False)
    bedrooms: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    beds: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    bathrooms: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # Aggregate rating for display; recomputed from reviews when needed.
    rating: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    host: Mapped["User"] = relationship("User", back_populates="listings")
    images: Mapped[list["ListingImage"]] = relationship(
        "ListingImage",
        back_populates="listing",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ListingImage.display_order",
    )
    amenities: Mapped[list["Amenity"]] = relationship(
        "Amenity", secondary=listing_amenities, back_populates="listings"
    )
    bookings: Mapped[list["Booking"]] = relationship(
        "Booking", back_populates="listing", cascade="all, delete-orphan", passive_deletes=True
    )
    reviews: Mapped[list["Review"]] = relationship(
        "Review", back_populates="listing", cascade="all, delete-orphan", passive_deletes=True
    )
    favourites: Mapped[list["Favourite"]] = relationship(
        "Favourite", back_populates="listing", cascade="all, delete-orphan", passive_deletes=True
    )


class ListingImage(Base):
    __tablename__ = "listing_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(
        ForeignKey("listings.id", ondelete="CASCADE"), index=True, nullable=False
    )
    image_url: Mapped[str] = mapped_column(String, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    listing: Mapped["Listing"] = relationship("Listing", back_populates="images")


class Amenity(Base):
    __tablename__ = "amenities"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    icon: Mapped[str | None] = mapped_column(String, nullable=True)

    listings: Mapped[list["Listing"]] = relationship(
        "Listing", secondary=listing_amenities, back_populates="amenities"
    )
