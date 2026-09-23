"""
Infrastructure & Audit Database Models
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, JSON
from app.database import Base


class ShelterEntity(Base):
    __tablename__ = "shelters"

    id = Column(String(64), primary_key=True)
    name = Column(String(255), nullable=False)
    type = Column(String(64), default="shelter", nullable=False)  # "shelter", "hospital", "safe_haven"
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    capacity = Column(Integer, default=300, nullable=False)
    current_occupancy = Column(Integer, default=50, nullable=False)
    status = Column(String(32), default="open", nullable=False)  # "open", "full", "closed", "unavailable"
    is_accessible = Column(Boolean, default=True, nullable=False)
    address = Column(String(255), default="", nullable=False)
    is_demo = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class RoadEntity(Base):
    __tablename__ = "roads"

    id = Column(String(64), primary_key=True)
    name = Column(String(255), nullable=False)
    start_node = Column(String(64), nullable=False)
    end_node = Column(String(64), nullable=False)
    status = Column(String(32), default="safe", nullable=False)  # "safe", "flooded", "blocked", "congested", "inaccessible"
    risk_level = Column(Float, default=0.2, nullable=False)
    accessible_wheelchair = Column(Boolean, default=True, nullable=False)
    has_stairs = Column(Boolean, default=False, nullable=False)
    travel_time_minutes = Column(Integer, default=10, nullable=False)
    coordinates = Column(JSON, default=list)
    is_demo = Column(Boolean, default=True, nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), nullable=True)
    action = Column(String(128), nullable=False)
    event_type = Column(String(64), default="SYSTEM_EVENT", nullable=False)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class UserTimelineEvent(Base):
    __tablename__ = "user_timeline_events"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), nullable=False, index=True)
    event_text = Column(String(512), nullable=False)
    event_type = Column(String(64), default="system")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
