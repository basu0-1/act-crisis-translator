from datetime import datetime
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine, Base
from app.models.models import (
    User, UserProfile, UserPreferences, AlertSource, EmergencyAlert, Shelter,
    UserRole, MobilityTier, LanguageCode, EmergencyType, SeverityLevel,
    CertaintyLevel, DataStatus, ShelterStatus
)
from app.auth.security import get_password_hash

def seed_database(db: Session = None):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        # Check if already seeded
        if db.query(AlertSource).count() > 0:
            print("Database already seeded with demo data.")
            return

        print("Seeding demo database for ACT Actionable Crisis Translator...")

        # 1. Sources
        nmhs_source = AlertSource(
            name="National Hydrological & Meteorological Service (NMHS)",
            source_type="GOVERNMENT_METEOROLOGY",
            url="https://emergency.demo.act.local/nmhs",
            is_verified=True,
            trust_score=0.99
        )
        rcrc_source = AlertSource(
            name="Civil Protection & Crisis Management Agency",
            source_type="CIVIL_DEFENSE",
            url="https://emergency.demo.act.local/rcrc",
            is_verified=True,
            trust_score=0.98
        )
        db.add_all([nmhs_source, rcrc_source])
        db.flush()

        # 2. Emergency Alert (DEMO FLOOD)
        flood_hazard_geojson = {
            "type": "Polygon",
            "coordinates": [[
                [-122.4220, 37.7730],
                [-122.4120, 37.7740],
                [-122.4100, 37.7810],
                [-122.4170, 37.7800],
                [-122.4220, 37.7730]
            ]]
        }

        demo_alert = EmergencyAlert(
            title="Flash Flood Surge Warning — Riverside Lowland Corridor",
            description="Rapid cresting of the Riverside riverbed due to sustained torrential precipitation. Up to 45cm runoff inundating lowland transit corridors including Riverside Road Bridge. Evacuate immediately toward elevated ridge shelters.",
            emergency_type=EmergencyType.FLOOD,
            severity=SeverityLevel.SEVERE,
            certainty=CertaintyLevel.OBSERVED,
            hazard_polygon_geojson=flood_hazard_geojson,
            time_to_impact_minutes=32,
            source_id=nmhs_source.id,
            verification_status="OFFICIALLY_VERIFIED_DISPATCH",
            data_status=DataStatus.DEMO,
            is_active=True
        )
        db.add(demo_alert)
        db.flush()

        # 3. Shelters
        shelter_civic = Shelter(
            name="Community Civic Center Evacuation Center",
            address="800 Civic Plaza, Riverside District",
            latitude=37.7810,
            longitude=-122.4080,
            capacity_total=250,
            capacity_available=112,
            wheelchair_accessible=True,
            medical_support=True,
            pet_friendly=True,
            status=ShelterStatus.OPEN,
            source_id=rcrc_source.id,
            is_active=True
        )

        shelter_highland = Shelter(
            name="Highland Crest High-Ground Haven",
            address="1420 Ridgeview Terrace, North Heights",
            latitude=37.7840,
            longitude=-122.4160,
            capacity_total=400,
            capacity_available=285,
            wheelchair_accessible=True,
            medical_support=True,
            pet_friendly=False,
            status=ShelterStatus.OPEN,
            source_id=rcrc_source.id,
            is_active=True
        )

        shelter_lowland = Shelter(
            name="Valley Riverbed Recreational Hall",
            address="35 Riverbed Lane (Lowland Basin)",
            latitude=37.7760,
            longitude=-122.4110,
            capacity_total=150,
            capacity_available=0,
            wheelchair_accessible=False,
            medical_support=False,
            pet_friendly=False,
            status=ShelterStatus.CLOSED,
            source_id=rcrc_source.id,
            is_active=True
        )
        db.add_all([shelter_civic, shelter_highland, shelter_lowland])
        db.flush()

        # 4. Admin User
        admin_user = User(
            email="admin@act-emergency.org",
            hashed_password=get_password_hash("Admin@ACT2026!"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.flush()

        admin_profile = UserProfile(
            user_id=admin_user.id,
            full_name="Emergency Director Adams",
            preferred_language=LanguageCode.EN,
            mobility=MobilityTier.NORMAL,
            location_name="Command Central"
        )
        admin_prefs = UserPreferences(user_id=admin_user.id, theme="system")
        db.add_all([admin_profile, admin_prefs])

        # 5. Standard Test User (Limited Walking)
        test_user = User(
            email="user@example.com",
            hashed_password=get_password_hash("User@ACT2026!"),
            role=UserRole.END_USER,
            is_active=True
        )
        db.add(test_user)
        db.flush()

        test_profile = UserProfile(
            user_id=test_user.id,
            full_name="Elena Chen",
            preferred_language=LanguageCode.EN,
            mobility=MobilityTier.NORMAL,
            location_name="Central Riverside District",
            location_lat=37.7749,
            location_lon=-122.4194
        )
        test_prefs = UserPreferences(user_id=test_user.id, theme="system")
        db.add_all([test_profile, test_prefs])

        # 6. Wheelchair Test User
        wheelchair_user = User(
            email="wheelchair@example.com",
            hashed_password=get_password_hash("User@ACT2026!"),
            role=UserRole.END_USER,
            is_active=True
        )
        db.add(wheelchair_user)
        db.flush()

        wheelchair_profile = UserProfile(
            user_id=wheelchair_user.id,
            full_name="Marcus Vance",
            preferred_language=LanguageCode.EN,
            mobility=MobilityTier.WHEELCHAIR,
            location_name="Riverside Promenade",
            location_lat=37.7749,
            location_lon=-122.4194
        )
        wheelchair_prefs = UserPreferences(user_id=wheelchair_user.id, theme="system")
        db.add_all([wheelchair_profile, wheelchair_prefs])

        db.commit()
        print("Database seed completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        if close_db:
            db.close()

if __name__ == "__main__":
    seed_database()
