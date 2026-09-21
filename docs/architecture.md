# System Architecture — ACT (Actionable Crisis Translator)

"Turn emergency information into clear personal decisions."

---

## 1. Architectural Philosophy

During life-threatening crises, victims and dispatchers are inundated with technical advisories (meteorological coordinates, rainfall volume, river cresting stats) that fail to answer immediate personal questions:
1. **What is happening?**
2. **How does it affect me?**
3. **What should I do NOW?**
4. **What should I do NEXT?**
5. **What should I AVOID?**
6. **What should I do IF the situation changes?**

ACT bridges this critical gap by acting as an **actionable crisis decision-support compiler**. It ingests raw emergency data, correlates it with the user's specific location and mobility constraints, and outputs clear, sequential directives, topological safe routes, and verified shelter targets.

```
EXTERNAL EMERGENCY SOURCE (Government / Meteorological / Civil Protection)
                                ↓
                         DATA INGESTION
                                ↓
                     VERIFICATION & PROVENANCE
                                ↓
                      DATABASE (PostgreSQL 16)
                                ↓
                    ACT DECISION & RISK ENGINE
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
  PERSONALIZED RISK       DO NOW / NEXT         MOBILITY-AWARE
  EVALUATION (0-100)      & AVOID PLANS         SAFE ROUTE & SHELTER
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                                ▼
                   REACT / NEXT.JS DASHBOARD
           (Interactive Map, Audio Chimes, Offline Cache)
```

---

## 2. Core Components

### 2.1 Backend (FastAPI + SQLAlchemy 2.0)
- **Framework**: Python 3.11+ / 3.14 with FastAPI for async high-concurrency API performance.
- **ORM & Data Layer**: SQLAlchemy 2.0 declarative models supporting PostgreSQL for production and zero-configuration SQLite for development.
- **Auth & RBAC**: Stateless JWT with HttpOnly Secure cookies and Bearer token fallback. Role-Based Access Control distinguishing `END_USER` from authoritative `ADMIN`.
- **Decision Engine**:
  - `RiskEngine`: Computes multi-factor risk scores considering emergency severity, hazard centroid proximity, urgency time-to-impact, and user mobility penalty (+15 for wheelchair, +10 for limited walking).
  - `RouteEngine`: Mobility-aware path calculation avoiding steep grades and low-lying flood planes. Supports instant dynamic recalculation upon road blockage detection.
  - `ActionPlanService`: Generates tiered action statements (DO NOW, NEXT, AVOID, IF -> THEN).

### 2.2 Frontend (Next.js 14 App Router + Tailwind CSS)
- **Framework**: React 18, TypeScript, Tailwind CSS.
- **Navigation & Mapping**: OpenStreetMap Leaflet / MapLibre compatible interface with an offline topological vector SVG fallback.
- **Multilingual Support**: Real-time translation dictionary for English (`en`), Hindi (`hi`), and Japanese (`ja`).
- **Resilient Offline Mode**: Automatic detection of network disconnection, retrieving verified emergency packages from `localStorage` sandbox with exact verification timestamps.

---

## 3. Dynamic Route Recalculation Lifecycle

When an active corridor (such as **Riverside Road Bridge**) is compromised:
1. **Event Detection**: An official dispatcher, automated sensor, or admin triggers a blockage event.
2. **Backend Mutation**: The active route is marked `is_blocked = True`, and a `RouteEvent` is persisted with coordinates and reason.
3. **Engine Recalculation**:
   - Primary route shifts from the lowland river path to the elevated **Ridge Avenue bypass (+25m elevation)**.
   - Destination shelter is re-evaluated to the highest-ground safe haven (**Highland Crest Haven**).
   - Estimated transit time is recalculated based on incline and mobility profile.
4. **Action Plan Adaptation**:
   - `DO NOW`: Changes from bag preparation to *"ABANDON Riverside Road immediately. Shift trajectory West toward Ridge Avenue."*
   - `IF -> THEN`: Activates active contingency branch.
5. **Client Broadcast**: The dashboard instantly updates the map, alerts the user with audible urgency, and displays the recalculated route without page reload.
