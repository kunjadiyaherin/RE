from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import CircleRate, InfrastructureProject
from ..services.ml_forecast import calculate_ml_forecast

router = APIRouter(tags=["Analytics & AI Forecast"])

@router.get("/analytics/city-comparison")
async def get_city_comparison():
    return [
        {
            "city": "Ahmedabad",
            "infrastructureGrowth": 88,
            "realEstateDemand": 85,
            "averageTransactionValueINR": 8500000,
            "populationGrowth": 2.4,
            "urbanExpansionRate": 4.1,
            "investmentScore": 90,
            "keyDrivers": "GIFT City expansion, Ahmedabad-Dholera Expressway, Metro Phase 2"
        },
        {
            "city": "Mumbai",
            "infrastructureGrowth": 92,
            "realEstateDemand": 95,
            "averageTransactionValueINR": 32000000,
            "populationGrowth": 1.1,
            "urbanExpansionRate": 2.2,
            "investmentScore": 88,
            "keyDrivers": "Coastal Road project, Navi Mumbai Airport, Trans Harbour Link"
        },
        {
            "city": "Pune",
            "infrastructureGrowth": 82,
            "realEstateDemand": 80,
            "averageTransactionValueINR": 9200000,
            "populationGrowth": 1.9,
            "urbanExpansionRate": 3.2,
            "investmentScore": 82,
            "keyDrivers": "Pune Metro expansion, Hinjewadi IT Park extension, Ring Road plans"
        },
        {
            "city": "Surat",
            "infrastructureGrowth": 78,
            "realEstateDemand": 74,
            "averageTransactionValueINR": 6500000,
            "populationGrowth": 2.9,
            "urbanExpansionRate": 3.8,
            "investmentScore": 78,
            "keyDrivers": "Surat Metro Rail, Dream City (Diamond Bourse) zoning, SMC Smart City"
        },
        {
            "city": "Bangalore",
            "infrastructureGrowth": 86,
            "realEstateDemand": 90,
            "averageTransactionValueINR": 14500000,
            "populationGrowth": 3.2,
            "urbanExpansionRate": 4.5,
            "investmentScore": 89,
            "keyDrivers": "Outer Ring Road Metro, Peripheral Ring Road, Kempegowda Airport Phase 2"
        },
        {
            "city": "Hyderabad",
            "infrastructureGrowth": 89,
            "realEstateDemand": 88,
            "averageTransactionValueINR": 12800000,
            "populationGrowth": 2.8,
            "urbanExpansionRate": 4.0,
            "investmentScore": 92,
            "keyDrivers": "Regional Ring Road (RRR), IT Corridor extensions, Aerospace Parks"
        }
    ]

@router.get("/analytics/area-growth")
async def get_area_growth(city: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(CircleRate)
    if city:
        q = q.filter(CircleRate.city.ilike(city))
    areas = q.all()

    infra_q = db.query(InfrastructureProject)
    if city:
        infra_q = infra_q.filter(InfrastructureProject.city.ilike(city))
    infra_list = infra_q.all()

    result = []
    for a in areas:
        impacting = [
            p.project_name for p in infra_list
            if any(l.lower() == a.locality.lower() for l in (p.affected_localities or []))
            or (a.metro_proximity_km <= p.impact_radius_km and p.project_type == "Metro Line")
        ]
        boost = len(impacting) * 5
        if a.metro_proximity_km < 1.0:
            boost += 8
        if a.highway_proximity_km < 1.0:
            boost += 5
        final_score = min(100, a.growth_score + boost)

        result.append({
            "locality": a.locality,
            "city": a.city,
            "state": a.state,
            "baseGrowthScore": a.growth_score,
            "finalGrowthScore": final_score,
            "infrastructureImpactScore": a.infrastructure_impact_score,
            "impactingProjects": impacting,
            "metroProximityKm": a.metro_proximity_km,
            "highwayProximityKm": a.highway_proximity_km,
            "commercialDensityScore": a.commercial_density_score
        })
    return result

@router.get("/analytics/forecast")
async def get_forecast(city: str = Query(...), locality: str = Query(...), db: Session = Depends(get_db)):
    # Look up base rate from CircleRate or default
    rate_rec = db.query(CircleRate).filter(
        CircleRate.city.ilike(city),
        CircleRate.locality.ilike(locality)
    ).first()
    base_rate = rate_rec.market_rate_per_sqm if rate_rec else (295000 if city.lower() == 'mumbai' else 85000)

    # Directly run Scikit-Learn Linear Regression model!
    return calculate_ml_forecast(city, locality, base_rate)

@router.get("/analytics/opportunities")
async def get_opportunities(db: Session = Depends(get_db)):
    areas = db.query(CircleRate).all()
    opportunities = []
    for a in areas:
        ratio = a.circle_rate_per_sqm / a.market_rate_per_sqm if a.market_rate_per_sqm > 0 else 0.7
        undervaluation = round((1 - ratio) * 100)
        opp_score = min(100, round((a.growth_score * 0.6) + (undervaluation * 0.4)))
        tier = "Strong Buy" if opp_score >= 85 else ("Accumulate" if opp_score >= 70 else "Neutral")
        opportunities.append({
            "city": a.city,
            "locality": a.locality,
            "state": a.state,
            "marketPrice": a.market_rate_per_sqm,
            "circleRate": a.circle_rate_per_sqm,
            "growthScore": a.growth_score,
            "undervaluationGapPercent": undervaluation,
            "opportunityScore": opp_score,
            "recommendationTier": tier
        })
    opportunities.sort(key=lambda x: x["opportunityScore"], reverse=True)
    return opportunities

@router.get("/infrastructure-projects")
async def get_infrastructure_projects(city: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(InfrastructureProject)
    if city:
        q = q.filter(InfrastructureProject.city.ilike(city))
    projects = q.all()
    return [
        {
            "id": p.id,
            "projectName": p.project_name,
            "city": p.city,
            "projectType": p.project_type,
            "impactRadiusKm": p.impact_radius_km,
            "status": p.status,
            "completionYear": p.completion_year,
            "affectedLocalities": p.affected_localities or []
        }
        for p in projects
    ]
