# Database Schema Documentation — ACT Platform

ACT utilizes an indexed relational schema implemented via SQLAlchemy 2.0 with PostgreSQL 16 compatibility.

---

## 1. Entity Relationship Overview

```
 [User] 1 ──── 1 [UserProfile]
   │    1 ──── 1 [UserPreferences]
   │    1 ──── * [RiskAssessment] ─── * [EmergencyAlert] ─── 1 [AlertSource]
   │    1 ──── * [Route] ───────────── * [Shelter] ───────── 1 [AlertSource]
   │               │ 1
   │               └── * [RouteEvent]
   │    1 ──── * [ActionPlan] ─────── * [EmergencyAlert]
   │    1 ──── * [AuditLog]
```

---

## 2. Table Specifications (13 Tables)

1. **`users`**
   - Primary user identity and authentication record.
   - Columns: `id` (PK), `email` (Unique, Index), `hashed_password`, `role` (Enum: `END_USER`, `ADMIN`), `is_active`, `created_at`, `updated_at`.

2. **`user_profiles`**
   - Citizen personal attributes and mobility tier.
   - Columns: `id` (PK), `user_id` (FK `users.id`, Unique), `full_name`, `preferred_language` (`en`, `hi`, `ja`), `mobility` (`NORMAL`, `LIMITED_WALKING`, `WHEELCHAIR`), `location_name`, `location_lat`, `location_lon`.

3. **`user_preferences`**
   - Interface and device configuration.
   - Columns: `id` (PK), `user_id` (FK `users.id`, Unique), `theme` (`light`, `dark`, `system`), `notifications_enabled`, `sound_alerts_enabled`, `high_contrast`, `offline_cache_enabled`.

4. **`alert_sources`**
   - Official institutions and meteorological dispatch agencies.
   - Columns: `id` (PK), `name`, `source_type`, `url`, `is_verified`, `trust_score` (0.0 to 1.0).

5. **`emergency_alerts`**
   - Master emergency incident records.
   - Columns: `id` (PK), `title`, `description`, `emergency_type` (`FLOOD`, etc.), `severity` (`LOW`, `MODERATE`, `SEVERE`, `EXTREME`), `certainty` (`POSSIBLE`, `LIKELY`, `OBSERVED`), `hazard_polygon_geojson` (JSON), `time_to_impact_minutes`, `source_id` (FK `alert_sources.id`), `verification_status`, `data_status` (`DEMO`, `LIVE`, `CACHED`), `is_active` (Index).

6. **`shelters`**
   - Evacuation centers and high-ground havens.
   - Columns: `id` (PK), `name`, `address`, `latitude`, `longitude`, `capacity_total`, `capacity_available`, `wheelchair_accessible`, `medical_support`, `pet_friendly`, `status` (`OPEN`, `FULL`, `CLOSED`), `source_id` (FK `alert_sources.id`), `last_verified`, `is_active`.
   - Index: `idx_shelter_active_lat_lon` (`is_active`, `latitude`, `longitude`).

7. **`risk_assessments`**
   - Computed personal risk evaluations.
   - Columns: `id` (PK), `user_id` (FK `users.id`), `alert_id` (FK `emergency_alerts.id`), `risk_score` (0 to 100), `risk_level` (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`), `risk_factors` (JSON), `action_window_minutes`, `disclaimer`.

8. **`routes`**
   - Computed safe transit routes between user origin and target shelter.
   - Columns: `id` (PK), `user_id` (FK `users.id`), `alert_id` (FK `emergency_alerts.id`), `shelter_id` (FK `shelters.id`), `origin_lat`, `origin_lon`, `destination_lat`, `destination_lon`, `distance_meters`, `estimated_time_minutes`, `mobility_tier`, `waypoints_geojson` (JSON), `alternative_waypoints_geojson` (JSON), `is_blocked`, `blocked_reason`.

9. **`route_events`**
   - Incident logs and recalculation checkpoints.
   - Columns: `id` (PK), `route_id` (FK `routes.id`), `event_type`, `description`, `location_name`, `latitude`, `longitude`, `created_at`.

10. **`action_plans`**
    - Dynamic personalized directives.
    - Columns: `id` (PK), `user_id` (FK `users.id`), `alert_id` (FK `emergency_alerts.id`), `do_now` (JSON), `do_next` (JSON), `avoid` (JSON), `if_then` (JSON), `version`.

11. **`demo_scenarios`**
    - Seed scenarios for automated simulation and testing.
    - Columns: `id` (PK), `name`, `slug` (Unique), `description`, `scenario_data` (JSON), `is_default`.

12. **`audit_logs`**
    - Security and privilege tracking ledger.
    - Columns: `id` (PK), `user_id` (FK `users.id`, Nullable), `action`, `resource_type`, `resource_id`, `details` (JSON), `ip_address`, `timestamp`.
    - Index: `idx_audit_timestamp`.

13. **`system_events`**
    - Global telemetry and service status events.
    - Columns: `id` (PK), `event_type`, `payload` (JSON), `timestamp`.
