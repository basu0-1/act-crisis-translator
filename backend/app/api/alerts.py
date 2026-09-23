"""
API: Alerts Management
"""
from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timezone
from app.schemas.alert import Alert, AlertCreate
from app.data.mock_database import db
from app.agents.alert_analyst import AlertAnalystAgent

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("/active", response_model=Alert)
def get_active_alert():
    return db.get_alert()


@router.post("", response_model=Alert)
def create_or_update_alert(alert_create: AlertCreate):
    current = db.get_alert()
    updated_alert = Alert(
        id=f"ALERT-{alert_create.hazard_type.value.upper()}-{int(datetime.now().timestamp())}",
        hazard_type=alert_create.hazard_type,
        severity=alert_create.severity,
        certainty=alert_create.certainty,
        headline=alert_create.headline,
        description=alert_create.description,
        lat=alert_create.lat,
        lng=alert_create.lng,
        radius_km=alert_create.radius_km,
        time_to_impact_minutes=alert_create.time_to_impact_minutes,
        required_action=alert_create.required_action,
        source_level=alert_create.source_level,
        provenance=alert_create.provenance or current.provenance,
        created_at=datetime.now(timezone.utc).isoformat(),
        active=True
    )
    db.update_alert(updated_alert)
    return updated_alert


@router.get("/analysis")
def get_alert_analysis():
    alert = db.get_alert()
    return AlertAnalystAgent.analyze(alert)
