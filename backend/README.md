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

## Expected responses

`GET /`

```json
{ "message": "Airbnb Clone API is running" }
```

`GET /health`

```json
{
  "status": "healthy",
  "service": "Airbnb Clone API",
  "environment": "development"
}
```

## Environment variables

| Variable       | Default                    | Purpose                                          |
| -------------- | -------------------------- | ------------------------------------------------ |
| `APP_NAME`     | `Airbnb Clone API`         | Shown in docs, health response, app title.       |
| `APP_ENV`      | `development`              | Environment label (e.g. development/production). |
| `DEBUG`        | `true`                     | Debug flag.                                       |
| `API_PREFIX`   | `/api`                     | Prefix for feature routers added in later phases. |
| `DATABASE_URL` | `sqlite:///./airbnb.db`    | SQLAlchemy database URL.                          |
| `FRONTEND_URL` | `http://localhost:3000`    | Allowed CORS origin(s), comma-separated.         |

`FRONTEND_URL` accepts a comma-separated list, so the deployed Vercel URL can be
added later without code changes, e.g.
`FRONTEND_URL=http://localhost:3000,https://your-app.vercel.app`.

## Import convention

The backend is always run from inside `backend/`, and all internal imports are
absolute from the `app` package:

```python
from app.config import settings
from app.database import get_db
from app.models import Listing
```

Run command:

```powershell
cd backend
uvicorn app.main:app --reload
```

## Database

### Entities

- **User** — guest or host (role), owns listings, makes bookings, writes reviews, keeps favourites.
- **Listing** — a property owned by a host.
- **ListingImage** — gallery images for a listing (ordered by `display_order`).
- **Amenity** — a feature (Wi-Fi, Pool, etc.), linked to listings many-to-many.
- **listing_amenities** — association table between listings and amenities.
- **Booking** — a stay with a stored pricing snapshot.
- **Review** — a rating (1–5) and comment for a listing.
- **Favourite** — a saved listing per user (unique per user + listing).

### Table creation

Tables are created automatically on startup through the FastAPI `lifespan` handler,
which calls `init_db()` (`Base.metadata.create_all`). All models are imported in
`app/models/__init__.py` so every table is registered before creation. SQLite
foreign-key enforcement is enabled per connection via `PRAGMA foreign_keys=ON`.

### Seeding

After tables are created, `seed_database()` runs. It seeds only when the database
is empty (no users), so restarting the server never duplicates data. Seeding is
wrapped in a transaction and rolls back on any error.

Seeded on first run:

- 5 users (3 hosts, 2 guests)
- 12 listings across Goa, Manali, Jaipur, Mumbai, Delhi, Bengaluru, Udaipur, Rishikesh
- 50 listing images
- 15 amenities (varied per listing)
- 12 reviews
- 6 bookings (mix of past and future, with pricing snapshots)
- 5 favourites

### The database file

The SQLite file is created at the path from `DATABASE_URL`, by default
`backend/airbnb.db` (i.e. relative to where you run `uvicorn`). It is git-ignored.

### Resetting the local database

There is no reset API. To reseed from scratch locally:

1. Stop the backend.
2. Delete the SQLite file: `Remove-Item airbnb.db`
3. Restart: `uvicorn app.main:app --reload`

### Seeded demo accounts

Hosts:

- priya.sharma@example.com
- rahul.mehta@example.com
- neha.kapoor@example.com

Guests:

- aditya.balaji@example.com
- rohan.verma@example.com

(No passwords — authentication is mocked; these identify the current user in later phases.)

### Money storage convention

All monetary values (listing `price_per_night`, `cleaning_fee`, and every booking
amount) are stored as **integer paise** (1 rupee = 100 paise). This avoids
floating-point rounding in SQLite and keeps price maths exact. Divide by 100 for
display. Ratings are stored as a float since they are display-only.

## Project layout

```
app/
  main.py          # FastAPI app, CORS, lifespan (init + seed), router registration
  config.py        # settings loaded from environment variables
  database.py      # engine, session, get_db, init_db, SQLite FK pragma
  dependencies.py  # shared request dependencies
  exceptions.py    # shared error handlers
  enums.py         # roles, booking status, property types
  seed.py          # idempotent sample data
  routers/         # API routers (health for now)
  models/          # ORM models: user, listing, booking, review, favourite
  schemas/         # request/response schemas (added later)
  services/        # business logic (added later)
```
