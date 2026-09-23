"""
API: User Profile Management with Database Persistence, Timeline Logging & Multi-User Support
"""
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserProfile, MobilityType, TransportType, CompanionType, LanguageType
from app.database import get_db
from app.models.user import User
from app.models.infrastructure import AuditLog, UserTimelineEvent
from app.data.mock_database import db as memory_db
from app.auth.dependencies import get_current_user_optional

router = APIRouter(prefix="/user", tags=["User Profile"])


class TimelineEventCreate(BaseModel):
    user_id: Optional[str] = "demo_user_01"
    event_text: str
    event_type: str = "recalculation"


@router.get("/profile", response_model=UserProfile)
def get_user_profile(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if current_user:
        valid_langs = ["en", "hi", "ja", "bn", "or", "ur"]
        return UserProfile(
            id=current_user.id,
            name=current_user.name,
            lat=current_user.lat or 28.6139,
            lng=current_user.lng or 77.2090,
            language=LanguageType(current_user.language) if current_user.language in valid_langs else LanguageType.EN,
            mobility=MobilityType(current_user.mobility) if current_user.mobility in ["normal", "limited", "wheelchair"] else MobilityType.LIMITED,
            transport=TransportType(current_user.transport) if current_user.transport in ["walking", "bicycle", "car", "public_transport"] else TransportType.WALKING,
            companions=CompanionType(current_user.companions) if current_user.companions in ["none", "child", "elderly", "pet"] else CompanionType.NONE,
            accessibility_requirements=current_user.accessibility_requirements or [],
            critical_needs=current_user.critical_needs or []
        )
    return memory_db.get_user()


@router.post("/profile", response_model=UserProfile)
def update_user_profile(
    profile: UserProfile,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if current_user:
        current_user.name = profile.name
        current_user.mobility = profile.mobility.value
        current_user.transport = profile.transport.value
        current_user.companions = profile.companions.value
        current_user.language = profile.language.value
        current_user.lat = profile.lat
        current_user.lng = profile.lng
        current_user.accessibility_requirements = profile.accessibility_requirements
        current_user.critical_needs = profile.critical_needs

        audit = AuditLog(
            user_id=current_user.id,
            action="USER_UPDATED_PROFILE",
            event_type="PROFILE",
            details={"mobility": profile.mobility.value, "transport": profile.transport.value}
        )
        db.add(audit)
        db.commit()
        db.refresh(current_user)

    memory_db.update_user(profile)
    return profile


@router.post("/timeline-event")
def record_timeline_event(
    event: TimelineEventCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    uid = current_user.id if current_user else (event.user_id or "demo_user_01")
    entry = UserTimelineEvent(
        user_id=uid,
        event_text=event.event_text,
        event_type=event.event_type,
        created_at=datetime.now(timezone.utc)
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {
        "status": "recorded",
        "id": entry.id,
        "user_id": uid,
        "event_text": entry.event_text,
        "created_at": entry.created_at.isoformat()
    }


@router.get("/timeline-events")
def get_user_timeline_events(
    user_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    uid = current_user.id if current_user else (user_id or "demo_user_01")
    events = (
        db.query(UserTimelineEvent)
        .filter(UserTimelineEvent.user_id == uid)
        .order_by(UserTimelineEvent.created_at.desc())
        .limit(30)
        .all()
    )
    return [
        {
            "id": e.id,
            "user_id": e.user_id,
            "event_text": e.event_text,
            "event_type": e.event_type,
            "created_at": e.created_at.isoformat()
        }
        for e in events
    ]
