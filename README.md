# Airbnb Clone

GitHub repository: TODO
Live frontend: TODO
Backend API documentation: TODO

## Overview

This project is a full-stack Airbnb-style booking marketplace built for an assignment. It includes a Next.js frontend, a FastAPI backend, and a SQLite database with seeded demo data.

The goal is to demonstrate a working booking flow, listing discovery, host management, favourites, and mock user switching without real authentication or real payments.

## Core Features

- Airbnb-style listing grid with search, categories, filters, and pagination.
- Listing detail pages with photo gallery, amenities, reviews, availability ranges, and booking quote.
- Mock checkout and booking confirmation.
- My Trips page for guest bookings.
- Wishlist add/remove support.
- Host dashboard with listing CRUD, host bookings, and dashboard statistics.
- Mock user switching using seeded users and the `X-User-Id` request header.

## Guest Workflow

1. Choose a guest account from the mock user switcher.
2. Search or filter listings.
3. Open a listing detail page.
4. Select dates and guest count.
5. Request a booking quote.
6. Continue through mock checkout.
7. Confirm the booking.
8. View the booking in My Trips.
9. Add or remove listings from the wishlist.

## Host Workflow

1. Choose a seeded host account from the mock user switcher.
2. Open the Host dashboard.
3. View owned listings, dashboard stats, and received bookings.
4. Create a new listing.
5. Edit an existing owned listing.
6. Delete an owned listing.

## Technology Stack

- Frontend: Next.js, TypeScript, App Router, React
- Backend: Python, FastAPI, SQLAlchemy, Pydantic
- Database: SQLite
- Frontend deployment target: Vercel
- Backend deployment target: Render

## Architecture

The repository is a monorepo with separate frontend and backend apps:

```text
airbnb-clone/
  backend/
    app/
      routers/
      services/
      schemas/
      models/
      main.py
      config.py
      database.py
      seed.py
    requirements.txt
  frontend/
    app/
    components/
    lib/
    types/
    package.json
  README.md
```

### Frontend Architecture

The frontend uses Next.js App Router. Most pages render client components that call a typed API client in `frontend/lib/api.ts`. The mock user is stored in `localStorage`, and protected API calls attach the selected user through the `X-User-Id` header.

Key frontend areas:

- `frontend/app/` - routes and layouts
- `frontend/components/` - page components, forms, cards, and shared UI
- `frontend/lib/api.ts` - typed API wrapper
- `frontend/lib/user-context.tsx` - mock user selection
- `frontend/types/` - TypeScript types mirroring backend schemas

### Backend Architecture

The backend uses FastAPI routers, SQLAlchemy models, Pydantic schemas, and service modules for business logic. Startup initializes tables and seeds data only when the database is empty.

Key backend areas:

- `backend/app/main.py` - FastAPI app, CORS, lifespan, router registration
- `backend/app/config.py` - environment-based settings
- `backend/app/database.py` - SQLAlchemy engine, sessions, SQLite foreign keys
- `backend/app/routers/` - HTTP endpoints
- `backend/app/services/` - listing, booking, host, availability, and favourite logic
- `backend/app/models/` - database models
- `backend/app/schemas/` - request and response schemas
- `backend/app/seed.py` - seeded demo data

## Database

SQLite is used through SQLAlchemy.

Main entities:

- User
- Listing
- ListingImage
- Amenity
- Booking
- Review
- Favourite

Main relationships:

- A user can be a host or guest.
- A host user owns many listings.
- A listing has many images, bookings, reviews, and favourites.
- Listings and amenities have a many-to-many relationship.
- A guest user can create many bookings.
- A user can favourite many listings.

## API Overview

Public endpoints include:

- `GET /health`
- `GET /api/listings`
- `GET /api/listings/{id}`
- `GET /api/listings/{id}/availability`
- `POST /api/bookings/quote`

Protected guest endpoints include:

- `POST /api/bookings`
- `GET /api/bookings/me`
- `GET /api/bookings/{id}`
- `GET /api/favourites`
- `POST /api/favourites/{id}`
- `DELETE /api/favourites/{id}`

Protected host endpoints include:

- `GET /api/host/listings`
- `POST /api/host/listings`
- `PUT /api/host/listings/{id}`
- `DELETE /api/host/listings/{id}`
- `GET /api/host/bookings`
- `GET /api/host/stats`

## Booking Rules

A confirmed booking blocks a requested range when:

```text
existing_check_in < requested_check_out
AND
existing_check_out > requested_check_in
```

Overlapping confirmed bookings are rejected. Cancelled bookings do not block dates. A new booking may begin on the previous booking's checkout date because the overlap bounds are strict.

## Pricing

Money is stored in paise in the database and returned as whole INR values through the API.

The booking service calculates:

```text
subtotal = nightly_rate * number_of_nights
cleaning_fee = listing.cleaning_fee
service_fee = 12% of subtotal, rounded to the nearest whole rupee
total_price = subtotal + cleaning_fee + service_fee
```

The frontend never sends the final price. The backend creates a pricing snapshot on each booking.

## Mock Authentication

There is no real authentication. Protected endpoints read the current user from the `X-User-Id` header.

Missing, invalid, or unknown users are rejected by the backend. Host-only endpoints also require the selected user to have the host role.

Seeded users:

| ID | Role | Name | Email |
| --- | --- | --- | --- |
| 1 | host | Priya Sharma | priya.sharma@example.com |
| 2 | host | Rahul Mehta | rahul.mehta@example.com |
| 3 | host | Neha Kapoor | neha.kapoor@example.com |
| 4 | guest | Aditya Balaji | aditya.balaji@example.com |
| 5 | guest | Rohan Verma | rohan.verma@example.com |

## Local Setup

Run the backend and frontend in separate terminals.

Backend terminal:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend terminal:

```powershell
cd frontend
npm install
npm run dev
```

Local URLs:

- Frontend: http://localhost:3000
- Backend: http://127.0.0.1:8000
- Swagger: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health

## Environment Variables

Backend environment variables:

```env
APP_NAME=Airbnb Clone API
APP_ENV=production
DEBUG=false
API_PREFIX=/api
DATABASE_URL=sqlite:///./airbnb.db
FRONTEND_URL=http://localhost:3000
```

Frontend environment variables:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

For production, set `NEXT_PUBLIC_API_URL` to the deployed Render backend URL and set `FRONTEND_URL` to the deployed Vercel frontend URL.

## Render Deployment

Create the backend as a Render Web Service.

1. Open the Render dashboard.
2. Create a new Web Service.
3. Connect the GitHub repository.
4. Select the main branch.
5. Set Root Directory to `backend`.
6. Set Build Command to:

```text
pip install -r requirements.txt
```

7. Set Start Command to:

```text
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

8. Add environment variables:

```env
APP_NAME=Airbnb Clone API
APP_ENV=production
DEBUG=false
API_PREFIX=/api
DATABASE_URL=sqlite:///./airbnb.db
FRONTEND_URL=http://localhost:3000
```

9. Set the health-check path to `/health`.
10. Deploy the service.
11. Test:
    - `/health`
    - `/docs`
    - `/api/listings`
12. Copy the generated Render URL.

For initial deployment, `FRONTEND_URL` can temporarily be `http://localhost:3000`. After the Vercel deployment is live, replace it with the final Vercel URL and redeploy or restart the Render service.

## SQLite Persistence On Render

SQLite remains the required database.

Option A - Free Render service:

- Use a local SQLite URL such as `sqlite:///./airbnb.db`.
- The app can run and seed successfully.
- Runtime-created bookings, favourites, and listing changes may be lost after restart or redeployment.
- This limitation should be disclosed in the final submission.

Option B - Paid Render service with persistent disk:

- Add a persistent disk in Render.
- Mount it at `/var/data`.
- Set:

```env
DATABASE_URL=sqlite:////var/data/airbnb.db
```

- This is the preferred option for persistent deployed bookings and host CRUD changes.

## Vercel Deployment

Create the frontend as a Vercel project.

1. Open the Vercel dashboard.
2. Import the same GitHub repository.
3. Set Root Directory to `frontend`.
4. Confirm the Next.js framework preset.
5. Add:

```env
NEXT_PUBLIC_API_URL=<Render backend URL>
```

6. Deploy.
7. Copy the Vercel URL.
8. Return to Render.
9. Set:

```env
FRONTEND_URL=<Vercel frontend URL>
```

10. Redeploy or restart the backend.
11. Test the complete live application.

If you want the deployed backend to also allow local frontend testing, set `FRONTEND_URL` as a comma-separated list:

```env
FRONTEND_URL=<Vercel frontend URL>,http://localhost:3000
```

## Mocked Features

- Authentication is mocked through `X-User-Id`.
- Checkout is a mock payment flow.
- Listing images use external URLs.
- Map display is a static placeholder.

## Assumptions

- Seeded demo users are used for all guest and host actions.
- The backend is the source of truth for availability and pricing.
- Vercel hosts only the frontend.
- Render hosts only the backend.
- SQLite remains the required database.

## Known Limitations

- No real authentication, passwords, sessions, or OAuth.
- No real payment processing.
- No cloud image upload.
- No messaging or real-time features.
- No review creation UI.
- SQLite persistence on a free Render service is not guaranteed across restarts or redeployments.

## Live Smoke Test

After deployment, verify:

- Home loads listings.
- Search works.
- Filters work.
- Listing details open.
- Booking quote works.
- Booking creation works.
- Confirmation page opens.
- My Trips shows the booking.
- Wishlist add/remove works.
- Host dashboard opens.
- Host listing CRUD works.
- No browser CORS errors appear.
- No important browser console errors appear.
- Backend health remains successful.
- Refreshing frontend routes works.
