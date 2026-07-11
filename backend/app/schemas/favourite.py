from __future__ import annotations

from pydantic import BaseModel

from app.schemas.listing import ListingCard


# Favourites are returned as listing cards for easy display in the UI.
class FavouritesResponse(BaseModel):
    items: list[ListingCard]