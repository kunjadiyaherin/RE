from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Watchlist, User, Builder, RERAProject
from ..schemas import WatchlistAdd, WatchlistRemove
from ..auth import get_current_user
from .rera_routes import serialize_project
from .builder_routes import serialize_builder

router = APIRouter(prefix="/watchlist", tags=["Investor Watchlist"])

def get_or_create_watchlist(user_id: int, db: Session) -> Watchlist:
    wl = db.query(Watchlist).filter(Watchlist.user_id == user_id).first()
    if not wl:
        wl = Watchlist(
            user_id=user_id,
            saved_cities=["Ahmedabad", "Mumbai"],
            saved_localities=[{"city": "Ahmedabad", "locality": "Thaltej"}],
            saved_builders=["1"],
            saved_projects=["1", "2"]
        )
        db.add(wl)
        db.commit()
        db.refresh(wl)
    return wl

def populate_watchlist(wl: Watchlist, db: Session):
    # Resolve builders and projects
    builders = []
    for b_id in (wl.saved_builders or []):
        try:
            b = db.query(Builder).filter(Builder.id == int(b_id)).first()
            if b:
                builders.append(serialize_builder(b))
        except (ValueError, TypeError):
            pass

    projects = []
    for p_id in (wl.saved_projects or []):
        try:
            p = db.query(RERAProject).filter(RERAProject.id == int(p_id)).first()
            if p:
                projects.append(serialize_project(p))
        except (ValueError, TypeError):
            pass

    return {
        "savedCities": wl.saved_cities or [],
        "savedLocalities": wl.saved_localities or [],
        "savedBuilders": builders,
        "savedProjects": projects
    }

@router.get("")
async def get_watchlist(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wl = get_or_create_watchlist(current_user.id, db)
    return populate_watchlist(wl, db)

@router.post("/add")
async def add_to_watchlist(payload: WatchlistAdd, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wl = get_or_create_watchlist(current_user.id, db)
    if payload.type == "city":
        cities = list(wl.saved_cities or [])
        if payload.value not in cities:
            cities.append(payload.value)
            wl.saved_cities = cities
    elif payload.type == "locality":
        locs = list(wl.saved_localities or [])
        exists = any(l.get("city") == payload.value.get("city") and l.get("locality") == payload.value.get("locality") for l in locs if isinstance(l, dict))
        if not exists:
            locs.append(payload.value)
            wl.saved_localities = locs
    elif payload.type == "builder":
        builders = list(wl.saved_builders or [])
        if str(payload.value) not in builders:
            builders.append(str(payload.value))
            wl.saved_builders = builders
    elif payload.type == "project":
        projects = list(wl.saved_projects or [])
        if str(payload.value) not in projects:
            projects.append(str(payload.value))
            wl.saved_projects = projects

    db.commit()
    db.refresh(wl)
    return {"success": True, "watchlist": populate_watchlist(wl, db)}

@router.post("/remove")
async def remove_from_watchlist(payload: WatchlistRemove, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wl = get_or_create_watchlist(current_user.id, db)
    if payload.type == "city":
        wl.saved_cities = [c for c in (wl.saved_cities or []) if c != payload.value]
    elif payload.type == "locality":
        wl.saved_localities = [l for l in (wl.saved_localities or []) if not (l.get("city") == payload.value.get("city") and l.get("locality") == payload.value.get("locality"))]
    elif payload.type == "builder":
        wl.saved_builders = [b for b in (wl.saved_builders or []) if str(b) != str(payload.value)]
    elif payload.type == "project":
        wl.saved_projects = [p for p in (wl.saved_projects or []) if str(p) != str(payload.value)]

    db.commit()
    db.refresh(wl)
    return {"success": True, "watchlist": populate_watchlist(wl, db)}
