from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, EmergencyAlert, Shelter, Route, RouteEvent, MobilityTier, ActionPlan
from app.schemas.schemas import (
    RouteCalculationRequest, RouteRecalculationRequest, RouteResponse
)
from app.auth.deps import get_current_user
from app.services.route_engine import RouteEngine
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

    # Select shelter
    if req.shelter_id:
        shelter = db.query(Shelter).filter(Shelter.id == req.shelter_id).first()
    else:
        # Default to first active open shelter (or wheelchair accessible if needed)
        mobility = req.mobility or (current_user.profile.mobility if current_user.profile else MobilityTier.NORMAL)
        shelter_query = db.query(Shelter).filter(Shelter.is_active == True)
        if mobility == MobilityTier.WHEELCHAIR:
            shelter_query = shelter_query.filter(Shelter.wheelchair_accessible == True)
        shelter = shelter_query.first()

    if not shelter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No suitable shelter available")

    mobility = req.mobility or (current_user.profile.mobility if current_user.profile else MobilityTier.NORMAL)
    origin_lat = req.origin_lat or (current_user.profile.location_lat if current_user.profile else 37.7749)
    origin_lon = req.origin_lon or (current_user.profile.location_lon if current_user.profile else -122.4194)

    primary_geojson, alt_geojson, dist_m, est_mins = RouteEngine.compute_route(
        origin_lat=origin_lat,
        origin_lon=origin_lon,
        shelter=shelter,
        mobility=mobility,
        is_recalculated=False
    )

    # Check for existing route
    route = db.query(Route).filter(
        Route.user_id == current_user.id,
        Route.alert_id == alert.id
    ).first()

    if not route:
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
            is_blocked=False
        )
        db.add(route)
    else:
        route.shelter_id = shelter.id
        route.distance_meters = dist_m
        route.estimated_time_minutes = est_mins
        route.mobility_tier = mobility
        route.waypoints_geojson = primary_geojson
        route.alternative_waypoints_geojson = alt_geojson
        route.is_blocked = False
        route.blocked_reason = None

    db.commit()
    db.refresh(route)

    # Also update/generate Action Plan
    plan_dict = ActionPlanService.generate_plan(
        severity=alert.severity,
        mobility=mobility,
        is_blocked=False,
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
