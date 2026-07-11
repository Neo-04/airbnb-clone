# Airbnb Clone — Backend

FastAPI + SQLAlchemy + SQLite backend for the Airbnb clone.

## Requirements

- Python 3.11+ (developed on Python 3.12)

## Setup (Windows PowerShell)

Run all commands from the `backend/` directory.

1. Create and activate a virtual environment:

```powershell
   python -m venv .venv
   .venv\Scripts\Activate.ps1
```

   If activation is blocked: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.

2. Install dependencies:

```powershell
   pip install -r requirements.txt
```

3. Run the server:

```powershell
   uvicorn app.main:app --reload
```

## URLs

- Root: http://localhost:8000/
- Health: http://localhost:8000/health
- Swagger: http://localhost:8000/docs

## Environment variables

| Variable       | Default                 | Purpose                              |
| -------------- | ----------------------- | ------------------------------------ |
| `APP_NAME`     | `Airbnb Clone API`      | App title / health response.         |
| `APP_ENV`      | `development`           | Environment label.                   |
| `DEBUG`        | `true`                  | Debug flag.                          |
| `API_PREFIX`   | `/api`                  | Prefix for feature routers.          |
| `DATABASE_URL` | `sqlite:///./airbnb.db` | SQLAlchemy database URL.             |
| `FRONTEND_URL` | `http://localhost:3000` | Allowed CORS origin(s), comma-list.  |

## Import convention

Run from `backend/`; all imports are absolute from the `app` package
(`from app.services import booking_service`). Never `backend.app.<module>`.

## Money convention

Money is stored internally as integer **paise** (1 rupee = 100 paise) and the API
speaks whole **INR**. Request price fields (`price_per_night`, `cleaning_fee`,
`min_price`, `max_price`) are in rupees; responses convert paise back to rupees.

## Mock authentication (X-User-Id)

There is no real auth. Protected endpoints read the current user from an
`X-User-Id` header:

```
X-User-Id: 4
```

Missing header → `401`; non-integer → `401`; unknown user → `404`. Host-only
endpoints additionally require the user's role to be `host` (else `403`).

### Seeded demo accounts

| Role  | Id | Name          | Email                     |
| ----- | -- | ------------- | ------------------------- |
| host  | 1  | Priya Sharma  | priya.sharma@example.com  |
| host  | 2  | Rahul Mehta   | rahul.mehta@example.com   |
| host  | 3  | Neha Kapoor   | neha.kapoor@example.com   |
| guest | 4  | Aditya Balaji | aditya.balaji@example.com |
| guest | 5  | Rohan Verma   | rohan.verma@example.com   |

## Booking overlap rule

A confirmed booking blocks a requested range when
`existing_check_in < requested_check_out AND existing_check_out > requested_check_in`.
Cancelled bookings never block; back-to-back stays are allowed. The same rule is
used by listing search, the availability endpoint, quotes, and booking creation.

## Price calculation

One shared function computes: `subtotal = nightly_rate × nights`,
`cleaning_fee = listing.cleaning_fee`, `service_fee = 12% of subtotal` (rounded to
the nearest rupee), `total = subtotal + cleaning_fee + service_fee`. The client
never sends prices; a paise snapshot is stored on each booking so historical
bookings stay correct if the listing price later changes.

## API endpoints

Public listing endpoints (Phase 3): `GET /api/listings`,
`GET /api/listings/{id}`, `GET /api/listings/{id}/availability`.

### Bookings

| Method | Path                       | Auth         | Notes                              |
| ------ | -------------------------- | ------------ | ---------------------------------- |
| POST   | `/api/bookings/quote`      | none         | Price a stay; creates nothing.     |
| POST   | `/api/bookings`            | X-User-Id    | Create a confirmed booking (`201`).|
| GET    | `/api/bookings/me`         | X-User-Id    | Current user's trips.              |
| GET    | `/api/bookings/{id}`       | X-User-Id    | Guest or listing host only.        |

Request body (quote and create):

```json
{ "listing_id": 1, "check_in": "2026-09-10", "check_out": "2026-09-14", "guest_count": 2 }
```

### Host (role `host` only)

| Method | Path                          | Notes                          |
| ------ | ----------------------------- | ------------------------------ |
| GET    | `/api/host/listings`          | Listings owned by the host.    |
| POST   | `/api/host/listings`          | Create a listing (`201`).      |
| PUT    | `/api/host/listings/{id}`     | Full update; owner only.       |
| DELETE | `/api/host/listings/{id}`     | Delete; owner only (`204`).    |
| GET    | `/api/host/bookings`          | Bookings on owned listings.    |
| GET    | `/api/host/stats`             | Dashboard stats.               |

Listing create/update body (money in INR; amenities are existing names):

```json
{
  "title": "Sea-view villa", "description": "...", "city": "Goa", "country": "India",
  "address": "Baga", "latitude": 15.55, "longitude": 73.75,
  "price_per_night": 12000, "cleaning_fee": 1500, "property_type": "Villa",
  "max_guests": 8, "bedrooms": 4, "beds": 5, "bathrooms": 3,
  "amenities": ["Wi-Fi", "Kitchen", "Swimming pool"],
  "image_urls": ["https://...", "https://..."]
}
```

`property_type` must be one of: Apartment, Villa, Cottage, Cabin, Beach House,
Farm Stay. Amenity names must already exist.

### Favourites

| Method | Path                        | Notes                                   |
| ------ | --------------------------- | --------------------------------------- |
| GET    | `/api/favourites`           | Current user's favourites (as cards).   |
| POST   | `/api/favourites/{id}`      | Add (`201`); duplicate → `409`.         |
| DELETE | `/api/favourites/{id}`      | Remove; not favourited → `404`.         |

## Response codes

`200` reads/quotes · `201` created booking/listing/favourite · `204` deleted
listing · `400` invalid cross-field input · `401` missing/invalid X-User-Id ·
`403` role/ownership violation · `404` missing user/listing/booking/favourite ·
`409` unavailable dates or duplicate favourite · `422` FastAPI validation.

## Example requests (PowerShell)

```powershell
# Quote
curl -Method POST http://localhost:8000/api/bookings/quote -ContentType application/json `
  -Body '{"listing_id":1,"check_in":"2026-09-10","check_out":"2026-09-14","guest_count":2}'

# Create booking (as guest 4)
curl -Method POST http://localhost:8000/api/bookings -ContentType application/json `
  -Headers @{ "X-User-Id" = "4" } `
  -Body '{"listing_id":1,"check_in":"2026-09-10","check_out":"2026-09-14","guest_count":2}'

# My trips
curl http://localhost:8000/api/bookings/me -Headers @{ "X-User-Id" = "4" }

# Host listings (as host 1)
curl http://localhost:8000/api/host/listings -Headers @{ "X-User-Id" = "1" }

# Add favourite (as guest 4)
curl -Method POST http://localhost:8000/api/favourites/5 -Headers @{ "X-User-Id" = "4" }
```

## Database

Entities: User, Listing, ListingImage, Amenity, `listing_amenities`, Booking,
Review, Favourite. Tables are created on startup and seeded only when empty
(5 users, 12 listings, images, amenities, reviews, bookings, favourites). To
reseed locally: stop the server, `Remove-Item airbnb.db`, restart. There is no
reset API.

## Project layout

```
app/
  main.py          # app, CORS, lifespan, router registration
  config.py        # settings
  database.py      # engine, session, get_db, init_db, SQLite FK pragma
  dependencies.py  # get_db, get_current_user, get_current_host
  exceptions.py    # ServiceError + generic handlers
  enums.py         # roles, booking status, property types
  seed.py          # idempotent sample data
  routers/         # health, listings, bookings, host, favourites
  services/        # availability, listing_service, booking_service,
                   # host_service, favourite_service, errors
  schemas/         # listing, booking, host, favourite
  models/          # user, listing, booking, review, favourite
```