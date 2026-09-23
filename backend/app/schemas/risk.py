"""
Risk Calculation Schemas for ACT
"""
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EXTREME = "extreme"


class RiskBreakdownItem(BaseModel):
    factor: str
    weight: float
    contribution: float
    explanation: str
    satisfied: bool


class PersonalRisk(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Prototype decision-support risk score (0-100)")
    level: RiskLevel
    estimated_action_window_minutes: int
    hazard_type: Optional[str] = "flood"
    reasons: List[str] = Field(default_factory=list)
    breakdown: List[RiskBreakdownItem] = Field(default_factory=list)
    prototype_disclaimer: str = "Prototype decision-support score: Not a medical or regulatory risk guarantee."
