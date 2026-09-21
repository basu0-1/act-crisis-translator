from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, EmergencyAlert, RiskAssessment, MobilityTier
from app.schemas.schemas import RiskCalculationRequest, RiskAssessmentResponse
from app.auth.deps import get_current_user
from app.services.risk_engine import RiskEngine
from app.services.audit_service import AuditService

router = APIRouter(prefix="/risk", tags=["Risk Assessment"])

@router.post("/calculate", response_model=RiskAssessmentResponse)
def calculate_risk(
    req: RiskCalculationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.id == req.alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency alert not found"
        )
    
    # Determine mobility
    mobility = req.mobility
    if not mobility and current_user.profile:
        mobility = current_user.profile.mobility
    if not mobility:
        mobility = MobilityTier.NORMAL

    # Coordinates
    user_lat = req.latitude or (current_user.profile.location_lat if current_user.profile else 37.7749)
    user_lon = req.longitude or (current_user.profile.location_lon if current_user.profile else -122.4194)

    score, level, factors, action_window = RiskEngine.evaluate(
        alert=alert,
        mobility=mobility,
        user_lat=user_lat,
        user_lon=user_lon
    )

    factors_dict = [f.model_dump() for f in factors]

    # Check for existing assessment to update or create
    assessment = db.query(RiskAssessment).filter(
        RiskAssessment.user_id == current_user.id,
        RiskAssessment.alert_id == alert.id
    ).first()

    if not assessment:
        assessment = RiskAssessment(
            user_id=current_user.id,
            alert_id=alert.id,
            risk_score=score,
            risk_level=level,
            risk_factors=factors_dict,
            action_window_minutes=action_window,
            disclaimer="Prototype decision-support score"
        )
        db.add(assessment)
    else:
        assessment.risk_score = score
        assessment.risk_level = level
        assessment.risk_factors = factors_dict
        assessment.action_window_minutes = action_window

    db.commit()
    db.refresh(assessment)

    AuditService.log_action(
        db,
        action="RISK_CALCULATED",
        resource_type="RISK_ASSESSMENT",
        user_id=current_user.id,
        resource_id=str(assessment.id),
        details={"score": score, "level": level.value}
    )

    return RiskAssessmentResponse(
        id=assessment.id,
        user_id=assessment.user_id,
        alert_id=assessment.alert_id,
        risk_score=assessment.risk_score,
        risk_level=assessment.risk_level,
        risk_factors=factors,
        action_window_minutes=assessment.action_window_minutes,
        disclaimer=assessment.disclaimer,
        created_at=assessment.created_at
    )
