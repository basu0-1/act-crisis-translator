"""
Database Connection and Session Management for ACT
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./act_emergency.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app.models.user import User
    from app.models.alert import EmergencyAlert
    from app.models.infrastructure import ShelterEntity, RoadEntity, AuditLog
    Base.metadata.create_all(bind=engine)
    from app.data.seed import seed_database
    seed_database()


# Initialize tables on module load for test clients and workers
try:
    init_db()
except Exception as e:
    pass
