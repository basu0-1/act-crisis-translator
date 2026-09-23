"""
Action Plan & Multilingual Schemas for ACT
"""
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.alert import SourceProvenance
from app.schemas.user import LanguageType


class IfThenRule(BaseModel):
    condition: str
    action: str
    trigger_event: str


class ActionPlan(BaseModel):
    plan_id: str
    timestamp: str
    language: LanguageType
    hazard: str
    risk_score: int
    risk_level: str
    action_window_minutes: int
    destination_shelter: str
    route_summary: str
    now: List[str] = Field(default_factory=list)
    next: List[str] = Field(default_factory=list)
    avoid: List[str] = Field(default_factory=list)
    if_then: List[IfThenRule] = Field(default_factory=list)
    source_provenance: SourceProvenance
    is_cached: bool = False
    offline_ready: bool = True
    disclaimer: str = "ACT provides personalized emergency guidance based on verified data. Follow local authorities in life-safety emergencies."
    failsafe_status: Optional[str] = None  # None or "⚠️ INSUFFICIENT INFORMATION"
    failsafe_reason: Optional[str] = None
