"""
Standard Enterprise API v1 Router for ACT (/api/*)
Provides full enterprise endpoints with complete backward compatibility.
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from app.database import get_db
from app.auth.dependencies import get_current_user, require_admin, get_current_user_optional
from app.models.user import User
from app.schemas.user import UserProfile, LanguageType
from app.api.auth import UserRegisterRequest, UserLoginRequest, AuthResponse
from app.schemas.alert import Alert
from app.schemas.risk import PersonalRisk
from app.schemas.plan import ActionPlan
from app.schemas.simulation import SimulationState, SimulationEvent, SimulationEventType
from app.engines.alert_engine import AlertEngine
from app.engines.risk_engine import RiskEngine
from app.engines.route_engine import RouteEngine
from app.engines.decision_engine import DecisionEngine
from app.api import health, auth, alerts, user, risk, route, plan, simulate, admin

router = APIRouter(tags=["Enterprise API v1"])


# 1. Health Contract
@router.get("/health")
def api_health():
    return health.get_health()


# 2. Complete Current Decision State
@router.get("/decision/current", response_model=SimulationState)
def get_current_decision_state():
    return simulate.get_simulation_state()


# 3. Killer Roadblock Demo Controls
@router.post("/demo/trigger-roadblock", response_model=SimulationState)
def demo_trigger_roadblock(db: Session = Depends(get_db)):
    req = SimulationEvent(event_type=SimulationEventType.ROAD_BLOCKED, road_id="R3")
    res = simulate.trigger_simulation_event(req)
    # Automatically log timeline event to database per user with timestamp
    try:
        user.record_timeline_event(
            user.TimelineEventCreate(
                user_id="demo_user_01",
                event_text=res.last_event_description,
                event_type="roadblock_recalculation"
            ),
            None,
            db
        )
    except Exception:
        pass
    return res


@router.post("/demo/reset", response_model=SimulationState)
def demo_reset(db: Session = Depends(get_db)):
    res = simulate.reset_simulation()
    try:
        user.record_timeline_event(
            user.TimelineEventCreate(
                user_id="demo_user_01",
                event_text="Simulation reset to default state.",
                event_type="reset"
            ),
            None,
            db
        )
    except Exception:
        pass
    return res


# 4. Trusted Source Hierarchy Catalog
@router.get("/admin/sources")
def get_trusted_sources():
    return AlertEngine.get_source_hierarchy_catalog()


# 5. Route & Shelter Endpoints
@router.get("/routes/shelters")
def api_get_shelters():
    return route.get_shelters()


@router.get("/routes/roads")
def api_get_roads():
    return route.get_roads()


@router.post("/routes/recalculate")
def api_recalculate_route(
    mobility: Optional[str] = None
):
    if mobility:
        from app.schemas.user import MobilityType
        try:
            m = MobilityType(mobility.lower())
            req = SimulationEvent(event_type=SimulationEventType.MOBILITY_CHANGED, mobility=m)
            simulate.trigger_simulation_event(req)
        except Exception:
            pass
    return route.recalculate_route()


# 6. Active Alert & Analysis
@router.get("/alerts/active")
def api_active_alert():
    return alerts.get_active_alert()


@router.get("/alerts/analysis")
def api_alert_analysis():
    return alerts.get_alert_analysis()


# 7. Risk Calculation
@router.post("/risk/calculate")
def api_calculate_risk(user_profile: Optional[UserProfile] = None):
    return risk.calculate_personal_risk(user_profile)


# 8. Action Plan Generation
@router.post("/plan/generate")
def api_generate_plan(language: LanguageType = LanguageType.EN):
    return plan.generate_plan(language=language)


# 9. Auth & User Profile Passthroughs
@router.post("/auth/register", response_model=AuthResponse)
def api_register(user_in: UserRegisterRequest, db: Session = Depends(get_db)):
    return auth.register_user(user_in, db)


@router.post("/auth/login", response_model=AuthResponse)
def api_login(user_in: UserLoginRequest, db: Session = Depends(get_db)):
    return auth.login_user(user_in, db)


@router.get("/auth/me")
def api_get_me(current_user: User = Depends(get_current_user)):
    return auth.get_current_user_profile(current_user)


@router.get("/user/profile")
def api_get_user_profile():
    return user.get_profile()


@router.post("/user/profile")
def api_update_user_profile(user_data: UserProfile):
    return user.update_profile(user_data)


# 10. User Timeline Event Persistence in Database
@router.post("/user/timeline-event")
def api_record_timeline_event(
    event: user.TimelineEventCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    return user.record_timeline_event(event, current_user, db)


@router.get("/user/timeline-events")
def api_get_timeline_events(
    user_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    return user.get_user_timeline_events(user_id, current_user, db)
