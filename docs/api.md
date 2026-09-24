# ACT REST API Specification (v1.1.0)

### Base URL: `http://localhost:8000`

---

### 1. Authentication & Multi-User Accounts
- **`POST /auth/register`**: Registers a real end-user account with personalized mobility.
- **`POST /auth/login`**: Authenticates user and returns JWT Bearer token.
- **`POST /auth/demo-login`**: Instant 1-click login for `user` or `admin` testing.
- **`GET /auth/me`**: Fetches authenticated user profile.

---

### 2. Protected Developer & Admin APIs (Role: Admin Only)
- **`GET /admin/users`**: Lists all registered user profiles.
- **`GET /admin/alerts`**: Lists all live and demo alerts.
- **`POST /admin/alerts`**: Broadcasts new emergency alert.
- **`DELETE /admin/alerts/{id}`**: Deletes emergency alert.
- **`GET /admin/shelters` & `PUT /admin/shelters/{id}`**: Updates live shelter status and capacity.
- **`GET /admin/roads` & `PUT /admin/roads/{id}`**: Updates road blockage / hazard status.
- **`GET /admin/audit-logs`**: Inspects user actions and system event trails.
- **`GET /admin/config`**: Runtime config and database health telemetry.

---

### 3. Emergency Telemetry & Decision Endpoints
- **`GET /health`**: System status, agent health, and security guards.
- **`GET /alerts/active`**: Active emergency alert.
- **`GET /user/profile` & `POST /user/profile`**: User context profile.
- **`POST /risk/calculate`**: Agent 2 Risk score (0–100) and explainability checklist.
- **`POST /route/recalculate`**: Agent 3 Barrier-free evacuation pathfinding.
- **`GET /route/geojson`**: GeoJSON layers for vector map rendering.
- **`POST /plan/generate?language={en|hi|ja}`**: Agent 4 & 5 Action plan synthesis.
- **`POST /simulate/event` & `POST /simulate/reset`**: Scenario simulation machine.

### Simulation event examples

The existing simulation endpoint also accepts:

```json
{
	"event_type": "location_changed",
	"latitude": 28.6139,
	"longitude": 77.209
}
```

```json
{
	"event_type": "situation_changed",
	"hazard_type": "flood"
}
```

Location updates recalculate risk and map context. The seeded route network is only considered verified near its seeded origin. Situation types without verified alert data are returned with unverified provenance and the existing fail-safe action plan.