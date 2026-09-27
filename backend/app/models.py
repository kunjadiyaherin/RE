from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="investor")
    is_verified = Column(Boolean, default=False)
    otp_code = Column(String(10), nullable=True)
    reset_code = Column(String(10), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class RERAProject(Base):
    __tablename__ = "rera_projects"

    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String(255), index=True, nullable=False)
    registration_number = Column(String(150), unique=True, index=True, nullable=False)
    state = Column(String(100), index=True, nullable=False)
    city = Column(String(100), index=True, nullable=False)
    locality = Column(String(150), index=True, nullable=False)
    builder_name = Column(String(255), index=True, nullable=False)
    promoter_name = Column(String(255), nullable=True)
    property_type = Column(String(100), default="Residential")
    project_category = Column(String(100), default="High-Rise")
    completion_status = Column(String(50), default="Ongoing")
    delayed_months = Column(Integer, default=0)
    total_units = Column(Integer, default=0)
    available_units = Column(Integer, default=0)
    carpet_area_range_sqft = Column(String(100), default="1000 - 2000 sq.ft")
    average_price_per_sqm = Column(Float, default=0.0)
    escrow_account_compliant = Column(Boolean, default=True)
    legal_dispute_flags = Column(Boolean, default=False)
    dispute_details = Column(Text, nullable=True)
    structural_audit_status = Column(String(150), default="Approved & Certified")
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Builder(Base):
    __tablename__ = "builders"

    id = Column(Integer, primary_key=True, index=True)
    builder_name = Column(String(255), unique=True, index=True, nullable=False)
    cin_number = Column(String(100), nullable=True)
    pan_number = Column(String(50), nullable=True)
    state = Column(String(100), default="Maharashtra")
    total_delivered_projects = Column(Integer, default=0)
    ongoing_projects = Column(Integer, default=0)
    registration_count = Column(Integer, default=0)
    delayed_projects = Column(Integer, default=0)
    average_delay_months = Column(Float, default=0.0)
    active_litigations = Column(Integer, default=0)
    headquarters = Column(String(255), nullable=True)
    established_year = Column(Integer, default=2000)
    market_cap_inr = Column(String(100), default="Private Enterprise")
    credit_rating = Column(String(100), default="CRISIL A / Stable")
    trust_score = Column(Integer, default=85)

class PropertyTransaction(Base):
    __tablename__ = "property_transactions"

    id = Column(Integer, primary_key=True, index=True)
    deed_number = Column(String(150), unique=True, index=True, nullable=False)
    deed_date = Column(DateTime, default=datetime.utcnow)
    city = Column(String(100), index=True, nullable=False)
    locality = Column(String(150), index=True, nullable=False)
    property_type = Column(String(100), default="Residential")
    carpet_area_sqft = Column(Float, default=1000.0)
    sale_value_inr = Column(Float, default=0.0)
    calculated_rate_per_sqm = Column(Float, default=0.0)
    circle_rate_per_sqm = Column(Float, default=0.0)
    variance_percentage = Column(Float, default=0.0)
    stamp_duty_paid_inr = Column(Float, default=0.0)
    buyer_type = Column(String(100), default="Individual")
    seller_type = Column(String(100), default="Developer")
    verification_status = Column(String(100), default="Verified")

class CircleRate(Base):
    __tablename__ = "circle_rates"

    id = Column(Integer, primary_key=True, index=True)
    locality = Column(String(150), index=True, nullable=False)
    city = Column(String(100), index=True, nullable=False)
    state = Column(String(100), default="Maharashtra")
    circle_rate_per_sqm = Column(Float, nullable=False)
    market_rate_per_sqm = Column(Float, nullable=False)
    growth_score = Column(Integer, default=85)
    metro_proximity_km = Column(Float, default=1.0)
    highway_proximity_km = Column(Float, default=1.0)
    commercial_density_score = Column(Integer, default=80)
    infrastructure_impact_score = Column(Integer, default=85)

class InfrastructureProject(Base):
    __tablename__ = "infrastructure_projects"

    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String(255), index=True, nullable=False)
    city = Column(String(100), index=True, nullable=False)
    project_type = Column(String(100), default="Metro Line")
    impact_radius_km = Column(Float, default=2.5)
    status = Column(String(100), default="Under Construction")
    completion_year = Column(Integer, default=2026)
    affected_localities = Column(JSON, default=list)

class FraudReport(Base):
    __tablename__ = "fraud_reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    target_type = Column(String(100), default="Project")
    identifier = Column(String(150), nullable=False)
    city = Column(String(100), nullable=False)
    anomaly_type = Column(String(100), nullable=False)
    risk_level = Column(String(50), default="Medium")
    description = Column(Text, nullable=False)
    evidence = Column(JSON, default=dict)
    flagged_date = Column(DateTime, default=datetime.utcnow)

class GovernmentDataset(Base):
    __tablename__ = "government_datasets"

    id = Column(Integer, primary_key=True, index=True)
    dataset_name = Column(String(255), unique=True, nullable=False)
    category = Column(String(100), nullable=False)
    source_url = Column(String(255), nullable=False)
    sync_status = Column(String(50), default="Operational")
    last_sync_time = Column(DateTime, default=datetime.utcnow)
    record_count = Column(Integer, default=0)

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(50), default="info")
    message = Column(Text, nullable=False)
    component = Column(String(100), default="System")
    timestamp = Column(DateTime, default=datetime.utcnow)

class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    saved_cities = Column(JSON, default=list)
    saved_localities = Column(JSON, default=list)
    saved_builders = Column(JSON, default=list)
    saved_projects = Column(JSON, default=list)
