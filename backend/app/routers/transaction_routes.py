from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import PropertyTransaction, CircleRate

router = APIRouter(prefix="/transactions", tags=["Transactions & Circle Rates"])

def serialize_tx(t: PropertyTransaction):
    return {
        "_id": str(t.id),
        "id": t.id,
        "deedNumber": t.deed_number,
        "deedDate": t.deed_date.isoformat() if t.deed_date else None,
        "city": t.city,
        "locality": t.locality,
        "propertyType": t.property_type,
        "carpetAreaSqFt": t.carpet_area_sqft,
        "saleValueINR": t.sale_value_inr,
        "calculatedRatePerSqm": t.calculated_rate_per_sqm,
        "circleRatePerSqm": t.circle_rate_per_sqm,
        "variancePercentage": t.variance_percentage,
        "stampDutyPaidINR": t.stamp_duty_paid_inr,
        "buyerType": t.buyer_type,
        "sellerType": t.seller_type,
        "verificationStatus": t.verification_status
    }

@router.get("")
async def get_transactions(
    city: Optional[str] = None,
    locality: Optional[str] = None,
    propertyType: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PropertyTransaction)
    if city:
        query = query.filter(PropertyTransaction.city.ilike(city))
    if locality:
        query = query.filter(PropertyTransaction.locality.ilike(locality))
    if propertyType:
        query = query.filter(PropertyTransaction.property_type == propertyType)
    txs = query.all()
    return [serialize_tx(t) for t in txs]

@router.get("/circle-rates")
async def get_circle_rates(city: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CircleRate)
    if city:
        query = query.filter(CircleRate.city.ilike(city))
    rates = query.all()
    result = []
    for r in rates:
        var_pct = round(((r.market_rate_per_sqm - r.circle_rate_per_sqm) / r.circle_rate_per_sqm) * 100) if r.circle_rate_per_sqm > 0 else 0
        result.append({
            "locality": r.locality,
            "city": r.city,
            "state": r.state,
            "circleRatePerSqm": r.circle_rate_per_sqm,
            "marketRatePerSqm": r.market_rate_per_sqm,
            "variancePercent": var_pct,
            "classification": "Premium Gap" if r.market_rate_per_sqm > r.circle_rate_per_sqm * 1.25 else "Aligned"
        })
    return result
