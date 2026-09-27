import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5731/property_intel_db")
FALLBACK_DB_URL = os.getenv("FALLBACK_DB_URL", "sqlite:///./property_intel.db")

engine = None
is_postgres = False

# Try connecting to PostgreSQL
try:
    test_engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args={"connect_timeout": 3})
    with test_engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    engine = test_engine
    is_postgres = True
    print(f"[Database] Successfully connected to PostgreSQL at: {DATABASE_URL.split('@')[-1]}")
except Exception as e:
    print(f"[Database Warning] Could not connect to PostgreSQL ({e}).")
    print(f"[Database Note] You can update your PostgreSQL credentials in backend/.env: DATABASE_URL=postgresql://postgres:<your_password>@localhost:5731/property_intel_db")
    print(f"[Database] Initializing resilient database engine via: {FALLBACK_DB_URL}")
    engine = create_engine(FALLBACK_DB_URL, connect_args={"check_same_thread": False})
    is_postgres = False

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
