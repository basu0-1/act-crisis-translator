from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import (
    User, EmergencyAlert, Shelter, RiskAssessment, Route, RouteEvent, ActionPlan, MobilityTier
)
from app.schemas.schemas import EmergencyDecisionResponse
from app.auth.deps import get_current_user
from app.services.risk_engine import RiskEngine
from app.services.route_engine import RouteEngine
from app.services.action_plan_service import ActionPlanService

router = APIRouter(prefix="/decision", tags=["Emergency Decision"])

@router.get("/current", response_model=EmergencyDecisionResponse)
def get_current_decision_package(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Get primary active alert
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.is_active == True).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active emergency alert found"
        )
    
    profile = current_user.profile
    mobility = profile.mobility if profile else MobilityTier.NORMAL
    user_lat = profile.location_lat if profile else 37.7749
    user_lon = profile.location_lon if profile else -122.4194

    # 2. Get or calculate Risk Assessment
    risk = db.query(RiskAssessment).filter(
        RiskAssessment.user_id == current_user.id,
        RiskAssessment.alert_id == alert.id
    ).first()

    if not risk:
        score, level, factors, action_win = RiskEngine.evaluate(alert, mobility, user_lat, user_lon)
        factors_dict = [f.model_dump() for f in factors]
        risk = RiskAssessment(
            user_id=current_user.id,
            alert_id=alert.id,
            risk_score=score,
            risk_level=level,
            risk_factors=factors_dict,
            action_window_minutes=action_win,
            disclaimer="Prototype decision-support score"
        )
        db.add(risk)
        db.commit()
        db.refresh(risk)

    # 3. Get or calculate Route
    route = db.query(Route).filter(
        Route.user_id == current_user.id,
        Route.alert_id == alert.id
    ).first()

    if not route:
        # Choose shelter
        shelter_q = db.query(Shelter).filter(Shelter.is_active == True)
        if mobility == MobilityTier.WHEELCHAIR:
            shelter_q = shelter_q.filter(Shelter.wheelchair_accessible == True)
        shelter = shelter_q.first()

        primary_pts, alt_pts, dist_m, est_m = RouteEngine.compute_route(
            origin_lat=user_lat,
            origin_lon=user_lon,
            shelter=shelter,
            mobility=mobility,
            is_recalculated=False
        )

        route = Route(
            user_id=current_user.id,
            alert_id=alert.id,
            shelter_id=shelter.id,
            origin_lat=user_lat,
            origin_lon=user_lon,
            destination_lat=shelter.latitude,
            destination_lon=shelter.longitude,
            distance_meters=dist_m,
            estimated_time_minutes=est_m,
            mobility_tier=mobility,
            waypoints_geojson=primary_pts,
            alternative_waypoints_geojson=alt_pts,
            is_blocked=False
        )
        db.add(route)
        db.commit()
        db.refresh(route)
    else:
        shelter = route.shelter

    # 4. Get or generate Action Plan
    action_plan = db.query(ActionPlan).filter(
        ActionPlan.user_id == current_user.id,
        ActionPlan.alert_id == alert.id
    ).first()

    if not action_plan:
        plan_dict = ActionPlanService.generate_plan(
            severity=alert.severity,
            mobility=mobility,
            is_blocked=route.is_blocked,
            time_to_impact_minutes=alert.time_to_impact_minutes,
            shelter_name=shelter.name
        )
        action_plan = ActionPlan(
            user_id=current_user.id,
            alert_id=alert.id,
            do_now=plan_dict["do_now"],
            do_next=plan_dict["do_next"],
            avoid=plan_dict["avoid"],
            if_then=plan_dict["if_then"],
            version=1
        )
        db.add(action_plan)
        db.commit()
        db.refresh(action_plan)

    # 5. Recent events
    events = db.query(RouteEvent).filter(RouteEvent.route_id == route.id).order_by(RouteEvent.created_at.desc()).all()

    return EmergencyDecisionResponse(
        alert=alert,
        risk=risk,
        route=route,
        shelter=shelter,
        action_plan=action_plan,
        recent_events=events
    )
