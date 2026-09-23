"""
Protected Developer & Database Management API (Role: Admin Only)
"""
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.alert import EmergencyAlert
from app.models.infrastructure import ShelterEntity, RoadEntity, AuditLog
from app.auth.dependencies import require_admin

router = APIRouter(prefix="/admin", tags=["Developer & Database Admin Management"])


class AdminAlertCreate(BaseModel):
    hazard_type: str = "flood"
    severity: str = "high"
    certainty: str = "likely"
    headline: str
    description: str
    lat: float = 28.6139
    lng: float = 77.2090
    radius_km: float = 5.0
    time_to_impact_minutes: int = 30
    source_name: str = "National Emergency Center"
    source_type: str = "live"  # "live", "demo"
    source_level: int = 1
    confidence: float = 0.98


class ShelterUpdateRequest(BaseModel):
    status: Optional[str] = None
    capacity: Optional[int] = None
    current_occupancy: Optional[int] = None
    is_accessible: Optional[bool] = None


class RoadUpdateRequest(BaseModel):
    status: Optional[str] = None
    risk_level: Optional[float] = None
    has_stairs: Optional[bool] = None
    accessible_wheelchair: Optional[bool] = None


@router.get("/users")
def get_all_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "role": u.role,
            "mobility": u.mobility,
            "transport": u.transport,
            "language": u.language,
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u in users
    ]


@router.get("/alerts")
def get_all_alerts(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(EmergencyAlert).order_by(EmergencyAlert.created_at.desc()).all()


@router.post("/alerts")
def create_admin_alert(
    req: AdminAlertCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    alert = EmergencyAlert(
        hazard_type=req.hazard_type,
        severity=req.severity,
        certainty=req.certainty,
        headline=req.headline,
        description=req.description,
        lat=req.lat,
        lng=req.lng,
        radius_km=req.radius_km,
        time_to_impact_minutes=req.time_to_impact_minutes,
        required_action="evacuate",
        source_level=req.source_level,
        source_name=req.source_name,
        source_type=req.source_type,
        confidence=req.confidence,
        verified=True,
        is_demo=(req.source_type == "demo"),
        active=True
    )
    db.add(alert)

    audit = AuditLog(
        user_id=admin.id,
        action="ADMIN_CREATED_ALERT",
        event_type="EMERGENCY_ALERT",
        details={"headline": req.headline, "severity": req.severity, "type": req.source_type}
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)
    return alert


@router.delete("/alerts/{alert_id}")
def delete_admin_alert(
    alert_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    db.delete(alert)
    db.commit()
    return {"status": "deleted", "alert_id": alert_id}


@router.get("/shelters")
def get_admin_shelters(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(ShelterEntity).all()


@router.put("/shelters/{shelter_id}")
def update_admin_shelter(
    shelter_id: str,
    req: ShelterUpdateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    shelter = db.query(ShelterEntity).filter(ShelterEntity.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found.")
    
    if req.status is not None:
        shelter.status = req.status
    if req.capacity is not None:
        shelter.capacity = req.capacity
    if req.current_occupancy is not None:
        shelter.current_occupancy = req.current_occupancy
    if req.is_accessible is not None:
        shelter.is_accessible = req.is_accessible
    shelter.updated_at = datetime.now(timezone.utc)

    audit = AuditLog(
        user_id=admin.id,
        action="ADMIN_UPDATED_SHELTER",
        event_type="INFRASTRUCTURE",
        details={"shelter_id": shelter_id, "status": req.status, "occupancy": req.current_occupancy}
    )
    db.add(audit)
    db.commit()
    return shelter


@router.get("/roads")
def get_admin_roads(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(RoadEntity).all()


@router.put("/roads/{road_id}")
def update_admin_road(
    road_id: str,
    req: RoadUpdateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    road = db.query(RoadEntity).filter(RoadEntity.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road not found.")

    if req.status is not None:
        road.status = req.status
    if req.risk_level is not None:
        road.risk_level = req.risk_level
    if req.has_stairs is not None:
        road.has_stairs = req.has_stairs
    if req.accessible_wheelchair is not None:
        road.accessible_wheelchair = req.accessible_wheelchair

    audit = AuditLog(
        user_id=admin.id,
        action="ADMIN_UPDATED_ROAD",
        event_type="INFRASTRUCTURE",
        details={"road_id": road_id, "status": req.status}
    )
    db.add(audit)
    db.commit()
    return road


@router.get("/audit-logs")
def get_audit_logs(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()


@router.get("/config")
def get_admin_system_config(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return {
        "system": "ACT — Actionable Crisis Translator",
        "version": "1.1.0",
        "environment": "production-ready",
        "registered_users_count": db.query(User).count(),
        "alerts_count": db.query(EmergencyAlert).count(),
        "shelters_count": db.query(ShelterEntity).count(),
        "roads_count": db.query(RoadEntity).count(),
        "audit_events_count": db.query(AuditLog).count(),
        "database_backend": "SQLite / PostgreSQL Compatible",
        "security_policy": "Strict RBAC (JWT HS256)"
    }
