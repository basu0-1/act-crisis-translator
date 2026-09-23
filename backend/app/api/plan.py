"""
API: Action Plan Generation & Localization
"""
from fastapi import APIRouter, Query
from datetime import datetime, timezone
from app.schemas.user import LanguageType
from app.schemas.plan import ActionPlan
from app.data.mock_database import db
from app.agents.risk_analyst import RiskAnalystAgent
from app.agents.route_analyst import RouteAnalystAgent
from app.agents.action_planner import ActionPlannerAgent
from app.agents.communication_agent import CommunicationAgent
from app.engines.decision_engine import DecisionEngine

router = APIRouter(prefix="/plan", tags=["Action Plan"])


@router.post("/generate", response_model=ActionPlan)
def generate_action_plan(language: LanguageType = Query(LanguageType.EN)):
    alert = db.get_alert()
    user = db.get_user()
    roads = db.get_roads()
    shelters = db.get_shelters()

    # 1. Compute personal risk
    risk = RiskAnalystAgent.analyze(alert, user)

    # 2. Compute route recommendation
    route_rec = RouteAnalystAgent.analyze(roads, shelters, user)

    # 3. Formulate strict verified structured facts
    verified_facts = DecisionEngine.build_verified_facts(alert, user, risk, route_rec)

    # 4. Generate structured action plan
    base_plan = ActionPlannerAgent.generate_plan(verified_facts, alert.provenance, language=LanguageType.EN)

    # 5. Localize via Communication Agent
    final_plan = CommunicationAgent.format_and_localize(base_plan, language)

    # Cache for offline support
    db.cached_plan = final_plan
    db.cached_timestamp = datetime.now(timezone.utc).isoformat()

    return final_plan


@router.get("/cached", response_model=ActionPlan)
def get_cached_action_plan():
    if db.cached_plan:
        cached = db.cached_plan.model_copy()
        cached.is_cached = True
        return cached
    # Fallback to generating one
    return generate_action_plan(LanguageType.EN)
