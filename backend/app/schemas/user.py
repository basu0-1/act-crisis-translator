"""
User Profile Schemas for ACT
"""
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class MobilityType(str, Enum):
    NORMAL = "normal"
    LIMITED = "limited"
    WHEELCHAIR = "wheelchair"


class TransportType(str, Enum):
    WALKING = "walking"
    BICYCLE = "bicycle"
    CAR = "car"
    PUBLIC_TRANSPORT = "public_transport"


class CompanionType(str, Enum):
    NONE = "none"
    CHILD = "child"
    ELDERLY = "elderly"
    PET = "pet"


class LanguageType(str, Enum):
    EN = "en"  # English
    HI = "hi"  # Hindi
    JA = "ja"  # Japanese
    BN = "bn"  # Bengali (বাংলা)
    OR = "or"  # Odia (ଓଡ଼ିଆ)
    UR = "ur"  # Urdu (اردو)


class UserProfile(BaseModel):
    id: str = "demo_user_01"
    name: str = "Demo User"
    lat: float = 28.6139  # Simulated City coordinate
    lng: float = 77.2090
    language: LanguageType = LanguageType.EN
    mobility: MobilityType = MobilityType.LIMITED
    transport: TransportType = TransportType.WALKING
    companions: CompanionType = CompanionType.NONE
    accessibility_requirements: List[str] = Field(
        default_factory=lambda: ["Ramp access required", "Avoid stairs", "Flat terrain preferred"]
    )
    critical_needs: List[str] = Field(
        default_factory=lambda: ["Continuous shelter access", "Prescription medication kit"]
    )
