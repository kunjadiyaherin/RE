import os
import asyncio
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, SessionLocal, Base, is_postgres, DATABASE_URL, get_db
from .seeder import seed_database
from .models import SystemLog
from .services.live_public_apis import get_live_forex, get_live_india_macroeconomics

# Create all database tables
Base.metadata.create_all(bind=engine)

# Seed initial data
with SessionLocal() as db:
    seed_database(db)

# Background task for live public API periodic sync
async def live_public_api_sync_loop():
    while True:
        try:
            await asyncio.sleep(120)  # every 2 minutes
            fx = await get_live_forex()
            macro = await get_live_india_macroeconomics()
            with SessionLocal() as db:
                log = SystemLog(
                    level="info",
                    message=f"Live Public APIs Sync: USD/INR at ₹{fx.get('rates', {}).get('INR', 95.82)}, India CPI: {macro.get('cpiInflationPercent', 4.8)}%, Repo Rate: {macro.get('rbiRepoRatePercent', 6.5)}%.",
                    component="FastAPILiveWorker"
                )
                db.add(log)
                db.commit()
            print(f"[FastAPI Live Worker] Synced live FX (USD/INR: {fx.get('rates', {}).get('INR')}) & CPI ({macro.get('cpiInflationPercent')}%)")
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[FastAPI Live Worker Warning]: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: spawn live background sync loop
    sync_task = asyncio.create_task(live_public_api_sync_loop())
    print("=============================================================")
    print(" PROPERTY INTELLIGENCE Python FastAPI Backend Listening")
    print(f" Database: {'PostgreSQL (' + DATABASE_URL.split('@')[-1] + ')' if is_postgres else 'SQLite / Resilient DB'}")
    print(" API Endpoint: http://localhost:5000/api/")
    print(" Documentation: http://localhost:5000/docs")
    print("=============================================================")
    yield
    sync_task.cancel()

app = FastAPI(
    title="Property Intelligence API",
    description="Real Estate Market Intelligence Platform with Live Public APIs & PostgreSQL Database",
    version="3.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api
from .routers import (
    live_routes, auth_routes, rera_routes, builder_routes,
    transaction_routes, analytics_routes, fraud_routes,
    watchlist_routes, admin_routes
)

app.include_router(live_routes.router, prefix="/api")
app.include_router(auth_routes.router, prefix="/api")
app.include_router(rera_routes.router, prefix="/api")
app.include_router(builder_routes.router, prefix="/api")
app.include_router(transaction_routes.router, prefix="/api")
app.include_router(analytics_routes.router, prefix="/api")
app.include_router(fraud_routes.router, prefix="/api")
app.include_router(watchlist_routes.router, prefix="/api")
app.include_router(admin_routes.router, prefix="/api")

# Compatibility alias for /api/infrastructure-projects
@app.get("/api/infrastructure-projects", tags=["Analytics & Forecasts"])
async def api_infrastructure_projects_alias(city: str = None, db = Depends(get_db)):
    return await analytics_routes.get_infrastructure_projects(city=city, db=db)

@app.get("/health")
async def health_check():
    return {
        "status": "Healthy",
        "backend": "Python FastAPI",
        "database": "PostgreSQL" if is_postgres else "SQLite / Failover",
        "timestamp": datetime.utcnow().isoformat()
    }
