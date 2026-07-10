from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SAEnum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.enums import UserRole

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.favourite import Favourite
    from app.models.listing import Listing
    from app.models.review import Review


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole, native_enum=False), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)

    listings: Mapped[list["Listing"]] = relationship("Listing", back_populates="host")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="guest")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user")
    favourites: Mapped[list["Favourite"]] = relationship("Favourite", back_populates="user")
