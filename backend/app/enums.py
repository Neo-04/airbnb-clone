import enum


class UserRole(str, enum.Enum):
    guest = "guest"
    host = "host"


class BookingStatus(str, enum.Enum):
    confirmed = "confirmed"
    cancelled = "cancelled"


# Allowed listing property types. Kept as plain strings to stay easy to extend.
PROPERTY_TYPES = [
    "Apartment",
    "Villa",
    "Cottage",
    "Cabin",
    "Beach House",
    "Farm Stay",
]
