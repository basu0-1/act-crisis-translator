from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Shelter, ShelterStatus
from app.schemas.schemas import ShelterResponse

router = APIRouter(prefix="/shelters", tags=["Shelters"])

@router.get("", response_model=List[ShelterResponse])
def list_shelters(
    wheelchair_only: Optional[bool] = Query(False),
    status_filter: Optional[ShelterStatus] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Shelter).filter(Shelter.is_active == True)
    if wheelchair_only:
        query = query.filter(Shelter.wheelchair_accessible == True)
    if status_filter:
        query = query.filter(Shelter.status == status_filter)
    
    return query.all()

@router.get("/{shelter_id}", response_model=ShelterResponse)
def get_shelter(shelter_id: int, db: Session = Depends(get_db)):
    shelter = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shelter not found"
        )
    return shelter
