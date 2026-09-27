from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import RERAProject

router = APIRouter(prefix="/rera", tags=["RERA Registry"])

def serialize_project(p: RERAProject):
    return {
        "_id": str(p.id),
        "id": p.id,
        "projectName": p.project_name,
        "registrationNumber": p.registration_number,
        "state": p.state,
        "city": p.city,
        "locality": p.locality,
        "builderName": p.builder_name,
        "promoterName": p.promoter_name,
        "propertyType": p.property_type,
        "projectCategory": p.project_category,
        "completionStatus": p.completion_status,
        "delayedMonths": p.delayed_months,
        "totalUnits": p.total_units,
        "availableUnits": p.available_units,
        "carpetAreaRangeSqFt": p.carpet_area_range_sqft,
        "averagePricePerSqm": p.average_price_per_sqm,
        "escrowAccountCompliant": p.escrow_account_compliant,
        "legalDisputeFlags": p.legal_dispute_flags,
        "disputeDetails": p.dispute_details,
        "structuralAuditStatus": p.structural_audit_status,
        "lat": p.lat,
        "lon": p.lon,
        "createdAt": p.created_at.isoformat() if p.created_at else None
    }

@router.get("/verify")
async def verify_project(regNumber: str = Query(...), db: Session = Depends(get_db)):
    # Case-insensitive match
    project = db.query(RERAProject).filter(RERAProject.registration_number.ilike(regNumber.strip())).first()
    if not project:
        return {
            "status": "Unverified",
            "message": "No record found in Gujarat or Maharashtra RERA public index with this registration number.",
            "details": None
        }

    status = "Verified"
    message = "Project registration details are successfully verified with the official state regulatory database."
    if project.legal_dispute_flags:
        status = "Risky"
        message = "Project verified, but active legal disputes or regulatory warnings have been flagged."
    elif project.completion_status == "Delayed" or project.delayed_months > 12:
        status = "Risky"
        message = "Project verified, but construction timeline exhibits severe delays exceeding 12 months."

    return {
        "status": status,
        "message": message,
        "details": serialize_project(project)
    }

@router.get("/projects")
async def get_projects(
    state: Optional[str] = None,
    city: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(RERAProject)
    if state:
        query = query.filter(RERAProject.state == state)
    if city:
        query = query.filter(RERAProject.city.ilike(city))
    if status:
        query = query.filter(RERAProject.completion_status == status)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (RERAProject.project_name.ilike(s)) |
            (RERAProject.registration_number.ilike(s)) |
            (RERAProject.builder_name.ilike(s))
        )
    projects = query.all()
    return [serialize_project(p) for p in projects]

@router.get("/projects/{project_id}")
async def get_project_by_id(project_id: str, db: Session = Depends(get_db)):
    try:
        p_id = int(project_id)
        project = db.query(RERAProject).filter(RERAProject.id == p_id).first()
    except ValueError:
        project = db.query(RERAProject).filter(RERAProject.registration_number == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return serialize_project(project)
