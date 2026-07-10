from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class AmenityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    icon: str | None = None


class ListingImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    display_order: int


class HostPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    avatar_url: str | None = None


class ReviewOut(BaseModel):
    id: int
    rating: int
    comment: str
    created_at: datetime
    reviewer_name: str
    reviewer_avatar: str | None = None


class DateRange(BaseModel):
    check_in: date
    check_out: date


# Compact listing shape used for the explore grid. Prices are in whole INR.
class ListingCard(BaseModel):
    id: int
    title: str
    city: str
    country: str
    property_type: str
    price_per_night: int
    cleaning_fee: int
    rating: float
    review_count: int
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: int
    cover_image: str | None = None
    amenities: list[str]


class ListingListResponse(BaseModel):
    items: list[ListingCard]
    page: int
    page_size: int
    total: int
    total_pages: int


# Full listing shape for the detail page. Prices are in whole INR.
class ListingDetail(BaseModel):
    id: int
    host: HostPublic
    title: str
    description: str
    city: str
    country: str
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    property_type: str
    price_per_night: int
    cleaning_fee: int
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: int
    rating: float
    review_count: int
    created_at: datetime
    updated_at: datetime
    images: list[ListingImageOut]
    amenities: list[AmenityOut]
    reviews: list[ReviewOut]
    unavailable_ranges: list[DateRange]


class AvailabilityResponse(BaseModel):
    listing_id: int
    unavailable_ranges: list[DateRange]