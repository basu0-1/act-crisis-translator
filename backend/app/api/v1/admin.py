from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import (
    User, EmergencyAlert, Shelter, AlertSource, AuditLog, Route,
    UserRole, SeverityLevel, DataStatus, ShelterStatus
)
from app.schemas.schemas import (
    UserResponse, EmergencyAlertResponse, EmergencyAlertCreate, EmergencyAlertUpdate,
    ShelterResponse, ShelterCreate, AlertSourceResponse,
    AuditLogResponse, SystemStatsResponse
)
from app.auth.deps import require_admin
from app.services.audit_service import AuditService
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/stats", response_model=SystemStatsResponse)
def get_system_stats(admin_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    active_alerts = db.query(EmergencyAlert).filter(EmergencyAlert.is_active == True).count()
    total_shelters = db.query(Shelter).count()
    open_shelters = db.query(Shelter).filter(Shelter.status == ShelterStatus.OPEN).count()
    recalculations = db.query(Route).filter(Route.is_blocked == True).count()

    return SystemStatsResponse(
        total_users=total_users,
        active_alerts=active_alerts,
        total_shelters=total_shelters,
        open_shelters=open_shelters,
        recalculations_count=recalculations,
        system_status="HEALTHY_OPERATIONAL",
        environment=settings.ENVIRONMENT,
        version=settings.VERSION
    )

@router.get("/users", response_model=List[UserResponse])
def list_all_users(admin_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id.desc()).limit(100).all()

@router.get("/alerts", response_model=List[EmergencyAlertResponse])
def list_admin_alerts(admin_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(EmergencyAlert).order_by(EmergencyAlert.id.desc()).all()

@router.post("/alerts", response_model=EmergencyAlertResponse, status_code=status.HTTP_201_CREATED)
def create_emergency_alert(
    alert_in: EmergencyAlertCreate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    new_alert = EmergencyAlert(
        title=alert_in.title,
        description=alert_in.description,
        emergency_type=alert_in.emergency_type,
        severity=alert_in.severity,
        certainty=alert_in.certainty,
        time_to_impact_minutes=alert_in.time_to_impact_minutes,
        hazard_polygon_geojson=alert_in.hazard_polygon_geojson,
        source_id=alert_in.source_id,
        data_status=alert_in.data_status,
        is_active=alert_in.is_active
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    AuditService.log_action(
        db,
        action="ALERT_CREATED",
        resource_type="EMERGENCY_ALERT",
        user_id=admin_user.id,
        resource_id=str(new_alert.id),
        details={"title": new_alert.title, "severity": new_alert.severity.value}
    )

    return new_alert

@router.put("/alerts/{alert_id}", response_model=EmergencyAlertResponse)
def update_emergency_alert(
    alert_id: int,
    alert_update: EmergencyAlertUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    
    update_data = alert_update.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(alert, key, val)
    
    db.commit()
    db.refresh(alert)

    AuditService.log_action(
        db,
        action="ALERT_UPDATED",
        resource_type="EMERGENCY_ALERT",
        user_id=admin_user.id,
        resource_id=str(alert.id),
        details=update_data
    )

    return alert

@router.get("/shelters", response_model=List[ShelterResponse])
def list_admin_shelters(admin_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(Shelter).order_by(Shelter.id.asc()).all()

@router.post("/shelters", response_model=ShelterResponse, status_code=status.HTTP_201_CREATED)
def create_shelter(
    shelter_in: ShelterCreate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    shelter = Shelter(**shelter_in.model_dump())
    db.add(shelter)
    db.commit()
    db.refresh(shelter)

    AuditService.log_action(
        db,
        action="SHELTER_CREATED",
        resource_type="SHELTER",
        user_id=admin_user.id,
        resource_id=str(shelter.id)
    )

    return shelter

@router.get("/sources", response_model=List[AlertSourceResponse])
def list_sources(admin_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(AlertSource).all()

@router.get("/audit", response_model=List[AuditLogResponse])
def list_audit_logs(
    limit: int = 50,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
