from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field

from app.schemas.booking import GuestSummary, ListingSummary


# Shared body for creating and updating a listing. Money fields are in whole INR.
class ListingWrite(BaseModel):
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    city: str = Field(min_length=1)
    country: str = Field(min_length=1)
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    price_per_night: int = Field(ge=0)
    cleaning_fee: int = Field(default=0, ge=0)
    property_type: str = Field(min_length=1)
    max_guests: int = Field(ge=1)
    bedrooms: int = Field(default=1, ge=0)
    beds: int = Field(default=1, ge=0)
    bathrooms: int = Field(default=1, ge=0)
    amenities: list[str] = Field(default_factory=list)
    image_urls: list[str] = Field(default_factory=list)


class HostImageOut(BaseModel):
    image_url: str
    display_order: int


# Full listing owned by a host. Money fields are in whole INR.
class HostListingOut(BaseModel):
    id: int
    host_id: int
    title: str
    description: str
    city: str
    country: str
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    price_per_night: int
    cleaning_fee: int
    property_type: str
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: int
    rating: float
    images: list[HostImageOut]
    amenities: list[str]
    created_at: datetime
    updated_at: datetime


class HostBookingItem(BaseModel):
    id: int
    status: str
    check_in: date
    check_out: date
    guest_count: int
    number_of_nights: int
    total_price: int
    listing: ListingSummary
    guest: GuestSummary


class HostBookingsResponse(BaseModel):
    items: list[HostBookingItem]


class HostStats(BaseModel):
    total_listings: int
    total_bookings: int
    upcoming_bookings: int
    total_confirmed_revenue: int