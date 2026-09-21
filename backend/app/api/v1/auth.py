from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, UserProfile, UserPreferences, UserRole
from app.schemas.schemas import UserRegister, UserLogin, Token, UserResponse
from app.auth.security import get_password_hash, verify_password, create_access_token
from app.auth.deps import get_current_user
from app.services.audit_service import AuditService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, response: Response, request: Request, db: Session = Depends(get_db)):
    # Check if user email already exists
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    
    # Hash password securely
    hashed = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email.lower(),
        hashed_password=hashed,
        role=UserRole.END_USER,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # Create associated profile
    profile = UserProfile(
        user_id=new_user.id,
        full_name=user_in.full_name,
        preferred_language=user_in.preferred_language,
        mobility=user_in.mobility,
        location_name="Central Riverside District",
        location_lat=37.7749,
        location_lon=-122.4194
    )
    db.add(profile)

    # Create associated preferences
    prefs = UserPreferences(
        user_id=new_user.id,
        theme="system",
        notifications_enabled=True,
        high_contrast=False,
        offline_cache_enabled=True
    )
    db.add(prefs)
    db.commit()
    db.refresh(new_user)

    # Audit log
    AuditService.log_action(
        db,
        action="REGISTER",
        resource_type="USER",
        user_id=new_user.id,
        resource_id=str(new_user.id),
        ip_address=request.client.host if request.client else None
    )

    # Generate token
    token = create_access_token(subject=new_user.id, role=new_user.role.value)
    
    # Set HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {token}",
        httponly=True,
        max_age=60 * 60 * 24,
        samesite="lax",
        secure=False # Set true in HTTPS production
    )

    return Token(
        access_token=token,
        token_type="bearer",
        user_role=new_user.role,
        user_id=new_user.id,
        full_name=profile.full_name
    )


@router.post("/login", response_model=Token)
def login(user_in: UserLogin, response: Response, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is currently inactive"
        )
    
    token = create_access_token(subject=user.id, role=user.role.value)
    
    # Set HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {token}",
        httponly=True,
        max_age=60 * 60 * 24,
        samesite="lax",
        secure=False
    )

    # Audit log
    AuditService.log_action(
        db,
        action="LOGIN",
        resource_type="USER",
        user_id=user.id,
        resource_id=str(user.id),
        ip_address=request.client.host if request.client else None
    )

    full_name = user.profile.full_name if user.profile else user.email.split("@")[0]

    return Token(
        access_token=token,
        token_type="bearer",
        user_role=user.role,
        user_id=user.id,
        full_name=full_name
    )


@router.post("/logout")
def logout(response: Response, current_user: User = Depends(get_current_user)):
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
