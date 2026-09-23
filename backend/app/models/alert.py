"""
Emergency Alert Database Model
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime
from app.database import Base


class EmergencyAlert(Base):
    __tablename__ = "emergency_alerts"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    hazard_type = Column(String(64), default="flood", nullable=False)
    severity = Column(String(32), default="high", nullable=False)
    certainty = Column(String(32), default="likely", nullable=False)
    headline = Column(String(255), nullable=False)
    description = Column(String(1024), nullable=False)
    lat = Column(Float, default=28.6139, nullable=False)
    lng = Column(Float, default=77.2090, nullable=False)
    radius_km = Column(Float, default=5.0, nullable=False)
    time_to_impact_minutes = Column(Integer, default=32, nullable=False)
    required_action = Column(String(64), default="evacuate", nullable=False)
    source_level = Column(Integer, default=1, nullable=False)
    source_name = Column(String(255), default="Official Emergency Authority", nullable=False)
    source_type = Column(String(32), default="demo", nullable=False)  # "live", "demo", "cached"
    confidence = Column(Float, default=0.98, nullable=False)
    verified = Column(Boolean, default=True, nullable=False)
    is_demo = Column(Boolean, default=True, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
