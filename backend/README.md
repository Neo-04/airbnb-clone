# Airbnb Clone Backend

FastAPI backend for the Airbnb Clone application. It handles listings, search and filters, availability, bookings, host operations, favourites, seed data, and SQLite persistence.

## Deployed Links

- **Backend API:** https://airbnb-clone-backend-aned.onrender.com
- **Swagger Documentation:** https://airbnb-clone-backend-aned.onrender.com/docs
- **Health Check:** https://airbnb-clone-backend-aned.onrender.com/health

## Tech Stack

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- SQLite
- Uvicorn
- Render

## Backend Architecture

```text
FastAPI Application
   |
   ├── Routers
   |     Handles API endpoints
   |
   ├── Schemas
   |     Validates request and response data
   |
   ├── Services
   |     Contains business logic
   |
   ├── Models
   |     Defines SQLAlchemy database tables
   |
   ├── Database Layer
   |     Manages sessions and SQLite connections
   |
   └── Seed Data
         Adds initial users, listings, bookings, and reviews
```

The routers receive requests and call the service layer.

The service layer handles listing filters, booking validation, price calculation, host ownership checks, favourites, and database operations.

SQLAlchemy connects the FastAPI application to SQLite.

## Directory Structure

```text
backend/
├── app/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── listing.py
│   │   ├── booking.py
│   │   ├── review.py
│   │   └── favourite.py
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py
│   │   ├── listings.py
│   │   ├── bookings.py
│   │   ├── host.py
│   │   └── favourites.py
│   │
│   ├── schemas/
│   ├── services/
│   ├── __init__.py
│   ├── config.py
│   ├── database.py
│   ├── dependencies.py
│   ├── enums.py
│   ├── exceptions.py
│   ├── main.py
│   └── seed.py
│
├── .env.example
├── requirements.txt
└── README.md
```

## Run Locally

From the project root, open a terminal and enter the backend directory:

```powershell
cd backend
```

Create a virtual environment:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the dependencies:

```powershell
pip install -r requirements.txt
```

Start the FastAPI server:

```powershell
uvicorn app.main:app --reload
```

The backend will be available at:

- API: http://127.0.0.1:8000
- Swagger Documentation: http://127.0.0.1:8000/docs
- Health Check: http://127.0.0.1:8000/health

## Environment Variables

Create a `backend/.env` file if custom local values are required.

Example:

```env
APP_NAME=Airbnb Clone API
APP_ENV=development
DEBUG=true
API_PREFIX=/api
DATABASE_URL=sqlite:///./airbnb.db
FRONTEND_URL=http://localhost:3000
```

### Variable Details

- `APP_NAME`: Name displayed by the FastAPI application.
- `APP_ENV`: Current environment, such as development or production.
- `DEBUG`: Enables or disables debug mode.
- `API_PREFIX`: Prefix used for application API routes.
- `DATABASE_URL`: SQLite database connection URL.
- `FRONTEND_URL`: Frontend origin allowed by CORS.

## Mock User Identification

The backend uses a mock user system instead of real authentication.

Protected endpoints receive the current user through:

```text
X-User-Id
```

Seeded user IDs:

```text
Hosts: 1, 2, 3
Guests: 4, 5
```

Example request header:

```text
X-User-Id: 4
```

## Main API Groups

```text
/api/listings
/api/bookings
/api/host
/api/favourites
```

The backend supports:

- Listing search and filters
- Pagination
- Listing details
- Availability ranges
- Booking quotes
- Booking creation
- My Trips
- Host listing CRUD
- Host bookings
- Host dashboard statistics
- Favourites

## Production Deployment

The backend is deployed on Render:

```text
https://airbnb-clone-backend-aned.onrender.com
```

Render configuration:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Recommended production environment variables:

```env
APP_NAME=Airbnb Clone API
APP_ENV=production
DEBUG=false
API_PREFIX=/api
DATABASE_URL=sqlite:///./airbnb.db
FRONTEND_URL=https://airbnb-clone-liart-gamma.vercel.app
```

For a Render service with a persistent disk mounted at `/var/data`, use:

```env
DATABASE_URL=sqlite:////var/data/airbnb.db
```

SQLite data created on a free Render service may be lost after a restart or redeployment because the local filesystem is not permanently persistent.