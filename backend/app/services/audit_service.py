from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import AuditLog, SystemEvent

class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        action: str,
        resource_type: str,
        user_id: Optional[int] = None,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def log_system_event(
        db: Session,
        event_type: str,
        payload: Dict[str, Any]
    ) -> SystemEvent:
        event = SystemEvent(
            event_type=event_type,
            payload=payload
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event
