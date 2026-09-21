# API Documentation — ACT Platform

The ACT backend exposes RESTful APIs documented automatically via OpenAPI / Swagger at `/docs` and ReDoc at `/redoc`.

Base URL: `http://localhost:8000/api`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new citizen account and associated profile/preferences.
- **Request Body**:
  ```json
  {
    "full_name": "Elena Chen",
    "email": "user@example.com",
    "password": "User@ACT2026!",
    "preferred_language": "en",
    "mobility": "LIMITED_WALKING"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1...",
    "token_type": "bearer",
    "user_role": "END_USER",
    "user_id": 2,
    "full_name": "Elena Chen"
  }
  ```
- **Cookie Set**: `access_token=Bearer <token>; HttpOnly; SameSite=Lax; Path=/`

### `POST /api/auth/login`
Authenticates a citizen or administrator.
- **Request Body**: `{"email": "...", "password": "..."}`
- **Response** (200 OK): Token response with user role and full name.

### `POST /api/auth/logout`
Clears the session cookie.
- **Response** (200 OK): `{"message": "Successfully logged out"}`

### `GET /api/auth/me`
Retrieves the authenticated user's details, role, and profile.
- **Headers**: `Authorization: Bearer <token>` or HttpOnly cookie.

---

## 2. Emergency Decisions

### `GET /api/decision/current`
Aggregates the active emergency alert, personal risk score, safe evacuation route, target shelter, action plan, and recent updates into a single high-performance payload.
- **Response** (200 OK):
  ```json
  {
    "alert": {
      "id": 1,
      "title": "Flash Flood Warning — Riverside Basin Corridor",
      "severity": "SEVERE",
      "certainty": "OBSERVED",
      "time_to_impact_minutes": 32,
      "data_status": "DEMO"
    },
    "risk": {
      "risk_score": 68.5,
      "risk_level": "HIGH",
      "action_window_minutes": 24,
      "disclaimer": "Prototype decision-support score",
      "risk_factors": [...]
    },
    "route": {
      "id": 1,
      "distance_meters": 1600,
      "estimated_time_minutes": 14,
      "mobility_tier": "LIMITED_WALKING",
      "is_blocked": false,
      "waypoints_geojson": {...}
    },
    "shelter": {
      "name": "Community Civic Center",
      "capacity_available": 112,
      "capacity_total": 250,
      "wheelchair_accessible": true,
      "status": "OPEN"
    },
    "action_plan": {
      "do_now": [...],
      "do_next": [...],
      "avoid": [...],
      "if_then": [...]
    },
    "recent_events": [...]
  }
  ```

---

## 3. Routes & Dynamic Recalculation

### `POST /api/routes/calculate`
Calculates an initial safe evacuation route.
- **Request Body**: `{"alert_id": 1, "mobility": "NORMAL"}`

### `POST /api/routes/recalculate`
Simulates or applies a road blockage event (e.g. Riverside Road flood inundation), computing an alternative high-ground route and updating the action plan.
- **Request Body**:
  ```json
  {
    "route_id": 1,
    "blockage_location": "Riverside Road Bridge",
    "blockage_lat": 37.7780,
    "blockage_lon": -122.4140,
    "reason": "Rapid flood water inundation"
  }
  ```

---

## 4. Admin Authority Endpoints
*Strictly restricted to users with `role: "ADMIN"`. Returns 403 Forbidden for regular citizens.*

- `GET /api/admin/stats` — Overall system health, user counts, active alerts.
- `GET /api/admin/users` — List registered citizens and accounts.
- `GET /api/admin/alerts` — Master list of alerts.
- `POST /api/admin/alerts` — Create and publish official emergency alerts.
- `PUT /api/admin/alerts/{id}` — Update severity, certainty, or expiration.
- `GET /api/admin/shelters` — Master shelter inventory.
- `POST /api/admin/shelters` — Register a new emergency shelter.
- `GET /api/admin/audit` — Immutable chronological security and dispatch audit trail.

---

## 5. Demo Simulator Endpoints
- `POST /api/demo/trigger-roadblock` — Instantly blocks Riverside Road Bridge and recalculates route.
- `POST /api/demo/trigger-urgency?minutes=10` — Shifts countdown to 10 minutes, re-evaluating risk score.
- `POST /api/demo/reset` — Resets demo environment to baseline state.
