# ACT — Actionable Crisis Translator (v1.1.0)

> **"Turn emergency information into clear personal decisions."**

[![CI Tests](https://img.shields.io/badge/pytest-35%20passed-brightgreen.svg)]()
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Security: RBAC](https://img.shields.io/badge/Security-Strict%20RBAC%20(JWT)-blueviolet.svg)]()

---

## 🚨 What is ACT?

**ACT (Actionable Crisis Translator)** is an AI-powered personalized emergency decision-support platform. It transforms official, technical disaster alerts into immediate, barrier-free survival directives tailored to individual mobility, transit modes, and family companions.

### Key Capabilities:
- **Decision Intelligence Pipeline**: 5-stage transformation (`01 ALERT` → `02 RISK` → `03 ACTION` → `04 ROUTE` → `05 SHELTER`).
- **6 Supported Emergency Hazards**: Flood, Wildfire, Cyclone, Earthquake, Extreme Heat, and Urban Emergency.
- **Dynamic Roadblock Rerouting**: Instant recalculation when roads or bridges flood, automatically redirecting from primary safe haven (`Shelter B`) to secondary safe haven (`Shelter C`).
- **4-Tier Source Hierarchy**: Level 1 Official (NDMA, IMD, USGS) > Level 2 Infrastructure & Sensors > Level 3 Responders > Level 4 Crowdsourced.
- **Zero-Hallucination Guarantee**: Strict deterministic engine execution. Missing or unverified data triggers conservative shelter-in-place directives and `"Information unavailable."`
- **Accessibility-First Routing**: Specialized graph traversal guaranteeing step-free paths for wheelchair users and limited mobility citizens.
- **Multilingual Support**: Real-time localization across English (`en`), Hindi (`hi`), and Japanese (`ja`).
- **Theme Support**: Seamless Light, Dark, and System (`☀️ 🌙 💻`) modes.

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart TD
    subgraph S1["Data Ingestion & 4-Tier Provenance"]
        A1["Level 1: Official Authorities (NDMA, IMD, USGS)"]
        A2["Level 2: Sensors & Gauge Networks"]
        A3["Level 3: Verified On-Ground Responders"]
        A4["Level 4: Crowdsourced Telemetry"]
    end

    subgraph S2["Harmonization & Decision Engines"]
        E1["Alert Engine\n(Conflict Resolution & Source Hierarchy)"]
        E2["Risk Engine\n(Severity × Exposure × Vulnerability × Time)"]
        E3["Route Engine\n(NetworkX Dijkstra with Barrier Avoidance)"]
        E4["Decision Engine\n(Verified Fact Assembly)"]
    end

    subgraph S3["5-Agent AI Pipeline"]
        AG1["Agent 1: Alert Analyst"]
        AG2["Agent 2: Risk Analyst"]
        AG3["Agent 3: Route Analyst"]
        AG4["Agent 4: Action Planner (NOW, NEXT, AVOID, IF→THEN)"]
        AG5["Agent 5: Communication Agent (EN / HI / JA)"]
    end

    subgraph S4["Client Layer (Next.js 14)"]
        UI1["Landing Page with Hero & 5-Card Pipeline"]
        UI2["7-Step Crisis Decision Dashboard"]
        UI3["Interactive Roadblock Demo Drawer"]
        UI4["Admin Developer DB Console"]
    end

    S1 --> E1
    E1 --> E2
    E2 --> E3
    E3 --> E4
    E4 --> S3
    S3 --> S4
```

---

## 🔁 Killer Demo: Dynamic Roadblock Recalculation

```mermaid
sequenceDiagram
    autonumber
    actor User as Citizen / Evaluator
    participant UI as Next.js Dashboard
    participant API as FastAPI Backend (/api/*)
    participant RE as Route Engine (NetworkX)
    participant AP as Action Planner

    User->>UI: View Active Evacuation Path
    UI->>API: GET /api/decision/current
    API-->>UI: Primary Route: Highland Blvd (R3) → Shelter B (ETA: 14 mins)

    User->>UI: Click "Trigger Roadblock on Highland Blvd"
    UI->>API: POST /api/demo/trigger-roadblock
    API->>RE: Mark R3 as BLOCKED & Inundated
    RE->>RE: Exclude R3 & Recompute Shortest Step-Free Path
    RE-->>API: New Route: Ridge Connector (R6) → Shelter C (Ridge Heights Haven)
    API->>AP: Update Directives & IF→THEN Rules
    AP-->>API: Updated Action Plan (DO NOW: Abandon Highland Blvd)
    API-->>UI: Stream Recalculated State
    UI-->>User: Map renders R3 in RED DASHED "BLOCKED", draws new green path to Shelter C
```

---

## 📋 Standard Enterprise API Contracts (`/api/*`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` / `/api/health` | System health, service status, and environment mode |
| `GET` | `/api/decision/current` | Complete unified decision package (alert, risk, plan, route, shelters) |
| `POST` | `/api/demo/trigger-roadblock` | Simulates road flood on R3; recalculates route to Shelter C |
| `POST` | `/api/demo/reset` | Resets simulation to initial state (Shelter B) |
| `GET` | `/api/admin/sources` | 4-Tier Source Hierarchy definitions and trust weights |
| `GET` | `/api/routes/shelters` | Registry of shelters, open capacities, and accessibility |
| `GET` | `/api/routes/roads` | Real-time road network segments, risk levels, and blockages |
| `POST` | `/api/routes/recalculate` | Dynamic on-demand evacuation route calculation |
| `POST` | `/api/risk/calculate` | Personalized multi-factor risk assessment (0–100 score) |
| `POST` | `/api/plan/generate` | Generates verified DO NOW, NEXT, AVOID, and IF→THEN actions |
| `POST` | `/api/auth/register` | Citizen / responder account registration with mobility preferences |
| `POST` | `/api/auth/login` | JWT token authentication |
| `GET` | `/api/auth/me` | Current authenticated profile and RBAC permissions |

---

## 🧪 Verification & Automated Tests (35 / 35 Passed)

Run the full backend test suite:
```powershell
cd backend
pytest -v
```

### Verified Test Suites:
- `test_api_v1.py` — Enterprise `/api/*` endpoints, source conflict resolution, multi-emergency coverage, fail-safe rules.
- `test_api_endpoints.py` — Health contracts, simulation triggers, and plan generation.
- `test_agents_and_pipeline.py` — 5-agent pipeline synthesis and zero-hallucination guard.
- `test_alert_engine.py` — Alert ingestion, spatial exposure calculation, and CAP validation.
- `test_risk_engine.py` — Multi-hazard risk scoring and mobility vulnerability weights.
- `test_route_engine.py` — Dijkstra graph pathfinding, wheelchair stairs avoidance, and roadblock detour.
- `test_auth_and_rbac.py` — JWT authentication, password hashing, and 403 Forbidden admin protection.
- `test_database_persistence.py` — SQLAlchemy DB schema creation and seeding.

---

## 🚀 Local Quickstart Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ & npm

### 1. Start the Backend API
```powershell
cd C:\Projects\act\backend
python -m uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/health`

### 2. Start the Frontend Dashboard
```powershell
cd C:\Projects\act\frontend
npm run dev
```
- Open `http://localhost:3000` in your browser.
- Production build: `npm run build` followed by `npm start`.

---

## 📱 User Interface Progression

1. **Home / Landing Page**: Brand header, hero badge, headline, CTAs, 5-card decision intelligence pipeline, methodology, capabilities, safety and trust guarantee.
2. **Dashboard**: 7-Step crisis decision journey:
   - Step 1: Current Emergency Status
   - Step 2: Personalized Risk Score
   - Step 3: What You Should Do Now (Priority Actions)
   - Step 4: Safe Evacuation Route & Tactical Map
   - Step 5: Designated Safe Haven
   - Step 6: Live Updates & Recalculation Timeline
   - Step 7: Active Personal Settings & Consent
3. **Simulation Controls**: Collapsible top drawer to trigger instant roadblocks, adjust mobility preferences, and test multi-hazard responses.

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.