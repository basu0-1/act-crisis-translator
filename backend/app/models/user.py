"""
User Database Model
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, JSON
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(32), default="user", nullable=False)  # "user" or "admin"
    name = Column(String(128), default="End User", nullable=False)
    mobility = Column(String(32), default="limited", nullable=False)
    transport = Column(String(32), default="walking", nullable=False)
    companions = Column(String(32), default="none", nullable=False)
    language = Column(String(8), default="en", nullable=False)
    lat = Column(Float, default=28.6139, nullable=True)
    lng = Column(Float, default=77.2090, nullable=True)
    accessibility_requirements = Column(JSON, default=lambda: ["Step-free access", "Paved pathways"])
    critical_needs = Column(JSON, default=lambda: ["Prescription medication kit"])
    notification_preferences = Column(JSON, default=lambda: {"sound": True, "vibrate": True, "high_priority": True})
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
