"""
Route & Shelter Schemas for ACT
"""
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class RoadStatus(str, Enum):
    SAFE = "safe"
    FLOODED = "flooded"
    BLOCKED = "blocked"
    CONGESTED = "congested"
    INACCESSIBLE = "inaccessible"


class ShelterStatus(str, Enum):
    OPEN = "open"
    FULL = "full"
    CLOSED = "closed"
    UNAVAILABLE = "unavailable"


class Road(BaseModel):
    id: str
    name: str
    start_node: str
    end_node: str
    status: RoadStatus
    risk_level: float = Field(..., ge=0.0, le=1.0)
    accessible_wheelchair: bool = True
    has_stairs: bool = False
    travel_time_minutes: int
    coordinates: List[List[float]] = Field(default_factory=list)


class Shelter(BaseModel):
    id: str
    name: str
    type: str = "shelter"  # shelter, hospital, safe_haven
    lat: float
    lng: float
    capacity: int
    current_occupancy: int
    status: ShelterStatus
    is_accessible: bool = True
    updated_at: str
    address: str = ""

    @property
    def has_capacity(self) -> bool:
        return self.status == ShelterStatus.OPEN and self.current_occupancy < self.capacity


class RouteStep(BaseModel):
    instruction: str
    road_name: str
    distance_meters: int
    estimated_seconds: int
    warning: Optional[str] = None


class RouteOption(BaseModel):
    route_id: str
    name: str
    destination_id: str
    destination_name: str
    total_distance_km: float
    estimated_time_minutes: int
    safety_score: int  # 0 to 100
    is_accessible: bool
    has_stairs: bool
    status: RoadStatus = RoadStatus.SAFE
    steps: List[RouteStep] = Field(default_factory=list)
    path_coordinates: List[List[float]] = Field(default_factory=list)


class RouteRecommendation(BaseModel):
    recommended_route: Optional[RouteOption] = None
    destination: Optional[Shelter] = None
    destination_type: str = "shelter"
    estimated_time_minutes: int = 0
    safety_score: int = 0
    reasons: List[str] = Field(default_factory=list)
    rejected_routes: List[dict] = Field(default_factory=list)
    all_routes: List[RouteOption] = Field(default_factory=list)
    status: str = "available"  # available, recalculating, insufficient_info
