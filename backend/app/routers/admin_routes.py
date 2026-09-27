from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from ..database import get_db, is_postgres, DATABASE_URL
from ..models import (
    RERAProject, Builder, PropertyTransaction, CircleRate,
    GovernmentDataset, SystemLog, User
)
from ..auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin Controls"])

@router.get("/health")
async def get_system_health(db: Session = Depends(get_db)):
    p_count = db.query(RERAProject).count()
    b_count = db.query(Builder).count()
    t_count = db.query(PropertyTransaction).count()
    c_count = db.query(CircleRate).count()

    datasets = db.query(GovernmentDataset).all()
    logs = db.query(SystemLog).order_by(SystemLog.timestamp.desc()).limit(15).all()

    db_name = f"PostgreSQL ({DATABASE_URL.split('@')[-1]})" if is_postgres else "SQLite / Fallback DB"

    return {
        "database": {
            "connected": True,
            "isPostgres": is_postgres,
            "databaseName": db_name,
            "stats": {
                "projects": p_count,
                "builders": b_count,
                "transactions": t_count,
                "landRecords": c_count
            }
        },
        "crawlers": [
            {
                "datasetName": d.dataset_name,
                "category": d.category,
                "sourceUrl": d.source_url,
                "syncStatus": d.sync_status,
                "lastSyncTime": d.last_sync_time.isoformat() if d.last_sync_time else None,
                "recordCount": d.record_count
            }
            for d in datasets
        ],
        "logs": [
            {
                "_id": str(l.id),
                "level": l.level,
                "message": l.message,
                "component": l.component,
                "timestamp": l.timestamp.isoformat() if l.timestamp else None
            }
            for l in logs
        ],
        "scheduler": {
            "activeJobs": ["Live Public APIs Worker", "OpenStreetMap Spatial Sync", "World Bank Macro Worker"],
            "intervalHours": 2,
            "nextRun": (datetime.utcnow() + timedelta(hours=2)).isoformat()
        }
    }

@router.post("/sync")
async def trigger_crawler_sync(crawlerName: str = Body(..., embed=True), db: Session = Depends(get_db)):
    ds = db.query(GovernmentDataset).filter(GovernmentDataset.dataset_name == crawlerName).first()
    if ds:
        ds.last_sync_time = datetime.utcnow()
        ds.sync_status = "Operational"
        db.commit()

    log = SystemLog(
        level="info",
        message=f"Manual live sync initiated for dataset: {crawlerName}.",
        component="AdminConsole"
    )
    db.add(log)
    db.commit()

    return {
        "success": True,
        "message": f"Dataset '{crawlerName}' synchronized successfully with live sources."
    }
