import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, 
    Text, Float, Enum, JSON, Index
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class UserRole(str, enum.Enum):
    END_USER = "END_USER"
    ADMIN = "ADMIN"


class MobilityTier(str, enum.Enum):
    NORMAL = "NORMAL"
    LIMITED_WALKING = "LIMITED_WALKING"
    WHEELCHAIR = "WHEELCHAIR"


class LanguageCode(str, enum.Enum):
    EN = "en"
    HI = "hi"
    JA = "ja"


class EmergencyType(str, enum.Enum):
    FLOOD = "FLOOD"
    WILDFIRE = "WILDFIRE"
    EARTHQUAKE = "EARTHQUAKE"
    STORM = "STORM"
    CHEMICAL_HAZARD = "CHEMICAL_HAZARD"


class SeverityLevel(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    SEVERE = "SEVERE"
    EXTREME = "EXTREME"


class CertaintyLevel(str, enum.Enum):
    POSSIBLE = "POSSIBLE"
    LIKELY = "LIKELY"
    OBSERVED = "OBSERVED"


class DataStatus(str, enum.Enum):
    LIVE = "LIVE"
    DEMO = "DEMO"
    CACHED = "CACHED"
    UNAVAILABLE = "UNAVAILABLE"


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ShelterStatus(str, enum.Enum):
    OPEN = "OPEN"
    FULL = "FULL"
    CLOSED = "CLOSED"
    UNAVAILABLE = "UNAVAILABLE"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.END_USER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    preferences = relationship("UserPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="user", cascade="all, delete-orphan")
    routes = relationship("Route", back_populates="user", cascade="all, delete-orphan")
    action_plans = relationship("ActionPlan", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    preferred_language = Column(Enum(LanguageCode), default=LanguageCode.EN, nullable=False)
    mobility = Column(Enum(MobilityTier), default=MobilityTier.NORMAL, nullable=False)
    location_name = Column(String(255), default="Central Riverside District")
    location_lat = Column(Float, default=37.7749)
    location_lon = Column(Float, default=-122.4194)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="profile")


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    theme = Column(String(20), default="system")  # light, dark, system
    notifications_enabled = Column(Boolean, default=True)
    sound_alerts_enabled = Column(Boolean, default=True)
    high_contrast = Column(Boolean, default=False)
    offline_cache_enabled = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="preferences")


class AlertSource(Base):
    __tablename__ = "alert_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    source_type = Column(String(100), default="METEOROLOGICAL_AGENCY")  # GOVERNMENT, WEATHER_SERVICE, SIMULATION
    url = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=True)
    trust_score = Column(Float, default=0.98)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    alerts = relationship("EmergencyAlert", back_populates="source")
    shelters = relationship("Shelter", back_populates="source")


class EmergencyAlert(Base):
    __tablename__ = "emergency_alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    emergency_type = Column(Enum(EmergencyType), default=EmergencyType.FLOOD, nullable=False)
    severity = Column(Enum(SeverityLevel), default=SeverityLevel.SEVERE, nullable=False)
    certainty = Column(Enum(CertaintyLevel), default=CertaintyLevel.OBSERVED, nullable=False)
    hazard_polygon_geojson = Column(JSON, nullable=True)  # GeoJSON representation of hazard boundary
    time_to_impact_minutes = Column(Integer, default=32, nullable=False)
    source_id = Column(Integer, ForeignKey("alert_sources.id"), nullable=True)
    verification_status = Column(String(100), default="VERIFIED_BY_AUTHORITY")
    data_status = Column(Enum(DataStatus), default=DataStatus.DEMO, nullable=False)
    is_active = Column(Boolean, default=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    source = relationship("AlertSource", back_populates="alerts")
    risk_assessments = relationship("RiskAssessment", back_populates="alert")
    routes = relationship("Route", back_populates="alert")
    action_plans = relationship("ActionPlan", back_populates="alert")


class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity_total = Column(Integer, default=250, nullable=False)
    capacity_available = Column(Integer, default=112, nullable=False)
    wheelchair_accessible = Column(Boolean, default=True, nullable=False)
    medical_support = Column(Boolean, default=True, nullable=False)
    pet_friendly = Column(Boolean, default=False, nullable=False)
    status = Column(Enum(ShelterStatus), default=ShelterStatus.OPEN, nullable=False)
    source_id = Column(Integer, ForeignKey("alert_sources.id"), nullable=True)
    last_verified = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    source = relationship("AlertSource", back_populates="shelters")
    routes = relationship("Route", back_populates="shelter")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    alert_id = Column(Integer, ForeignKey("emergency_alerts.id", ondelete="CASCADE"), nullable=False)
    risk_score = Column(Float, nullable=False)  # 0 to 100
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.HIGH, nullable=False)
    risk_factors = Column(JSON, nullable=False)  # breakdown of factors: severity, proximity, mobility, time
    action_window_minutes = Column(Integer, default=32, nullable=False)
    disclaimer = Column(String(255), default="Prototype decision-support score")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="risk_assessments")
    alert = relationship("EmergencyAlert", back_populates="risk_assessments")


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    alert_id = Column(Integer, ForeignKey("emergency_alerts.id", ondelete="CASCADE"), nullable=False)
    shelter_id = Column(Integer, ForeignKey("shelters.id"), nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lon = Column(Float, nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lon = Column(Float, nullable=False)
    distance_meters = Column(Integer, nullable=False)
    estimated_time_minutes = Column(Integer, nullable=False)
    mobility_tier = Column(Enum(MobilityTier), default=MobilityTier.NORMAL, nullable=False)
    waypoints_geojson = Column(JSON, nullable=False)
    alternative_waypoints_geojson = Column(JSON, nullable=True)
    is_blocked = Column(Boolean, default=False, nullable=False)
    blocked_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="routes")
    alert = relationship("EmergencyAlert", back_populates="routes")
    shelter = relationship("Shelter", back_populates="routes")
    events = relationship("RouteEvent", back_populates="route", cascade="all, delete-orphan")


class RouteEvent(Base):
    __tablename__ = "route_events"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(100), nullable=False)  # ROAD_BLOCKED, ROUTE_RECALCULATED, HAZARD_EXPANDED
    description = Column(String(500), nullable=False)
    location_name = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    route = relationship("Route", back_populates="events")


class ActionPlan(Base):
    __tablename__ = "action_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    alert_id = Column(Integer, ForeignKey("emergency_alerts.id", ondelete="CASCADE"), nullable=False)
    do_now = Column(JSON, nullable=False)    # list of immediate actions
    do_next = Column(JSON, nullable=False)   # list of next steps
    avoid = Column(JSON, nullable=False)     # list of things to avoid
    if_then = Column(JSON, nullable=False)   # list of conditional instructions
    version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="action_plans")
    alert = relationship("EmergencyAlert", back_populates="action_plans")


class DemoScenario(Base):
    __tablename__ = "demo_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    scenario_data = Column(JSON, nullable=False)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # LOGIN, REGISTER, RISK_CALCULATED, ROUTE_RECALCULATED, ALERT_CREATED
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="audit_logs")


class SystemEvent(Base):
    __tablename__ = "system_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False)
    payload = Column(JSON, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)


# Indexing for high-performance lookup
Index("idx_alert_active", EmergencyAlert.is_active)
Index("idx_shelter_active_lat_lon", Shelter.is_active, Shelter.latitude, Shelter.longitude)
Index("idx_audit_timestamp", AuditLog.timestamp)
