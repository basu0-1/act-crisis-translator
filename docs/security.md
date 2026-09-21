# Security & Trust Specification — ACT Platform

ACT is built to ensure integrity, confidentiality, and resilience during civil emergencies.

---

## 1. Authentication & Session Security

- **Password Hashing**: Passwords are never stored in plaintext. Passwords are salted and hashed using **bcrypt** with work factor 12.
- **Stateless JWT with HttpOnly Cookies**:
  - JWTs are signed using HMAC-SHA256 with an independent server-side `SECRET_KEY`.
  - Stored in `HttpOnly`, `SameSite=Lax` cookies, preventing JavaScript XSS access to tokens.
  - Fallback support for `Authorization: Bearer <token>` for API clients.
  - 24-hour token expiration with automatic rejection of expired or malformed tokens.

---

## 2. Role-Based Access Control (RBAC)

ACT enforces strict server-side authorization:
- **`END_USER` (Citizen)**:
  - Can read active alerts, shelters, and sources.
  - Can calculate personal risk, routes, and action plans.
  - Can view and modify **only their own** profile and preferences.
  - Denied access to `/api/admin/*` (403 Forbidden).
- **`ADMIN` (Emergency Authority / Dispatcher)**:
  - Authorized to create, update, and publish official alerts.
  - Authorized to manage shelter registry and capacity.
  - Authorized to inspect immutable audit logs and system KPIs.

---

## 3. Data Safety & Anti-Fabrication Principles

- **No Hallucinated Emergency Data**: ACT never fabricates live alerts or casualty numbers.
- **Mandatory Provenance Badging**:
  - `SIMULATED / DEMO SCENARIO` — Clearly watermarks pre-seeded demo data.
  - `LIVE` — Applied only when connected to verified civil defense endpoints.
  - `CACHED` — Applied when reviewing previously saved offline records.
  - `UNAVAILABLE` — Displayed whenever verified data cannot be confirmed.
- **Prototype Risk Disclaimer**: Personal risk scores are accompanied by the mandatory notice: *"Prototype decision-support score. Not a medical or civil defense certification."*

---

## 4. Injection & Input Sanitization

- **SQL Injection**: Prevented via SQLAlchemy 2.0 parameterized queries and ORM mappings. Raw unescaped SQL execution is forbidden.
- **XSS (Cross-Site Scripting)**: React JSX automatically encodes rendered strings. User profile text is validated through Pydantic v2 schemas.
- **CORS Protection**: FastAPI CORS middleware restricts API requests to explicit allowed origins defined in `BACKEND_CORS_ORIGINS`.

---

## 5. Security Audit Logging

All privileged operations are recorded in the `audit_logs` table:
- Account Registration and Authentication
- Risk assessment calculations
- Dynamic route recalculations
- Emergency alert publication and modifications
- Shelter capacity alterations
- Client IP addresses and ISO 8601 timestamps.
