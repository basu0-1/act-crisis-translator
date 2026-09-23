"""
API: Judge Simulation Panel & Real-time State Machine
"""
from fastapi import APIRouter
from typing import Dict, Any
from app.schemas.simulation import SimulationEvent, SimulationState, SimulationEventType
from app.schemas.route import RoadStatus, ShelterStatus
from app.data.mock_database import db
from app.agents.risk_analyst import RiskAnalystAgent
from app.agents.route_analyst import RouteAnalystAgent
from app.agents.action_planner import ActionPlannerAgent
from app.agents.communication_agent import CommunicationAgent
from app.engines.decision_engine import DecisionEngine

router = APIRouter(prefix="/simulate", tags=["Simulation Control"])


@router.get("/state", response_model=SimulationState)
def get_simulation_state():
    alert = db.get_alert()
    user = db.get_user()
    roads = db.get_roads()
    shelters = db.get_shelters()

    risk = RiskAnalystAgent.analyze(alert, user)
    route_rec = RouteAnalystAgent.analyze(roads, shelters, user)
    facts = DecisionEngine.build_verified_facts(alert, user, risk, route_rec)
    base_plan = ActionPlannerAgent.generate_plan(facts, alert.provenance, user.language)
    localized_plan = CommunicationAgent.format_and_localize(base_plan, user.language)

    return SimulationState(
        alert=alert,
        user=user,
        roads=roads,
        shelters=shelters,
        risk=risk,
        route_recommendation=route_rec,
        action_plan=localized_plan,
        is_offline=db.is_offline,
        last_event_description=db.last_event
    )


@router.post("/event", response_model=SimulationState)
def trigger_simulation_event(event: SimulationEvent):
    if event.event_type == SimulationEventType.ROAD_BLOCKED:
        road_id = event.road_id or "R2"
        db.update_road_status(road_id, RoadStatus.BLOCKED)
        road = db.get_road(road_id)
        name = road.name if road else road_id
        db.last_event = f"🚨 ROAD BLOCKAGE DETECTED: {name} is completely blocked."

    elif event.event_type == SimulationEventType.ROAD_CLEARED:
        road_id = event.road_id or "R2"
        db.update_road_status(road_id, RoadStatus.SAFE)
        road = db.get_road(road_id)
        name = road.name if road else road_id
        db.last_event = f"✅ ROAD CLEARED: {name} reopened as safe."

    elif event.event_type == SimulationEventType.MOBILITY_CHANGED:
        if event.mobility:
            user = db.get_user()
            user.mobility = event.mobility
            db.update_user(user)
            db.last_event = f"♿ USER PROFILE UPDATED: Mobility changed to {event.mobility.value.upper()}."

    elif event.event_type == SimulationEventType.SEVERITY_CHANGED:
        if event.severity:
            alert = db.get_alert()
            alert.severity = event.severity
            db.update_alert(alert)
            db.last_event = f"⚠️ HAZARD LEVEL ESCALATED: Alert severity set to {event.severity.value.upper()}."

    elif event.event_type == SimulationEventType.TIME_REDUCED:
        mins = event.time_to_impact_minutes or 10
        alert = db.get_alert()
        alert.time_to_impact_minutes = mins
        db.update_alert(alert)
        db.last_event = f"⏱️ TIME PRESSURE SURGE: Time to impact collapsed to {mins} minutes."

    elif event.event_type == SimulationEventType.OFFLINE_TOGGLED:
        db.is_offline = bool(event.is_offline)
        status_text = "OFFLINE (Cached Plan Mode)" if db.is_offline else "ONLINE (Live Telemetry)"
        db.last_event = f"📡 CONNECTIVITY SIMULATION: Switched to {status_text}."

    elif event.event_type == SimulationEventType.LANGUAGE_CHANGED:
        if event.language:
            user = db.get_user()
            user.language = event.language
            db.update_user(user)
            db.last_event = f"🌐 LANGUAGE CHANGED: Active language set to {event.language.value.upper()}."

    elif event.event_type == SimulationEventType.SHELTER_UNAVAILABLE:
        shelter_id = event.shelter_id or "SHELTER_B"
        db.update_shelter_status(shelter_id, ShelterStatus.UNAVAILABLE)
        db.last_event = f"⛔ SHELTER STATUS CHANGED: {shelter_id} marked unavailable."

    elif event.event_type == SimulationEventType.RESET:
        db.reset()
        db.last_event = "🔄 SIMULATION RESET: Restored initial state."

    return get_simulation_state()


@router.post("/reset", response_model=SimulationState)
def reset_simulation():
    db.reset()
    return get_simulation_state()
