"""
Database Seed Script: Populates initial demo and admin records
"""
from datetime import datetime, timezone
from app.database import SessionLocal
from app.models.user import User
from app.models.alert import EmergencyAlert
from app.models.infrastructure import ShelterEntity, RoadEntity, AuditLog
from app.auth.security import hash_password
from app.data.mock_database import DEFAULT_ALERT, DEFAULT_USER, DEFAULT_ROADS, DEFAULT_SHELTERS


def seed_database():
    db = SessionLocal()
    try:
        # 1. Seed Admin User
        admin_user = db.query(User).filter(User.email == "admin@emergency.ai").first()
        if not admin_user:
            admin_user = User(
                id="user-admin-01",
                email="admin@emergency.ai",
                hashed_password=hash_password("AdminPass123!"),
                role="admin",
                name="Lead Emergency Architect",
                mobility="normal",
                transport="car",
                companions="none",
                language="en",
                lat=28.6139,
                lng=77.2090
            )
            db.add(admin_user)

        # 2. Seed Default Demo User
        demo_user = db.query(User).filter(User.id == "user-demo-01").first()
        if not demo_user:
            demo_user = User(
                id="user-demo-01",
                email="demo@emergency.ai",
                hashed_password=hash_password("DemoPass123!"),
                role="user",
                name="Demo User",
                mobility="limited",
                transport="walking",
                companions="none",
                language="en",
                lat=28.6139,
                lng=77.2090,
                accessibility_requirements=["Step-free access required", "Avoid steep inclines (>8%)", "Paved pathways only"],
                critical_needs=["Uninterrupted mobility device clearance", "Direct shelter reception support"]
            )
            db.add(demo_user)

        # 3. Seed Default Flood Alert
        alert_count = db.query(EmergencyAlert).count()
        if alert_count == 0:
            db_alert = EmergencyAlert(
                id=DEFAULT_ALERT.id,
                hazard_type=DEFAULT_ALERT.hazard_type.value,
                severity=DEFAULT_ALERT.severity.value,
                certainty=DEFAULT_ALERT.certainty.value,
                headline=DEFAULT_ALERT.headline,
                description=DEFAULT_ALERT.description,
                lat=DEFAULT_ALERT.lat,
                lng=DEFAULT_ALERT.lng,
                radius_km=DEFAULT_ALERT.radius_km,
                time_to_impact_minutes=DEFAULT_ALERT.time_to_impact_minutes,
                required_action=DEFAULT_ALERT.required_action,
                source_level=DEFAULT_ALERT.source_level.value,
                source_name=DEFAULT_ALERT.provenance.source_name,
                source_type="demo",
                confidence=DEFAULT_ALERT.provenance.confidence,
                verified=True,
                is_demo=True,
                active=True
            )
            db.add(db_alert)

        # 4. Seed Shelters
        if db.query(ShelterEntity).count() == 0:
            for s in DEFAULT_SHELTERS:
                shelter = ShelterEntity(
                    id=s.id,
                    name=s.name,
                    type=s.type,
                    lat=s.lat,
                    lng=s.lng,
                    capacity=s.capacity,
                    current_occupancy=s.current_occupancy,
                    status=s.status.value,
                    is_accessible=s.is_accessible,
                    address=s.address,
                    is_demo=True
                )
                db.add(shelter)

        # 5. Seed Roads
        if db.query(RoadEntity).count() == 0:
            for r in DEFAULT_ROADS:
                road = RoadEntity(
                    id=r.id,
                    name=r.name,
                    start_node=r.start_node,
                    end_node=r.end_node,
                    status=r.status.value,
                    risk_level=r.risk_level,
                    accessible_wheelchair=r.accessible_wheelchair,
                    has_stairs=r.has_stairs,
                    travel_time_minutes=r.travel_time_minutes,
                    coordinates=r.coordinates,
                    is_demo=True
                )
                db.add(road)

        # 6. Initial Audit Log
        if db.query(AuditLog).count() == 0:
            log = AuditLog(
                user_id="user-admin-01",
                action="SYSTEM_INIT",
                event_type="BOOTSTRAP",
                details={"message": "ACT persistent database initialized and seeded successfully."}
            )
            db.add(log)

        db.commit()
    finally:
        db.close()
