from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import EmergencyAlert
from app.schemas.schemas import EmergencyAlertResponse

router = APIRouter(prefix="/alerts", tags=["Emergency Alerts"])

@router.get("/active", response_model=List[EmergencyAlertResponse])
def get_active_alerts(db: Session = Depends(get_db)):
    alerts = db.query(EmergencyAlert).filter(EmergencyAlert.is_active == True).all()
    return alerts

@router.get("/{alert_id}", response_model=EmergencyAlertResponse)
def get_alert_by_id(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Emergency alert with ID {alert_id} not found"
        )
    return alert
