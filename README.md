# ACT — Actionable Crisis Translator

ACT is an emergency decision-support system that translates official hazard information into personalized, accessibility-aware guidance. The backend remains the source of truth for decision logic, and the frontend renders that state for the user.

## What ACT solves

The platform turns broad emergency alerts into clear personal instructions for:

- hazard severity and time-to-impact
- personal mobility constraints
- accessible route guidance
- shelter assignment and occupancy
- roadblock-triggered route recalculation
- multilingual user guidance
- fail-safe behavior during degraded connectivity

## Decision pipeline

The system follows the flow:

HAZARD → PERSON → RISK → ROUTE → ACTION → ADAPT

In the repository, this is implemented in the backend with:

- alert engine
- risk engine
- route engine
- decision engine
- simulation and API layer

## Agent architecture

The project includes a specialized agent pipeline for ACT:

- Alert Analyst
- Risk Analyst
- Route Analyst
- Action Planner
- Communication Agent

## Core features

- risk scoring based on severity, mobility, exposure, and urgency
- accessibility-aware route selection that avoids unsafe or stair-heavy paths
- dynamic shelter recommendation and capacity checks
- simulation-triggered roadblock events and backend route recalculation
- multilingual support across English, Hindi, Bengali, Odia, Urdu, and Japanese
- offline fallback behavior when the API is unavailable
- Leaflet-based map visualization that does not replace the backend route engine

## Frontend architecture

The primary interactive map is the `EmergencyMap` component. It uses Leaflet only as a visualization layer. It reads data from the existing ACT backend and renders:

- user position from the user profile
- shelter markers from the shelter registry
- route path from the recommended route's `path_coordinates`
- hazard radius from the active alert when geographic geometry is available
- road status overlays from the road network

## Backend architecture

The backend exposes a FastAPI API used by the dashboard, including:

- alert status
- personal risk
- route recommendations
- shelter data
- simulation controls
- roadblock and route recalculation events

The ACT backend remains the system of record for routing, shelter logic, decision logic, and simulation updates.

## Demo flow

The default demo follows this sequence:

1. User opens the dashboard.
2. ACT loads the active emergency alert.
3. ACT evaluates the personal risk and assigns a recommended shelter.
4. ACT displays the safe route on the map.
5. The simulation triggers a roadblock.
6. The backend recalculates the route.
7. The map and action plan update to the new route and shelter.

## Geographic map implementation

The app uses Leaflet for the live map and controls. It includes:

- Zoom In
- Zoom Out
- Recenter Map
- Fit Route

The map uses real application coordinates when they are present and safely avoids fabricated data when they are missing.

## Development setup

### Backend

```powershell
cd C:\Projects\act\backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```powershell
cd C:\Projects\act\frontend
npm install
npm run dev
```

### API docs

`http://localhost:8000/docs`

### Tests

```powershell
cd C:\Projects\act\backend
pytest -v
```

```powershell
cd C:\Projects\act\frontend
npm run build
```

## Environment notes

- default backend URL: `http://localhost:8000`
- frontend API base can be set with `NEXT_PUBLIC_API_URL`
- offline cached fallback remains supported for fail-safe behavior

## Accessibility and safety

- keyboard-accessible controls are used for the map layer
- action information remains visible without hover-only interactions
- missing geographic information does not get replaced with invented coordinates
- the dashboard preserves the emergency action plan while the map updates

## Repository note

The ACT backend is the source of truth for routing, shelter assignment, risk scoring, and simulation state. The map is a visualization layer only.