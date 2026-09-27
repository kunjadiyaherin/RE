from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Builder, RERAProject, PropertyTransaction

router = APIRouter(prefix="/fraud", tags=["Fraud Detection & Anomaly Scanner"])

@router.get("/reports")
async def get_fraud_reports(city: Optional[str] = None, riskLevel: Optional[str] = None, db: Session = Depends(get_db)):
    # Run dynamic anomaly scanner to produce live reports
    anomalies = await scan_anomalies(db)
    if city:
        anomalies = [a for a in anomalies if a.get("city", "").lower() == city.lower()]
    if riskLevel:
        anomalies = [a for a in anomalies if a.get("riskLevel", "").lower() == riskLevel.lower()]
    return anomalies

@router.get("/scan")
async def scan_anomalies(db: Session = Depends(get_db)):
    builders = db.query(Builder).all()
    projects = db.query(RERAProject).all()
    transactions = db.query(PropertyTransaction).all()

    anomalies = []

    # 1. Builders with high delay ratios
    for b in builders:
        ratio = (b.delayed_projects / b.registration_count) if b.registration_count > 0 else 0
        if ratio > 0.25 or b.average_delay_months > 12:
            anomalies.append({
                "title": f"High Delay Risk: {b.builder_name}",
                "targetType": "Builder",
                "identifier": b.pan_number or "PAN N/A",
                "city": "Mumbai" if b.state == "Maharashtra" else "Ahmedabad",
                "anomalyType": "Repeated Delays",
                "riskLevel": "High" if ratio > 0.4 else "Medium",
                "description": f"{b.builder_name} exhibits a project delay ratio of {round(ratio * 100)}% with an average delay of {b.average_delay_months} months across portfolio.",
                "evidence": {"delayRatioPercent": round(ratio * 100), "averageDelayMonths": b.average_delay_months}
            })

    # 2. Projects with extreme delays or legal disputes
    for p in projects:
        if p.completion_status == 'Delayed' and p.delayed_months > 12:
            anomalies.append({
                "title": f"Regulatory Warning: {p.project_name}",
                "targetType": "Project",
                "identifier": p.registration_number,
                "city": p.city,
                "anomalyType": "Severe Delay",
                "riskLevel": "High",
                "description": f"Project has exceeded declared RERA timeline by {p.delayed_months} months.",
                "evidence": {"delayedMonths": p.delayed_months, "legalDispute": p.legal_dispute_flags}
            })
        if p.legal_dispute_flags:
            anomalies.append({
                "title": f"Legal Dispute Flagged: {p.project_name}",
                "targetType": "Project",
                "identifier": p.registration_number,
                "city": p.city,
                "anomalyType": "Legal Dispute",
                "riskLevel": "High",
                "description": p.dispute_details or "Active legal dispute or regulatory warning flagged under RERA index.",
                "evidence": {"disputeDetails": p.dispute_details, "delayedMonths": p.delayed_months}
            })

    # 3. Transactions under circle rate (undervaluation tax evasion check)
    for t in transactions:
        variance = t.variance_percentage
        if variance < -15:
            anomalies.append({
                "title": f"Undervaluation Alert: Deed {t.deed_number}",
                "targetType": "Transaction",
                "identifier": t.deed_number,
                "city": t.city,
                "anomalyType": "Circle Rate Discrepancy",
                "riskLevel": "High" if variance < -25 else "Medium",
                "description": f"Registered at ₹{t.calculated_rate_per_sqm:,.0f}/sqm — {abs(round(variance))}% below government circle rate of ₹{t.circle_rate_per_sqm:,.0f}/sqm for {t.locality}.",
                "evidence": {"saleRate": t.calculated_rate_per_sqm, "circleRate": t.circle_rate_per_sqm, "variance": variance}
            })

    anomalies.sort(key=lambda x: 0 if x["riskLevel"] == "High" else 1)
    return anomalies
