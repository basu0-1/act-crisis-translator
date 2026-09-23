"""
API: Risk Calculation Endpoint
"""
from fastapi import APIRouter
from app.schemas.risk import PersonalRisk
from app.data.mock_database import db
from app.agents.risk_analyst import RiskAnalystAgent

router = APIRouter(prefix="/risk", tags=["Personal Risk"])


@router.post("/calculate", response_model=PersonalRisk)
def calculate_risk():
    alert = db.get_alert()
    user = db.get_user()
    return RiskAnalystAgent.analyze(alert, user)
