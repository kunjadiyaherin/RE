from datetime import datetime
from sqlalchemy.orm import Session
from .models import (
    User, RERAProject, Builder, PropertyTransaction, CircleRate,
    InfrastructureProject, GovernmentDataset, SystemLog, Watchlist
)
from .auth import get_password_hash

def seed_database(db: Session):
    # 1. Users
    if db.query(User).count() == 0:
        admin_user = User(
            username="admin",
            email="admin@propertyintel.com",
            password_hash=get_password_hash("password123"),
            role="admin",
            is_verified=True
        )
        investor_user = User(
            username="investor",
            email="investor@propertyintel.com",
            password_hash=get_password_hash("password123"),
            role="investor",
            is_verified=True
        )
        db.add_all([admin_user, investor_user])
        db.commit()

    # 2. RERA Projects
    if db.query(RERAProject).count() == 0:
        projects = [
            RERAProject(
                project_name="Oberoi Sky City Phase 2",
                registration_number="P51800003582",
                state="Maharashtra",
                city="Mumbai",
                locality="Borivali East",
                builder_name="Oberoi Realty Ltd",
                promoter_name="Vikas Oberoi",
                property_type="Residential Luxury",
                project_category="High-Rise",
                completion_status="Ongoing",
                delayed_months=3,
                total_units=650,
                available_units=142,
                carpet_area_range_sqft="1050 - 2400 sq.ft",
                average_price_per_sqm=295000,
                escrow_account_compliant=True,
                legal_dispute_flags=False,
                structural_audit_status="Approved & Certified",
                lat=19.2288,
                lon=72.8576
            ),
            RERAProject(
                project_name="Lodha World One Signature",
                registration_number="P51900008399",
                state="Maharashtra",
                city="Mumbai",
                locality="Lower Parel",
                builder_name="Macrotech Developers (Lodha Group)",
                promoter_name="Abhishek Lodha",
                property_type="Ultra Luxury Tower",
                project_category="Iconic Skyscraper",
                completion_status="Completed",
                delayed_months=0,
                total_units=320,
                available_units=18,
                carpet_area_range_sqft="2800 - 6500 sq.ft",
                average_price_per_sqm=420000,
                escrow_account_compliant=True,
                legal_dispute_flags=False,
                structural_audit_status="Approved & Certified",
                lat=18.9986,
                lon=72.8258
            ),
            RERAProject(
                project_name="Godrej Origins at The Trees",
                registration_number="P51800018112",
                state="Maharashtra",
                city="Mumbai",
                locality="Vikhroli East",
                builder_name="Godrej Properties",
                promoter_name="Pirojsha Godrej",
                property_type="Mixed Use Township",
                project_category="Sustainable Green Living",
                completion_status="Ongoing",
                delayed_months=0,
                total_units=480,
                available_units=88,
                carpet_area_range_sqft="920 - 1850 sq.ft",
                average_price_per_sqm=215000,
                escrow_account_compliant=True,
                legal_dispute_flags=False,
                structural_audit_status="IGBC Platinum Certified",
                lat=19.1025,
                lon=72.9284
            ),
            RERAProject(
                project_name="Sun South Stream & Highline",
                registration_number="PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA09581/280922",
                state="Gujarat",
                city="Ahmedabad",
                locality="South Bopal",
                builder_name="Sun Builders Group",
                promoter_name="N. K. Patel",
                property_type="Residential Community",
                project_category="Mid-Rise Premium",
                completion_status="Ongoing",
                delayed_months=4,
                total_units=410,
                available_units=94,
                carpet_area_range_sqft="1150 - 2100 sq.ft",
                average_price_per_sqm=74000,
                escrow_account_compliant=True,
                legal_dispute_flags=False,
                structural_audit_status="Approved & Certified",
                lat=23.0182,
                lon=72.4831
            ),
            RERAProject(
                project_name="Goyal & Co Orchid Heights",
                registration_number="PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA07114/150621",
                state="Gujarat",
                city="Ahmedabad",
                locality="Thaltej",
                builder_name="Goyal & Co Real Estate",
                promoter_name="Mukesh Goyal",
                property_type="Luxury Apartments",
                project_category="Urban Residential",
                completion_status="Completed",
                delayed_months=0,
                total_units=280,
                available_units=12,
                carpet_area_range_sqft="1800 - 3200 sq.ft",
                average_price_per_sqm=104000,
                escrow_account_compliant=True,
                legal_dispute_flags=False,
                structural_audit_status="Approved & Certified",
                lat=23.0519,
                lon=72.5085
            ),
            RERAProject(
                project_name="Adani Shantigram Water Lily",
                registration_number="PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA00234/120817",
                state="Gujarat",
                city="Ahmedabad",
                locality="SG Highway",
                builder_name="Adani Realty",
                promoter_name="Karan Adani",
                property_type="Integrated Township",
                project_category="Lakefront Living",
                completion_status="Completed",
                delayed_months=0,
                total_units=720,
                available_units=34,
                carpet_area_range_sqft="1950 - 3800 sq.ft",
                average_price_per_sqm=92000,
                escrow_account_compliant=True,
                legal_dispute_flags=False,
                structural_audit_status="Approved & Certified",
                lat=23.1558,
                lon=72.5442
            ),
            RERAProject(
                project_name="Rajyash Reeva Enclave",
                registration_number="PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA04491/211218",
                state="Gujarat",
                city="Ahmedabad",
                locality="Vasna",
                builder_name="Rajyash Group",
                promoter_name="Dipen Patel",
                property_type="Affordable Housing",
                project_category="Urban Residential",
                completion_status="Delayed",
                delayed_months=21,
                total_units=340,
                available_units=85,
                carpet_area_range_sqft="650 - 1100 sq.ft",
                average_price_per_sqm=56000,
                escrow_account_compliant=False,
                legal_dispute_flags=True,
                dispute_details="Escrow funds re-allocation dispute under review by GujRERA tribunal.",
                structural_audit_status="Pending Re-Inspection",
                lat=23.0039,
                lon=72.5482
            )
        ]
        db.add_all(projects)
        db.commit()

    # 3. Builders
    if db.query(Builder).count() == 0:
        builders = [
            Builder(
                builder_name="Oberoi Realty Ltd",
                cin_number="L45200MH1998PLC114818",
                pan_number="AAAC01248E",
                state="Maharashtra",
                total_delivered_projects=44,
                ongoing_projects=9,
                registration_count=53,
                delayed_projects=2,
                average_delay_months=2.1,
                active_litigations=1,
                headquarters="Commerz II, Goregaon East, Mumbai",
                established_year=1998,
                market_cap_inr="52,000 Cr",
                credit_rating="CRISIL AA+ / Stable",
                trust_score=94
            ),
            Builder(
                builder_name="Macrotech Developers (Lodha Group)",
                cin_number="L45200MH1995PLC093041",
                pan_number="AABCL4921D",
                state="Maharashtra",
                total_delivered_projects=92,
                ongoing_projects=28,
                registration_count=120,
                delayed_projects=8,
                average_delay_months=4.2,
                active_litigations=6,
                headquarters="Lodha Excelus, Mahalaxmi, Mumbai",
                established_year=1995,
                market_cap_inr="115,000 Cr",
                credit_rating="ICRA AA / Positive",
                trust_score=91
            ),
            Builder(
                builder_name="Godrej Properties",
                cin_number="L74120MH1985PLC035308",
                pan_number="AAACG4592H",
                state="Both",
                total_delivered_projects=88,
                ongoing_projects=36,
                registration_count=124,
                delayed_projects=4,
                average_delay_months=1.8,
                active_litigations=2,
                headquarters="Godrej One, Vikhroli East, Mumbai",
                established_year=1990,
                market_cap_inr="78,000 Cr",
                credit_rating="ICRA AA+ / Stable",
                trust_score=96
            ),
            Builder(
                builder_name="Goyal & Co Real Estate",
                cin_number="U45200GJ2001PTC039201",
                pan_number="AABCG8192K",
                state="Gujarat",
                total_delivered_projects=65,
                ongoing_projects=14,
                registration_count=79,
                delayed_projects=3,
                average_delay_months=3.0,
                active_litigations=1,
                headquarters="Orchid Whitefield, Makarba, Ahmedabad",
                established_year=1971,
                market_cap_inr="Private Enterprise",
                credit_rating="CARE A+ / Stable",
                trust_score=89
            ),
            Builder(
                builder_name="Sun Builders Group",
                cin_number="U45201GJ1996PTC029411",
                pan_number="AAECS5128M",
                state="Gujarat",
                total_delivered_projects=38,
                ongoing_projects=8,
                registration_count=46,
                delayed_projects=2,
                average_delay_months=2.5,
                active_litigations=0,
                headquarters="Sun House, Navrangpura, Ahmedabad",
                established_year=1989,
                market_cap_inr="Private Enterprise",
                credit_rating="CRISIL A / Stable",
                trust_score=90
            ),
            Builder(
                builder_name="Adani Realty",
                cin_number="U45200GJ2007PLC052188",
                pan_number="AABCA7211P",
                state="Both",
                total_delivered_projects=32,
                ongoing_projects=16,
                registration_count=48,
                delayed_projects=2,
                average_delay_months=1.5,
                active_litigations=1,
                headquarters="Adani Corporate House, Shantigram, Ahmedabad",
                established_year=2010,
                market_cap_inr="Conglomerate Division",
                credit_rating="BWR AA+ / Stable",
                trust_score=92
            ),
            Builder(
                builder_name="Rajyash Group",
                cin_number="U45200GJ2012PTC070891",
                pan_number="AABCR4128N",
                state="Gujarat",
                total_delivered_projects=14,
                ongoing_projects=7,
                registration_count=21,
                delayed_projects=6,
                average_delay_months=16.5,
                active_litigations=4,
                headquarters="Rajyash Rise, Vasna, Ahmedabad",
                established_year=2012,
                market_cap_inr="Private Enterprise",
                credit_rating="BB- / High Watch",
                trust_score=58
            )
        ]
        db.add_all(builders)
        db.commit()

    # 4. Circle Rates
    if db.query(CircleRate).count() == 0:
        circle_rates = [
            CircleRate(locality="Thaltej", city="Ahmedabad", state="Gujarat", circle_rate_per_sqm=68000, market_rate_per_sqm=104000, growth_score=92, metro_proximity_km=0.8, highway_proximity_km=1.2),
            CircleRate(locality="South Bopal", city="Ahmedabad", state="Gujarat", circle_rate_per_sqm=48000, market_rate_per_sqm=74000, growth_score=89, metro_proximity_km=3.2, highway_proximity_km=0.5),
            CircleRate(locality="SG Highway", city="Ahmedabad", state="Gujarat", circle_rate_per_sqm=62000, market_rate_per_sqm=96000, growth_score=94, metro_proximity_km=1.5, highway_proximity_km=0.1),
            CircleRate(locality="Lower Parel", city="Mumbai", state="Maharashtra", circle_rate_per_sqm=285000, market_rate_per_sqm=420000, growth_score=91, metro_proximity_km=0.4, highway_proximity_km=2.1),
            CircleRate(locality="Borivali East", city="Mumbai", state="Maharashtra", circle_rate_per_sqm=195000, market_rate_per_sqm=295000, growth_score=87, metro_proximity_km=0.6, highway_proximity_km=0.4),
            CircleRate(locality="Vikhroli East", city="Mumbai", state="Maharashtra", circle_rate_per_sqm=145000, market_rate_per_sqm=215000, growth_score=88, metro_proximity_km=1.1, highway_proximity_km=0.3),
            CircleRate(locality="Hinjewadi", city="Pune", state="Maharashtra", circle_rate_per_sqm=56000, market_rate_per_sqm=82000, growth_score=86, metro_proximity_km=1.2, highway_proximity_km=1.5),
            CircleRate(locality="Whitefield", city="Bangalore", state="Karnataka", circle_rate_per_sqm=85000, market_rate_per_sqm=125000, growth_score=90, metro_proximity_km=0.7, highway_proximity_km=2.0)
        ]
        db.add_all(circle_rates)
        db.commit()

    # 5. Property Transactions
    if db.query(PropertyTransaction).count() == 0:
        transactions = [
            PropertyTransaction(
                deed_number="DEED/MH/MUM/2026/04192",
                city="Mumbai",
                locality="Lower Parel",
                property_type="Commercial Office",
                carpet_area_sqft=3400,
                sale_value_inr=146200000,
                calculated_rate_per_sqm=462000,
                circle_rate_per_sqm=285000,
                variance_percentage=62,
                stamp_duty_paid_inr=8772000,
                buyer_type="Corporate Entity",
                seller_type="Promoter/Developer",
                verification_status="Verified & Registered"
            ),
            PropertyTransaction(
                deed_number="DEED/GJ/AHM/2026/08812",
                city="Ahmedabad",
                locality="Thaltej",
                property_type="Residential Apartment",
                carpet_area_sqft=2150,
                sale_value_inr=22800000,
                calculated_rate_per_sqm=114000,
                circle_rate_per_sqm=68000,
                variance_percentage=67,
                stamp_duty_paid_inr=1117200,
                buyer_type="Individual",
                seller_type="Individual Resale",
                verification_status="Verified & Registered"
            ),
            PropertyTransaction(
                deed_number="DEED/GJ/AHM/2026/09144",
                city="Ahmedabad",
                locality="Vasna",
                property_type="Residential Plot",
                carpet_area_sqft=1800,
                sale_value_inr=7200000,
                calculated_rate_per_sqm=43000,
                circle_rate_per_sqm=56000,
                variance_percentage=-23,
                stamp_duty_paid_inr=352800,
                buyer_type="Individual",
                seller_type="Individual",
                verification_status="Flagged for Circle Rate Deficit"
            )
        ]
        db.add_all(transactions)
        db.commit()

    # 6. Infrastructure Projects
    if db.query(InfrastructureProject).count() == 0:
        infra = [
            InfrastructureProject(
                project_name="Mumbai Metro Line 3 (Aqua Line)",
                city="Mumbai",
                project_type="Metro Line",
                impact_radius_km=2.5,
                status="Operational / Phase 2 Finishing",
                completion_year=2025,
                affected_localities=["Lower Parel", "Byculla", "Worli"]
            ),
            InfrastructureProject(
                project_name="Ahmedabad Metro Phase 2 (GIFT City Link)",
                city="Ahmedabad",
                project_type="Metro Line",
                impact_radius_km=2.0,
                status="Operational / Expanding",
                completion_year=2025,
                affected_localities=["Motera", "GIFT City", "Koba Circle"]
            ),
            InfrastructureProject(
                project_name="Ahmedabad-Dholera Expressway",
                city="Ahmedabad",
                project_type="Expressway",
                impact_radius_km=5.0,
                status="Under Construction",
                completion_year=2026,
                affected_localities=["South Bopal", "Sanand", "Sarkhej"]
            )
        ]
        db.add_all(infra)
        db.commit()

    # 7. Government Datasets (Live Public API tracker)
    if db.query(GovernmentDataset).count() == 0:
        ds = [
            GovernmentDataset(
                dataset_name="OpenStreetMap Nominatim Geocoding API",
                category="Geospatial & Address Intelligence",
                source_url="https://nominatim.openstreetmap.org",
                sync_status="Operational (Live Direct)",
                record_count=148200
            ),
            GovernmentDataset(
                dataset_name="Open-Meteo Weather & AQI Live API",
                category="Environmental & Climate Intelligence",
                source_url="https://api.open-meteo.com",
                sync_status="Operational (Live Direct)",
                record_count=42100
            ),
            GovernmentDataset(
                dataset_name="Frankfurter Forex & Financial API",
                category="Global Currency & Foreign Investment",
                source_url="https://api.frankfurter.dev",
                sync_status="Operational (Live Direct)",
                record_count=1890
            ),
            GovernmentDataset(
                dataset_name="World Bank India Economic Indicators API",
                category="Macroeconomic Growth & Inflation",
                source_url="https://api.worldbank.org",
                sync_status="Operational (Live Direct)",
                record_count=540
            )
        ]
        db.add_all(ds)
        db.commit()

    # 8. System Log
    if db.query(SystemLog).count() == 0:
        log = SystemLog(
            level="info",
            message="Python FastAPI & PostgreSQL Database Engine initialized with live public APIs.",
            component="SystemStartup"
        )
        db.add(log)
        db.commit()
