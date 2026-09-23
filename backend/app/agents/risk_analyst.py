"""
Agent 2: Risk Analyst
Question: "How does this affect THIS person?"
Computes personalized risk and transparent rationale.
"""
from typing import Dict, Any
from app.schemas.alert import Alert
from app.schemas.user import UserProfile
from app.schemas.risk import PersonalRisk
from app.engines.risk_engine import RiskEngine


class RiskAnalystAgent:
    """Agent 2: Evaluates personal exposure, vulnerability, and response window"""

    @classmethod
    def analyze(cls, alert: Alert, user: UserProfile) -> PersonalRisk:
        return RiskEngine.calculate_risk(alert, user)
