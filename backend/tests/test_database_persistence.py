"""
Tests for Persistent Relational Database (SQLAlchemy) & Audit Logging
"""
import pytest
from app.database import SessionLocal, init_db
from app.models.user import User
from app.models.alert import EmergencyAlert
from app.models.infrastructure import ShelterEntity, RoadEntity, AuditLog


def test_database_initialization_and_seeding():
    init_db()
    db = SessionLocal()
    try:
        # Check users seeded
        users = db.query(User).all()
        assert len(users) >= 2
        admin = db.query(User).filter(User.role == "admin").first()
        assert admin is not None
        assert admin.email == "admin@emergency.ai"

        # Check shelters seeded
        shelters = db.query(ShelterEntity).all()
        assert len(shelters) >= 3

        # Check roads seeded
        roads = db.query(RoadEntity).all()
        assert len(roads) >= 5

        # Check alerts seeded
        alerts = db.query(EmergencyAlert).all()
        assert len(alerts) >= 1
    finally:
        db.close()
