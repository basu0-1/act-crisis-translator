"""
Simulation Engine Schemas for ACT
"""
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.alert import Alert, AlertSeverity, HazardType
from app.schemas.user import UserProfile, MobilityType, LanguageType
from app.schemas.route import Road, Shelter, RouteRecommendation, RoadStatus
from app.schemas.risk import PersonalRisk
from app.schemas.plan import ActionPlan


class SimulationEventType(str, Enum):
    ROAD_BLOCKED = "road_blocked"
    ROAD_CLEARED = "road_cleared"
    MOBILITY_CHANGED = "mobility_changed"
    SEVERITY_CHANGED = "severity_changed"
    TIME_REDUCED = "time_reduced"
    OFFLINE_TOGGLED = "offline_toggled"
    LANGUAGE_CHANGED = "language_changed"
    LOCATION_CHANGED = "location_changed"
    SITUATION_CHANGED = "situation_changed"
    SHELTER_UNAVAILABLE = "shelter_unavailable"
    RESET = "reset"


class SimulationEvent(BaseModel):
    event_type: SimulationEventType
    road_id: Optional[str] = None
    new_road_status: Optional[RoadStatus] = None
    mobility: Optional[MobilityType] = None
    severity: Optional[AlertSeverity] = None
    time_to_impact_minutes: Optional[int] = None
    is_offline: Optional[bool] = None
    language: Optional[LanguageType] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    hazard_type: Optional[HazardType] = None
    shelter_id: Optional[str] = None


class SimulationState(BaseModel):
    alert: Alert
    user: UserProfile
    roads: List[Road]
    shelters: List[Shelter]
    risk: PersonalRisk
    route_recommendation: RouteRecommendation
    action_plan: ActionPlan
    is_offline: bool = False
    last_event_description: str = "System initialized in default state."
