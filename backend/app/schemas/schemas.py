from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field
from app.models.models import (
    UserRole, MobilityTier, LanguageCode, EmergencyType,
    SeverityLevel, CertaintyLevel, DataStatus, RiskLevel, ShelterStatus
)


# --- Auth Schemas ---

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    preferred_language: LanguageCode = LanguageCode.EN
    mobility: MobilityTier = MobilityTier.NORMAL


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_role: UserRole
    user_id: int
    full_name: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None


# --- User & Profile Schemas ---

class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    preferred_language: LanguageCode
    mobility: MobilityTier
    location_name: str
    location_lat: float
    location_lon: float
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    preferred_language: Optional[LanguageCode] = None
    mobility: Optional[MobilityTier] = None
    location_name: Optional[str] = None
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None


class UserPreferencesResponse(BaseModel):
    id: int
    user_id: int
    theme: str
    notifications_enabled: bool
    sound_alerts_enabled: bool
    high_contrast: bool
    offline_cache_enabled: bool
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserPreferencesUpdate(BaseModel):
    theme: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    sound_alerts_enabled: Optional[bool] = None
    high_contrast: Optional[bool] = None
    offline_cache_enabled: Optional[bool] = None


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime
    profile: Optional[UserProfileResponse] = None
    preferences: Optional[UserPreferencesResponse] = None

    model_config = {"from_attributes": True}


# --- Alert Schemas ---

class AlertSourceResponse(BaseModel):
    id: int
    name: str
    source_type: str
    url: Optional[str] = None
    is_verified: bool
    trust_score: float

    model_config = {"from_attributes": True}


class EmergencyAlertResponse(BaseModel):
    id: int
    title: str
    description: str
    emergency_type: EmergencyType
    severity: SeverityLevel
    certainty: CertaintyLevel
    hazard_polygon_geojson: Optional[Dict[str, Any]] = None
    time_to_impact_minutes: int
    source_id: Optional[int] = None
    source: Optional[AlertSourceResponse] = None
    verification_status: str
    data_status: DataStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EmergencyAlertCreate(BaseModel):
    title: str
    description: str
    emergency_type: EmergencyType = EmergencyType.FLOOD
    severity: SeverityLevel = SeverityLevel.SEVERE
    certainty: CertaintyLevel = CertaintyLevel.OBSERVED
    time_to_impact_minutes: int = 30
    hazard_polygon_geojson: Optional[Dict[str, Any]] = None
    source_id: Optional[int] = None
    data_status: DataStatus = DataStatus.DEMO
    is_active: bool = True


class EmergencyAlertUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[SeverityLevel] = None
    certainty: Optional[CertaintyLevel] = None
    time_to_impact_minutes: Optional[int] = None
    hazard_polygon_geojson: Optional[Dict[str, Any]] = None
    data_status: Optional[DataStatus] = None
    is_active: Optional[bool] = None


# --- Shelter Schemas ---

class ShelterResponse(BaseModel):
    id: int
    name: str
    address: str
    latitude: float
    longitude: float
    capacity_total: int
    capacity_available: int
    wheelchair_accessible: bool
    medical_support: bool
    pet_friendly: bool
    status: ShelterStatus
    last_verified: datetime
    is_active: bool
    source_id: Optional[int] = None
    source: Optional[AlertSourceResponse] = None

    model_config = {"from_attributes": True}


class ShelterCreate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    capacity_total: int = 200
    capacity_available: int = 100
    wheelchair_accessible: bool = True
    medical_support: bool = True
    pet_friendly: bool = False
    status: ShelterStatus = ShelterStatus.OPEN


# --- Risk Schemas ---

class RiskFactorDetail(BaseModel):
    name: str
    score_impact: float
    description: str
    severity_level: str


class RiskAssessmentResponse(BaseModel):
    id: Optional[int] = None
    user_id: int
    alert_id: int
    risk_score: float
    risk_level: RiskLevel
    risk_factors: List[RiskFactorDetail]
    action_window_minutes: int
    disclaimer: str = "Prototype decision-support score"
    created_at: datetime

    model_config = {"from_attributes": True}


class RiskCalculationRequest(BaseModel):
    alert_id: int
    mobility: Optional[MobilityTier] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


# --- Route Schemas ---

class RouteEventResponse(BaseModel):
    id: int
    route_id: int
    event_type: str
    description: str
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class RouteResponse(BaseModel):
    id: int
    user_id: int
    alert_id: int
    shelter_id: int
    shelter: Optional[ShelterResponse] = None
    origin_lat: float
    origin_lon: float
    destination_lat: float
    destination_lon: float
    distance_meters: int
    estimated_time_minutes: int
    mobility_tier: MobilityTier
    waypoints_geojson: Dict[str, Any]
    alternative_waypoints_geojson: Optional[Dict[str, Any]] = None
    is_blocked: bool
    blocked_reason: Optional[str] = None
    events: List[RouteEventResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RouteCalculationRequest(BaseModel):
    alert_id: int
    shelter_id: Optional[int] = None
    mobility: Optional[MobilityTier] = None
    origin_lat: Optional[float] = None
    origin_lon: Optional[float] = None


class RouteRecalculationRequest(BaseModel):
    route_id: int
    blockage_location: str = "Riverside Road Bridge"
    blockage_lat: float = 37.7780
    blockage_lon: float = -122.4140
    reason: str = "Rapid flood inundation detected on Riverside Road"


# --- Action Plan Schemas ---

class ActionItem(BaseModel):
    id: str
    text: str
    priority: str
    category: str
    icon: Optional[str] = None


class IfThenItem(BaseModel):
    id: str
    condition: str
    action: str
    severity: str


class ActionPlanResponse(BaseModel):
    id: Optional[int] = None
    user_id: int
    alert_id: int
    do_now: List[ActionItem]
    do_next: List[ActionItem]
    avoid: List[ActionItem]
    if_then: List[IfThenItem]
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Decision Support Aggregated View ---

class EmergencyDecisionResponse(BaseModel):
    alert: EmergencyAlertResponse
    risk: RiskAssessmentResponse
    route: RouteResponse
    shelter: ShelterResponse
    action_plan: ActionPlanResponse
    recent_events: List[RouteEventResponse]


# --- Admin & Audit Schemas ---

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    model_config = {"from_attributes": True}


class SystemStatsResponse(BaseModel):
    total_users: int
    active_alerts: int
    total_shelters: int
    open_shelters: int
    recalculations_count: int
    system_status: str
    environment: str
    version: str
