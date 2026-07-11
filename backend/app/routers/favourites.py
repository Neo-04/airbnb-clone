from __future__ import annotations

from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import get_current_user, get_db
from app.models import User
from app.schemas.favourite import FavouritesResponse
from app.schemas.listing import ListingCard
from app.services import favourite_service

router = APIRouter(prefix=f"{settings.api_prefix}/favourites", tags=["Favourites"])


@router.get("", response_model=FavouritesResponse, summary="List current user's favourites")
def list_favourites(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return favourite_service.list_favourites(db, user)


@router.post(
    "/{listing_id}",
    response_model=ListingCard,
    status_code=status.HTTP_201_CREATED,
    summary="Add a listing to favourites",
)
def add_favourite(
    listing_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return favourite_service.add_favourite(db, user, listing_id)


@router.delete("/{listing_id}", summary="Remove a listing from favourites")
def remove_favourite(
    listing_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    favourite_service.remove_favourite(db, user, listing_id)
    return {"detail": "Favourite removed"}