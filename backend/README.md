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
```

Run command:

```powershell
cd backend
uvicorn app.main:app --reload
```

## Project layout

```
app/
  main.py          # FastAPI app, CORS, lifespan, router registration
  config.py        # settings loaded from environment variables
  database.py      # engine, session, get_db, init_db
  dependencies.py  # shared request dependencies
  exceptions.py    # shared error handlers
  routers/         # API routers (health for now)
  models/          # ORM models (added later)
  schemas/         # request/response schemas (added later)
  services/        # business logic (added later)
```
