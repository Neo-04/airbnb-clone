# Airbnb Clone — Backend

FastAPI + SQLAlchemy + SQLite backend for the Airbnb clone.

## Requirements

- Python 3.11+ (developed on Python 3.12)

## Setup (Windows PowerShell)

Run all commands from the `backend/` directory.

1. Create a virtual environment:

```powershell
   python -m venv .venv
```

2. Activate it:

```powershell
   .venv\Scripts\Activate.ps1
```

   If activation is blocked by execution policy, allow it for the current session:

```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

3. Install dependencies:

```powershell
   pip install -r requirements.txt
```

4. (Optional) Create a local `.env` from the example. The app runs on defaults without it:

```powershell
   Copy-Item .env.example .env
```

5. Run the server:

```powershell
   uvicorn app.main:app --reload
```

## URLs

- API root: http://localhost:8000/
- Health check: http://localhost:8000/health
- Swagger docs: http://localhost:8000/docs

## Environment variables

| Variable       | Default                    | Purpose                                          |
| -------------- | -------------------------- | ------------------------------------------------ |
| `APP_NAME`     | `Airbnb Clone API`         | Shown in docs, health response, app title.       |
| `APP_ENV`      | `development`              | Environment label (e.g. development/production). |
| `DEBUG`        | `true`                     | Debug flag.                                       |
| `API_PREFIX`   | `/api`                     | Prefix for feature routers.                       |
| `DATABASE_URL` | `sqlite:///./airbnb.db`    | SQLAlchemy database URL.                          |
| `FRONTEND_URL` | `http://localhost:3000`    | Allowed CORS origin(s), comma-separated.         |

`FRONTEND_URL` accepts a comma-separated list, so the deployed Vercel URL can be
added later without code changes.

## Import convention

The backend is always run from inside `backend/`, and all internal imports are
absolute from the `app` package:

```python
from app.config import settings
from app.models import Listing
from app.services import listing_service
```

Run command:

```powershell
cd backend
uvicorn app.main:app --reload
```

## Database

### Entities

- **User** — guest or host, owns listings, makes bookings, writes reviews, keeps favourites.
- **Listing** — a property owned by a host.
- **ListingImage** — gallery images (ordered by `display_order`).
- **Amenity** — a feature, linked to listings many-to-many via `listing_amenities`.
- **Booking** — a stay with a stored pricing snapshot.
- **Review** — a rating (1–5) and comment for a listing.
- **Favourite** — a saved listing per user (unique per user + listing).

### Table creation and seeding

Tables are created on startup via the FastAPI `lifespan` handler (`init_db()`),
then `seed_database()` runs. Seeding happens only when the database is empty, so
restarts never duplicate data. SQLite foreign keys are enabled per connection.

Seeded on first run: 5 users (3 hosts, 2 guests), 12 listings, 50 images,
15 amenities, 12 reviews, 6 bookings, 5 favourites.

### The database file & resetting

The SQLite file is created at `DATABASE_URL` (default `backend/airbnb.db`). There
is no reset API. To reseed locally: stop the backend, `Remove-Item airbnb.db`,
restart.

### Seeded demo accounts

Hosts: priya.sharma@example.com, rahul.mehta@example.com, neha.kapoor@example.com
Guests: aditya.balaji@example.com, rohan.verma@example.com
(Authentication is mocked — these identify the current user in later phases.)

### Money storage convention

Money is stored internally as **integer paise** (1 rupee = 100 paise) to keep
maths exact in SQLite. **The API speaks whole INR (rupees)** — responses convert
paise to rupees, and `min_price` / `max_price` are given in rupees.

## API endpoints

All feature routes live under `API_PREFIX` (default `/api`).

### `GET /api/listings`

Paginated, filterable listing search. All query parameters are optional.

| Parameter       | Type   | Notes                                                             |
| --------------- | ------ | ----------------------------------------------------------------- |
| `location`      | string | Case-insensitive partial match on city, country, address, title.  |
| `check_in`      | date   | ISO `YYYY-MM-DD`. Must be sent together with `check_out`.          |
| `check_out`     | date   | ISO `YYYY-MM-DD`. Must be sent together with `check_in`.           |
| `guests`        | int    | `>= 1`. Returns listings whose `max_guests >= guests`.            |
| `min_price`     | int    | `>= 0`. Minimum nightly price in **INR**.                         |
| `max_price`     | int    | `>= 0`. Maximum nightly price in **INR**.                         |
| `property_type` | string | Case-insensitive exact match.                                     |
| `amenities`     | string | Comma-separated names; a listing must contain **all** of them.   |
| `page`          | int    | `>= 1`, default `1`.                                             |
| `page_size`     | int    | `1..100`, default `12`.                                          |

**Amenity format:** comma-separated, e.g. `amenities=Wi-Fi,Swimming pool`.
Matching is case-insensitive and surrounding whitespace is ignored.

**Date availability:** both dates are required together; `check_in` must be before
`check_out`. A listing is excluded when a **confirmed** booking overlaps, using
`existing_check_in < requested_check_out AND existing_check_out > requested_check_in`.
Back-to-back stays are allowed; cancelled bookings never block dates.

**Ordering:** newest first (`created_at` desc, then `id` desc) for stable pages.
`total` is counted after filters, before pagination.

Response:

```json
{
  "items": [
    {
      "id": 1, "title": "...", "city": "Goa", "country": "India",
      "property_type": "Villa", "price_per_night": 12000, "cleaning_fee": 1500,
      "rating": 4.5, "review_count": 2, "max_guests": 8, "bedrooms": 4,
      "beds": 5, "bathrooms": 3, "cover_image": "https://...", "amenities": ["Wi-Fi", "..."]
    }
  ],
  "page": 1, "page_size": 12, "total": 12, "total_pages": 1
}
```

### `GET /api/listings/{listing_id}`

Full detail: host (public fields only), description, all images (ordered),
amenities, reviews (with reviewer name/avatar), `review_count`, prices in INR,
and current `unavailable_ranges`. Returns `404` if the listing does not exist.

### `GET /api/listings/{listing_id}/availability`

```json
{
  "listing_id": 1,
  "unavailable_ranges": [{ "check_in": "2026-07-20", "check_out": "2026-07-24" }]
}
```

Only confirmed bookings appear. Returns `404` if the listing does not exist.

### Example requests