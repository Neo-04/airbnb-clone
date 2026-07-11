from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models import Favourite, Listing, User
from app.schemas.favourite import FavouritesResponse
from app.schemas.listing import ListingCard
from app.services import listing_service
from app.services.errors import ServiceError


# All listings the current user has favourited, newest first, as cards.
def list_favourites(db: Session, user: User) -> FavouritesResponse:
    listings = db.scalars(
        select(Listing)
        .join(Favourite, Favourite.listing_id == Listing.id)
        .where(Favourite.user_id == user.id)
        .options(selectinload(Listing.images), selectinload(Listing.amenities))
        .order_by(Favourite.created_at.desc())
    ).all()
    return FavouritesResponse(items=listing_service.build_listing_cards(db, listings))


def _load_card(db: Session, listing_id: int) -> ListingCard:
    listing = db.scalars(
        select(Listing)
        .where(Listing.id == listing_id)
        .options(selectinload(Listing.images), selectinload(Listing.amenities))
    ).first()
    return listing_service.build_listing_cards(db, [listing])[0]


# Add a favourite, ignoring duplicates for the same user and listing.
def add_favourite(db: Session, user: User, listing_id: int) -> ListingCard:
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise ServiceError(404, "Listing not found")

    existing = db.scalar(
        select(Favourite).where(
            Favourite.user_id == user.id, Favourite.listing_id == listing_id
        )
    )
    if existing:
        raise ServiceError(409, "Listing already in favourites")

    db.add(Favourite(user_id=user.id, listing_id=listing_id))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ServiceError(409, "Listing already in favourites")
    return _load_card(db, listing_id)


def remove_favourite(db: Session, user: User, listing_id: int) -> None:
    favourite = db.scalar(
        select(Favourite).where(
            Favourite.user_id == user.id, Favourite.listing_id == listing_id
        )
    )
    if favourite is None:
        raise ServiceError(404, "Favourite not found")
    db.delete(favourite)
    db.commit()