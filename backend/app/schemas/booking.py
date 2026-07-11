from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field


# Small nested summaries reused by booking and host responses.
class ListingSummary(BaseModel):
    id: int
    title: str
    city: str
    country: str
    cover_image: str | None = None


class GuestSummary(BaseModel):
    id: int
    name: str
    avatar_url: str | None = None


class BookingQuoteRequest(BaseModel):
    listing_id: int = Field(ge=1)
    check_in: date
    check_out: date
    guest_count: int = Field(ge=1)


class BookingCreateRequest(BaseModel):
    listing_id: int = Field(ge=1)
    check_in: date
    check_out: date
    guest_count: int = Field(ge=1)


# All money fields are in whole INR.
class BookingQuoteResponse(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guest_count: int
    number_of_nights: int
    nightly_rate: int
    subtotal: int
    cleaning_fee: int
    service_fee: int
    total_price: int
    available: bool


class BookingDetail(BaseModel):
    id: int
    status: str
    check_in: date
    check_out: date
    guest_count: int
    number_of_nights: int
    nightly_rate: int
    subtotal: int
    cleaning_fee: int
    service_fee: int
    total_price: int
    created_at: datetime
    listing: ListingSummary
    guest: GuestSummary


class BookingListItem(BaseModel):
    id: int
    status: str
    check_in: date
    check_out: date
    guest_count: int
    number_of_nights: int
    total_price: int
    trip_type: str
    listing: ListingSummary


class MyTripsResponse(BaseModel):
    items: list[BookingListItem]