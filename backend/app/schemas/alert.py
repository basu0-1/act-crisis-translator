"""
Alert Schemas for ACT
"""
from enum import Enum, IntEnum
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class HazardType(str, Enum):
    FLOOD = "flood"
    WILDFIRE = "wildfire"
    CYCLONE = "cyclone"
    EARTHQUAKE = "earthquake"
    EXTREME_HEAT = "extreme_heat"
    URBAN_EMERGENCY = "urban_emergency"


class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EXTREME = "extreme"


class AlertCertainty(str, Enum):
    POSSIBLE = "possible"
    LIKELY = "likely"
    OBSERVED = "observed"


class SourceLevel(IntEnum):
    LEVEL_1_OFFICIAL = 1          # Official emergency authority (Highest Trust)
    LEVEL_2_INFRASTRUCTURE = 2    # Trusted infrastructure / meteorological agency
    LEVEL_3_VERIFIED_LOCAL = 3    # Verified on-ground responder report
    LEVEL_4_UNVERIFIED_USER = 4   # Crowdsourced unverified report


class SourceProvenance(BaseModel):
    source_name: str = Field(..., description="Name of the reporting entity")
    source_level: SourceLevel = Field(..., description="Trust hierarchy level (1=Highest, 4=Lowest)")
    timestamp: str = Field(..., description="Timestamp of the issued report")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score from 0.0 to 1.0")
    verified: bool = Field(True, description="Whether the information is officially verified")
    source_url: Optional[str] = None


class AlertCreate(BaseModel):
    hazard_type: HazardType = HazardType.FLOOD
    severity: AlertSeverity = AlertSeverity.HIGH
    certainty: AlertCertainty = AlertCertainty.LIKELY
    headline: str
    description: str
    lat: float
    lng: float
    radius_km: float = 5.0
    time_to_impact_minutes: int = 32
    required_action: str = "evacuate"
    source_level: SourceLevel = SourceLevel.LEVEL_1_OFFICIAL
    provenance: Optional[SourceProvenance] = None


class Alert(BaseModel):
    id: str
    hazard_type: HazardType
    severity: AlertSeverity
    certainty: AlertCertainty
    headline: str
    description: str
    lat: float
    lng: float
    radius_km: float
    time_to_impact_minutes: int
    required_action: str
    source_level: SourceLevel
    provenance: SourceProvenance
    created_at: str
    active: bool = True
