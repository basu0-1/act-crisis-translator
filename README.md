# ACT — Actionable Crisis Translator

> **"Turn emergency information into clear personal decisions."**

[![CI Platform](https://github.com/act-crisis/act/actions/workflows/ci.yml/badge.svg)](https://github.com/act-crisis/act/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)

---

## 1. Project Overview

During life-threatening disasters (flash floods, storm surges, fires), citizens are overwhelmed by technical bulletins that do not answer the basic questions needed to survive:
1. **What is happening?**
2. **How does it affect me?**
3. **What should I do NOW?**
4. **What should I do NEXT?**
5. **What should I AVOID?**
6. **What should I do IF the situation changes?**

**ACT (Actionable Crisis Translator)** is a full-stack, production-ready emergency decision-support platform. It correlates verified emergency alerts with user location, terrain, and physical mobility needs to generate transparent personal risk evaluations, accessible evacuation corridors, verified shelter assignments, and immediate action plans that recalculate dynamically as conditions change.

---

## 2. Decision Intelligence Pipeline

```
EMERGENCY INFORMATION
        ↓
UNDERSTAND THE SITUATION (Perimeter, severity, time-to-impact)
        ↓
ASSESS PERSONAL RISK (0-100 composite score adjusted for mobility)
        ↓
RECOMMEND IMMEDIATE ACTION (DO NOW, NEXT, AVOID)
        ↓
RECOMMEND SAFE ROUTE (Open-source mapping, wheelchair accessibility)
        ↓
RECOMMEND SHELTER (Verified status, medical care, capacity)
        ↓
MONITOR CHANGES & RECALCULATE DYNAMICALLY (Road blockages rerouted in real time)
```

---

## 3. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Python 3.11+ / 3.14, FastAPI, Pydantic v2.
- **Database & ORM**: PostgreSQL 16 (production), SQLAlchemy 2.0 ORM, automatic SQLite development fallback.
- **Authentication**: Stateless JWT signed sessions, password hashing via bcrypt, HttpOnly Secure cookies, role-based authorization (`END_USER`, `ADMIN`).
- **Mapping**: Open mapping solution (MapLibre / Leaflet compatible) with resilient topological vector SVG fallback.
- **Testing**: Pytest & Asyncio (Backend), Vitest & React Testing Library (Frontend), Python E2E Integration Suite.
- **Containerization**: Docker, Docker Compose (Postgres + Backend + Frontend).

---

## 4. Key Features

- **Personalized Risk Scoring**: Transparent 0–100 score breaking down severity, time urgency, proximity, and mobility penalties. Labeled with mandatory prototype disclaimers.
- **Accessibility-Aware Routing**: Distinct routing profiles for **Normal**, **Limited Walking**, and **Wheelchair** mobility tiers (filtering out steep inclines, stairs, and debris).
- **Dynamic Route Recalculation**: Instant detection of road blockages (e.g. Riverside Road Bridge inundation) reroutes users around hazards to elevated high-ground corridors without page refresh.
- **Resilient Offline Mode**: Gracefully detects network disruption and serves cached evacuation directives with a prominent `OFFLINE — CACHED — LAST VERIFIED: [timestamp]` banner.
- **Multilingual Support**: Real-time interface translation for **English**, **Hindi (हिन्दी)**, and **Japanese (日本語)** with emergency terminology accuracy.
- **Emergency Authority Console**: Role-protected `/admin/dashboard` allowing dispatchers to create alerts, manage shelters, and review security audit logs.
- **Controlled Demo Mode**: One-click simulation bar to test road blockage rerouting, urgency shifts (32m → 10m), and network severance.
- **Zero Hallucination Guarantee**: Demo scenarios are prominently watermarked as `SIMULATED / DEMO SCENARIO` to prevent confusing mock exercises with live civil defense alerts.

---

## 5. Quick Start (Local Development)

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Git

### 1. Clone & Set Up Monorepo
```bash
git clone <repository_url>
cd act
cp .env.example .env
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

Database tables and demo scenarios will be automatically initialized on first launch.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Running the Platform
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
.\.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
- API Base: `http://localhost:8000`
- Interactive OpenAPI / Swagger Docs: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/health`

**Terminal 2 (Frontend Web App):**
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 6. Pre-Configured Demo Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Emergency Director (Admin)** | `admin@act-emergency.org` | `Admin@ACT2026!` | Full administrative access to `/admin/dashboard` |
| **Citizen (Limited Mobility)** | `user@example.com` | `User@ACT2026!` | Elena Chen — Limited walking profile |
| **Citizen (Wheelchair)** | `wheelchair@example.com` | `User@ACT2026!` | Marcus Vance — Wheelchair accessible routing |

---

## 7. Running Tests

### Backend Unit & RBAC Tests (Pytest)
```bash
cd backend
.\.venv\Scripts\activate
pytest -v
```

### End-to-End System Lifecycle Verification
```bash
cd backend
.\.venv\Scripts\activate
python tests/test_e2e_flow.py
```

### Frontend Unit & Component Tests (Vitest)
```bash
cd frontend
npm test
```

### Next.js Production Build Validation
```bash
cd frontend
npm run build
```

---

## 8. Docker Deployment

Launch PostgreSQL 16, FastAPI backend, and Next.js frontend with a single command:
```bash
docker compose up --build
```

---

## 9. Security & Anti-Fabrication Principles

1. **No Fictitious Alerts Masquerading as Official**: When external civil defense APIs are not configured, ACT explicitly labels all pre-seeded events as `SIMULATED / DEMO SCENARIO`.
2. **Strict User Isolation**: Regular citizens can only read or mutate their own preferences. Any citizen attempting to query or modify admin dispatch endpoints receives an immediate `403 Forbidden` logged to the audit ledger.
3. **Password Security**: Passwords are encrypted with `bcrypt` (work factor 12) and never stored in plaintext or returned in responses.

---

## 10. License

This project is licensed under the [MIT License](LICENSE). Built for human safety.
