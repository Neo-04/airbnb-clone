# StayFinder

A full-stack Airbnb-style vacation rental application that supports user authentication, property browsing, search and filtering, real-time availability checks, booking creation, wishlists, trip management, and host listing management.

## Live Application

- **Website:** https://airbnb-clone-liart-gamma.vercel.app

## Tech Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript
- CSS
- React Hot Toast
- Vercel

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- SQLite
- Uvicorn
- Render

## Run Locally

### 1. Backend

Open a terminal:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend server will run at `http://127.0.0.1:8000`.

### 2. Frontend

Create a file named `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The application will run at `http://localhost:3000`.
