from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import (
    EmergencyAlert, Route, RouteEvent, Shelter, ActionPlan, RiskAssessment, User
)
from app.auth.deps import get_current_user
from app.services.route_engine import RouteEngine
from app.services.action_plan_service import ActionPlanService
from app.services.risk_engine import RiskEngine

router = APIRouter(prefix="/demo", tags=["Demo Mode Simulator"])

@router.post("/trigger-roadblock")
def trigger_roadblock(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simulates the core scenario: Riverside Road becomes flooded & impassable.
    Triggers dynamic recalculation of user route, shelter, and action plan.
    """
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.is_active == True).first()
    if not alert:
        raise HTTPException(status_code=404, detail="No active alert found")

    route = db.query(Route).filter(
        Route.user_id == current_user.id,
        Route.alert_id == alert.id
    ).first()

    if not route:
        raise HTTPException(status_code=404, detail="No route found to recalculate")

    # Divert to Highland Crest Shelter
    highland_shelter = db.query(Shelter).filter(Shelter.name.like("%Highland%")).first()
    if not highland_shelter:
        highland_shelter = route.shelter

    primary_geojson, alt_geojson, dist_m, est_mins = RouteEngine.compute_route(
        origin_lat=route.origin_lat,
        origin_lon=route.origin_lon,
        shelter=highland_shelter,
        mobility=route.mobility_tier,
        is_recalculated=True
    )

    route.shelter_id = highland_shelter.id
    route.destination_lat = highland_shelter.latitude
    route.destination_lon = highland_shelter.longitude
    route.distance_meters = dist_m
    route.estimated_time_minutes = est_mins
    route.waypoints_geojson = primary_geojson
    route.alternative_waypoints_geojson = alt_geojson
    route.is_blocked = True
    route.blocked_reason = "Riverside Road Bridge: Rapid flood inundation (>45cm standing water)"

    # Add RouteEvent
    event = RouteEvent(
        route_id=route.id,
        event_type="ROAD_BLOCKED_DIVERSION",
        description="Riverside Road Bridge closed due to rapid flood inundation. Route diverted to Highland Crest via Ridge Ave.",
        location_name="Riverside Road Bridge",
        latitude=37.7780,
        longitude=-122.4140
    )
    db.add(event)

    # Regenerate Action Plan
    plan_dict = ActionPlanService.generate_plan(
        severity=alert.severity,
        mobility=route.mobility_tier,
        is_blocked=True,
        time_to_impact_minutes=alert.time_to_impact_minutes,
        shelter_name=highland_shelter.name
    )

    action_plan = db.query(ActionPlan).filter(
        ActionPlan.user_id == current_user.id,
        ActionPlan.alert_id == alert.id
    ).first()

    if action_plan:
        action_plan.do_now = plan_dict["do_now"]
        action_plan.do_next = plan_dict["do_next"]
        action_plan.avoid = plan_dict["avoid"]
        action_plan.if_then = plan_dict["if_then"]
        action_plan.version += 1

    db.commit()

    return {
        "status": "success",
        "message": "Simulated road block applied: Route recalculated to Highland Crest Evacuation Haven via Ridge Avenue.",
        "new_route_distance_meters": dist_m,
        "new_route_estimated_minutes": est_mins
    }


@router.post("/trigger-urgency")
def trigger_urgency(
    minutes: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simulates rapid onset: reduces time-to-impact to 10 minutes,
    elevating risk score and updating action urgency.
    """
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.is_active == True).first()
    if not alert:
        raise HTTPException(status_code=404, detail="No active alert found")

    alert.time_to_impact_minutes = minutes
    db.commit()

    # Re-evaluate risk
    profile = current_user.profile
    score, level, factors, action_win = RiskEngine.evaluate(
        alert=alert,
        mobility=profile.mobility if profile else "NORMAL",
        user_lat=profile.location_lat if profile else 37.7749,
        user_lon=profile.location_lon if profile else -122.4194
    )

    risk = db.query(RiskAssessment).filter(
        RiskAssessment.user_id == current_user.id,
        RiskAssessment.alert_id == alert.id
    ).first()

    if risk:
        risk.risk_score = score
        risk.risk_level = level
        risk.risk_factors = [f.model_dump() for f in factors]
        risk.action_window_minutes = action_win
        db.commit()

    return {
        "status": "success",
        "message": f"Time to impact shifted to {minutes} minutes. Risk score re-evaluated to {score}.",
        "new_risk_score": score,
        "new_action_window_minutes": action_win
    }


@router.post("/reset")
def reset_demo(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Resets the demo back to the initial baseline state (32m window, open road).
    """
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.is_active == True).first()
    if alert:
        alert.time_to_impact_minutes = 32

    # Reset route
    route = db.query(Route).filter(Route.user_id == current_user.id).first()
    civic_shelter = db.query(Shelter).filter(Shelter.name.like("%Civic%")).first()

    if route and civic_shelter:
        primary_geojson, alt_geojson, dist_m, est_mins = RouteEngine.compute_route(
            origin_lat=route.origin_lat,
            origin_lon=route.origin_lon,
            shelter=civic_shelter,
            mobility=route.mobility_tier,
            is_recalculated=False
        )
        route.shelter_id = civic_shelter.id
        route.destination_lat = civic_shelter.latitude
        route.destination_lon = civic_shelter.longitude
        route.distance_meters = dist_m
        route.estimated_time_minutes = est_mins
        route.waypoints_geojson = primary_geojson
        route.alternative_waypoints_geojson = alt_geojson
        route.is_blocked = False
        route.blocked_reason = None

        # Reset plan
        plan_dict = ActionPlanService.generate_plan(
            severity=alert.severity if alert else None,
            mobility=route.mobility_tier,
            is_blocked=False,
            time_to_impact_minutes=32,
            shelter_name=civic_shelter.name
        )
        action_plan = db.query(ActionPlan).filter(ActionPlan.user_id == current_user.id).first()
        if action_plan:
            action_plan.do_now = plan_dict["do_now"]
            action_plan.do_next = plan_dict["do_next"]
            action_plan.avoid = plan_dict["avoid"]
            action_plan.if_then = plan_dict["if_then"]

    # Clear route events
    if route:
        db.query(RouteEvent).filter(RouteEvent.route_id == route.id).delete()

    db.commit()

    return {"status": "success", "message": "Demo reset to initial baseline state"}
