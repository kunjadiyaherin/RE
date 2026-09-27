from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Builder, RERAProject
from .rera_routes import serialize_project

router = APIRouter(prefix="/builders", tags=["Builder Track Record"])

def serialize_builder(b: Builder):
    ratio = (b.delayed_projects / b.registration_count) if b.registration_count > 0 else 0
    score = 100 - round((ratio * 45) + (b.average_delay_months * 2.5))
    score = max(1, min(100, score))
    tier = (
        'Institutional Grade (A)' if score >= 90 else
        'Investment Grade (B)' if score >= 80 else
        'Speculative (C)' if score >= 70 else
        'High Risk (D)'
    )
    return {
        "_id": str(b.id),
        "id": b.id,
        "builderName": b.builder_name,
        "cinNumber": b.cin_number,
        "panNumber": b.pan_number,
        "state": b.state,
        "totalDeliveredProjects": b.total_delivered_projects,
        "ongoingProjects": b.ongoing_projects,
        "registrationCount": b.registration_count,
        "delayedProjects": b.delayed_projects,
        "averageDelayMonths": b.average_delay_months,
        "activeLitigations": b.active_litigations,
        "headquarters": b.headquarters,
        "establishedYear": b.established_year,
        "marketCapINR": b.market_cap_inr,
        "creditRating": b.credit_rating,
        "calculatedTrustScore": score,
        "trustScore": score,
        "ratingTier": tier
    }

@router.get("")
async def get_builders(state: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Builder)
    if state and state != 'Both':
        query = query.filter((Builder.state == state) | (Builder.state == 'Both'))
    builders = query.all()
    return [serialize_builder(b) for b in builders]

@router.get("/{builder_id}")
async def get_builder_profile(builder_id: str, db: Session = Depends(get_db)):
    try:
        b_id = int(builder_id)
        builder = db.query(Builder).filter(Builder.id == b_id).first()
    except ValueError:
        builder = db.query(Builder).filter(Builder.builder_name.ilike(builder_id)).first()

    if not builder:
        raise HTTPException(status_code=404, detail="Builder not found")

    projects = db.query(RERAProject).filter(RERAProject.builder_name == builder.builder_name).all()

    return {
        "builderDetails": serialize_builder(builder),
        "projects": [serialize_project(p) for p in projects]
    }
