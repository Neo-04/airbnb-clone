# Airbnb Clone

A full-stack Airbnb-style web application that supports property browsing, search and filtering, booking, wishlists, trip management, and host listing management.

## Deployed Links

- **Live Application:** https://airbnb-clone-liart-gamma.vercel.app
- **Backend API:** https://airbnb-clone-backend-aned.onrender.com
- **API Documentation:** https://airbnb-clone-backend-aned.onrender.com/docs

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- App Router
- CSS
- Vercel

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- SQLite
- Uvicorn
- Render

## Project Architecture

```text
Browser
   |
   v
Next.js Frontend
   |
   | HTTP / JSON
   | X-User-Id for mock user identification
   v
FastAPI Backend
   |
   v
SQLAlchemy ORM
   |
   v
SQLite Database
```

The frontend handles routing, user interaction, search and filter state, booking flow, user switching, forms, and communication with the backend.

The backend handles request validation, listing search, availability checks, price calculation, booking persistence, host operations, favourites, and database access.

## Project Directory

```text
airbnb-clone/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── contexts/
│   ├── lib/
│   ├── public/
│   ├── types/
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── next.config.ts
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── enums.py
│   │   ├── main.py
│   │   └── seed.py
│   ├── requirements.txt
│   └── README.md
│
├── .gitignore
└── README.md
```

## Run Locally

### 1. Clone the repository

```powershell
git clone https://github.com/Neo-04/airbnb-clone.git
cd airbnb-clone
```

### 2. Start the backend

Open the first terminal:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend will be available at:

- API: http://127.0.0.1:8000
- Swagger Documentation: http://127.0.0.1:8000/docs
- Health Check: http://127.0.0.1:8000/health

### 3. Configure the frontend

Create a file named `frontend/.env.local` and add:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 4. Start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

Both the frontend and backend must be running during local development.

## Deployment

The Next.js frontend is deployed on Vercel:

```text
https://airbnb-clone-liart-gamma.vercel.app
```

The FastAPI backend is deployed on Render:

```text
https://airbnb-clone-backend-aned.onrender.com
```

The deployed API documentation is available at:

```text
https://airbnb-clone-backend-aned.onrender.com/docs
```