# ACT Setup & Quickstart Guide

## Prerequisites
- **Python 3.10+** (Tested on Python 3.14)
- **Node.js 18+** (Tested on Node.js v24)
- **Git**

---

## 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API runs at: `http://localhost:8000`  
Swagger UI docs: `http://localhost:8000/docs`

---

## 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

---

## 3. Running Backend Tests
```bash
pytest backend/tests -v
```
Verifies the backend pipeline, deterministic engines, fail-safe triggers, roadblock recalculation, and location/situation state changes.

## 4. Real-user dashboard flow

After signing in, the dashboard lets the user:

1. Use the saved profile location or request browser geolocation.
2. Select Flood, Wildfire, Cyclone, Earthquake, Extreme Heat, or Urban Emergency.
3. Press `Check my safety` to update backend state.
4. Review the alert, personal risk, action plan, shelter, and route.

The seeded route network only covers the seeded demo origin. Outside that coverage, ACT keeps the location but reports that a verified route is unavailable.