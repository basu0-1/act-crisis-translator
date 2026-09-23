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
Verifies all 19 unit & integration tests covering the 5-agent pipeline, deterministic engines, and fail-safe triggers.