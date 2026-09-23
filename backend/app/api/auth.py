"""
Authentication & User Account API
"""
import uuid
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.infrastructure import AuditLog
from app.auth.security import hash_password, verify_password, create_access_token
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & User Security"])


class UserRegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    mobility: str = "normal"
    transport: str = "walking"
    companions: str = "none"
    language: str = "en"
    lat: Optional[float] = 28.6139
    lng: Optional[float] = 77.2090
    accessibility_requirements: Optional[list] = []


class UserLoginRequest(BaseModel):
    email: str
    password: str


class DemoLoginRequest(BaseModel):
    role: str = "user"  # "user" or "admin"


class UserProfileResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    mobility: str
    transport: str
    companions: str
    language: str
    lat: Optional[float]
    lng: Optional[float]
    accessibility_requirements: list
    critical_needs: list
    notification_preferences: dict


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse


@router.post("/register", response_model=AuthResponse)
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    if "@" not in req.email or "." not in req.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format."
        )

    existing = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered."
        )

    new_user = User(
        id=f"user-{str(uuid.uuid4())[:8]}",
        email=req.email.lower().strip(),
        hashed_password=hash_password(req.password),
        role="user",
        name=req.name,
        mobility=req.mobility,
        transport=req.transport,
        companions=req.companions,
        language=req.language,
        lat=req.lat,
        lng=req.lng,
        accessibility_requirements=req.accessibility_requirements or [],
        critical_needs=["Prescription medication kit"],
        notification_preferences={"sound": True, "vibrate": True, "high_priority": True}
    )
    db.add(new_user)

    audit = AuditLog(
        user_id=new_user.id,
        action="USER_REGISTERED",
        event_type="AUTH",
        details={"email": new_user.email, "role": new_user.role, "mobility": new_user.mobility}
    )
    db.add(audit)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.id, "email": new_user.email, "role": new_user.role})

    return AuthResponse(
        access_token=token,
        user=UserProfileResponse(
            id=new_user.id,
            email=new_user.email,
            name=new_user.name,
            role=new_user.role,
            mobility=new_user.mobility,
            transport=new_user.transport,
            companions=new_user.companions,
            language=new_user.language,
            lat=new_user.lat,
            lng=new_user.lng,
            accessibility_requirements=new_user.accessibility_requirements or [],
            critical_needs=new_user.critical_needs or [],
            notification_preferences=new_user.notification_preferences or {}
        )
    )


@router.post("/login", response_model=AuthResponse)
def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        event_type="AUTH",
        details={"email": user.email, "role": user.role}
    )
    db.add(audit)
    db.commit()

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})

    return AuthResponse(
        access_token=token,
        user=UserProfileResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            mobility=user.mobility,
            transport=user.transport,
            companions=user.companions,
            language=user.language,
            lat=user.lat,
            lng=user.lng,
            accessibility_requirements=user.accessibility_requirements or [],
            critical_needs=user.critical_needs or [],
            notification_preferences=user.notification_preferences or {}
        )
    )


@router.post("/demo-login", response_model=AuthResponse)
def demo_login(req: DemoLoginRequest, db: Session = Depends(get_db)):
    target_email = "admin@emergency.ai" if req.role == "admin" else "demo@emergency.ai"
    user = db.query(User).filter(User.email == target_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo user account not found.")

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})

    return AuthResponse(
        access_token=token,
        user=UserProfileResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            mobility=user.mobility,
            transport=user.transport,
            companions=user.companions,
            language=user.language,
            lat=user.lat,
            lng=user.lng,
            accessibility_requirements=user.accessibility_requirements or [],
            critical_needs=user.critical_needs or [],
            notification_preferences=user.notification_preferences or {}
        )
    )


@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        mobility=current_user.mobility,
        transport=current_user.transport,
        companions=current_user.companions,
        language=current_user.language,
        lat=current_user.lat,
        lng=current_user.lng,
        accessibility_requirements=current_user.accessibility_requirements or [],
        critical_needs=current_user.critical_needs or [],
        notification_preferences=current_user.notification_preferences or {}
    )
