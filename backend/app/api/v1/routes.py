from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import (
    User, EmergencyAlert, Shelter, Route, RouteEvent, MobilityTier, ActionPlan, RiskAssessment
)
from app.schemas.schemas import (
    RouteCalculationRequest, RouteRecalculationRequest, RouteResponse
)
from app.auth.deps import get_current_user
from app.services.route_engine import RouteEngine
from app.services.risk_engine import RiskEngine
from app.services.action_plan_service import ActionPlanService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/routes", tags=["Routes"])

@router.post("/calculate", response_model=RouteResponse)
def calculate_route(
    req: RouteCalculationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.id == req.alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    # Check for existing route
    existing_route = db.query(Route).filter(
        Route.user_id == current_user.id,
        Route.alert_id == alert.id
    ).first()

    is_currently_blocked = existing_route.is_blocked if existing_route else False

    # Determine mobility tier from request, existing route, or profile
    mobility = req.mobility or (existing_route.mobility_tier if existing_route else None) or (current_user.profile.mobility if current_user.profile else MobilityTier.NORMAL)

    # Keep user profile mobility synchronized
    if current_user.profile and current_user.profile.mobility != mobility:
        current_user.profile.mobility = mobility

    # Select shelter
    if req.shelter_id:
        shelter = db.query(Shelter).filter(Shelter.id == req.shelter_id).first()
    elif is_currently_blocked:
        highland_shelter = db.query(Shelter).filter(Shelter.name.like("%Highland%")).first()
        shelter = highland_shelter if highland_shelter else (existing_route.shelter if existing_route else None)
    else:
        # Default to first active open shelter (or wheelchair accessible if needed)
        shelter_query = db.query(Shelter).filter(Shelter.is_active == True)
        if mobility == MobilityTier.WHEELCHAIR:
            shelter_query = shelter_query.filter(Shelter.wheelchair_accessible == True)
        shelter = shelter_query.first()

    if not shelter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No suitable shelter available")

    origin_lat = req.origin_lat or (existing_route.origin_lat if existing_route else None) or (current_user.profile.location_lat if current_user.profile else 37.7749)
    origin_lon = req.origin_lon or (existing_route.origin_lon if existing_route else None) or (current_user.profile.location_lon if current_user.profile else -122.4194)

    primary_geojson, alt_geojson, dist_m, est_mins = RouteEngine.compute_route(
        origin_lat=origin_lat,
        origin_lon=origin_lon,
        shelter=shelter,
        mobility=mobility,
        is_recalculated=is_currently_blocked
    )

    if not existing_route:
        route = Route(
            user_id=current_user.id,
            alert_id=alert.id,
            shelter_id=shelter.id,
            origin_lat=origin_lat,
            origin_lon=origin_lon,
            destination_lat=shelter.latitude,
            destination_lon=shelter.longitude,
            distance_meters=dist_m,
            estimated_time_minutes=est_mins,
            mobility_tier=mobility,
            waypoints_geojson=primary_geojson,
            alternative_waypoints_geojson=alt_geojson,
            is_blocked=is_currently_blocked
        )
        db.add(route)
    else:
        route = existing_route
        route.shelter_id = shelter.id
        route.destination_lat = shelter.latitude
        route.destination_lon = shelter.longitude
        route.distance_meters = dist_m
        route.estimated_time_minutes = est_mins
        route.mobility_tier = mobility
        route.waypoints_geojson = primary_geojson
        route.alternative_waypoints_geojson = alt_geojson
        route.is_blocked = is_currently_blocked

    db.commit()
    db.refresh(route)

    # Also update/generate Action Plan
    plan_dict = ActionPlanService.generate_plan(
        severity=alert.severity,
        mobility=mobility,
        is_blocked=is_currently_blocked,
        time_to_impact_minutes=alert.time_to_impact_minutes,
        shelter_name=shelter.name
    )

    action_plan = db.query(ActionPlan).filter(
        ActionPlan.user_id == current_user.id,
        ActionPlan.alert_id == alert.id
    ).first()

    if not action_plan:
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
    else:
        action_plan.do_now = plan_dict["do_now"]
        action_plan.do_next = plan_dict["do_next"]
        action_plan.avoid = plan_dict["avoid"]
        action_plan.if_then = plan_dict["if_then"]
        action_plan.version += 1

    # Keep risk assessment synchronized with new mobility tier
    risk = db.query(RiskAssessment).filter(
        RiskAssessment.user_id == current_user.id,
        RiskAssessment.alert_id == alert.id
    ).first()
    if risk:
        score, level, factors, action_win = RiskEngine.evaluate(alert, mobility, origin_lat, origin_lon)
        risk.risk_score = score
        risk.risk_level = level
        risk.risk_factors = [f.model_dump() for f in factors]
        risk.action_window_minutes = action_win

    db.commit()

    return route


@router.post("/recalculate", response_model=RouteResponse)
def recalculate_route(
    req: RouteRecalculationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    route = db.query(Route).filter(
        Route.id == req.route_id,
        Route.user_id == current_user.id
    ).first()

    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found or unauthorized"
        )

    alert = db.query(EmergencyAlert).filter(EmergencyAlert.id == route.alert_id).first()
    
    # In road block scenario, reroute to Highland Crest Evacuation Haven (shelter 2) if present
    highland_shelter = db.query(Shelter).filter(Shelter.name.like("%Highland%")).first()
    if highland_shelter:
        shelter = highland_shelter
    else:
        shelter = route.shelter

    primary_geojson, alt_geojson, dist_m, est_mins = RouteEngine.compute_route(
        origin_lat=route.origin_lat,
        origin_lon=route.origin_lon,
        shelter=shelter,
        mobility=route.mobility_tier,
        is_recalculated=True
    )

    route.shelter_id = shelter.id
    route.destination_lat = shelter.latitude
    route.destination_lon = shelter.longitude
    route.distance_meters = dist_m
    route.estimated_time_minutes = est_mins
    route.waypoints_geojson = primary_geojson
    route.alternative_waypoints_geojson = alt_geojson
    route.is_blocked = True
    route.blocked_reason = req.reason

    # Add RouteEvent record
    event = RouteEvent(
        route_id=route.id,
        event_type="ROAD_BLOCKED_RECALCULATED",
        description=f"Road blockage at {req.blockage_location}: {req.reason}. Route recalculated via Ridge Avenue bypass.",
        location_name=req.blockage_location,
        latitude=req.blockage_lat,
        longitude=req.blockage_lon
    )
    db.add(event)

    # Regenerate Action Plan with road blocked state
    plan_dict = ActionPlanService.generate_plan(
        severity=alert.severity if alert else None,
        mobility=route.mobility_tier,
        is_blocked=True,
        time_to_impact_minutes=alert.time_to_impact_minutes if alert else 25,
        shelter_name=shelter.name
    )

    action_plan = db.query(ActionPlan).filter(
        ActionPlan.user_id == current_user.id,
        ActionPlan.alert_id == route.alert_id
    ).first()

    if action_plan:
        action_plan.do_now = plan_dict["do_now"]
        action_plan.do_next = plan_dict["do_next"]
        action_plan.avoid = plan_dict["avoid"]
        action_plan.if_then = plan_dict["if_then"]
        action_plan.version += 1

    db.commit()
    db.refresh(route)

    AuditService.log_action(
        db,
        action="ROUTE_RECALCULATED",
        resource_type="ROUTE",
        user_id=current_user.id,
        resource_id=str(route.id),
        details={"reason": req.reason, "new_eta": est_mins}
    )

    return route
